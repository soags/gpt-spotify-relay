// src/controllers/tracksController.ts

import { Request, Response } from "express";
import { FieldPath } from "firebase-admin/firestore";
import { db, SPOTIFY_COLLECTIONS } from "../../lib/firestore";
import { getAccessToken, getFollowedArtists } from "../../lib/spotify";
import { classifyItems, toCountResponse } from "../../services/classifyItems";
import { FollowingArtist } from "../../types/spotify/artists";
import { FollowingArtistsResponse } from "../../types/spotify/response";
import { ClassifyResultCount } from "../../services/classifyItems";
import {
  GetFollowingQuery,
  RefreshFollowingBody,
} from "../../types/spotify/request";

export async function getFollowing(
  req: Request<object, FollowingArtistsResponse, object, GetFollowingQuery>,
  res: Response<FollowingArtistsResponse>
): Promise<void> {
  const limit = Number(req.query.limit ?? 100);
  const cursorId = req.query.cursorId as string | undefined;
  const cursorFollowedAt = req.query.cursorFollowedAt as string | undefined;

  let query = db
    .collection(SPOTIFY_COLLECTIONS.FOLLOWING_ARTISTS)
    .orderBy("followedAt")
    .orderBy(FieldPath.documentId())
    .limit(limit);

  if (cursorId && cursorFollowedAt) {
    query = query.startAfter(cursorFollowedAt, cursorId);
  }

  const snapshot = await query.get();
  const artists = snapshot.docs.map(
    (doc) => ({ ...doc.data(), id: doc.id } as FollowingArtist)
  );

  // 次ページ用のカーソル
  const last = artists[artists.length - 1];
  const nextCursor = last
    ? { id: last.id, followedAt: last.followedAt }
    : undefined;

  // 総数
  const totalSnap = await db
    .collection(SPOTIFY_COLLECTIONS.FOLLOWING_ARTISTS)
    .count()
    .get();
  const total = totalSnap.data().count;

  res.json({
    artists,
    cursor: nextCursor,
    total,
  });
}

export async function refreshFollowing(
  req: Request<object, ClassifyResultCount, RefreshFollowingBody, object>,
  res: Response<ClassifyResultCount>
): Promise<void> {
  const token = await getAccessToken();

  const { force = false } = req.body as {
    force?: boolean;
  };

  const col = db.collection(SPOTIFY_COLLECTIONS.FOLLOWING_ARTISTS);
  const followedAt = new Date().toISOString();

  const apiArtists = await getFollowedArtists(token);
  const apiItems: FollowingArtist[] = apiArtists.map((a) => ({
    id: a.id,
    name: a.name,
    genres: a.genres,
    popularity: a.popularity,
    followers: a.followers.total,
    followedAt,
  }));

  // Firestoreから現在のキャッシュを取得
  const snapshot = await col.get();
  const cached: Record<string, FollowingArtist> = {};
  snapshot.docs.forEach((doc) => {
    if (doc.exists) cached[doc.id] = doc.data() as FollowingArtist;
  });

  // 差分判定
  const result = classifyItems({
    apiItems,
    cached,
    idSelector: (a) => a.id,
    equalsKeys: ["name", "genres", "popularity"],
    force,
  });

  // Firestore更新
  await Promise.all([
    ...result.createItems.map((a) => col.doc(a.id).set(a)),
    ...result.refreshItems.map((a) => col.doc(a.id).set(a)),
    ...result.deletedIds.map((id) => col.doc(id).delete()),
  ]);

  res.json(toCountResponse(result));
}
