import { Matcher } from ".";
import { simplifyTrackFull } from "./tracks";

export const playlistMatchers: Matcher[] = [
  {
    test: (path) => /^\/me\/playlists$/.test(path),
    simplify: simplifyUserPlaylists,
  },
  {
    test: (path) => /^\/playlists\/[^/]+$/.test(path),
    simplify: simplifyPlaylistFull,
  },
  {
    test: (path) => /^\/playlists\/[^/]+\/tracks$/.test(path),
    simplify: simplifyPlaylistTracks,
  },
];

export function simplifyPlaylistSimplified(
  playlist: SpotifyApi.PlaylistObjectSimplified
) {
  return {
    id: playlist.id,
    name: playlist.name,
    tracks: playlist.tracks.total,
  };
}

// GET /me/playlists
export function simplifyUserPlaylists(
  playlists: SpotifyApi.ListOfCurrentUsersPlaylistsResponse
) {
  return {
    next: playlists.next,
    previous: playlists.previous,
    total: playlists.total,
    items: playlists.items.map(simplifyPlaylistSimplified),
  };
}

// GET /playlists/:id
export function simplifyPlaylistFull(playlist: SpotifyApi.PlaylistObjectFull) {
  return {
    ...simplifyPlaylistSimplified(playlist),
  };
}

// GET /playlists/:id/tracks
export function simplifyPlaylistTracks(
  tracks: SpotifyApi.PlaylistTrackResponse
) {
  return {
    next: tracks.next,
    previous: tracks.previous,
    total: tracks.total,
    items: tracks.items.map((item) => ({
      track: item.track ? simplifyTrackFull(item.track) : null,
      added_at: item.added_at,
    })),
  };
}
