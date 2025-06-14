// src/controllers/artistsController.ts

import { Request, Response } from "express";
import { getAccessToken, GetSeveralArtists } from "../lib/spotify";
import { db } from "../lib/firestore";
import { ValidationError } from "../types/error";

export const getArtists = async (req: Request, res: Response) => {
  const ids = (req.query.ids as string)?.split(",") ?? [];

  const col = db.collection("saved_artists");

  let docs;
  if (ids.length > 0) {
    docs = await Promise.all(ids.map((id) => col.doc(id).get()));
  } else {
    const snapshot = await col.get();
    docs = snapshot.docs;
  }

  const artists = docs.filter((doc) => doc.exists).map((doc) => doc.data());

  res.json(artists);
};

export async function refreshArtists(req: Request, res: Response) {
  const token = await getAccessToken();

  const { artistIds, force = false } = req.body as {
    artistIds: string[];
    force?: boolean;
  };

  if (!artistIds || artistIds.length === 0) {
    throw new ValidationError("artistIds is required and cannot be empty.");
  }

  const col = db.collection("saved_artists");

  const toFetch: string[] = [];

  for (const id of artistIds) {
    const doc = await col.doc(id).get();
    if (!doc.exists || force) {
      toFetch.push(id);
    }
  }

  const results = [];

  for (let i = 0; i < toFetch.length; i += 50) {
    const ids = toFetch.slice(i, i + 50);
    const artists = await GetSeveralArtists({ ids }, token);

    for (const a of artists) {
      await col.doc(a.id).set({
        id: a.id,
        name: a.name,
        genres: a.genres,
        popularity: a.popularity,
        updatedAt: new Date().toISOString(),
      });
      results.push({ id: a.id, status: "refreshed" });
    }
  }

  return res.json(results);
}
