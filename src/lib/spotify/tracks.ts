// src/lib/spotify/tracks.ts

import { SPOTIFY_API_BASE_URL } from "./constants";
import { fetchAllPaginated } from "./fetchApi";

export const getUsersSavedTracks = async (token: string) => {
  return await fetchAllPaginated<
    SpotifyApi.SavedTrackObject,
    SpotifyApi.UsersSavedTracksResponse
  >({
    getUrl: (_page, limit, offset) => {
      const url = new URL(`${SPOTIFY_API_BASE_URL}/me/tracks`);
      const searchParams = new URLSearchParams({ limit: String(limit) });
      if (offset > 0) searchParams.append("offset", String(offset));
      url.search = searchParams.toString();
      return url;
    },
    extractItems: (res) => res.items,
    extractNext: (res, _page, offset) => offset < res.total,
    token,
  });
};
