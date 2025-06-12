// src/index.ts

import { http } from "@google-cloud/functions-framework";
import express from "express";
import spotifyRouter from "./spotify/router";
import notionRouter from "./notion/router";

const app = express();

app.use("/spotify", spotifyRouter);
app.use("/notion", notionRouter);

http("relay", app);
