// src/lib/spotify.ts

import { UnauthorizedError } from "../types/error";

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID!;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET!;
const SPOTIFY_REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN!;
const SPOTIFY_API_BASE_URL = "https://api.spotify.com/v1";

export async function getUsersSavedTracks(
  options: { limit: number; offset?: number },
  token: string
) {
  const url = new URL(`${SPOTIFY_API_BASE_URL}/me/tracks`);

  if (options) {
    const searchParams = new URLSearchParams();
    searchParams.append("limit", String(options.limit));
    if (typeof options.offset === "number") {
      searchParams.append("offset", String(options.offset));
    }
    url.search = searchParams.toString();
  }

  const response: SpotifyApi.UsersSavedTracksResponse = await fetchSpotifyApi(
    url,
    token
  );

  return response;
}

export async function GetSeveralArtists(
  options: { ids: string[] },
  token: string
) {
  const url = new URL(`${SPOTIFY_API_BASE_URL}/artists`);
  url.searchParams.append("ids", options.ids.join(","));

  const response: SpotifyApi.MultipleArtistsResponse = await fetchSpotifyApi(
    url,
    token
  );

  return response.artists;
}

export async function getAccessToken(): Promise<string> {
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
    const errorData: { error?: { message: string; status: number } } =
      await response.json();
    const errorMessage = errorData.error?.message || response.statusText;
    const errorStatus = errorData.error?.status || response.status;
    throw new UnauthorizedError(
      `Spotify API error: ${errorStatus} - ${errorMessage}`
    );
  }

  const data = await response.json();
  return data.access_token;
}

async function fetchSpotifyApi(url: URL, token: string) {
  console.log(`Fetching Spotify API: ${url.toString()}`);
  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData: { error?: { message: string; status: number } } =
      await response.json();
    const errorMessage = errorData.error?.message || response.statusText;
    const errorStatus = errorData.error?.status || response.status;
    throw new Error(`Spotify API error: ${errorStatus} - ${errorMessage}`);
  }

  return await response.json();
}
