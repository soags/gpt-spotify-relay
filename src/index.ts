// src/index.ts

import { http } from "@google-cloud/functions-framework";
import express from "express";
import { spotifyRouter } from "./routes";
import { auth } from "./middleware/auth";
import { ping } from "./middleware/ping";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(express.json());

app.use(ping);

app.use(auth);

app.use("/spotify", spotifyRouter);

app.use(errorHandler);

http("relay", app);
