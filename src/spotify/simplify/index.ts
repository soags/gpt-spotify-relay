import { albumsMatchers } from "./albums";
import { artistsMatchers } from "./artists";
import { playlistMatchers } from "./playlists";
import { tracksMatchers } from "./tracks";
import { usersMatchers } from "./users";

export type Simplifier = (data: any) => any;

export type Matcher = {
  test: (path: string, query: any) => boolean;
  simplify: Simplifier;
};

const matchers: Matcher[] = [
  ...albumsMatchers,
  ...artistsMatchers,
  ...playlistMatchers,
  ...tracksMatchers,
  ...usersMatchers,
];

export function getSimplifier(path: string, query: any): Simplifier | null {
  for (const { test, simplify } of matchers) {
    if (test(path, query)) return simplify;
  }
  return null;
}
