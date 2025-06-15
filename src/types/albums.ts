// src/types/albums.ts

import { Track } from "./tracks";

export type Album = {
  id: string;
  name: string;
  artists: {
    id: string;
    name: string;
  }[];
  releaseDate: string;
  totalTracks: number;
  albumType: string;
  popularity: number;
};

export type AlbumTrack = Omit<Track, "album" | "popularity">;
