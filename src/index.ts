// src/index.ts

import { http } from "@google-cloud/functions-framework";
import express from "express";
import spotifyRouter from "./spotify/router";

const app = express();

app.use("/spotify", spotifyRouter);

http("relay", app);
