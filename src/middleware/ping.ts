// src/middleware/ping.ts

import { Request, Response, NextFunction } from "express";

export function ping(req: Request, res: Response, next: NextFunction) {
  // __mode が "ping" の場合はテストレスポンスを返す
  const mode = req.body?.query?.__mode;
  if (mode === "ping") {
    console.log("Ping mode detected, returning test response");
    return res.status(200).json({
      test: "ok",
      timestamp: new Date().toISOString(),
      body: req.body,
      note: "This is a ping response triggered by __mode=ping",
    });
  }

  next();
}
