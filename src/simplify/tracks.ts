// src/simplify/tracks.ts

import { simplifyArtistSimplified } from "./artists";

export function simplifyTracktSimplified(
  res: SpotifyApi.TrackObjectSimplified
) {
  return {
    id: res.id,
    name: res.name,
    artists: res.artists.map(simplifyArtistSimplified),
    duration_ms: res.duration_ms,
    explicit: res.explicit,
  };
}

// GET /me/tracks
export function simplifySavedTracks(res: SpotifyApi.UsersSavedTracksResponse) {
  return {
    next: res.next,
    previous: res.previous,
    total: res.total,
    items: res.items.map((item) => ({
      track: simplifyTrackFull(item.track),
      added_at: item.added_at,
    })),
  };
}

// GET /tracks/:id
export function simplifyTrackFull(res: SpotifyApi.TrackObjectFull) {
  return {
    popularity: res.popularity,
    isrc: res.external_ids.isrc,
    ...simplifyTracktSimplified(res),
  };
}

// Get /tracks
export function simplifyMultipleTracks(res: SpotifyApi.MultipleTracksResponse) {
  return {
    tracks: res.tracks.map(simplifyTrackFull),
  };
}

// GET /audio-features/:id
export function simplifyAudioFeatures(res: SpotifyApi.AudioFeaturesResponse) {
  return {
    danceability: res.danceability,
    energy: res.energy,
    valence: res.valence,
    tempo: res.tempo,
    acousticness: res.acousticness,
    instrumentalness: res.instrumentalness,
    speechiness: res.speechiness,
    liveness: res.liveness,
    loudness: res.loudness,
    mode: res.mode,
    key: res.key,
    time_signature: res.time_signature,
    duration_ms: res.duration_ms,
  };
}

// GET /audio-features
export function simplifyMultipleAudioFeatures(
  res: SpotifyApi.MultipleAudioFeaturesResponse
) {
  return {
    audio_features: res.audio_features.map(simplifyAudioFeatures),
  };
}

// GET /audio-analysis/{id}
export function simplifyAudioAnalysis(res: SpotifyApi.AudioAnalysisResponse) {
  const { track } = res;
  return {
    track: {
      duration: track.duration,
      tempo: track.tempo,
      key: track.key,
      mode: track.mode,
      time_signature: track.time_signature,
      loudness: track.loudness,
    },
  };
}
