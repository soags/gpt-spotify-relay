// src/controllers/tracksController.ts

import { Request, Response } from "express";
import { getAccessToken, getUsersSavedTracks } from "../api/spotify";
import { ClassifyResult, ClassifyResultCount, Track } from "../types/tracks";
import {
  deleteTracks,
  getTracksAll,
  getTracksWithCursor,
  setTracks,
} from "../cache/tracks";

export const getTracks = async (req: Request, res: Response) => {
  const limit = Number(req.query.limit ?? 100);
  const cursorId = req.query.cursorId as string | undefined;
  const cursorAddedAt = req.query.cursorAddedAt as string | undefined;
  const cursor =
    cursorId && cursorAddedAt
      ? { id: cursorId, addedAt: cursorAddedAt }
      : undefined;

  const {
    tracks,
    cursor: nextCursor,
    total,
  } = await getTracksWithCursor(limit, cursor);

  res.json({
    tracks,
    cursor: nextCursor,
    total,
  });
};

export async function refresh(
  req: Request,
  res: Response
): Promise<Response<ClassifyResultCount>> {
  const token = await getAccessToken();

  // キャッシュから取得
  const cached = await getTracksAll();
  const cachedIds = Object.keys(cached);

  console.log(`Cached tracks: ${cachedIds.length}`);

  // Spotify API からトラックを全件取得（50件ずつ分割取得）
  const apiTracks = await getTracksFromSpotify(token);
  const apiIds = apiTracks.map((track) => track.id);

  console.log(`Fetched tracks: ${apiIds.length}`);

  const { createItems, refreshItems, skipItems, deleteIds } = classifyTracks(
    apiTracks,
    cached
  );

  // 新規トラックをキャッシュに保存
  if (createItems.length > 0) {
    console.log(`Saving ${createItems.length} new tracks to cache`);
    await setTracks(createItems);
  }

  // 更新されているトラックをキャッシュに保存
  if (refreshItems.length > 0) {
    console.log(`Updating ${refreshItems.length} tracks in cache`);
    await setTracks(refreshItems);
  }

  // 削除されているトラックをキャッシュから削除
  if (deleteIds.length > 0) {
    console.log(`Deleting ${deleteIds.length} tracks from cache`);
    await deleteTracks(deleteIds);
  }

  return res.status(200).json({
    new: createItems.length,
    refreshed: refreshItems.length,
    skipped: skipItems.length,
    deleted: deleteIds.length,
  });
}

function classifyTracks(
  apiTracks: Omit<Track, "updatedAt">[],
  cached: Record<string, Track>
): ClassifyResult<Track> {
  const newTracks: Track[] = [];
  const skipTracks: Track[] = [];
  const refreshTracks: Track[] = [];

  // 効率化のため、APIトラックをIDベースのマップに変換
  const apiTracksMap = new Map<string, Omit<Track, "updatedAt">>();
  apiTracks.forEach((track) => apiTracksMap.set(track.id, track));

  // APIトラックを走査して newTracks, skipTracks, refreshTracks を分類
  apiTracks.forEach((apiTrack) => {
    const cachedTrack = cached[apiTrack.id];

    // キャッシュとの変化点をチェック
    const isChanged =
      !cachedTrack ||
      cachedTrack.name !== apiTrack.name ||
      cachedTrack.album !== apiTrack.album ||
      cachedTrack.duration_ms !== apiTrack.duration_ms ||
      cachedTrack.explicit !== apiTrack.explicit ||
      cachedTrack.popularity !== apiTrack.popularity ||
      cachedTrack.addedAt !== apiTrack.addedAt ||
      JSON.stringify(cachedTrack.artists) !== JSON.stringify(apiTrack.artists);

    // キャッシュと変化点がない場合は更新日時を引き継ぐ
    const mergedTrack: Track = {
      ...apiTrack,
      updatedAt: isChanged
        ? new Date().toISOString()
        : cachedTrack?.updatedAt || new Date().toISOString(),
    };

    if (!cachedTrack) {
      // キャッシュに存在しない場合は新規
      newTracks.push(mergedTrack);
    } else if (isChanged) {
      // キャッシュと変化点がない場合はスキップ
      skipTracks.push(mergedTrack);
    } else {
      // キャッシュと変化点がある場合は更新
      refreshTracks.push(mergedTrack);
    }
  });

  // 削除されたトラックを特定
  const deletedTrackIds = Object.keys(cached).filter(
    (cachedId) => !apiTracksMap.has(cachedId)
  );

  return {
    createItems: newTracks,
    skipItems: skipTracks,
    refreshItems: refreshTracks,
    deleteIds: deletedTrackIds,
  };
}

// Spotify API からトラックを全件取得（50件ずつ分割取得）
async function getTracksFromSpotify(
  token: string
): Promise<Omit<Track, "updatedAt">[]> {
  const tracks: Omit<Track, "updatedAt">[] = [];

  let offset = 0;
  let tryCount = 1;
  for (let i = 0; i < tryCount; i++) {
    console.log(`Fetching tracks: attempt ${i + 1}, offset ${offset}`);
    const res = await getUsersSavedTracks(token, {
      limit: 50,
      offset,
    });
    console.log(`Fetched ${res.items.length} tracks`);

    const track = res.items.map((item) => convertToTrack(item));
    tracks.push(...track);

    if (i === 0) {
      const total = res.total;
      tryCount = Math.ceil(total / 50);
    }

    offset += 50;

    await new Promise((r) => setTimeout(r, 1000));
  }

  return tracks;
}

function convertToTrack(
  res: SpotifyApi.SavedTrackObject
): Omit<Track, "updatedAt"> {
  return {
    id: res.track.id,
    name: res.track.name,
    artists: res.track.artists.map((artist) => ({
      id: artist.id,
      name: artist.name,
    })),
    album: res.track.album.name,
    duration_ms: res.track.duration_ms,
    explicit: res.track.explicit,
    popularity: res.track.popularity,
    addedAt: res.added_at,
  };
}
