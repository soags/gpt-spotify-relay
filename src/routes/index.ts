// src/routes/index.ts

import { Router } from "express";
import * as spotifyController from "../controllers/spotifyController";

export const spotifyRouter = Router();

spotifyRouter.post("/", spotifyController.handleRelay);
