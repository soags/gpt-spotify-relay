// src/services/spotifyRelayDispatcher.ts

import { match, MatchFunction } from "path-to-regexp";
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
  match: MatchFunction<object>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  simplify: (data: any) => any;
};

function matchPath(path: string): MatchFunction<object> {
  return match(path, { decode: decodeURIComponent });
}

const relayRoutes: RelayRoute[] = [
  {
    match: matchPath("/albums/:id"),
    simplify: simplifyAlbumFull,
  },
  {
    match: matchPath("/albums"),
    simplify: simplifyMultipleAlbums,
  },
  {
    match: matchPath("/albums/:id/tracks"),
    simplify: simplifyAlbumTracks,
  },
  {
    match: matchPath("/me/albums"),
    simplify: simplifySavedAlbums,
  },
  {
    match: matchPath("/me/following"),
    simplify: simplifyFollowingArtists,
  },
  {
    match: matchPath("/artists/:id"),
    simplify: simplifyArtistFull,
  },
  {
    match: matchPath("/artists/:id/top-tracks"),
    simplify: simplifyArtistTopTracks,
  },
  {
    match: matchPath("/recommendations/available-genre-seeds"),
    simplify: simplifyAvailableGenreSeeds,
  },
  {
    match: matchPath("/me/player/recently-played"),
    simplify: simplifyRecentlyPlayed,
  },
  {
    match: matchPath("/me/playlists"),
    simplify: simplifyUserPlaylists,
  },
  {
    match: matchPath("/playlists/:id"),
    simplify: simplifyPlaylistFull,
  },
  {
    match: matchPath("/playlists/:id/tracks"),
    simplify: simplifyPlaylistTracks,
  },
  {
    match: matchPath("/me/tracks"),
    simplify: simplifySavedTracks,
  },
  {
    match: matchPath("/tracks/:id"),
    simplify: simplifyTrackFull,
  },
  {
    match: matchPath("/tracks"),
    simplify: simplifyMultipleTracks,
  },
  {
    match: matchPath("/audio-features"),
    simplify: simplifyMultipleAudioFeatures,
  },
  {
    match: matchPath("/audio-features/:id"),
    simplify: simplifyAudioFeatures,
  },
  {
    match: matchPath("/audio-analysis/:id"),
    simplify: simplifyAudioAnalysis,
  },
  {
    match: matchPath("/me"),
    simplify: simplifyUser,
  },
  {
    match: matchPath("/me/top/tracks"),
    simplify: simplifyTopTracks,
  },
  {
    match: matchPath("/me/top/artists"),
    simplify: simplifyTopArtists,
  },
];

export async function dispatch(request: RequestBody) {
  console.log("Dispatching request:", request);

  // "/artists" の場合は、キャッシュありの特殊処理
  if (matchPath("/artists")(request.path)) {
    console.log("Handling artists request with cache");
    return await getArtistsWithCache(request);
  }

  const route = relayRoutes.find((r) => r.match(request.path));
  if (!route) {
    throw new NotSupportedError(
      `No supported action found for path: ${request.path}`
    );
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

  console.log(
    `Cached artists: ${cachedIds.length}, Missing artists: ${missingIds.length}`
  );

  // 足りない分を Spotify API から取得
  let newArtists: ArtistGenreData[] = [];
  if (missingIds.length > 0) {
    console.log(`Fetching missing artists from Spotify:`, missingIds);

    const response = await fetchSpotify({
      path: "/artists",
      query: {
        ids: missingIds.join(","),
      },
    });

    console.log(`Received response for missing artists:`, response);

    newArtists = (response.artists ?? [])
      .filter(Boolean)
      .map((a: SpotifyApi.ArtistObjectFull) => ({
        id: a.id,
        name: a.name,
        genres: a.genres ?? [],
        retrieved_at: new Date().toISOString(),
      }));

    console.log(`Fetched ${newArtists.length} new artists from Spotify`);

    await setArtistGenres(newArtists);
  }

  const allResults = [...Object.values(cached), ...newArtists];

  console.log(
    `Total artists after merging cache and new: ${allResults.length}`
  );

  return { artists: allResults };
}
