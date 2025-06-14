// src/controllers/index.ts

import { Request, Response } from "express";
import { parseRequest } from "../services/parseRequest";
import { dispatch } from "../services/spotifyRelayDispatcher";

export async function handleRelay(req: Request, res: Response) {
  console.log("Relay request received:", req.body);

  const request = parseRequest(req);

  const result = await dispatch(request);

  console.log("Relay result:", result);

  return res.status(200).json(result);
}
