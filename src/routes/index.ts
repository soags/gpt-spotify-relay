// src/routes/index.ts

import { Router } from "express";
import { relayRoutes } from "./relayRoutes";
import {
  ArtistGenreData,
  getArtistGenres,
  setArtistGenres,
} from "../utils/artistGenres";
import { relaySpotify } from "../utils/spotify";
import { RequestConfig } from "../types";

const spotifyRouter = Router();

spotifyRouter.get("/artists", async (req, res) => {
  const ids = (req.query.ids as string)?.split(",").filter(Boolean) ?? [];

  if (ids.length === 0) {
    return res.status(400).json({ error: "No artist IDs provided." });
  }

  // キャッシュから取得
  const cached = await getArtistGenres(ids);
  const cachedIds = Object.keys(cached);
  const missingIds = ids.filter((id) => !cachedIds.includes(id));

  // 足りない分を Spotify API から取得
  let newArtists: ArtistGenreData[] = [];
  if (missingIds.length > 0) {
    const { artists } = await relaySpotify({
      path: "/artists",
      query: { ids: missingIds.join(",") },
    });

    newArtists = artists.map((a: any) => ({
      id: a.id,
      name: a.name,
      genres: a.genres ?? [],
      retrieved_at: new Date().toISOString(),
    }));

    await setArtistGenres(newArtists);
  }

  // 結果をマージして返却
  const allResults = [...Object.values(cached), ...newArtists];
  return res.json({ artists: allResults });
});

// Relay
spotifyRouter.all("*", (req, res) => {
  for (const { path, simplify } of relayRoutes) {
    if (req.path === path) {
      const result = simplify(
        relaySpotify({
          path: req.path,
          query: req.query as RequestConfig["query"],
        })
      );
      return res.status(200).json(result);
    }
  }

  res.status(404).json({ error: "Unknown path in relay" });
});

export default spotifyRouter;
