// src/cache/tracks.ts

import { Track } from "../types/tracks";
import { db } from "../lib/firestore";

const COLLECTION = "saved_tracks";

// カーソル取得
export async function getTracksWithCursor(
  limit: number,
  cursor?: Pick<Track, "id" | "addedAt">
): Promise<{
  tracks: Track[];
  cursor?: Pick<Track, "id" | "addedAt">;
  total: number;
}> {
  let query = db
    .collection(COLLECTION)
    .orderBy("addedAt")
    .orderBy("id")
    .limit(limit);

  if (cursor?.id && cursor.addedAt) {
    query = query.startAfter(cursor.addedAt, cursor.id);
  }

  const snapshot = await query.get();
  const tracks = snapshot.docs.map((doc) => doc.data() as Track);

  // 次ページ用のカーソル
  const last = tracks[tracks.length - 1];
  const nextCursor = last ? { id: last.id, addedAt: last.addedAt } : undefined;

  // 総数
  const totalSnap = await db.collection(COLLECTION).count().get();
  const total = totalSnap.data().count;

  return { tracks, cursor: nextCursor, total };
}

// 全件取得
export async function getTracksAll(): Promise<Record<string, Track>> {
  const snapshot = await db.collection(COLLECTION).get();
  const result: Record<string, Track> = {};
  snapshot.forEach((doc) => {
    if (doc.exists) result[doc.id] = doc.data() as Track;
  });
  return result;
}

// 複数保存
export async function setTracks(data: Track[]): Promise<void> {
  const batch = db.batch();
  data.forEach((track) => {
    const ref = db.collection(COLLECTION).doc(track.id);
    batch.set(ref, track);
  });
  await batch.commit();
}

// 複数削除
export async function deleteTracks(ids: string[]): Promise<void> {
  const batch = db.batch();
  ids.forEach((id) => {
    const ref = db.collection(COLLECTION).doc(id);
    batch.delete(ref);
  });
  await batch.commit();
}
