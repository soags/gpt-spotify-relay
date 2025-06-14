// src/controllers/tracksController.ts

import { Request, Response } from "express";
import { getAccessToken, getUsersSavedTracks } from "../lib/spotify";
import { Track } from "../types/tracks";
import { classifyItems, toCountResponse } from "../services/classifyItems";
import { db } from "../lib/firestore";

export const getTracks = async (req: Request, res: Response) => {
  const limit = Number(req.query.limit ?? 100);
  const cursorId = req.query.cursorId as string | undefined;
  const cursorAddedAt = req.query.cursorAddedAt as string | undefined;

  let query = db
    .collection("saved_tracks")
    .orderBy("addedAt")
    .orderBy("id")
    .limit(limit);

  if (cursorId && cursorAddedAt) {
    query = query.startAfter(cursorAddedAt, cursorId);
  }

  const snapshot = await query.get();
  const tracks = snapshot.docs.map((doc) => doc.data() as Track);

  // 次ページ用のカーソル
  const last = tracks[tracks.length - 1];
  const nextCursor = last ? { id: last.id, addedAt: last.addedAt } : undefined;

  // 総数
  const totalSnap = await db.collection("saved_tracks").count().get();
  const total = totalSnap.data().count;

  return res.json({
    tracks,
    cursor: nextCursor,
    total,
  });
};

export async function refreshTracks(req: Request, res: Response) {
  const token = await getAccessToken();

  const col = db.collection("saved_tracks");

  const apiTracks = await getUsersSavedTracks(token);
  const apiItems: Track[] = apiTracks.map((t) => ({
    id: t.track.id,
    name: t.track.name,
    artists: t.track.artists.map((artist) => ({
      id: artist.id,
      name: artist.name,
    })),
    album: t.track.album.name,
    duration_ms: t.track.duration_ms,
    explicit: t.track.explicit,
    popularity: t.track.popularity,
    addedAt: t.added_at,
  }));

  // Firestoreから現在のキャッシュを取得
  const snapshot = await col.get();
  const cached: Record<string, Track> = {};
  snapshot.docs.forEach((doc) => {
    if (doc.exists) cached[doc.id] = doc.data() as Track;
  });

  // 差分判定
  const result = classifyItems<Track>({
    apiItems,
    cached,
    idSelector: (item) => item.id,
    equals: (api, cached) => {
      if (!cached) return false;
      return (
        cached.name === api.name &&
        cached.album === api.album &&
        cached.duration_ms === api.duration_ms &&
        cached.explicit === api.explicit &&
        cached.popularity === api.popularity &&
        cached.addedAt === api.addedAt &&
        JSON.stringify(cached.artists) === JSON.stringify(api.artists)
      );
    },
  });

  // Firestore更新
  await Promise.all([
    ...result.createItems.map((a) => col.doc(a.id).set(a)),
    ...result.refreshItems.map((a) => col.doc(a.id).set(a)),
    ...result.deletedIds.map((id) => col.doc(id).delete()),
  ]);

  return res.json(toCountResponse(result));
}
