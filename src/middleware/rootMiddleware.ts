// src/middleware/rootMiddleware.ts

import { Request, Response, NextFunction } from "express";

export function rootMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // __mode が "test" の場合はテストレスポンスを返す
  const mode = req.query.__mode;
  if (mode === "test") {
    res.status(200).json({
      test: "ok",
      timestamp: new Date().toISOString(),
      body: req.body,
      note: "This is a test response triggered by __mode=test",
    });
    return;
  }

  const start = Date.now();

  // 常に application/json を設定
  res.setHeader("Content-Type", "application/json");

  // レスポンス終了後にログ出力
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `[Relay] ${req.method} ${req.originalUrl} → ${res.statusCode} (${duration}ms)`
    );
  });

  next();
}
