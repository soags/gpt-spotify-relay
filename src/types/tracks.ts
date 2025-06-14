// src/types/tracks.ts

type ArtistSimplified = {
  id: string;
  name: string;
};

export type Track = {
  id: string;
  name: string;
  artists: ArtistSimplified[];
  album: string;
  duration_ms: number;
  explicit: boolean;
  popularity: number;
  addedAt: string;

  audioFeatures?: {
    danceability: number;
    energy: number;
    valence: number;
    tempo: number;
    acousticness: number;
    instrumentalness: number;
    speechiness: number;
    liveness: number;
    loudness: number;
    mode: number;
    key: number;
    timeSignature: number;
    durationMs: number;
  };

  audioAnalysis?: {
    duration: number;
    tempo: number;
    key: number;
    mode: number;
    timeSignature: number;
    loudness: number;
  };

  updatedAt: string;
};
