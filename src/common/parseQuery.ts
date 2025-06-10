import { Request } from "@google-cloud/functions-framework";

type ParseQueryResult = {
  path: string;
  query?: Record<string, string>;
  status: number;    
  error?: string;
};

export function parseQuery(req: Request): ParseQueryResult {
  const rawPath = req.query.path as string;
  if (!rawPath) {
    return {
      path: "",
      status: 400,            
      error: 'Missing "path" parameter',
    };
  }

  let parsedPath: URL;
  try {
    const base = "http://localhost"; // dummy base for relative URL
    parsedPath = new URL(rawPath, base);
  } catch {
    return {
      path: "",
      status: 400,
      error: "Invalid path format",
    };
  }

  const cleanPath = parsedPath.pathname || "/";

  const queryFromPath: Record<string, string> = {};
  parsedPath.searchParams.forEach((value, key) => {
    queryFromPath[key] = value;
  });

  const cleanQuery = normalizeQuery(req.query || {});
  const mergedQuery = {
    ...cleanQuery,
    ...queryFromPath,
  };

  return {
    path: cleanPath,
    query: mergedQuery,
    status: 200,
    error: undefined,    
  };
}

function normalizeQuery(query: unknown): Record<string, string> {
  const result: Record<string, string> = {};
  if (typeof query !== "object" || query == null) return result;

  for (const [key, value] of Object.entries(query)) {
    if (["path", "api_key"].includes(key)) continue;

    if (typeof value === "string") {
      result[key] = value;
    } else if (Array.isArray(value) && typeof value[0] === "string") {
      result[key] = value[0]; 
    }
  }

  return result;
}
