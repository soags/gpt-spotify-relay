// src/spotify/router.ts

import { fetchSpotify } from "./spotify";
import { createRelayRouter } from "../common/createRelayRouter";
import { getSimplifier } from "./simplify";

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
      const simplifier = getSimplifier(path, query);
      if (!simplifier) {
        console.error("No simplifier found for path:", path, "query:", query);
        res.status(404).json({
          error: "SIMPLIFIER_NOT_FOUND",
          message:
            "No specific simplification logic was found for the given API path and query parameters.",
          details: {
            requested_path: path,
            requested_query: query,
          },
          action_required:
            "Please verify the API endpoint path and query parameters against the available documentation or supported patterns.",
        });
        return;
      }

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

      const simplified = simplifier(data);
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
