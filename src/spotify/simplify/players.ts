// src/spotify/simplify/players.ts

import { Matcher } from ".";
import { simplifyTrackFull } from "./tracks";

export const playersMatchers: Matcher[] = [
  {
    test: (path) => path === "/me/player/recently-played",
    simplify: simplifyRecentlyPlayed,
  },
];

export function simplifyRecentlyPlayed(
  recentlyPlayed: SpotifyApi.UsersRecentlyPlayedTracksResponse
) {
  return {
    next: recentlyPlayed.next,
    cursors: recentlyPlayed.cursors,
    total: recentlyPlayed.total,
    items: recentlyPlayed.items.map((item) => ({
      track: simplifyTrackFull(item.track),
      played_at: item.played_at,
    })),
  };
}
