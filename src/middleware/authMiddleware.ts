// src/middleware/authMiddleware.ts

import { Request, Response, NextFunction } from "express";

const API_KEY = process.env.API_KEY;

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const key = req.header("X-API-KEY");

  if (!key || key !== API_KEY) {
    res.status(401).json({
      error: "Unauthorized",
      message: "Invalid or missing API key",
    });
    return;
  }

  next();
}
