import axios from "axios";

const SPOTIFY_API_BASE = "https://api.spotify.com/v1";
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID!;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET!;
const SPOTIFY_REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN!;

async function getAccessToken(): Promise<string> {
  const res = await axios.post(
    "https://accounts.spotify.com/api/token",
    new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: SPOTIFY_REFRESH_TOKEN,
    }),
    {
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString(
            "base64"
          ),
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  return res.data.access_token;
}

async function authorizedGet(path: string, params = {}) {
  console.log({SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN})

  const token = await getAccessToken();
  const res = await axios.get(`${SPOTIFY_API_BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params,
  });
  return res.data;
}

export const getTopTracks = () => authorizedGet("/me/top/tracks");

export const getTopArtists = () => authorizedGet("/me/top/artists");

export const getSavedTracks = () => authorizedGet("/me/tracks");

export const getAlbums = () => authorizedGet("/me/albums");

export const getPlaylists = () => authorizedGet("/me/playlists");

export const getFollowingArtists = () =>
  authorizedGet("/me/following", { type: "artist" });

export const getPlaylist = (id: string) => authorizedGet(`/playlists/${id}`);

export const getPlaylistTracks = (id: string) =>
  authorizedGet(`/playlists/${id}/tracks`);

export const getAlbum = (id: string) => authorizedGet(`/albums/${id}`);

export const getAlbumTracks = (id: string) =>
  authorizedGet(`/albums/${id}/tracks`);

export const getTrack = (id: string) => authorizedGet(`/tracks/${id}`);

export const getArtist = (id: string) => authorizedGet(`/artists/${id}`);

export const getArtistTopTracks = (id: string) =>
  authorizedGet(`/artists/${id}/top-tracks`, { market: "JP" }); // market必須
