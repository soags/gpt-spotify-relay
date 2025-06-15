// src/lib/spotify/artists.ts

import { SPOTIFY_API_BASE_URL } from "./constants";
import { fetchApi } from "./fetchApi";

export const getSeveralArtists = async (ids: string[], token: string) => {
  const url = new URL(`${SPOTIFY_API_BASE_URL}/artists`);
  url.searchParams.append("ids", ids.join(","));

  const res = await fetchApi<SpotifyApi.MultipleArtistsResponse>(url, token);

  return res.artists;
};
