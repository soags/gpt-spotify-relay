import {
  Album,
  Artist,
  Track,
  SavedAlbum,
  SavedTrack,
  Playlist,
  PlaylistTrackItem
} from './types/spotify';

// ==== /me/* ====

export function simplifyTopTracks(items: Track[]) {
  return items.map(track => ({
    id: track.id,
    name: track.name,
    artists: track.artists.map(a => a.name),
    album: track.album.name,
    preview_url: track.preview_url
  }));
}

export function simplifyTopArtists(items: Artist[]) {
  return items.map(artist => ({
    id: artist.id,
    name: artist.name,
    genres: artist.genres,
    popularity: artist.popularity
  }));
}

export function simplifySavedTracks(items: SavedTrack[]) {
  return items.map(entry => ({
    id: entry.track.id,
    name: entry.track.name,
    artists: entry.track.artists.map(a => a.name),
    album: entry.track.album.name,
    added_at: entry.added_at
  }));
}

export function simplifySavedAlbums(items: SavedAlbum[]) {
  return items.map(entry => ({
    id: entry.album.id,
    name: entry.album.name,
    artists: entry.album.artists.map(a => a.name),
    release_date: entry.album.release_date,
    added_at: entry.added_at
  }));
}

export function simplifyFollowingArtists(items: Artist[]) {
  return items.map(artist => ({
    id: artist.id,
    name: artist.name,
    genres: artist.genres,
    popularity: artist.popularity
  }));
}

export function simplifyPlaylists(items: Playlist[]) {
  return items.map(p => ({
    id: p.id,
    name: p.name,
    trackCount: p.tracks.total,
    public: p.public,
    owner: p.owner.display_name,
    image: p.images?.[0]?.url
  }));
}

// ==== /playlists/{id} ====

export function simplifyPlaylist(p: Playlist) {
  return {
    id: p.id,
    name: p.name,
    trackCount: p.tracks.total,
    public: p.public,
    owner: p.owner.display_name,
    image: p.images?.[0]?.url,
    collaborative: p.collaborative
  };
}

export function simplifyPlaylistTracks(items: PlaylistTrackItem[]) {
  return items.map(entry => ({
    id: entry.track.id,
    name: entry.track.name,
    artists: entry.track.artists.map(a => a.name),
    album: entry.track.album.name,
    added_at: entry.added_at
  }));
}

// ==== /albums/{id} ====

export function simplifyAlbum(album: Album) {
  return {
    id: album.id,
    name: album.name,
    release_date: album.release_date,
    artists: album.artists.map(a => a.name),
    total_tracks: album.total_tracks,
    image: album.images?.[0]?.url
  };
}

export function simplifyAlbumTracks(items: Track[]) {
  return items.map(track => ({
    id: track.id,
    name: track.name,
    artists: track.artists.map(a => a.name),
    preview_url: track.preview_url
  }));
}

// ==== /tracks/{id} ====

export function simplifyTrack(track: Track) {
  return {
    id: track.id,
    name: track.name,
    artists: track.artists.map(a => a.name),
    album: track.album.name,
    preview_url: track.preview_url
  };
}

// ==== /artists/{id} ====

export function simplifyArtist(artist: Artist) {
  return {
    id: artist.id,
    name: artist.name,
    genres: artist.genres,
    popularity: artist.popularity
  };
}

export function simplifyArtistTopTracks(items: Track[]) {
  return items.map(track => ({
    id: track.id,
    name: track.name,
    preview_url: track.preview_url,
    album: track.album.name,
    artists: track.artists.map(a => a.name)
  }));
}
