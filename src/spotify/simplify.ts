// src/spotify/simplify.ts

// GET /me/top/tracks
export const simplifyTopTracks = (data: any) => {
  return data.items.map((item: any) => ({
    id: item.id,
    name: item.name,
    artists: item.artists.map((a: any) => a.name),
    duration_ms: item.duration_ms,
    url: item.external_urls?.spotify,
  }));
};

// GET /me/top/artists
export const simplifyTopArtists = (data: any) => {
  return data.items.map((item: any) => ({
    id: item.id,
    name: item.name,
    genres: item.genres,
    followers: item.followers.total,
    popularity: item.popularity,
    url: item.external_urls?.spotify,
  }));
};

// GET /me/tracks
export const simplifySavedTracks = (data: any) => {
  return data.items.map((item: any) => ({
    id: item.track.id,
    name: item.track.name,
    artists: item.track.artists.map((a: any) => a.name),
    duration_ms: item.track.duration_ms,
    url: item.track.external_urls?.spotify,
  }));
};

// GET /me/albums
export const simplifySavedAlbums = (data: any) => {
  return data.items.map((item: any) => ({
    id: item.album.id,
    name: item.album.name,
    release_date: item.album.release_date,
    total_tracks: item.album.total_tracks,
    url: item.album.external_urls?.spotify,
  }));
};

// GET /me/following?type=artist
export const simplifyFollowingArtists = (data: any) => {
  return data.artists.items.map((item: any) => ({
    id: item.id,
    name: item.name,
    genres: item.genres,
    followers: item.followers.total,
    popularity: item.popularity,
    url: item.external_urls?.spotify,
  }));
};

// GET /me/playlists
export const simplifyPlaylists = (data: any) => {
  return data.items.map((item: any) => ({
    id: item.id,
    name: item.name,
    description: item.description,
    tracks: item.tracks.total,
    url: item.external_urls?.spotify,
  }));
};

// GET /playlists/:id
export const simplifyPlaylist = (data: any) => {
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    tracks: data.tracks.total,
    url: data.external_urls?.spotify,
  };
};

// GET /playlists/:id/tracks
export const simplifyPlaylistTracks = (data: any) => {
  return data.items.map((item: any) => ({
    id: item.track.id,
    name: item.track.name,
    artists: item.track.artists.map((a: any) => a.name),
    duration_ms: item.track.duration_ms,
    url: item.track.external_urls?.spotify,
  }));
};

// GET /albums/:id
export const simplifyAlbum = (data: any) => {
  return {
    id: data.id,
    name: data.name,
    release_date: data.release_date,
    total_tracks: data.total_tracks,
    url: data.external_urls?.spotify,
  };
};

// GET /albums/:id/tracks
export const simplifyAlbumTracks = (data: any) => {
  return data.items.map((item: any) => ({
    id: item.id,
    name: item.name,
    duration_ms: item.duration_ms,
    track_number: item.track_number,
    url: item.external_urls?.spotify,
  }));
};

// GET /tracks/:id
export const simplifyTrack = (data: any) => {
  return {
    id: data.id,
    name: data.name,
    artists: data.artists.map((a: any) => a.name),
    duration_ms: data.duration_ms,
    url: data.external_urls?.spotify,
  };
};

// GET /artists/:id
export const simplifyArtist = (data: any) => {
  return {
    id: data.id,
    name: data.name,
    genres: data.genres,
    followers: data.followers.total,
    popularity: data.popularity,
    url: data.external_urls?.spotify,
  };
};

// GET /artists/:id/top-tracks
export const simplifyArtistTopTracks = (data: any) => {
  return data.tracks.map((track: any) => ({
    id: track.id,
    name: track.name,
    artists: track.artists.map((a: any) => a.name),
    duration_ms: track.duration_ms,
    url: track.external_urls?.spotify,
  }));
};

type Matcher = {
  test: (path: string, query: any) => boolean;
  simplify: (data: any) => any;
};

const matchers: Matcher[] = [
  { test: (path) => path === "/me/top/tracks", simplify: simplifyTopTracks },
  { test: (path) => path === "/me/top/artists", simplify: simplifyTopArtists },
  { test: (path) => path === "/me/tracks", simplify: simplifySavedTracks },
  { test: (path) => path === "/me/albums", simplify: simplifySavedAlbums },
  { test: (path, q) => path === "/me/following" && q.type === "artist", simplify: simplifyFollowingArtists },
  { test: (path) => path === "/me/playlists", simplify: simplifyPlaylists },
  { test: (path) => /^\/playlists\/[^/]+$/.test(path), simplify: simplifyPlaylist },
  { test: (path) => /^\/playlists\/[^/]+\/tracks$/.test(path), simplify: simplifyPlaylistTracks },
  { test: (path) => /^\/albums\/[^/]+$/.test(path), simplify: simplifyAlbum },
  { test: (path) => /^\/albums\/[^/]+\/tracks$/.test(path), simplify: simplifyAlbumTracks },
  { test: (path) => /^\/tracks\/[^/]+$/.test(path), simplify: simplifyTrack },
  { test: (path) => /^\/artists\/[^/]+\/top-tracks$/.test(path), simplify: simplifyArtistTopTracks },
  { test: (path) => /^\/artists\/[^/]+$/.test(path), simplify: simplifyArtist },
];

export function simplifySpotifyResponse(path: string, query: any, data: any) {
  for (const { test, simplify } of matchers) {
    if (test(path, query)) return simplify(data);
  }
  return data;
}