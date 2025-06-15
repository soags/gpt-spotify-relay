// src/controllers/tracksController.ts

import { Request, Response } from "express";
import { getAccessToken, getFollowedArtists } from "../lib/spotify";
import { COLLECTIONS, db } from "../lib/firestore";
import { FollowingArtist } from "../types/spotify/artists";
import { classifyItems, toCountResponse } from "../services/classifyItems";
import { FieldPath } from "firebase-admin/firestore";

export const getFollowing = async (req: Request, res: Response) => {
  const limit = Number(req.query.limit ?? 100);
  const cursorId = req.query.cursorId as string | undefined;
  const cursorFollowedAt = req.query.cursorFollowedAt as string | undefined;

  let query = db
    .collection(COLLECTIONS.FOLLOWING_ARTISTS)
    .orderBy("followedAt")
    .orderBy(FieldPath.documentId())
    .limit(limit);

  if (cursorId && cursorFollowedAt) {
    query = query.startAfter(cursorFollowedAt, cursorId);
  }

  const snapshot = await query.get();
  const artists = snapshot.docs.map((doc) => doc.data() as FollowingArtist);

  // 次ページ用のカーソル
  const last = artists[artists.length - 1];
  const nextCursor = last
    ? { id: last.id, followedAt: last.followedAt }
    : undefined;

  // 総数
  const totalSnap = await db
    .collection(COLLECTIONS.FOLLOWING_ARTISTS)
    .count()
    .get();
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

  const col = db.collection(COLLECTIONS.FOLLOWING_ARTISTS);
  const followedAt = new Date().toISOString();

  const apiArtists = await getFollowedArtists(token);
  const apiItems: FollowingArtist[] = apiArtists.map((a) => ({
    id: a.id,
    name: a.name,
    genres: a.genres,
    popularity: a.popularity,
    followers: a.followers.total,
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
    equalsKeys: ["name", "genres", "popularity"],
    force,
  });

  // Firestore更新
  await Promise.all([
    ...result.createItems.map((a) => col.doc(a.id).set(a)),
    ...result.refreshItems.map((a) => col.doc(a.id).set(a)),
    ...result.deletedIds.map((id) => col.doc(id).delete()),
  ]);

  return res.json(toCountResponse(result));
};
