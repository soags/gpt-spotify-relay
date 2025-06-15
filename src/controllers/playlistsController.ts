// src/controllers/playlistsController.ts

import { Request, Response } from "express";
import { COLLECTIONS, db } from "../lib/firestore";
import {
  getAccessToken,
  getPlaylistItems,
  getUserPlaylists,
} from "../lib/spotify";
import { classifyItems, toCountResponse } from "../services/classifyItems";
import { Playlist, PlaylistTrack } from "../types/playlist";
import { ValidationError } from "../types/error";

export const getPlaylists = async (req: Request, res: Response) => {
  const limit = Number(req.query.limit ?? 100);
  const cursorId = req.query.cursorId as string | undefined;

  let query = db.collection(COLLECTIONS.PLAYLISTS).limit(limit);

  if (cursorId) {
    query = query.startAfter(cursorId);
  }

  const snapshot = await query.get();
  const playlists = snapshot.docs.map((doc) => doc.data() as Playlist);

  // 次ページ用のカーソル
  const last = playlists[playlists.length - 1];
  const nextCursor = last ? { id: last.id } : undefined;

  // 総数
  const totalSnap = await db.collection(COLLECTIONS.PLAYLISTS).count().get();
  const total = totalSnap.data().count;

  return res.json({
    playlists,
    cursor: nextCursor,
    total,
  });
};

export const refreshPlaylists = async (req: Request, res: Response) => {
  const token = await getAccessToken();

  const { force = false } = req.body as {
    force?: boolean;
  };

  const col = db.collection(COLLECTIONS.PLAYLISTS);

  const apiPlaylists = await getUserPlaylists(token);

  const apiItems: Playlist[] = apiPlaylists.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    total: p.tracks.total,
    owner: {
      id: p.owner.id,
      displayName: p.owner.display_name,
    },
    public: p.public,
  }));

  // Firestoreから現在のキャッシュを取得
  const snapshot = await col.get();
  const cached: Record<string, Playlist> = {};
  snapshot.docs.forEach((doc) => {
    if (doc.exists) cached[doc.id] = doc.data() as Playlist;
  });

  // 差分判定
  const classifyResult = classifyItems({
    apiItems,
    cached,
    idSelector: (p) => p.id,
    equalsKeys: ["name", "description", "total", "public"],
    force,
  });

  // Firestore更新
  await Promise.all([
    ...classifyResult.createItems.map((p) => col.doc(p.id).set(p)),
    ...classifyResult.refreshItems.map((p) => col.doc(p.id).set(p)),
    ...classifyResult.deletedIds.map((id) => col.doc(id).delete()),
  ]);

  // プレイリストのトラックも更新
  const toRefreshPlaylists = [
    ...classifyResult.createItems,
    ...classifyResult.refreshItems,
  ];
  const tracksResults = [];
  for (const playlist of toRefreshPlaylists) {
    const res = await refreshPlaylistTracksCore(playlist.id, false, token);
    tracksResults.push(res);
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  // 削除されたプレイリストのトラックも削除
  const deletedPlaylistIds = classifyResult.deletedIds;
  if (deletedPlaylistIds.length > 0) {
    await Promise.all(
      deletedPlaylistIds.map((playlistId) =>
        db.collection(COLLECTIONS.PLAYLIST_TRACKS).doc(playlistId).delete()
      )
    );
  }

  const result = {
    ...toCountResponse(classifyResult),
    tracks: tracksResults,
  };

  return res.json(result);
};

export const getPlaylistTracks = async (req: Request, res: Response) => {
  const { playlistId } = req.params;
  const limit = Number(req.query.limit ?? 100);
  const cursorId = req.query.cursorId as string | undefined;

  if (!playlistId) {
    throw new ValidationError("playlistId is required.");
  }

  let query = db
    .collection(COLLECTIONS.PLAYLIST_TRACKS)
    .doc(playlistId)
    .collection(COLLECTIONS.PLAYLIST_TRACKS__TRACKS)
    .limit(limit);

  if (cursorId) {
    query = query.startAfter(cursorId);
  }

  const snapshot = await query.get();
  const tracks = snapshot.docs.map((doc) => doc.data() as PlaylistTrack);

  // 次ページ用のカーソル
  const last = tracks[tracks.length - 1];
  const nextCursor = last ? { id: last.id } : undefined;

  // 総数
  const totalSnap = await db
    .collection(COLLECTIONS.PLAYLIST_TRACKS)
    .doc(playlistId)
    .collection(COLLECTIONS.PLAYLIST_TRACKS__TRACKS)
    .count()
    .get();
  const total = totalSnap.data().count;

  return res.json({
    tracks,
    cursor: nextCursor,
    total,
  });
};

export const refreshPlaylistTracks = async (req: Request, res: Response) => {
  const { playlistId } = req.params;
  const { force = false } = req.body as {
    force?: boolean;
  };

  if (!playlistId) {
    throw new ValidationError("playlistId is required.");
  }

  const token = await getAccessToken();

  const result = await refreshPlaylistTracksCore(playlistId, force, token);

  return res.json(result);
};

const refreshPlaylistTracksCore = async (
  playlistId: string,
  force: boolean,
  token: string
) => {
  const col = db
    .collection(COLLECTIONS.PLAYLIST_TRACKS)
    .doc(playlistId)
    .collection(COLLECTIONS.PLAYLIST_TRACKS__TRACKS);

  const apiTracks = await getPlaylistItems(playlistId, token);

  const apiValidTracks = apiTracks
    .filter((t) => t.track !== null)
    .map((t) => ({ ...t, track: t.track! }));

  const apiItems: PlaylistTrack[] = apiValidTracks.map((t) => ({
    id: t.track.id,
    addedAt: t.added_at,
    track: {
      id: t.track.id,
      name: t.track.name,
      artists: t.track.artists.map((artist) => ({
        id: artist.id,
        name: artist.name,
      })),
      album: {
        id: t.track.album.id,
        name: t.track.album.name,
      },
      duration_ms: t.track.duration_ms,
      explicit: t.track.explicit,
      popularity: t.track.popularity,
    },
  }));

  // Firestoreから現在のキャッシュを取得
  const snapshot = await col.get();
  const cached: Record<string, PlaylistTrack> = {};
  snapshot.docs.forEach((doc) => {
    if (doc.exists) cached[doc.id] = doc.data() as PlaylistTrack;
  });

  // 差分判定
  const result = classifyItems({
    apiItems,
    cached,
    idSelector: (p) => p.id,
    equalsKeys: ["id", "addedAt", "track"],
    force,
  });

  // Firestore更新
  await Promise.all([
    ...result.createItems.map((p) => col.doc(p.id).set(p)),
    ...result.refreshItems.map((p) => col.doc(p.id).set(p)),
    ...result.deletedIds.map((id) => col.doc(id).delete()),
  ]);

  return toCountResponse(result);
};
