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
  {
    test: (path) => /^\/audio-analysis\/[^/]+$/.test(path),
    simplify: simplifyAudioAnalysis,
  },
  {
    test: (path, q) => path === "/audio-features",
    simplify: simplifyMultipleAudioFeatures,
  },
  {
    test: (path) => /^\/audio-features$/.test(path),
    simplify: simplifyMultipleAudioFeatures,
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

// GET /audio-features/:id
export function simplifyAudioFeatures(
  audioFeatures: SpotifyApi.AudioFeaturesResponse
) {
  return {
    danceability: audioFeatures.danceability,
    energy: audioFeatures.energy,
    valence: audioFeatures.valence,
    tempo: audioFeatures.tempo,
    acousticness: audioFeatures.acousticness,
    instrumentalness: audioFeatures.instrumentalness,
    speechiness: audioFeatures.speechiness,
    liveness: audioFeatures.liveness,
    loudness: audioFeatures.loudness,
    mode: audioFeatures.mode,
    key: audioFeatures.key,
    time_signature: audioFeatures.time_signature,
    duration_ms: audioFeatures.duration_ms,
  };
}

// GET /audio-features
export function simplifyMultipleAudioFeatures(
  audioFeatures: SpotifyApi.MultipleAudioFeaturesResponse
) {
  return {
    audio_features: audioFeatures.audio_features.map(simplifyAudioFeatures),
  };
}

// GET /audio-analysis/{id}
export function simplifyAudioAnalysis(
  audioAnalysis: SpotifyApi.AudioAnalysisResponse
) {
  const { track } = audioAnalysis;
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
