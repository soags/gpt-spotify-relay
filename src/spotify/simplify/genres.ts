// src/spotify/simplify/genres.ts

import { Matcher } from ".";

export const genresMatchers: Matcher[] = [
  {
    test: (path) => path === "/recommendations/available-genre-seeds",
    simplify: simplifyAvailableGenreSeeds,
  },
];

export function simplifyAvailableGenreSeeds(
  genre: SpotifyApi.AvailableGenreSeedsResponse
) {
  return genre;
}
