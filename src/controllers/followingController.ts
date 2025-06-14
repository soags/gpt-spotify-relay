// src/controllers/tracksController.ts

import { Request, Response } from "express";
import { getAccessToken, getFollowedArtists } from "../lib/spotify";
import { db } from "../lib/firestore";
import { FollowingArtist } from "../types/artists";
import { classifyItems, toCountResponse } from "../services/classifyItems";

export const getFollowing = async (req: Request, res: Response) => {
  const limit = Number(req.query.limit ?? 100);
  const cursorId = req.query.cursorId as string | undefined;
  const cursorAddedAt = req.query.cursorAddedAt as string | undefined;

  let query = db
    .collection("following_artists")
    .orderBy("followedAt")
    .orderBy("id")
    .limit(limit);

  if (cursorId && cursorAddedAt) {
    query = query.startAfter(cursorAddedAt, cursorId);
  }

  const snapshot = await query.get();
  const artists = snapshot.docs.map((doc) => doc.data() as FollowingArtist);

  // 次ページ用のカーソル
  const last = artists[artists.length - 1];
  const nextCursor = last
    ? { id: last.id, addedAt: last.followedAt }
    : undefined;

  // 総数
  const totalSnap = await db.collection("following_artists").count().get();
  const total = totalSnap.data().count;

  return res.json({
    artists,
    cursor: nextCursor,
    total,
  });
};

export const refreshFollowing = async (req: Request, res: Response) => {
  const token = await getAccessToken();

  const { force = false } = req.body as {
    force?: boolean;
  };

  const col = db.collection("following_artists");
  const followedAt = new Date().toISOString();

  const apiArtists = await getFollowedArtists(token);
  const apiItems: FollowingArtist[] = apiArtists.map((a) => ({
    id: a.id,
    name: a.name,
    genres: a.genres,
    popularity: a.popularity,
    followedAt,
  }));

  // Firestoreから現在のキャッシュを取得
  const snapshot = await col.get();
  const cached: Record<string, FollowingArtist> = {};
  snapshot.docs.forEach((doc) => {
    if (doc.exists) cached[doc.id] = doc.data() as FollowingArtist;
  });

  // 差分判定
  const result = classifyItems({
    apiItems,
    cached,
    idSelector: (a) => a.id,
    equals: (api, cached) =>
      !force &&
      Boolean(cached) &&
      api.name === cached.name &&
      JSON.stringify(api.genres) === JSON.stringify(cached.genres) &&
      api.popularity === cached.popularity &&
      api.followedAt === cached.followedAt,
  });

  // Firestore更新
  await Promise.all([
    ...result.createItems.map((a) => col.doc(a.id).set(a)),
    ...result.refreshItems.map((a) => col.doc(a.id).set(a)),
    ...result.deletedIds.map((id) => col.doc(id).delete()),
  ]);

  return res.json(toCountResponse(result));
};
