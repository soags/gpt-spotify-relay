// src/simplify/playlists.ts

import { simplifyTrackFull } from "./tracks";

export function simplifyPlaylistSimplified(
  res: SpotifyApi.PlaylistObjectSimplified
) {
  return {
    id: res.id,
    name: res.name,
    tracks: res.tracks.total,
  };
}

// GET /me/playlists
export function simplifyUserPlaylists(
  res: SpotifyApi.ListOfCurrentUsersPlaylistsResponse
) {
  return {
    next: res.next,
    previous: res.previous,
    total: res.total,
    items: res.items.map(simplifyPlaylistSimplified),
  };
}

// GET /playlists/:id
export function simplifyPlaylistFull(res: SpotifyApi.PlaylistObjectFull) {
  return {
    ...simplifyPlaylistSimplified(res),
  };
}

// GET /playlists/:id/tracks
export function simplifyPlaylistTracks(res: SpotifyApi.PlaylistTrackResponse) {
  return {
    next: res.next,
    previous: res.previous,
    total: res.total,
    items: res.items.map((item) => ({
      track: item.track ? simplifyTrackFull(item.track) : null,
      added_at: item.added_at,
    })),
  };
}
