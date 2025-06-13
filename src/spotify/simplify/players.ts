// src/spotify/simplify/players.ts

import { Matcher } from ".";
import { simplifyTrackFull } from "./tracks";

export const playersMatchers: Matcher[] = [
  {
    test: (path) => /^\/me\/player\/recently-played$/.test(path),
    simplify: simplifyRecentlyPlayed,
  },
];

export function simplifyRecentlyPlayed(
  res: SpotifyApi.UsersRecentlyPlayedTracksResponse
) {
  return {
    next: res.next,
    cursors: res.cursors,
    total: res.total,
    items: res.items.map((item) => ({
      track: simplifyTrackFull(item.track),
      played_at: item.played_at,
    })),
  };
}
