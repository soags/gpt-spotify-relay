// src/controllers/albumsController.ts

import { Request, Response } from "express";
import { db } from "../lib/firestore";
import { classifyItems, toCountResponse } from "../services/classifyItems";
import { getAccessToken, getSeveralAlbums } from "../lib/spotify";
import { Album } from "../types/albums";
import { ValidationError } from "../types/error";

export const getAlbums = async (req: Request, res: Response) => {
  const ids = (req.query.ids as string)?.split(",") ?? [];

  const col = db.collection("saved_albums");

  let docs;
  if (ids.length > 0) {
    docs = await Promise.all(ids.map((id) => col.doc(id).get()));
  } else {
    const snapshot = await col.get();
    docs = snapshot.docs;
  }

  const albums = docs.filter((doc) => doc.exists).map((doc) => doc.data());

  return res.json(albums);
};

export const refreshAlbums = async (req: Request, res: Response) => {
  const token = await getAccessToken();

  const { albumIds, force = false } = req.body as {
    albumIds: string[];
    force?: boolean;
  };

  if (!albumIds || albumIds.length === 0) {
    throw new ValidationError("albumIds is required and cannot be empty.");
  }

  const col = db.collection("saved_albums");

  const snapshot = await col.get();
  const cached: Record<string, Album> = {};
  snapshot.docs.forEach((doc) => {
    if (doc.exists) cached[doc.id] = doc.data() as Album;
  });

  const toFetch = force ? albumIds : albumIds.filter((id) => !cached[id]);

  const albums = [];
  for (let i = 0; i < toFetch.length; i += 20) {
    const ids = toFetch.slice(i, i + 20);
    const result = await getSeveralAlbums(ids, token);
    albums.push(...result);
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  const apiItems: Album[] = albums.map((a) => ({
    id: a.id,
    name: a.name,
    artists: a.artists.map((artist) => ({
      id: artist.id,
      name: artist.name,
    })),
    releaseDate: a.release_date,
    totalTracks: a.total_tracks,
    albumType: a.album_type,
  }));

  const result = classifyItems({
    apiItems,
    cached,
    idSelector: (a) => a.id,
    equalsKeys: ["name", "artists", "releaseDate", "totalTracks", "albumType"],
  });

  await Promise.all([
    ...result.createItems.map((a) => col.doc(a.id).set(a)),
    ...result.refreshItems.map((a) => col.doc(a.id).set(a)),
    ...result.deletedIds.map((id) => col.doc(id).delete()),
  ]);

  return res.json(toCountResponse(result));
};
