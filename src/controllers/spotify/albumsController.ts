// src/controllers/albumsController.ts

import { Request, Response } from "express";
import {
  AlbumsResponse,
  RefreshPlaylistsResponse,
  AlbumTracksResponse,
} from "../../types/spotify/response";
import { SPOTIFY_COLLECTIONS, db } from "../../lib/firestore";
import {
  classifyItems,
  toCountResponse,
  ClassifyResultCount,
} from "../../services/classifyItems";
import {
  getAccessToken,
  getSeveralAlbums,
  getAlbumTracks as getAlbumTracksApi,
} from "../../lib/spotify";
import { Album, AlbumTrack } from "../../types/spotify/albums";
import { ValidationError } from "../../types/error";
import { FieldPath } from "firebase-admin/firestore";
import {
  GetAlbumsQuery,
  RefreshAlbumsBody,
  GetAlbumTracksParams,
  GetAlbumTracksQuery,
  RefreshAlbumTracksParams,
  RefreshAlbumTracksBody,
} from "../../types/spotify/request";

export async function getAlbums(
  req: Request<object, AlbumsResponse, object, GetAlbumsQuery>,
  res: Response<AlbumsResponse>
): Promise<void> {
  const rawIds = req.query.ids as string | undefined;
  const ids = rawIds?.trim() ? rawIds.split(",").filter(Boolean) : [];
  const limit = Number(req.query.limit ?? 100);
  const cursorId = req.query.cursorId as string | undefined;

  const col = db.collection(SPOTIFY_COLLECTIONS.ALBUMS);

  if (ids.length > 0) {
    // ids指定時はidsのアルバムを全件取得、ページネーション・limit無視
    const docs = await Promise.all(ids.map((id) => col.doc(id).get()));
    const albums = docs
      .filter((doc) => doc.exists)
      .map((doc) => ({ ...doc.data(), id: doc.id } as Album));
    res.json({
      albums,
      cursor: undefined,
      total: albums.length,
    });
  } else {
    // ページネーション
    let query = col.orderBy(FieldPath.documentId()).limit(limit);
    if (cursorId) {
      query = query.startAfter(cursorId);
    }
    const snapshot = await query.get();
    const albums = snapshot.docs.map(
      (doc) => ({ ...doc.data(), id: doc.id } as Album)
    );
    // 次ページ用のカーソル
    const last = albums[albums.length - 1];
    const nextCursor = last ? { id: last.id } : undefined;
    // 総数
    const totalSnap = await col.count().get();
    const total = totalSnap.data().count;
    res.json({
      albums,
      cursor: nextCursor,
      total,
    });
  }
}

export async function refreshAlbums(
  req: Request<object, RefreshPlaylistsResponse, RefreshAlbumsBody, object>,
  res: Response<RefreshPlaylistsResponse>
): Promise<void> {
  const token = await getAccessToken();

  const { albumIds, force = false } = req.body as {
    albumIds: string[];
    force?: boolean;
  };

  if (!albumIds || albumIds.length === 0) {
    throw new ValidationError("albumIds is required and cannot be empty.");
  }

  const col = db.collection(SPOTIFY_COLLECTIONS.ALBUMS);

  const snapshot = await col.get();
  const cached: Record<string, Album> = {};
  snapshot.docs.forEach((doc) => {
    if (doc.exists) cached[doc.id] = doc.data() as Album;
  });

  const toFetch = force ? albumIds : albumIds.filter((id) => !cached[id]);

  const albums = [];
  for (let i = 0; i < toFetch.length; i += 20) {
    const ids = toFetch.slice(i, i + 20);
    const result = await getSeveralAlbums({ ids, token });
    albums.push(...result);
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  const apiItems: Album[] = albums.map((a) => ({
    id: a.id,
    name: a.name,
    artists: a.artists.map((artist) => ({
      id: artist.id,
      name: artist.name,
    })),
    releaseDate: a.release_date,
    totalTracks: a.total_tracks,
    albumType: a.album_type,
    popularity: a.popularity,
  }));

  const classifyResult = classifyItems({
    apiItems,
    cached,
    idSelector: (a) => a.id,
    equalsKeys: ["name", "artists", "releaseDate", "totalTracks", "albumType"],
  });

  await Promise.all([
    ...classifyResult.createItems.map((a) => col.doc(a.id).set(a)),
    ...classifyResult.refreshItems.map((a) => col.doc(a.id).set(a)),
    ...classifyResult.deletedIds.map((id) => col.doc(id).delete()),
  ]);

  // アルバムのトラックも更新
  const toRefreshAlbums = [
    ...classifyResult.createItems,
    ...classifyResult.refreshItems,
  ];
  const tracksResults = [];
  for (const album of toRefreshAlbums) {
    const res = await refreshAlbumTracksCore(album.id, false, token);
    tracksResults.push(res);
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  // 削除されたアルバムのトラックも削除
  const deletedAlbumIds = classifyResult.deletedIds;
  if (deletedAlbumIds.length > 0) {
    await Promise.all([
      ...deletedAlbumIds.map((albumId) =>
        db.collection(SPOTIFY_COLLECTIONS.ALBUM_TRACKS).doc(albumId).delete()
      ),
    ]);
  }

  const result = {
    ...toCountResponse(classifyResult),
    tracks: tracksResults,
  };

  res.json(result);
}

export async function getAlbumTracks(
  req: Request<
    GetAlbumTracksParams,
    AlbumTracksResponse,
    object,
    GetAlbumTracksQuery
  >,
  res: Response<AlbumTracksResponse>
): Promise<void> {
  const { albumId } = req.params;
  const limit = Number(req.query.limit ?? 100);
  const cursorId = req.query.cursorId as string | undefined;

  if (!albumId) {
    throw new ValidationError("albumId is required.");
  }

  let query = db
    .collection(SPOTIFY_COLLECTIONS.ALBUM_TRACKS)
    .doc(albumId)
    .collection(SPOTIFY_COLLECTIONS.ALBUM_TRACKS__TRACKS)
    .limit(limit);

  if (cursorId) {
    query = query.startAfter(cursorId);
  }

  const snapshot = await query.get();
  const tracks = snapshot.docs.map(
    (doc) => ({ ...doc.data(), id: doc.id } as AlbumTrack)
  );

  // 次ページ用のカーソル
  const last = tracks[tracks.length - 1];
  const nextCursor = last ? { id: last.id } : undefined;

  // 総数
  const totalSnap = await db
    .collection(SPOTIFY_COLLECTIONS.ALBUM_TRACKS)
    .doc(albumId)
    .collection(SPOTIFY_COLLECTIONS.ALBUM_TRACKS__TRACKS)
    .count()
    .get();
  const total = totalSnap.data().count;

  res.json({
    tracks,
    cursor: nextCursor,
    total,
  });
}

export async function refreshAlbumTracks(
  req: Request<
    RefreshAlbumTracksParams,
    ClassifyResultCount,
    RefreshAlbumTracksBody,
    object
  >,
  res: Response<ClassifyResultCount>
): Promise<void> {
  const { albumId } = req.params;
  const { force = false } = req.body as {
    force?: boolean;
  };

  if (!albumId) {
    throw new ValidationError("albumId is required.");
  }

  const token = await getAccessToken();

  const result = await refreshAlbumTracksCore(albumId, force, token);

  res.json(result);
}

const refreshAlbumTracksCore = async (
  albumId: string,
  force: boolean,
  token: string
) => {
  const col = db
    .collection(SPOTIFY_COLLECTIONS.ALBUM_TRACKS)
    .doc(albumId)
    .collection(SPOTIFY_COLLECTIONS.ALBUM_TRACKS__TRACKS);

  const apiTracks = await getAlbumTracksApi(albumId, token);

  const apiItems: AlbumTrack[] = apiTracks.map((t) => ({
    id: t.id,
    name: t.name,
    artists: t.artists.map((artist) => ({
      id: artist.id,
      name: artist.name,
    })),
    duration_ms: t.duration_ms,
    explicit: t.explicit,
  }));

  // Firestoreから現在のキャッシュを取得
  const snapshot = await col.get();
  const cached: Record<string, AlbumTrack> = {};
  snapshot.docs.forEach((doc) => {
    if (doc.exists) cached[doc.id] = doc.data() as AlbumTrack;
  });

  // 差分判定
  const result = classifyItems({
    apiItems,
    cached,
    idSelector: (p) => p.id,
    equalsKeys: ["id", "name", "artists", "duration_ms", "explicit"],
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
