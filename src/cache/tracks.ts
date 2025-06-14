// src/cache/tracks.ts

import { Track } from "../types/tracks";
import { db } from "./firestore";

const COLLECTION = "saved_tracks";

// 単一取得
export async function getTrack(id: string): Promise<Track | null> {
  const doc = await db.collection(COLLECTION).doc(id).get();
  return doc.exists ? (doc.data() as Track) : null;
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
