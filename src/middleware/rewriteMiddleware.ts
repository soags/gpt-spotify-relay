// src/middleware/rewriteMiddleware.ts

import { Request, Response, NextFunction } from "express";
import { parseRequestConfig } from "../utils/parseRequest";

export function rewriteMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const result = parseRequestConfig(req.body);
  if (!result.ok) {
    return res.status(400).json({
      error: "Bad Request",
      detail: result.error || "Invalid request configuration.",
    });
  }

  const { path, method, query, body } = result.config!;

  req.url = "/" + path.replace(/^\//, "");
  req.method = method;
  req.query = query || {};
  req.body = body || {};

  next();
}
