// src/common/auth.ts

import { Request } from "@google-cloud/functions-framework";

const API_KEY = process.env.API_KEY;

export function validateApiKey(req: Request) {
  const headerKey = req.header("x-api-key");
  if (!headerKey || headerKey !== API_KEY) {
    console.warn(`invalid api key: ${headerKey}`);
    return false;
  }

  return true;
}
