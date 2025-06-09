import { http } from "@google-cloud/functions-framework";
import axios from "axios";

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
  if (req.header("x-api-key") !== process.env.X_API_KEY) {
    return res.status(401).send("Unauthorized");
  }

  const path = req.query.path as string;
  if (!path || !path.startsWith("/")) {
    return res.status(400).send("Missing or invalid 'path' query");
  }

  try {
    const token = await getAccessToken();
    const query = new URLSearchParams(req.query as Record<string, string>);
    query.delete("path");
    const url = `https://api.spotify.com/v1${path}?${query}`;

    const spotifyRes = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    res.status(200).json(spotifyRes.data);
  } catch (err: any) {
    // 安全にSpotifyのエラー内容を返す
    if (err.response) {
      const { status, data, headers } = err.response;

      // セーフにヘッダーをセット
      const safeHeaders = Object.fromEntries(
        Object.entries(headers).filter(([_, v]) => typeof v === "string")
      );

      console.error("Spotify API error", {
        status: err.response?.status,
        data: err.response?.data,
        headers: err.response?.headers
      });

      res
        .status(status)
        .set(safeHeaders) // ← stringのみ通す
        .send(data);
    } else {
      res.status(500).send({ error: "Internal Error", message: err.message });
    }
  }
});
