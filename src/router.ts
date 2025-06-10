import {
  simplifyTopTracks,
  simplifyTopArtists,
  simplifySavedTracks,
  simplifySavedAlbums,
  simplifyFollowingArtists,
  simplifyPlaylists,
  simplifyPlaylist,
  simplifyPlaylistTracks,
  simplifyAlbum,
  simplifyAlbumTracks,
  simplifyTrack,
  simplifyArtist,
  simplifyArtistTopTracks
} from './simplify';
import { Request } from 'express';

export function routeAndSimplify(path: string, data: any, req: Request) {
  const { type } = req.query;

  if (path === '/me/top/tracks') return simplifyTopTracks(data.items);
  if (path === '/me/top/artists') return simplifyTopArtists(data.items);
  if (path === '/me/tracks') return simplifySavedTracks(data.items);
  if (path === '/me/albums') return simplifySavedAlbums(data.items);
  if (path === '/me/following' && type === 'artist') return simplifyFollowingArtists(data.artists.items);
  if (path === '/me/playlists') return simplifyPlaylists(data.items);

  if (/^\/playlists\/[^/]+$/.test(path)) return simplifyPlaylist(data);
  if (/^\/playlists\/[^/]+\/tracks$/.test(path)) return simplifyPlaylistTracks(data.items);
  if (/^\/albums\/[^/]+$/.test(path)) return simplifyAlbum(data);
  if (/^\/albums\/[^/]+\/tracks$/.test(path)) return simplifyAlbumTracks(data.items);
  if (/^\/tracks\/[^/]+$/.test(path)) return simplifyTrack(data);
  if (/^\/artists\/[^/]+$/.test(path) && path.endsWith('/top-tracks')) return simplifyArtistTopTracks(data.tracks);
  if (/^\/artists\/[^/]+$/.test(path)) return simplifyArtist(data);

  // fallback: そのまま返す
  return data;
}
