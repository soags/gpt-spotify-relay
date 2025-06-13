// src/middleware/testModeMiddleware.ts

import { Request, Response, NextFunction } from "express";

export function testModeMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const mode = req.body?.query?.__mode;

  // __mode が "test" の場合はテストレスポンスを返す
  if (mode === "test") {
    res.status(200).json({
      data: {
        test: "ok",
        timestamp: new Date().toISOString(),
        config: req.body,
        note: "This is a test response triggered by __mode=test",
      },
    });
    return;
  }

  next();
}
