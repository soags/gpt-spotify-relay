// src/index.ts

import { http } from "@google-cloud/functions-framework";
import express from "express";
import spotifyRouter from "./spotify/router";
import { rootMiddleware } from "./middleware/rootMiddleware";
import { testModeMiddleware } from "./middleware/testModeMiddleware";
import { authMiddleware } from "./middleware/authMiddleware";

const app = express();

app.use(express.json());

app.use(rootMiddleware);

app.use(testModeMiddleware);

app.use(authMiddleware);

app.use("/spotify", spotifyRouter);

http("relay", app);
