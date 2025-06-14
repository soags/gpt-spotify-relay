// src/routes/relayRoutes.ts

import {
  simplifyAlbumFull,
  simplifyMultipleAlbums,
  simplifyAlbumTracks,
  simplifySavedAlbums,
} from "../simplify/albums";
import {
  simplifyFollowingArtists,
  simplifyArtistFull,
  simplifyArtistTopTracks,
} from "../simplify/artists";
import { simplifyAvailableGenreSeeds } from "../simplify/genres";
import { simplifyRecentlyPlayed } from "../simplify/players";
import {
  simplifyUserPlaylists,
  simplifyPlaylistFull,
  simplifyPlaylistTracks,
} from "../simplify/playlists";
import {
  simplifySavedTracks,
  simplifyTrackFull,
  simplifyMultipleTracks,
  simplifyMultipleAudioFeatures,
  simplifyAudioFeatures,
  simplifyAudioAnalysis,
} from "../simplify/tracks";
import {
  simplifyUser,
  simplifyTopTracks,
  simplifyTopArtists,
} from "../simplify/users";

type RelayRoute = {
  path: string;
  simplify: (data: any) => any;
};

export const relayRoutes: RelayRoute[] = [
  {
    path: "/albums/:id",
    simplify: simplifyAlbumFull,
  },
  {
    path: "/albums",
    simplify: simplifyMultipleAlbums,
  },
  {
    path: "/albums/:id/tracks",
    simplify: simplifyAlbumTracks,
  },
  {
    path: "/me/albums",
    simplify: simplifySavedAlbums,
  },
  {
    path: "/me/following",
    simplify: simplifyFollowingArtists,
  },
  {
    path: "/artists/:id",
    simplify: simplifyArtistFull,
  },
  {
    path: "/artists/:id/top-tracks",
    simplify: simplifyArtistTopTracks,
  },
  {
    path: "/recommendations/available-genre-seeds",
    simplify: simplifyAvailableGenreSeeds,
  },
  {
    path: "/me/player/recently-played",
    simplify: simplifyRecentlyPlayed,
  },
  {
    path: "/me/playlists",
    simplify: simplifyUserPlaylists,
  },
  {
    path: "/playlists/:id",
    simplify: simplifyPlaylistFull,
  },
  {
    path: "/playlists/:id/tracks",
    simplify: simplifyPlaylistTracks,
  },
  {
    path: "/me/tracks",
    simplify: simplifySavedTracks,
  },
  {
    path: "/tracks/:id",
    simplify: simplifyTrackFull,
  },
  {
    path: "/tracks",
    simplify: simplifyMultipleTracks,
  },
  {
    path: "/audio-features",
    simplify: simplifyMultipleAudioFeatures,
  },
  {
    path: "/audio-features/:id",
    simplify: simplifyAudioFeatures,
  },
  {
    path: "/audio-analysis/:id",
    simplify: simplifyAudioAnalysis,
  },
  {
    path: "/me",
    simplify: simplifyUser,
  },
  {
    path: "/me/top/tracks",
    simplify: simplifyTopTracks,
  },
  {
    path: "/me/top/artists",
    simplify: simplifyTopArtists,
  },
];
