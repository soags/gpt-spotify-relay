// src/common/createRelayRouter.ts

import express from "express";

export type RequestConfig = {
  method: string;
  path: string;
  query?: Record<string, string>;
  body?: Record<string, any>;
};

type RequestHandler = (
  config: RequestConfig,
  req: express.Request,
  res: express.Response
) => Promise<void>;

export function createRelayRouter<T>(handler: RequestHandler): express.Router {
  const router = express.Router();

  router.post("/", async (req, res) => {
    try {
      const config = parseRequestConfig(req.body);
      await handler(config, req, res);
    } catch (err) {
      res.status(500).json({
        error: "Internal error",
        detail: err instanceof Error ? err.message : String(err),
      });
    }
  });

  return router;
}

function parseRequestConfig(body: unknown): RequestConfig {
  if (typeof body !== "object" || body === null) {
    throw new Error("Invalid input: Expected an object for RequestConfig.");
  }

  const config = body as Record<string, unknown>;

  if (typeof config.method !== "string") {
    throw new Error(
      'Invalid RequestConfig: "method" is required and must be a string.'
    );
  }
  if (typeof config.path !== "string") {
    throw new Error(
      'Invalid RequestConfig: "path" is required and must be a string.'
    );
  }
  if (config.query !== undefined) {
    if (typeof config.query !== "object" || config.query === null) {
      throw new Error(
        'Invalid RequestConfig: "query" must be an object if provided.'
      );
    }
  }
  if (config.body !== undefined) {
    if (typeof config.body !== "object" || config.body === null) {
      throw new Error(
        'Invalid RequestConfig: "body" must be an object if provided.'
      );
    }
  }

  if (config.path.includes("?")) {
    throw new Error("Invalid 'path'. Do not include query parameters in it.");
  }

  return {
    method: config.method,
    path: config.path,
    query: config.query as Record<string, string | number> | undefined,
    body: config.body as Record<string, any> | undefined,
  } as RequestConfig;
}
