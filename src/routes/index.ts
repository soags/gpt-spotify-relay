// src/routes/index.ts

import { Router } from "express";
import * as tracksController from "../controllers/tracksController";

export const spotifyRouter = Router();

spotifyRouter.get("/tracks", tracksController.getTracks);
spotifyRouter.post("/tracks/refresh", tracksController.refresh);
