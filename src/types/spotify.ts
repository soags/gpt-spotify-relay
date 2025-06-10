// types/spotify.ts

// ===== 共通型 =====

export interface Artist {
  id: string;
  name: string;
  genres?: string[];
  popularity?: number;
}

export interface Album {
  id: string;
  name: string;
  release_date: string;
  total_tracks: number;
  artists: Artist[];
  images?: { url: string }[];
}

export interface Track {
  id: string;
  name: string;
  album: Album;
  artists: Artist[];
  preview_url: string | null;
}

export interface SavedTrack {
  added_at: string;
  track: Track;
}

export interface SavedAlbum {
  added_at: string;
  album: Album;
}

// ===== /me/top/tracks =====

export interface TopTracksResponse {
  items: Track[];
}

// ===== /me/top/artists =====

export interface TopArtistsResponse {
  items: Artist[];
}

// ===== /me/tracks =====

export interface SavedTracksResponse {
  items: SavedTrack[];
  total: number;
  limit: number;
  offset: number;
  next: string | null;
  previous: string | null;
  href: string;
}

// ===== /me/albums =====

export interface SavedAlbumsResponse {
  items: SavedAlbum[];
  total: number;
  limit: number;
  offset: number;
  next: string | null;
  previous: string | null;
  href: string;
}

// ===== /me/following?type=artist =====

export interface FollowingArtistsResponse {
  artists: {
    items: Artist[];
    total: number;
    limit: number;
    offset: number;
    next: string | null;
    href: string;
  };
}

// ===== /me/playlists =====

export interface Playlist {
  id: string;
  name: string;
  public: boolean;
  owner: {
    display_name: string;
    id: string;
  };
  tracks: {
    total: number;
  };
  description?: string;
  images: { url: string }[];
  collaborative: boolean;
}

export interface PlaylistsResponse {
  items: Playlist[];
  total: number;
  limit: number;
  offset: number;
  href: string;
  next: string | null;
  previous: string | null;
}

// ===== /playlists/{id}/tracks =====

export interface PlaylistTrackItem {
  added_at: string;
  added_by: {
    id: string;
    type: string;
    uri: string;
  };
  is_local: boolean;
  track: Track;
}

export interface PlaylistTracksResponse {
  items: PlaylistTrackItem[];
  total: number;
  limit: number;
  offset: number;
  next: string | null;
  previous: string | null;
  href: string;
}

// ===== /albums/{id}/tracks =====

export interface AlbumTracksResponse {
  items: Track[];
  total: number;
  limit: number;
  offset: number;
  next: string | null;
  previous: string | null;
  href: string;
}
