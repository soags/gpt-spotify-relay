// src/routes/index.ts

import { Router } from "express";
import * as tracksController from "../controllers/tracksController";

export const spotifyRouter = Router();

spotifyRouter.post("/artists/refresh", tracksController.refresh);
