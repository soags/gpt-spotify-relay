// src/controllers/tracksController.ts

import { Request, Response } from "express";
import {
  getAccessToken,
  getSeveralArtists,
  getUsersSavedTracks,
} from "../lib/spotify";
import { SavedTrack } from "../types/tracks";
import { classifyItems, toCountResponse } from "../services/classifyItems";
import { COLLECTIONS, db } from "../lib/firestore";
import { Artist } from "../types/artists";
import { FieldPath } from "firebase-admin/firestore";

export const getTracks = async (req: Request, res: Response) => {
  const limit = Number(req.query.limit ?? 100);
  const cursorId = req.query.cursorId as string | undefined;
  const cursorAddedAt = req.query.cursorAddedAt as string | undefined;

  let query = db
    .collection(COLLECTIONS.SAVED_TRACKS)
    .orderBy("addedAt")
    .orderBy(FieldPath.documentId())
    .limit(limit);

  if (cursorId && cursorAddedAt) {
    query = query.startAfter(cursorAddedAt, cursorId);
  }

  const snapshot = await query.get();
  const tracks = snapshot.docs.map((doc) => doc.data() as SavedTrack);

  // 次ページ用のカーソル
  const last = tracks[tracks.length - 1];
  const nextCursor = last ? { id: last.id, addedAt: last.addedAt } : undefined;

  // 総数
  const totalSnap = await db.collection(COLLECTIONS.SAVED_TRACKS).count().get();
  const total = totalSnap.data().count;

  return res.json({
    tracks,
    cursor: nextCursor,
    total,
  });
};

export async function refreshTracks(req: Request, res: Response) {
  const token = await getAccessToken();

  const { force = false } = req.body as {
    force?: boolean;
  };

  const col = db.collection(COLLECTIONS.SAVED_TRACKS);

  const apiTracks = await getUsersSavedTracks(token);
  const apiItems: SavedTrack[] = apiTracks.map((t) => ({
    id: t.track.id,
    name: t.track.name,
    artists: t.track.artists.map((artist) => ({
      id: artist.id,
      name: artist.name,
    })),
    album: {
      id: t.track.album.id,
      name: t.track.album.name,
    },
    duration_ms: t.track.duration_ms,
    explicit: t.track.explicit,
    popularity: t.track.popularity,
    addedAt: t.added_at,
  }));

  // Firestoreから現在のキャッシュを取得
  const snapshot = await col.get();
  const cached: Record<string, SavedTrack> = {};
  snapshot.docs.forEach((doc) => {
    if (doc.exists) cached[doc.id] = doc.data() as SavedTrack;
  });

  // 差分判定
  const result = classifyItems<SavedTrack>({
    apiItems,
    cached,
    idSelector: (item) => item.id,
    equalsKeys: [
      "name",
      "album",
      "duration_ms",
      "explicit",
      "popularity",
      "addedAt",
      "artists",
    ],
    force,
  });

  // Firestore更新
  await Promise.all([
    ...result.createItems.map((a) => col.doc(a.id).set(a)),
    ...result.refreshItems.map((a) => col.doc(a.id).set(a)),
    ...result.deletedIds.map((id) => col.doc(id).delete()),
  ]);

  // アーティストのキャッシュを全件取得
  const aCol = db.collection(COLLECTIONS.ARTISTS);
  const aSnapshot = await aCol.get();
  const cachedArtists: Record<string, Artist> = {};
  aSnapshot.docs.forEach((doc) => {
    if (doc.exists) cachedArtists[doc.id] = doc.data() as Artist;
  });
  console.log(`Cached artists count: ${Object.keys(cachedArtists).length}`);

  // キャッシュにないアーティストIDを抽出
  const artistIds: string[] = [];
  [...result.createItems, ...result.refreshItems].forEach((item) => {
    item.artists.forEach((artist) => {
      if (!cachedArtists[artist.id]) {
        artistIds.push(artist.id);
      }
    });
  });
  console.log(
    `Artists to fetch: ${artistIds.length} (from ${result.createItems.length} new tracks)`
  );

  // キャッシュにないアーティストを50件ずつ取得
  const artists = [];
  for (let i = 0; i < artistIds.length; i += 50) {
    const ids = artistIds.slice(i, i + 50);

    console.log(`Fetching artists ${i + 1} to ${i + ids.length}`);
    const result = await getSeveralArtists(ids, token);
    artists.push(...result);
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  // Firestoreに保存
  console.log(`Saving ${artists.length} new artists to Firestore`);
  await Promise.all(artists.map((artist) => aCol.doc(artist.id).set(artist)));

  return res.json({
    ...toCountResponse(result),
    artists: {
      created: artists.length,
    },
  });
}
