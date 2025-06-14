// src/types/index.ts

export type RequestConfig = {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  path: string;
  query?: Record<string, string>;
  body?: Record<string, any>;
};
