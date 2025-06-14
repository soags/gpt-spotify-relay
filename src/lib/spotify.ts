// src/lib/spotify.ts

import { UnauthorizedError } from "../types/error";

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID!;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET!;
const SPOTIFY_REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN!;
const SPOTIFY_API_BASE_URL = "https://api.spotify.com/v1";

export const getSeveralArtists = async (ids: string[], token: string) => {
  const url = new URL(`${SPOTIFY_API_BASE_URL}/artists`);
  url.searchParams.append("ids", ids.join(","));

  const res = await fetchApi<SpotifyApi.MultipleArtistsResponse>(url, token);

  return res.artists;
};

export const getUsersSavedTracks = async (token: string) => {
  const tracks = [];

  let offset = 0;
  let tryCount = 1;
  for (let i = 0; i < tryCount; i++) {
    const url = new URL(`${SPOTIFY_API_BASE_URL}/me/tracks`);

    const searchParams = new URLSearchParams({
      limit: "50",
    });
    if (offset > 0) searchParams.append("offset", String(offset));
    url.search = searchParams.toString();

    const res = await fetchApi<SpotifyApi.UsersSavedTracksResponse>(url, token);

    const batch = res.items;
    tracks.push(...batch);

    if (i === 0) {
      tryCount = Math.ceil(res.total / 50);
    }

    offset += 50;

    await new Promise((r) => setTimeout(r, 500));
  }

  return tracks;
};

export const getFollowedArtists = async (token: string) => {
  const artists = [];
  let after: string | undefined = undefined;

  while (true) {
    const url = new URL(`${SPOTIFY_API_BASE_URL}/me/following`);

    const searchParams = new URLSearchParams({
      type: "artist",
      limit: "50",
    });
    if (after) searchParams.append("after", after);
    url.search = searchParams.toString();

    const res = await fetchApi<SpotifyApi.UsersFollowedArtistsResponse>(
      url,
      token
    );

    const batch = res.artists.items;
    artists.push(...batch);

    after = res.artists.cursors?.after;
    if (!after) break;

    await new Promise((r) => setTimeout(r, 500));
  }

  return artists;
};

export const getAccessToken = async (): Promise<string> => {
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString(
          "base64"
        ),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: SPOTIFY_REFRESH_TOKEN,
    }),
  });

  if (!response.ok) {
    const err: { error?: { message: string; status: number } } =
      await response.json();
    const message = err.error?.message || response.statusText;
    throw new UnauthorizedError(`Spotify API error: ${message}`);
  }

  const data = await response.json();
  return data.access_token;
};

const fetchApi = async <T>(url: URL, token: string) => {
  console.log(`Fetching Spotify API: ${url.toString()}`);
  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const err: { error?: { message: string; status: number } } =
      await response.json();
    const status = err.error?.status || response.status;
    const message = err.error?.message || response.statusText;
    throw new Error(`Spotify API error: ${status} - ${message}`);
  }

  return (await response.json()) as T;
};
