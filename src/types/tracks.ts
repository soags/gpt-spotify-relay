// src/types/tracks.ts

import { ArtistSimplified } from "./artists";

export type Track = {
  id: string;
  name: string;
  artists: ArtistSimplified[];
  album: string;
  duration_ms: number;
  explicit: boolean;
  popularity: number;
  addedAt: string;
  updatedAt: string;
};
