import { Matcher } from ".";
import { simplifyAlbumSimplified } from "./albums";
import { simplifyTrackFull } from "./tracks";

export const artistsMatchers: Matcher[] = [
  {
    test: (path) => /^\/artists\/[^/]+$/.test(path),
    simplify: simplifyArtistFull,
  },
  {
    test: (path, q) => path === "/artists" && Array.isArray(q.ids),
    simplify: simplifyMultipleArtistsFull,
  },
  {
    test: (path) => /^\/artists\/[^/]+\/albums$/.test(path),
    simplify: simplifyArtistAlbums,
  },
  {
    test: (path) => /^\/artists\/[^/]+\/top-tracks$/.test(path),
    simplify: simplifyArtistTopTracks,
  },
];

export function simplifyArtistSimplified(
  artist: SpotifyApi.ArtistObjectSimplified
) {
  return {
    id: artist.id,
    name: artist.name,
  };
}

// GET /artists/:id
export function simplifyArtistFull(artist: SpotifyApi.ArtistObjectFull) {
  return {
    genres: artist.genres,
    followers: artist.followers.total,
    popularity: artist.popularity,
    ...simplifyArtistSimplified(artist),
  };
}

// GET /artists?ids=:ids
export function simplifyMultipleArtistsFull(
  artists: SpotifyApi.MultipleArtistsResponse
) {
  return {
    artists: artists.artists.map(simplifyArtistFull),
  };
}

// GET /artists/:id/albums
export function simplifyArtistAlbums(
  artistAlbums: SpotifyApi.ArtistsAlbumsResponse
) {
  return {
    next: artistAlbums.next,
    previous: artistAlbums.previous,
    total: artistAlbums.total,
    items: artistAlbums.items.map(simplifyAlbumSimplified),
  };
}

// GET /artists/:id/top-tracks
export function simplifyArtistTopTracks(
  artistTopTracks: SpotifyApi.ArtistsTopTracksResponse
) {
  return {
    tracks: artistTopTracks.tracks.map(simplifyTrackFull),
  };
}
