// src/routes/index.ts

import { Router } from "express";
import * as tracksController from "../controllers/tracksController";
import * as artistsController from "../controllers/artistsController";
import * as followingController from "../controllers/followingController";
import * as playlistsController from "../controllers/playlistsController";

export const spotifyRouter = Router();

spotifyRouter.get("/tracks", tracksController.getTracks);
spotifyRouter.post("/tracks/refresh", tracksController.refreshTracks);

spotifyRouter.get("/artists", artistsController.getArtists);
spotifyRouter.post("/artists/refresh", artistsController.refreshArtists);

spotifyRouter.get("/following", followingController.getFollowing);
spotifyRouter.post("/following/refresh", followingController.refreshFollowing);

spotifyRouter.get("/playlists", playlistsController.getPlaylists);
spotifyRouter.post("/playlists/refresh", playlistsController.refreshPlaylists);
