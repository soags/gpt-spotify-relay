// src/spotify/router.ts

import { getSpotify } from "./spotify";
import { createRelayRouter } from "../common/createRelayRouter";
import { getSimplifier } from "./simplify";

export default createRelayRouter(async (config, req, res) => {
  const { path, query } = config;

  try {
    const simplifier = getSimplifier(config);

    if (!simplifier) {
      console.error("No simplifier found for path:", path, "query:", query);
      res.status(404).json({
        error: "SIMPLIFIER_NOT_FOUND",
        message:
          "No specific simplification logic was found for the given API path and query parameters.",
        details: config,
        action_required:
          "Please verify the API endpoint path and query parameters against the available documentation or supported patterns.",
      });
      return;
    }

    const response = await getSpotify(path, query);
    const json = await response.json();

    if (!response.ok) {
      console.error("Spotify API error:", {
        path,
        query,
        status: response.status,
      });
      res.status(response.status).json(json);
      return;
    }

    const simplified = simplifier(json);

    res.status(response.status).json({
      data: simplified,
    });
  } catch (err) {
    console.error("Spotify relay error:", {
      path,
      query,
      error: err instanceof Error ? err.stack : err,
    });
    res.status(500).json({ error: "Internal Server Error" });
  }
});
