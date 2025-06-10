import { Request, Response } from "@google-cloud/functions-framework";
import { validateApiKey } from "../common/auth";
import { routeRequest } from "./router";

export const notionRelay = async (req: Request, res: Response) => {
  // 認証チェック
  if (!validateApiKey(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const path = req.query.path as string;
  if (!path) {
    return res.status(400).json({ error: 'Missing "path" parameter' });
  }

  try {
    const result = await routeRequest(path, req.query);
    res.status(200).json(result);
  } catch (error: any) {
    console.error(error);

    const status = error?.response?.status || 500;
    const data = error?.response?.data || { error: 'Unknown error' };
    res.status(status).json(data);
  }
};