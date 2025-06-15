// Spotify API request types

export type GetTracksQuery = {
  limit?: string;
  cursorId?: string;
  cursorAddedAt?: string;
};

export type RefreshTracksBody = {
  force?: boolean;
};

export type GetPlaylistsQuery = {
  limit?: string;
  cursorId?: string;
};

export type RefreshPlaylistsBody = {
  force?: boolean;
};

export type GetPlaylistTracksParams = {
  playlistId: string;
};

export type GetPlaylistTracksQuery = {
  limit?: string;
  cursorId?: string;
};

export type RefreshPlaylistTracksParams = {
  playlistId: string;
};

export type RefreshPlaylistTracksBody = {
  force?: boolean;
};

export type GetAlbumsQuery = {
  ids?: string;
  limit?: string;
  cursorId?: string;
};

export type RefreshAlbumsBody = {
  albumIds: string[];
  force?: boolean;
};

export type GetAlbumTracksParams = {
  albumId: string;
};

export type GetAlbumTracksQuery = {
  limit?: string;
  cursorId?: string;
};

export type RefreshAlbumTracksParams = {
  albumId: string;
};

export type RefreshAlbumTracksBody = {
  force?: boolean;
};

export type GetArtistsQuery = {
  ids?: string;
  limit?: string;
  cursorId?: string;
};

export type RefreshArtistsBody = {
  artistIds: string[];
  force?: boolean;
};

export type GetFollowingQuery = {
  limit?: string;
  cursorId?: string;
  cursorFollowedAt?: string;
};

export type RefreshFollowingBody = {
  force?: boolean;
};
