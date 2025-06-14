// src/middleware/auth.ts

import { Request, Response, NextFunction } from "express";

const API_KEY = process.env.API_KEY;

export function auth(req: Request, res: Response, next: NextFunction) {
  console.log("Auth middleware triggered");

  const key = req.header("X-API-KEY");

  if (!key || key !== API_KEY) {
    console.warn("Unauthorized access attempt detected");
    return res.status(401).json({
      error: "Unauthorized",
      message: "Invalid or missing API key",
    });
  }

  next();
}
