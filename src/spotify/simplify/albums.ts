import { Matcher } from ".";
import { simplifyArtistSimplified } from "./artists";
import { simplifyTracktSimplified } from "./tracks";

export const albumsMatchers: Matcher[] = [
  {
    test: (path) => /^\/albums\/[^/]+$/.test(path),
    simplify: simplifyAlbumFull,
  },
  {
    test: (path, q) => path === "/albums" && Array.isArray(q.ids),
    simplify: simplifyMultipleAlbumsFull,
  },
  {
    test: (path) => /^\/albums\/[^/]+\/tracks$/.test(path),
    simplify: simplifyAlbumTracks,
  },
  {
    test: (path) => /^\/me\/albums$/.test(path),
    simplify: simplifySavedAlbums,
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

// GET /albums?ids=:ids
export function simplifyMultipleAlbumsFull(
  albums: SpotifyApi.MultipleAlbumsResponse
) {
  return {
    albums: albums.albums.map(simplifyAlbumFull),
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

// GET /me/albums
export function simplifySavedAlbums(
  savedAlbums: SpotifyApi.UsersSavedAlbumsResponse
) {
  return {
    next: savedAlbums.next,
    previous: savedAlbums.previous,
    total: savedAlbums.total,
    items: savedAlbums.items.map((item) => ({
      album: simplifyAlbumFull(item.album),
      added_at: item.added_at,
    })),
  };
}
