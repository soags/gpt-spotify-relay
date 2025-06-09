import { simplifyTopTracks } from "./handlers/topTracks";
import { simplifyTopArtists } from "./handlers/topArtists";
import { simplifyTracks } from "./handlers/tracks";
import { simplifyAlbums } from "./handlers/albums";
import { simplifyFollowingArtists } from "./handlers/followingArtists";
import { simplifyPlaylists } from "./handlers/playlists";

export function routeSpotifyRequest(path: string, data: any): any {
  if (path.startsWith("/me/top/tracks")) return simplifyTopTracks(data.items);
  if (path.startsWith("/me/top/artists")) return simplifyTopArtists(data.items);
  if (path.startsWith("/me/tracks")) return simplifyTracks(data.items);
  if (path.startsWith("/me/albums")) return simplifyAlbums(data.items);
  if (path.startsWith("/me/following"))
    return simplifyFollowingArtists(data.artists.items);
  if (path.startsWith("/me/playlists")) return simplifyPlaylists(data.items);
  return data; // fallback: relay raw data
}
