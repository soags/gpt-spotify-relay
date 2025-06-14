// src/services/artistGenres.ts

import { db } from "../cache/firestore";

const COLLECTION = "artist_genres";

export type ArtistGenreData = {
  id: string;
  name: string;
  genres: string[];
  retrieved_at: string; // ISO 形式で保存
};

// 単一取得
export async function getArtistGenre(
  id: string
): Promise<ArtistGenreData | null> {
  const doc = await db.collection(COLLECTION).doc(id).get();
  return doc.exists ? (doc.data() as ArtistGenreData) : null;
}

// 複数一括取得
export async function getArtistGenres(
  ids: string[]
): Promise<Record<string, ArtistGenreData>> {
  const snapshots = await db.getAll(
    ...ids.map((id) => db.collection(COLLECTION).doc(id))
  );
  const result: Record<string, ArtistGenreData> = {};
  snapshots.forEach((snap) => {
    if (snap.exists) result[snap.id] = snap.data() as ArtistGenreData;
  });
  return result;
}

// 複数保存
export async function setArtistGenres(data: ArtistGenreData[]): Promise<void> {
  const batch = db.batch();
  data.forEach((artist) => {
    const ref = db.collection(COLLECTION).doc(artist.id);
    batch.set(ref, artist);
  });
  await batch.commit();
}
