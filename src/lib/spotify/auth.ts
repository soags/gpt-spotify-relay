// src/lib/spotify/auth.ts

import { UnauthorizedError } from "../../types/error";
import {
  SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET,
  SPOTIFY_REFRESH_TOKEN,
} from "./constants";

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
