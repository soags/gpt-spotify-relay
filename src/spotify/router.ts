// src/spotify/router.ts

import { fetchSpotify } from "./spotify";
import { createRelayRouter } from "../common/createRelayRouter";
import { simplifySpotifyResponse } from "./simplify";

export default createRelayRouter(
  (q: any) => {
    const { path, query } = q;
    if (typeof path !== "string" || path.includes("?")) {
      throw new Error("Invalid 'path'. Do not include query parameters in it.");
    }
    return { path, query };
  },
  async ({ path, query }, req, res) => {
    try {
      const response = await fetchSpotify(path, query);
      const data = await response.json();
      if (!response.ok) {
        console.error("Spotify API error:", {
          path,
          query,
          status: response.status,
          data,
        });
        res.status(response.status).json(data);
        return;
      }

      const simplified = simplifySpotifyResponse(path, query, data);
      res.status(response.status).json(simplified);
    } catch (err) {
      console.error("Spotify relay error:", {
        path,
        query,
        error: err instanceof Error ? err.stack : err,
      });
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);
