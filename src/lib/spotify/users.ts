// src/lib/spotify/users.ts

import { SPOTIFY_API_BASE_URL } from "./constants";
import { fetchApi } from "./fetchApi";

export async function getFollowedArtists(
  token: string
): Promise<SpotifyApi.ArtistObjectFull[]> {
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
}
