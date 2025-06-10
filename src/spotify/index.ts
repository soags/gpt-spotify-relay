import { Request, Response } from "@google-cloud/functions-framework";
import { routeRequest } from "./router";
import { validateApiKey } from "../common/auth";

export async function spotifyRelay(req: Request, res: Response) {
  // 認証チェック
  if (!validateApiKey(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const rawPath = req.query.path as string;
  if (!rawPath) {
    return res.status(400).json({ error: 'Missing "path" parameter' });
  }

  let parsedPath: URL;
  try {
    parsedPath = new URL(rawPath, "http://localhost"); // dummy base for relative URL
  } catch {
    return res.status(400).json({ error: "Invalid path format" });
  }

  const cleanPath = parsedPath.pathname || "/";
  const queryFromPath: Record<string, string> = {};
  parsedPath.searchParams.forEach((value, key) => {
    queryFromPath[key] = value;
  });

  const mergedQuery = {
    ...Object.fromEntries(
      Object.entries(req.query).filter(
        ([k]) => !["path", "api_key"].includes(k)
      )
    ),
    ...queryFromPath,
  };

  try {
    const result = await routeRequest(cleanPath, mergedQuery);
    res.status(200).json(result);
  } catch (error: any) {
    console.error(error);

    const status = error?.response?.status || 500;
    const data = error?.response?.data || { error: "Unknown error" };
    res.status(status).json(data);
  }
}
