// src/types/playlist.ts

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
