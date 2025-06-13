// src/common/createRelayRouter.ts

import express from "express";

export type RequestConfig = {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
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
      const message = err instanceof Error ? err.message : String(err);

      if (err instanceof ValidationError) {
        res.status(400).json({ error: "Bad Request", detail: message });
      } else {
        res.status(500).json({ error: "Internal error", detail: message });
      }
    }
  });

  return router;
}

class ValidationError extends Error {}

function parseRequestConfig(body: unknown): RequestConfig {
  if (typeof body !== "object" || body === null) {
    throw new ValidationError(
      "Invalid input: Expected an object for RequestConfig."
    );
  }

  const config = body as Record<string, unknown>;

  // method
  if (typeof config.method !== "string") {
    throw new ValidationError(
      'Invalid RequestConfig: "method" is required and must be a string.'
    );
  }

  const upperCaseMethod = config.method.toUpperCase();
  if (!["GET", "POST", "PUT", "DELETE", "PATCH"].includes(upperCaseMethod)) {
    throw new ValidationError(
      'Invalid RequestConfig: "method" must be "GET", "POST", "PUT", "DELETE", or "PATCH". (Case-insensitive)'
    );
  }

  // path
  if (typeof config.path !== "string") {
    throw new ValidationError(
      'Invalid RequestConfig: "path" is required and must be a string.'
    );
  }

  if (config.path.includes("?")) {
    throw new ValidationError(
      "Invalid 'path'. Do not include query parameters in it."
    );
  }

  // query
  if (config.query !== undefined) {
    if (typeof config.query !== "object" || config.query === null) {
      throw new ValidationError(
        'Invalid RequestConfig: "query" must be an object if provided.'
      );
    }
  }

  // body
  if (config.body !== undefined) {
    if (typeof config.body !== "object" || config.body === null) {
      throw new ValidationError(
        'Invalid RequestConfig: "body" must be an object if provided.'
      );
    }
  }

  return {
    method: upperCaseMethod as RequestConfig["method"],
    path: config.path,
    query: config.query as Record<string, string | number> | undefined,
    body: config.body as Record<string, any> | undefined,
  } as RequestConfig;
}
