// src/utils/parseRequest.ts

import { RequestConfig } from "../types";

type ParseResult = {
  ok: boolean;
  config?: RequestConfig;
  error?: string;
};

export function parseRequestConfig(body: unknown): ParseResult {
  if (typeof body !== "object" || body === null) {
    return {
      ok: false,
      error: "Invalid input: Expected an object for RequestConfig.",
    };
  }

  const config = body as Record<string, unknown>;

  // method
  if (typeof config.method !== "string") {
    return {
      ok: false,
      error:
        'Invalid RequestConfig: "method" is required and must be a string.',
    };
  }

  const upperCaseMethod = config.method.toUpperCase();
  if (!["GET", "POST", "PUT", "DELETE", "PATCH"].includes(upperCaseMethod)) {
    return {
      ok: false,
      error:
        'Invalid RequestConfig: "method" must be "GET", "POST", "PUT", "DELETE", or "PATCH". (Case-insensitive)',
    };
  }

  // path
  if (typeof config.path !== "string") {
    return {
      ok: false,
      error: 'Invalid RequestConfig: "path" is required and must be a string.',
    };
  }

  if (config.path.includes("?")) {
    return {
      ok: false,
      error: "Invalid 'path'. Do not include query parameters in it.",
    };
  }

  // query
  if (config.query !== undefined) {
    if (typeof config.query !== "object" || config.query === null) {
      return {
        ok: false,
        error: 'Invalid RequestConfig: "query" must be an object if provided.',
      };
    }
  }

  // body
  if (config.body !== undefined) {
    if (typeof config.body !== "object" || config.body === null) {
      return {
        ok: false,
        error: 'Invalid RequestConfig: "body" must be an object if provided.',
      };
    }
  }

  return {
    ok: true,
    config: {
      method: upperCaseMethod as RequestConfig["method"],
      path: config.path,
      query: config.query as Record<string, string> | undefined,
      body: config.body as Record<string, any> | undefined,
    },
  };
}
