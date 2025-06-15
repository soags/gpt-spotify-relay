// src/index.ts

import { http } from "@google-cloud/functions-framework";
import express from "express";
import { spotifyRouter } from "./routes/spotifyRouter";
import { auth } from "./middleware/auth";
import { errorHandler } from "./middleware/errorHandler";
import { contextRouter } from "./routes/contextRouter";

const app = express();

app.use(express.json());

app.use(auth);

app.use("/health", (req, res) => res.json({ status: "ok" }));

app.use("/spotify", spotifyRouter);

app.use("/context", contextRouter);

app.use(errorHandler);

http("relay", app);
