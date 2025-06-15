// src/types/tracks.ts

import { ArtistSimplified } from "./artists";

export type Track = {
  id: string;
  name: string;
  artists: ArtistSimplified[];
  album: {
    id: string;
    name: string;
  };
  duration_ms: number;
  explicit: boolean;
  popularity: number;
};

export type SavedTrack = Track & {
  addedAt: string;
};
