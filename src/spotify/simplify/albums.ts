// src/spotify/simplify/albums.ts

import { Matcher } from ".";
import { simplifyArtistSimplified } from "./artists";
import { simplifyTracktSimplified } from "./tracks";

export const albumsMatchers: Matcher[] = [
  {
    test: (path) => /^\/albums\/[^/]+$/.test(path),
    simplify: simplifyAlbumFull,
  },
  {
    test: (path) => /^\/albums$/.test(path),
    simplify: simplifyMultipleAlbums,
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

export function simplifyAlbumSimplified(res: SpotifyApi.AlbumObjectSimplified) {
  return {
    id: res.id,
    name: res.name,
    artists: res.artists.map(simplifyArtistSimplified),
    release_date: res.release_date,
    release_date_precision: res.release_date_precision,
    total_tracks: res.total_tracks,
    album_type: res.album_type,
  };
}

// GET /albums/:id
export function simplifyAlbumFull(res: SpotifyApi.AlbumObjectFull) {
  return {
    ...simplifyAlbumSimplified(res),
  };
}

// GET /albums
export function simplifyMultipleAlbums(res: SpotifyApi.MultipleAlbumsResponse) {
  return {
    albums: res.albums.map(simplifyAlbumFull),
  };
}

// GET /albums/:id/tracks
export function simplifyAlbumTracks(res: SpotifyApi.AlbumTracksResponse) {
  return {
    next: res.next,
    previous: res.previous,
    total: res.total,
    items: res.items.map(simplifyTracktSimplified),
  };
}

// GET /me/albums
export function simplifySavedAlbums(res: SpotifyApi.UsersSavedAlbumsResponse) {
  return {
    next: res.next,
    previous: res.previous,
    total: res.total,
    items: res.items.map((item) => ({
      album: simplifyAlbumFull(item.album),
      added_at: item.added_at,
    })),
  };
}
