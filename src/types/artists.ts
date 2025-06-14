// src/types/artists.ts

export type ArtistSimplified = {
  id: string;
  name: string;
};

export type Artist = ArtistSimplified & {
  genres: string[];
  popularity: number;
};

export type FollowingArtist = Artist & {
  followedAt: string;
};
