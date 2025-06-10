import * as spotify from "./spotify";
import * as simplify from "./simplify";

export async function routeRequest(path: string, query: any) {
  console.log({ path, query });
  const type = query.type;

  // /me/xxx 系
  if (path === "/me/top/tracks") {
    const data = await spotify.getTopTracks();
    console.log({ data });
    return simplify.simplifyTopTracks(data);
  }
  if (path === "/me/top/artists") {
    const data = await spotify.getTopArtists();
    return simplify.simplifyTopArtists(data);
  }
  if (path === "/me/tracks") {
    const data = await spotify.getSavedTracks();
    return simplify.simplifySavedTracks(data);
  }
  if (path === "/me/albums") {
    const data = await spotify.getAlbums();
    return simplify.simplifySavedAlbums(data);
  }
  if (path === "/me/following" && type === "artist") {
    const data = await spotify.getFollowingArtists();
    return simplify.simplifyFollowingArtists(data);
  }
  if (path === "/me/playlists") {
    const data = await spotify.getPlaylists();
    return simplify.simplifyPlaylists(data);
  }

  // /playlists/:id
  const playlistMatch = path.match(/^\/playlists\/([^/]+)$/);
  if (playlistMatch) {
    const id = playlistMatch[1];
    const data = await spotify.getPlaylist(id);
    return simplify.simplifyPlaylist(data);
  }

  const playlistTracksMatch = path.match(/^\/playlists\/([^/]+)\/tracks$/);
  if (playlistTracksMatch) {
    const id = playlistTracksMatch[1];
    const data = await spotify.getPlaylistTracks(id);
    return simplify.simplifyPlaylistTracks(data);
  }

  const albumMatch = path.match(/^\/albums\/([^/]+)$/);
  if (albumMatch) {
    const id = albumMatch[1];
    const data = await spotify.getAlbum(id);
    return simplify.simplifyAlbum(data);
  }

  const albumTracksMatch = path.match(/^\/albums\/([^/]+)\/tracks$/);
  if (albumTracksMatch) {
    const id = albumTracksMatch[1];
    const data = await spotify.getAlbumTracks(id);
    return simplify.simplifyAlbumTracks(data);
  }

  const trackMatch = path.match(/^\/tracks\/([^/]+)$/);
  if (trackMatch) {
    const id = trackMatch[1];
    const data = await spotify.getTrack(id);
    return simplify.simplifyTrack(data);
  }

  const artistTopTracksMatch = path.match(/^\/artists\/([^/]+)\/top-tracks$/);
  if (artistTopTracksMatch) {
    const id = artistTopTracksMatch[1];
    const data = await spotify.getArtistTopTracks(id);
    return simplify.simplifyArtistTopTracks(data);
  }

  const artistMatch = path.match(/^\/artists\/([^/]+)$/);
  if (artistMatch) {
    const id = artistMatch[1];
    const data = await spotify.getArtist(id);
    return simplify.simplifyArtist(data);
  }

  throw {
    response: {
      status: 404,
      data: { error: "Unsupported Spotify API path" },
    },
  };
}
