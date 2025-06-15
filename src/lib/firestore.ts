// src/cache/firestore.ts

import { initializeApp, getApps } from "firebase-admin/app";
import { Firestore, getFirestore } from "firebase-admin/firestore";

if (!getApps().length) {
  initializeApp();
}

export const db: Firestore = getFirestore();

export const SPOTIFY_COLLECTIONS = {
  SAVED_TRACKS: "savedTracks",
  ALBUMS: "albums",
  ALBUM_TRACKS: "albumTracks",
  ALBUM_TRACKS__TRACKS: "tracks",
  ARTISTS: "artists",
  FOLLOWING_ARTISTS: "followingArtists",
  PLAYLISTS: "playlists",
  PLAYLIST_TRACKS: "playlistTracks",
  PLAYLIST_TRACKS__TRACKS: "tracks",
} as const;

export const CONTEXT_COLLECTIONS = {
  CONTEXT: "context",
  CONTEXT__RECORDS: "records",
} as const;
