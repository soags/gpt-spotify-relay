// src/controllers/index.ts

import { Request, Response } from "express";
import { parseRequest } from "../services/parseRequest";
import { dispatch } from "../services/spotifyRelayDispatcher";

export function handleRelay(req: Request, res: Response) {
  const request = parseRequest(req);

  const result = dispatch(request);

  res.status(200).json(result);
}
