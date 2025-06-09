import { http } from "@google-cloud/functions-framework";
import axios from "axios";
import { routeSpotifyRequest } from "./router";

async function getAccessToken(): Promise<string> {
  const clientId = process.env.SPOTIFY_CLIENT_ID!;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET!;
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN!;

  const res = await axios.post(
    "https://accounts.spotify.com/api/token",
    new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
    {
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  return res.data.access_token;
}

http("spotifyRelay", async (req, res) => {
  try {
    const apiKey = req.header("x-api-key");
    if (!apiKey || apiKey !== process.env.API_KEY) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const path = req.query.path as string;
    if (!path) return res.status(400).json({ error: "Missing path parameter" });

    const token = await getAccessToken();
    const params = new URLSearchParams(req.query as any).toString();
    const rawUrl = `https://api.spotify.com/v1${path}?${params}`;

    const response = await axios.get(rawUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const simplified = await routeSpotifyRequest(path, response.data);
    res.json(simplified);
  } catch (err: any) {
    console.error(err);
    res
      .status(err.response?.status || 500)
      .json(err.response?.data || { error: "Internal error" });
  }
});
