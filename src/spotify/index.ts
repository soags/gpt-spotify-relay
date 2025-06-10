import { Request, Response } from "@google-cloud/functions-framework";
import { routeRequest } from "./router";
import { validateApiKey } from "../common/auth";
import { parseQuery } from "../common/parseQuery";

export async function spotifyRelay(req: Request, res: Response) {
  if (!validateApiKey(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const parsedQuery = parseQuery(req);
  if (parsedQuery.status !== 200) {
    return res.status(parsedQuery.status).json({ error: parsedQuery.error });
  }

  try {
    const result = await routeRequest(parsedQuery.path, parsedQuery.query);
    res.status(200).json(result);
  } catch (error: any) {
    console.error(error);

    const status = error?.response?.status || 500;
    const data = error?.response?.data || { error: "Unknown error" };
    res.status(status).json(data);
  }
}
