// src/lib/spotify/playlists.ts

import { SPOTIFY_API_BASE_URL } from "./constants";
import { fetchAllPaginated } from "./fetchApi";

export async function getUserPlaylists(
  token: string
): Promise<SpotifyApi.PlaylistObjectSimplified[]> {
  return await fetchAllPaginated<
    SpotifyApi.PlaylistObjectSimplified,
    SpotifyApi.ListOfCurrentUsersPlaylistsResponse
  >({
    getUrl: (_page, limit, offset) => {
      const url = new URL(`${SPOTIFY_API_BASE_URL}/me/playlists`);
      const searchParams = new URLSearchParams({ limit: String(limit) });
      if (offset > 0) searchParams.append("offset", String(offset));
      url.search = searchParams.toString();
      return url;
    },
    extractItems: (res) => res.items,
    extractNext: (res, _page, offset) => offset < res.total,
    token,
  });
}

export async function getPlaylistItems(
  playlistId: string,
  token: string
): Promise<SpotifyApi.PlaylistTrackObject[]> {
  return await fetchAllPaginated<
    SpotifyApi.PlaylistTrackObject,
    SpotifyApi.PlaylistTrackResponse
  >({
    getUrl: (_page, limit, offset) => {
      const url = new URL(
        `${SPOTIFY_API_BASE_URL}/playlists/${playlistId}/tracks`
      );
      const searchParams = new URLSearchParams({ limit: String(limit) });
      if (offset > 0) searchParams.append("offset", String(offset));
      url.search = searchParams.toString();
      return url;
    },
    extractItems: (res) => res.items,
    extractNext: (res, _page, offset) => offset < res.total,
    token,
  });
}
