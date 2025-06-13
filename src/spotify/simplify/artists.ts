import { Matcher } from ".";
import { simplifyAlbumSimplified } from "./albums";
import { simplifyTrackFull } from "./tracks";

export const artistsMatchers: Matcher[] = [
  {
    test: (path, q) => path === "/me/following" && q.type === "artist",
    simplify: simplifyFollowingArtists,
  },
  {
    test: (path) => /^\/artists\/[^/]+$/.test(path),
    simplify: simplifyArtistFull,
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

// GET /me/following?type=artist
export function simplifyFollowingArtists(
  followingArtists: SpotifyApi.UsersFollowedArtistsResponse
) {
  const { artists } = followingArtists;
  return {
    artists: {
      next: artists.next,
      cursors: artists.cursors,
      total: artists.total,
      items: artists.items.map(simplifyArtistFull),
    },
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

// GET /artists/:id/top-tracks
export function simplifyArtistTopTracks(
  artistTopTracks: SpotifyApi.ArtistsTopTracksResponse
) {
  return {
    tracks: artistTopTracks.tracks.map(simplifyTrackFull),
  };
}
