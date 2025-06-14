// src/api/spotify.ts

import { UnauthorizedError } from "../types/error";

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID!;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET!;
const SPOTIFY_REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN!;
const SPOTIFY_API_BASE_URL = "https://api.spotify.com/v1";

export async function getUsersSavedTracks(
  token: string,
  options: { limit: number; offset?: number }
): Promise<SpotifyApi.UsersSavedTracksResponse> {
  const url = new URL(`${SPOTIFY_API_BASE_URL}/me/tracks`);

  if (options) {
    const searchParams = new URLSearchParams();
    if (typeof options.limit === "number") {
      searchParams.append("limit", String(options.limit));
    }
    if (typeof options.offset === "number") {
      searchParams.append("offset", String(options.offset));
    }
    url.search = searchParams.toString();
  }

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
