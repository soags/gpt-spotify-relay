// src/index.ts

import { http } from "@google-cloud/functions-framework";
import express, { ErrorRequestHandler } from "express";
import spotifyRouter from "./routes";
import { rootMiddleware } from "./middleware/rootMiddleware";
import { authMiddleware } from "./middleware/authMiddleware";
import { rewriteMiddleware } from "./middleware/rewriteMiddleware";

const app = express();

app.use(express.json());

app.use(rootMiddleware);

app.use(authMiddleware);

app.use(rewriteMiddleware);

app.use("/spotify", spotifyRouter);

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  const statusCode = err.status || 500;

  console.error("Spotify relay error:", {
    request: {
      method: req.method,
      path: req.path,
      query: req.query,
      body: req.body,
    },
    message: err.message,
    stack: err.stack,
  });

  res
    .status(statusCode)
    .json({ error: "Internal Server Error", stack: err.stack });
};

app.use(errorHandler);

http("relay", app);
