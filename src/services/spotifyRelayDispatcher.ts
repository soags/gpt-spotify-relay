// src/services/spotifyRelayDispatcher.ts

import { fetchSpotify } from "../api/spotify";
import {
  simplifyAlbumFull,
  simplifyMultipleAlbums,
  simplifyAlbumTracks,
  simplifySavedAlbums,
} from "../simplify/albums";
import {
  simplifyFollowingArtists,
  simplifyArtistFull,
  simplifyMultipleArtists,
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
import { RequestBody } from "../types";
import { NotSupportedError, ValidationError } from "../types/error";
import {
  ArtistGenreData,
  getArtistGenres,
  setArtistGenres,
} from "./artistGenres";

type RelayRoute = {
  path: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  simplify: (data: any) => any;
};

const relayRoutes: RelayRoute[] = [
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
    path: "/artists",
    simplify: simplifyMultipleArtists,
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

const pathToActionMap = new Map(
  relayRoutes.map((route) => [route.path, route])
);

export async function dispatch(request: RequestBody) {
  const route = pathToActionMap.get(request.path);

  if (!route) {
    throw new NotSupportedError(
      `No supported action found for path: ${request.path}`
    );
  }

  // "/artists" の場合は、キャッシュありの特殊処理
  if (route.path === "/artists") {
    return getArtistsWithCache(request);
  }

  const data = await fetchSpotify(request);

  const simplified = route.simplify(data);
  return simplified;
}

export async function getArtistsWithCache(request: RequestBody) {
  const ids = (request.query?.ids as string)?.split(",").filter(Boolean) ?? [];

  if (ids.length === 0) {
    throw new ValidationError("No artist IDs provided.");
  }

  // キャッシュから取得
  const cached = await getArtistGenres(ids);
  const cachedIds = Object.keys(cached);
  const missingIds = ids.filter((id) => !cachedIds.includes(id));

  // 足りない分を Spotify API から取得
  let newArtists: ArtistGenreData[] = [];
  if (missingIds.length > 0) {
    const { artists } = await fetchSpotify({
      path: "/artists",
      query: {
        ids: missingIds.join(","),
      },
    });

    newArtists = artists.map((a: SpotifyApi.ArtistObjectFull) => ({
      id: a.id,
      name: a.name,
      genres: a.genres ?? [],
      retrieved_at: new Date().toISOString(),
    }));

    await setArtistGenres(newArtists);
  }

  const allResults = [...Object.values(cached), ...newArtists];

  return { artists: allResults };
}
