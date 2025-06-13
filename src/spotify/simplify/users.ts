import { Matcher } from ".";
import { simplifyArtistFull } from "./artists";
import { simplifyTrackFull } from "./tracks";

export const usersMatchers: Matcher[] = [
  {
    test: (path) => path === "/me/top/tracks",
    simplify: simplifyTopTracks,
  },
  {
    test: (path) => path === "/me/top/artists",
    simplify: simplifyTopArtists,
  },
  {
    test: (path, q) => path === "/me/following" && q.type === "artist",
    simplify: simplifyFollowingArtists,
  },
];

// GET /me/top/tracks
export function simplifyTopTracks(
  topTracks: SpotifyApi.UsersTopTracksResponse
) {
  return {
    next: topTracks.next,
    previous: topTracks.previous,
    total: topTracks.total,
    items: topTracks.items.map(simplifyTrackFull),
  };
}

// GET /me/top/artists
export function simplifyTopArtists(
  topArtists: SpotifyApi.UsersTopArtistsResponse
) {
  return {
    next: topArtists.next,
    previous: topArtists.previous,
    total: topArtists.total,
    items: topArtists.items.map(simplifyArtistFull),
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
