// src/common/auth.ts

import { Request } from "@google-cloud/functions-framework";

const API_KEY = process.env.API_KEY;

export function validateApiKey(req: Request) {
  return req.header("x-api-key") === API_KEY;
}
