// src/spotify/simplify/genres.ts

import { Matcher } from ".";

export const genresMatchers: Matcher[] = [
  {
    test: (path) => /^\/recommendations\/available-genre-seeds$/.test(path),
    simplify: simplifyAvailableGenreSeeds,
  },
];

export function simplifyAvailableGenreSeeds(
  res: SpotifyApi.AvailableGenreSeedsResponse
) {
  return res;
}
