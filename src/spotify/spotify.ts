// src/spotify/spotify.ts

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID!;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET!;
const SPOTIFY_REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN!;

async function getAccessToken(): Promise<string> {
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
  const data = await response.json();
  return data.access_token;
}

export async function getSpotify(
  path: string,
  query: Record<string, string> | undefined
) {
  const searchParams = new URLSearchParams(query);
  const url = `https://api.spotify.com/v1${path}?${searchParams.toString()}`;

  const token = await getAccessToken();

  return await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
