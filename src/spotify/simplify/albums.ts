import { Matcher } from ".";
import { simplifyArtistSimplified } from "./artists";
import { simplifyTracktSimplified } from "./tracks";

export const albumsMatchers: Matcher[] = [
  {
    test: (path) => /^\/albums\/[^/]+$/.test(path),
    simplify: simplifyAlbumFull,
  },
  {
    test: (path) => /^\/albums\/[^/]+\/tracks$/.test(path),
    simplify: simplifyAlbumTracks,
  },
];

export function simplifyAlbumSimplified(
  album: SpotifyApi.AlbumObjectSimplified
) {
  return {
    id: album.id,
    name: album.name,
    artists: album.artists.map(simplifyArtistSimplified),
    release_date: album.release_date,
    release_date_precision: album.release_date_precision,
    total_tracks: album.total_tracks,
    album_type: album.album_type,
  };
}

// GET /albums/:id
export function simplifyAlbumFull(album: SpotifyApi.AlbumObjectFull) {
  return {
    ...simplifyAlbumSimplified(album),
  };
}

// GET /albums/:id/tracks
export function simplifyAlbumTracks(
  albumTracks: SpotifyApi.AlbumTracksResponse
) {
  return {
    next: albumTracks.next,
    previous: albumTracks.previous,
    total: albumTracks.total,
    items: albumTracks.items.map(simplifyTracktSimplified),
  };
}
