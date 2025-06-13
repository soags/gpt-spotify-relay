import { albumsMatchers } from "./albums";
import { artistsMatchers } from "./artists";
import { playlistMatchers } from "./playlists";
import { tracksMatchers } from "./tracks";
import { usersMatchers } from "./users";

export type Matcher = {
  test: (path: string, query: any) => boolean;
  simplify: (data: any) => any;
};

const matchers: Matcher[] = [
  ...albumsMatchers,
  ...artistsMatchers,
  ...playlistMatchers,
  ...tracksMatchers,
  ...usersMatchers,
];

export function simplifySpotifyResponse(path: string, query: any, data: any) {
  for (const { test, simplify } of matchers) {
    if (test(path, query)) return simplify(data);
  }
  return data;
}
