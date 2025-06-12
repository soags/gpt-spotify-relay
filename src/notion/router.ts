// src/notion/router.ts
import { fetchNotion } from "./notion";
import { createRelayRouter } from "../common/createRelayRouter";
import { simplifyNotionResponse } from "./simplify";

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
      const { method, body } = req;
      const response = await fetchNotion(path, query, method, body);
      const data = await response.json();
      if (!response.ok) {
        console.error("Notion API error:", {
          path,
          query,
          status: response.status,
          data,
        });
        res.status(response.status).json(data);
        return;
      }

      const simplified = simplifyNotionResponse(path, query, data);
      res.status(response.status).json(simplified);
    } catch (err) {
      console.error("Notion relay error:", {
        path,
        query,
        error: err instanceof Error ? err.stack : err,
      });
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);
