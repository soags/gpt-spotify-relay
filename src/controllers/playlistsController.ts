// src/controllers/playlistsController.ts

import { Request, Response } from "express";
import { db } from "../lib/firestore";
import { getAccessToken, getUserPlaylists } from "../lib/spotify";
import { classifyItems, toCountResponse } from "../services/classifyItems";
import { Playlist } from "../types/playlist";

export const getPlaylists = async (req: Request, res: Response) => {
  const limit = Number(req.query.limit ?? 100);
  const cursorId = req.query.cursorId as string | undefined;

  let query = db.collection("user_playlists").limit(limit);

  if (cursorId) {
    query = query.startAfter(cursorId);
  }

  const snapshot = await query.get();
  const playlists = snapshot.docs.map((doc) => doc.data() as Playlist);

  // 次ページ用のカーソル
  const last = playlists[playlists.length - 1];
  const nextCursor = last ? { id: last.id } : undefined;

  // 総数
  const totalSnap = await db.collection("user_playlists").count().get();
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

  const col = db.collection("user_playlists");

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
  const result = classifyItems({
    apiItems,
    cached,
    idSelector: (p) => p.id,
    equals: (api, cached) =>
      !force &&
      Boolean(cached) &&
      api.name === cached.name &&
      api.description === cached.description &&
      api.total === cached.total &&
      api.public === cached.public,
  });

  // Firestore更新
  await Promise.all([
    ...result.createItems.map((p) => col.doc(p.id).set(p)),
    ...result.refreshItems.map((p) => col.doc(p.id).set(p)),
    ...result.deletedIds.map((id) => col.doc(id).delete()),
  ]);

  return res.json(toCountResponse(result));
};
