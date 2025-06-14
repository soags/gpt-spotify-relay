// src/controllers/artistsController.ts

import { Request, Response } from "express";
import { getAccessToken, getSeveralArtists } from "../lib/spotify";
import { db } from "../lib/firestore";
import { ValidationError } from "../types/error";
import { Artist } from "../types/artists";
import { classifyItems, toCountResponse } from "../services/classifyItems";

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

  return res.json(artists);
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
  }

  const apiItems: Artist[] = artists.map((a) => ({
    id: a.id,
    name: a.name,
    genres: a.genres,
    popularity: a.popularity,
  }));

  const result = classifyItems({
    apiItems,
    cached,
    idSelector: (a) => a.id,
    equals: (api, cached) =>
      Boolean(cached) &&
      api.name === cached.name &&
      JSON.stringify(api.genres) === JSON.stringify(cached.genres) &&
      api.popularity === cached.popularity,
  });

  await Promise.all([
    ...result.createItems.map((a) => col.doc(a.id).set(a)),
    ...result.refreshItems.map((a) => col.doc(a.id).set(a)),
    ...result.deletedIds.map((id) => col.doc(id).delete()),
  ]);

  return res.json(toCountResponse(result));
}
