// src/spotify/simplify/index.ts

import { RequestConfig } from "../../common/createRelayRouter";
import { albumsMatchers } from "./albums";
import { artistsMatchers } from "./artists";
import { genresMatchers } from "./genres";
import { playersMatchers } from "./players";
import { playlistMatchers } from "./playlists";
import { tracksMatchers } from "./tracks";
import { usersMatchers } from "./users";

export type Simplifier = (data: any) => any;

export type Matcher = {
  test: (path: RequestConfig["path"], query: RequestConfig["query"]) => boolean;
  simplify: Simplifier;
};

const matchers: Matcher[] = [
  ...albumsMatchers,
  ...artistsMatchers,
  ...genresMatchers,
  ...playersMatchers,
  ...playlistMatchers,
  ...tracksMatchers,
  ...usersMatchers,
];

export function getSimplifier({
  method,
  path,
  query,
}: RequestConfig): Simplifier | null {
  if (method !== "GET") {
    return null;
  }

  for (const { test, simplify } of matchers) {
    if (test(path, query)) return simplify;
  }

  return null;
}
