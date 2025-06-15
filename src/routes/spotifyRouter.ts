// src/routes/index.ts

import { Router } from "express";
import * as tracksController from "../controllers/tracksController";
import * as artistsController from "../controllers/artistsController";
import * as followingController from "../controllers/followingController";
import * as playlistsController from "../controllers/playlistsController";
import * as albumsController from "../controllers/albumsController";
import * as analysisContoller from "../controllers/analysisContoller";

export const spotifyRouter = Router();

spotifyRouter.get("/health", (req, res) => res.json({ status: "ok" }));

spotifyRouter.get("/tracks", tracksController.getTracks);
spotifyRouter.post("/tracks/refresh", tracksController.refreshTracks);

spotifyRouter.get("/artists", artistsController.getArtists);
spotifyRouter.post("/artists/refresh", artistsController.refreshArtists);

spotifyRouter.get("/following", followingController.getFollowing);
spotifyRouter.post("/following/refresh", followingController.refreshFollowing);

spotifyRouter.get("/playlists", playlistsController.getPlaylists);
spotifyRouter.post("/playlists/refresh", playlistsController.refreshPlaylists);
spotifyRouter.get(
  "/playlists/:playlistId",
  playlistsController.getPlaylistTracks
);
spotifyRouter.post(
  "/playlists/:playlistId/refresh",
  playlistsController.refreshPlaylistTracks
);

spotifyRouter.get("/albums", albumsController.getAlbums);
spotifyRouter.post("/albums/refresh", albumsController.refreshAlbums);

spotifyRouter.get("/albums/:albumId", albumsController.getAlbumTracks);
spotifyRouter.post(
  "/albums/:albumId/refresh",
  albumsController.refreshAlbumTracks
);

spotifyRouter.get("/analysis/genres", analysisContoller.getGenreAnalysis);
