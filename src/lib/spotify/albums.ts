// src/lib/spotify/albums.ts

import { SPOTIFY_API_BASE_URL } from "./constants";
import { fetchApi, fetchAllPaginated } from "./fetchApi";

export const getSeveralAlbums = async (ids: string[], token: string) => {
  const url = new URL(`${SPOTIFY_API_BASE_URL}/albums`);
  url.searchParams.append("ids", ids.join(","));

  const res = await fetchApi<SpotifyApi.MultipleAlbumsResponse>(url, token);

  return res.albums;
};

export const getAlbumTracks = async (albumId: string, token: string) => {
  return await fetchAllPaginated<
    SpotifyApi.TrackObjectSimplified,
    SpotifyApi.AlbumTracksResponse
  >({
    getUrl: (_page, limit, offset) => {
      const url = new URL(`${SPOTIFY_API_BASE_URL}/albums/${albumId}/tracks`);
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
