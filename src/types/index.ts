// src/types/index.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

export type RequestBody = {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  path: string;
  query?: Record<string, string>;
  body?: Record<string, any>;
};
