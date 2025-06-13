import { Matcher } from ".";
import { simplifyArtistSimplified } from "./artists";

export const tracksMatchers: Matcher[] = [
  {
    test: (path) => /^\/me\/tracks$/.test(path),
    simplify: simplifySavedTracks,
  },
  {
    test: (path) => /^\/tracks\/[^/]+$/.test(path),
    simplify: simplifyTrackFull,
  },
];

export function simplifyTracktSimplified(
  track: SpotifyApi.TrackObjectSimplified
) {
  return {
    id: track.id,
    name: track.name,
    artists: track.artists.map(simplifyArtistSimplified),
    duration_ms: track.duration_ms,
    explicit: track.explicit,
  };
}

// GET /me/tracks
export function simplifySavedTracks(
  savedTracks: SpotifyApi.UsersSavedTracksResponse
) {
  return {
    next: savedTracks.next,
    previous: savedTracks.previous,
    total: savedTracks.total,
    items: savedTracks.items.map((item) => ({
      track: simplifyTrackFull(item.track),
      added_at: item.added_at,
    })),
  };
}

// GET /tracks/:id
export function simplifyTrackFull(track: SpotifyApi.TrackObjectFull) {
  return {
    popularity: track.popularity,
    isrc: track.external_ids.isrc,
    ...simplifyTracktSimplified(track),
  };
}
