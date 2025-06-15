// Spotify API response types
import { SavedTrack } from "./tracks";
import { Playlist, PlaylistTrack } from "./playlist";
import { Artist, FollowingArtist } from "./artists";
import { Album, AlbumTrack } from "./albums";
import { ClassifyResultCount } from "../../services/classifyItems";

export type TracksResponse = {
  tracks: SavedTrack[];
  cursor?: { id: string; addedAt: string };
  total: number;
};

export type PlaylistsResponse = {
  playlists: Playlist[];
  cursor?: { id: string };
  total: number;
};

export type PlaylistTracksResponse = {
  tracks: PlaylistTrack[];
  cursor?: { id: string };
  total: number;
};

export type FollowingArtistsResponse = {
  artists: FollowingArtist[];
  cursor?: { id: string; followedAt: string };
  total: number;
};

export type ArtistsResponse = {
  artists: Artist[];
  cursor?: { id: string };
  total: number;
};

export type AlbumsResponse = {
  albums: Album[];
  cursor?: { id: string };
  total: number;
};

export type AlbumTracksResponse = {
  tracks: AlbumTrack[];
  cursor?: { id: string };
  total: number;
};

export type GenreAnalysisResponse = {
  genres: { genre: string; count: number }[];
  total: number;
  message?: string;
};

export type RefreshTracksResponse = ClassifyResultCount & {
  artists: {
    created: number;
  };
};

export type RefreshPlaylistsResponse = ClassifyResultCount & {
  tracks: ClassifyResultCount[];
};
