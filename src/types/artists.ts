// src/types/artists.ts

export type ArtistSimplified = {
  id: string;
  name: string;
};

export type Artist = ArtistSimplified & {
  genres: string[];
  popularity: number;
  updatedAt: string;
};
