// src/controllers/playlistsController.ts

import { Request, Response } from "express";
import { db, SPOTIFY_COLLECTIONS } from "../../lib/firestore";
import {
  getAccessToken,
  getUserPlaylists,
  getPlaylistItems,
} from "../../lib/spotify";
import {
  classifyItems,
  ClassifyResultCount,
  toCountResponse,
} from "../../services/classifyItems";
import { ValidationError } from "../../types/error";
import { Playlist, PlaylistTrack } from "../../types/spotify/playlist";

export async function getPlaylists(req: Request, res: Response): Promise<void> {
  const limit = Number(req.query.limit ?? 100);
  const cursorId = req.query.cursorId as string | undefined;

  let query = db.collection(SPOTIFY_COLLECTIONS.PLAYLISTS).limit(limit);

  if (cursorId) {
    query = query.startAfter(cursorId);
  }

  const snapshot = await query.get();
  const playlists = snapshot.docs.map(
    (doc) => ({ ...doc.data(), id: doc.id } as Playlist)
  );

  // 次ページ用のカーソル
  const last = playlists[playlists.length - 1];
  const nextCursor = last ? { id: last.id } : undefined;

  // 総数
  const totalSnap = await db
    .collection(SPOTIFY_COLLECTIONS.PLAYLISTS)
    .count()
    .get();
  const total = totalSnap.data().count;

  res.json({
    playlists,
    cursor: nextCursor,
    total,
  });
}

export async function refreshPlaylists(
  req: Request,
  res: Response
): Promise<void> {
  const token = await getAccessToken();

  const { force = false } = req.body as {
    force?: boolean;
  };

  const col = db.collection(SPOTIFY_COLLECTIONS.PLAYLISTS);

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
        db
          .collection(SPOTIFY_COLLECTIONS.PLAYLIST_TRACKS)
          .doc(playlistId)
          .delete()
      )
    );
  }

  const result = {
    ...toCountResponse(classifyResult),
    tracks: tracksResults,
  };

  res.json(result);
}

export async function getPlaylistTracks(
  req: Request,
  res: Response
): Promise<void> {
  const { playlistId } = req.params;
  const limit = Number(req.query.limit ?? 100);
  const cursorId = req.query.cursorId as string | undefined;

  if (!playlistId) {
    throw new ValidationError("playlistId is required.");
  }

  let query = db
    .collection(SPOTIFY_COLLECTIONS.PLAYLIST_TRACKS)
    .doc(playlistId)
    .collection(SPOTIFY_COLLECTIONS.PLAYLIST_TRACKS__TRACKS)
    .limit(limit);

  if (cursorId) {
    query = query.startAfter(cursorId);
  }

  const snapshot = await query.get();
  const tracks = snapshot.docs.map(
    (doc) => ({ ...doc.data(), id: doc.id } as PlaylistTrack)
  );

  // 次ページ用のカーソル
  const last = tracks[tracks.length - 1];
  const nextCursor = last ? { id: last.id } : undefined;

  // 総数
  const totalSnap = await db
    .collection(SPOTIFY_COLLECTIONS.PLAYLIST_TRACKS)
    .doc(playlistId)
    .collection(SPOTIFY_COLLECTIONS.PLAYLIST_TRACKS__TRACKS)
    .count()
    .get();
  const total = totalSnap.data().count;

  res.json({
    tracks,
    cursor: nextCursor,
    total,
  });
}

export async function refreshPlaylistTracks(
  req: Request,
  res: Response
): Promise<void> {
  const { playlistId } = req.params;
  const { force = false } = req.body as {
    force?: boolean;
  };

  if (!playlistId) {
    throw new ValidationError("playlistId is required.");
  }

  const token = await getAccessToken();

  const result = await refreshPlaylistTracksCore(playlistId, force, token);

  res.json(result);
}

async function refreshPlaylistTracksCore(
  playlistId: string,
  force: boolean,
  token: string
): Promise<ClassifyResultCount> {
  const col = db
    .collection(SPOTIFY_COLLECTIONS.PLAYLIST_TRACKS)
    .doc(playlistId)
    .collection(SPOTIFY_COLLECTIONS.PLAYLIST_TRACKS__TRACKS);

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
}
