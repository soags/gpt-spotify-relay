// src/spotify/simplify/users.ts

import { Matcher } from ".";
import { simplifyArtistFull } from "./artists";
import { simplifyTrackFull } from "./tracks";

export const usersMatchers: Matcher[] = [
  {
    test: (path) => /^\/me$/.test(path),
    simplify: simplifyUser,
  },
  {
    test: (path) => /^\/me\/top\/tracks$/.test(path),
    simplify: simplifyTopTracks,
  },
  {
    test: (path) => /^\/me\/top\/artists$/.test(path),
    simplify: simplifyTopArtists,
  },
];

// GET /me
export function simplifyUser(res: SpotifyApi.UserObjectPublic) {
  return {
    id: res.id,
    display_name: res.display_name,
  };
}

// GET /me/top/tracks
export function simplifyTopTracks(res: SpotifyApi.UsersTopTracksResponse) {
  return {
    next: res.next,
    previous: res.previous,
    total: res.total,
    items: res.items.map(simplifyTrackFull),
  };
}

// GET /me/top/artists
export function simplifyTopArtists(res: SpotifyApi.UsersTopArtistsResponse) {
  return {
    next: res.next,
    previous: res.previous,
    total: res.total,
    items: res.items.map(simplifyArtistFull),
  };
}
