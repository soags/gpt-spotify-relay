// src/types/albums.ts

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
