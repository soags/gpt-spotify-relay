// src/spotify/simplify/users.ts

import { Matcher } from ".";
import { simplifyArtistFull } from "./artists";
import { simplifyTrackFull } from "./tracks";

export const usersMatchers: Matcher[] = [
  {
    test: (path) => path === "/me",
    simplify: simplifyUser,
  },
  {
    test: (path) => path === "/me/top/tracks",
    simplify: simplifyTopTracks,
  },
  {
    test: (path) => path === "/me/top/artists",
    simplify: simplifyTopArtists,
  },
];

// GET /me
export function simplifyUser(user: SpotifyApi.UserObjectPublic) {
  return {
    id: user.id,
    display_name: user.display_name,
  };
}

// GET /me/top/tracks
export function simplifyTopTracks(
  topTracks: SpotifyApi.UsersTopTracksResponse
) {
  return {
    next: topTracks.next,
    previous: topTracks.previous,
    total: topTracks.total,
    items: topTracks.items.map(simplifyTrackFull),
  };
}

// GET /me/top/artists
export function simplifyTopArtists(
  topArtists: SpotifyApi.UsersTopArtistsResponse
) {
  return {
    next: topArtists.next,
    previous: topArtists.previous,
    total: topArtists.total,
    items: topArtists.items.map(simplifyArtistFull),
  };
}
