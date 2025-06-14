// src/services/parseRequest.ts

import { Request } from "express";
import { RequestBody } from "../types";
import { ValidationError } from "../types/error";

export function parseRequest(req: Request): RequestBody {
  const body = req.body;

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
    method: upperCaseMethod as RequestBody["method"],
    path: config.path,
    query: config.query as Record<string, string> | undefined,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    body: config.body as Record<string, any> | undefined,
  };
}
