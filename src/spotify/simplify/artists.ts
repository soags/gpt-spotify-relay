// src/spotify/simplify/artists.ts

import { Matcher } from ".";
import { simplifyTrackFull } from "./tracks";

export const artistsMatchers: Matcher[] = [
  {
    test: (path, q) =>
      /^\/me\/following\?type=artist$/.test(path) && q?.type === "artist",
    simplify: simplifyFollowingArtists,
  },
  {
    test: (path) => /^\/artists\/[^/]+$/.test(path),
    simplify: simplifyArtistFull,
  },
  {
    test: (path) => /^\/artists$/.test(path),
    simplify: simplifyMultipleArtists,
  },
  {
    test: (path) => /^\/artists\/[^/]+\/top-tracks$/.test(path),
    simplify: simplifyArtistTopTracks,
  },
];

export function simplifyArtistSimplified(
  res: SpotifyApi.ArtistObjectSimplified
) {
  return {
    id: res.id,
    name: res.name,
  };
}

// GET /me/following?type=artist
export function simplifyFollowingArtists(
  res: SpotifyApi.UsersFollowedArtistsResponse
) {
  const { artists } = res;
  return {
    artists: {
      next: artists.next,
      cursors: artists.cursors,
      total: artists.total,
      items: artists.items.map(simplifyArtistFull),
    },
  };
}

// GET /artists/:id
export function simplifyArtistFull(res: SpotifyApi.ArtistObjectFull) {
  return {
    genres: res.genres,
    followers: res.followers.total,
    popularity: res.popularity,
    ...simplifyArtistSimplified(res),
  };
}

// GET /artists
export function simplifyMultipleArtists(
  res: SpotifyApi.MultipleArtistsResponse
) {
  return {
    artists: res.artists.map(simplifyArtistFull),
  };
}

// GET /artists/:id/top-tracks
export function simplifyArtistTopTracks(
  res: SpotifyApi.ArtistsTopTracksResponse
) {
  return {
    tracks: res.tracks.map(simplifyTrackFull),
  };
}
