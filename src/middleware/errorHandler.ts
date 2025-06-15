// src/middleware/errorHandler.ts

import { Request, Response, NextFunction } from "express";
import {
  NotFoundError,
  NotSupportedError,
  ValidationError,
} from "../types/error";

type ErrorResponse = {
  message: string;
  name: string;
  stack?: string;
};

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error("Error occurred:", err);

  let statusCode = 500;
  const errorResponse: ErrorResponse = {
    message: "An unexpected error occurred.",
    name: "InternalServerError",
  };

  if (err instanceof ValidationError) {
    statusCode = 400; // Bad Request
    errorResponse.message = err.message;
    errorResponse.name = err.name;
  } else if (err instanceof NotSupportedError) {
    statusCode = 405; // Method Not Allowed (またはNot Implementedなど、適切なステータスコードを選択)
    errorResponse.message = err.message;
    errorResponse.name = err.name;
  } else if (err instanceof NotFoundError) {
    statusCode = 404; // Not Found
    errorResponse.message = err.message;
    errorResponse.name = err.name;
  } else {
    // その他の予期せぬエラー
    errorResponse.message = err.message || "An unexpected error occurred.";
    errorResponse.name = err.name || "Error";
  }

  errorResponse.stack = err.stack;

  res.status(statusCode).json(errorResponse);
}
