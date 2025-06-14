// src/simplify/players.ts

import { simplifyTrackFull } from "./tracks";

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
