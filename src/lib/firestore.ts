// src/cache/firestore.ts

import { initializeApp, getApps } from "firebase-admin/app";
import { Firestore, getFirestore } from "firebase-admin/firestore";

if (!getApps().length) {
  initializeApp();
}

export const db: Firestore = getFirestore();

export const COLLECTIONS = {
  SAVED_TRACKS: "savedTracks",
  ALBUMS: "albums",
  ALBUM_TRACKS: "albumTracks",
  ARTISTS: "artists",
  FOLLOWING_ARTISTS: "followingArtists",
  PLAYLISTS: "playlists",
  PLAYLIST_TRACKS: "playlistTracks",
} as const;
