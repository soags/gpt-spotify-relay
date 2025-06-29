// src/controllers/artistsController.ts

import { Request, Response } from "express";
import { ArtistsResponse } from "../../types/spotify/response";
import { ClassifyResultCount } from "../../services/classifyItems";
import {
  GetArtistsQuery,
  RefreshArtistsBody,
} from "../../types/spotify/request";

import { FieldPath } from "firebase-admin/firestore";
import { db, SPOTIFY_COLLECTIONS } from "../../lib/firestore";
import { getAccessToken, getSeveralArtists } from "../../lib/spotify";
import { classifyItems, toCountResponse } from "../../services/classifyItems";
import { ValidationError } from "../../types/error";
import { Artist } from "../../types/spotify/artists";

export async function getArtists(
  req: Request<object, ArtistsResponse | Artist[], object, GetArtistsQuery>,
  res: Response<ArtistsResponse | Artist[]>
): Promise<void> {
  const rawIds = req.query.ids as string | undefined;
  const ids = rawIds?.trim() ? rawIds.split(",").filter(Boolean) : [];
  const limit = Number(req.query.limit ?? 100);
  const cursorId = req.query.cursorId as string | undefined;

  const col = db.collection(SPOTIFY_COLLECTIONS.ARTISTS);

  if (ids.length > 0) {
    // ids指定時はidsのアーティストを全件取得、ページネーション・limit無視
    const docs = await Promise.all(ids.map((id) => col.doc(id).get()));
    const artists = docs
      .filter((doc) => doc.exists)
      .map((doc) => ({ ...doc.data(), id: doc.id } as Artist));
    res.json(artists);
  } else {
    // ページネーション
    let query = col.orderBy(FieldPath.documentId()).limit(limit);
    if (cursorId) {
      query = query.startAfter(cursorId);
    }
    const snapshot = await query.get();
    const artists = snapshot.docs.map(
      (doc) => ({ ...doc.data(), id: doc.id } as Artist)
    );
    // 次ページ用のカーソル
    const last = artists[artists.length - 1];
    const nextCursor = last ? { id: last.id } : undefined;
    // 総数
    const totalSnap = await col.count().get();
    const total = totalSnap.data().count;
    res.json({
      artists,
      cursor: nextCursor,
      total,
    });
  }
}

export async function refreshArtists(
  req: Request<object, ClassifyResultCount, RefreshArtistsBody, object>,
  res: Response<ClassifyResultCount>
): Promise<void> {
  const token = await getAccessToken();

  const { artistIds, force = false } = req.body as {
    artistIds: string[];
    force?: boolean;
  };

  if (!artistIds || artistIds.length === 0) {
    throw new ValidationError("artistIds is required and cannot be empty.");
  }

  const col = db.collection(SPOTIFY_COLLECTIONS.ARTISTS);

  const snapshot = await col.get();
  const cached: Record<string, Artist> = {};
  snapshot.docs.forEach((doc) => {
    if (doc.exists) cached[doc.id] = doc.data() as Artist;
  });

  const toFetch = force ? artistIds : artistIds.filter((id) => !cached[id]);

  const artists = [];
  for (let i = 0; i < toFetch.length; i += 50) {
    const ids = toFetch.slice(i, i + 50);
    const result = await getSeveralArtists(ids, token);
    artists.push(...result);
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  const apiItems: Artist[] = artists.map((a) => ({
    id: a.id,
    name: a.name,
    genres: a.genres,
    popularity: a.popularity,
    followers: a.followers.total,
  }));

  const result = classifyItems({
    apiItems,
    cached,
    idSelector: (a) => a.id,
    equalsKeys: ["name", "genres", "popularity"],
    force,
  });

  await Promise.all([
    ...result.createItems.map((a) => col.doc(a.id).set(a)),
    ...result.refreshItems.map((a) => col.doc(a.id).set(a)),
    ...result.deletedIds.map((id) => col.doc(id).delete()),
  ]);

  res.json(toCountResponse(result));
}
