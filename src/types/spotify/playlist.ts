// src/types/playlist.ts

import { Track } from "./tracks";

export type Playlist = {
  id: string;
  name: string;
  description: string | null;
  total: number;
  owner: {
    id: string;
    displayName?: string;
  };
  public: boolean | null;
};

export type PlaylistTrack = {
  id: string; // = track.id
  addedAt: string;
  track: Track;
};
