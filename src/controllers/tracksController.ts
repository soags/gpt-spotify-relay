// src/controllers/tracksController.ts

import { Request, Response } from "express";
import { getAccessToken, getUsersSavedTracks } from "../api/spotify";
import { Track } from "../types/tracks";
import { deleteTracks, getTracksAll, setTracks } from "../cache/tracks";

type RefreshResponse = {
  new: number;
  refreshed: number;
  skipped: number;
  deleted: number;
};

export async function refresh(
  req: Request,
  res: Response
): Promise<Response<RefreshResponse>> {
  const token = await getAccessToken();

  // キャッシュから取得
  const cached = await getTracksAll();
  const cachedIds = Object.keys(cached);

  console.log(`Cached tracks: ${cachedIds.length}`);

  // Spotify API からトラックを全件取得（50件ずつ分割取得）
  const apiTracks = await getTracksFromSpotify(token);
  const apiIds = apiTracks.map((track) => track.id);

  console.log(`Fetched tracks: ${apiIds.length}`);

  const classified = classifyTracks(apiTracks, cached);

  // 新規トラックをキャッシュに保存
  if (classified.newTracks.length > 0) {
    console.log(`Saving ${classified.newTracks.length} new tracks to cache`);
    await setTracks(classified.newTracks);
  }

  // 更新されているトラックをキャッシュに保存
  if (classified.refreshTracks.length > 0) {
    console.log(`Updating ${classified.refreshTracks.length} tracks in cache`);
    await setTracks(classified.refreshTracks);
  }

  // 削除されているトラックをキャッシュから削除
  if (classified.deletedTrackIds.length > 0) {
    console.log(
      `Deleting ${classified.deletedTrackIds.length} tracks from cache`
    );
    await deleteTracks(classified.deletedTrackIds);
  }

  return res.status(200).json({
    new: classified.newTracks.length,
    refreshed: classified.refreshTracks.length,
    skipped: classified.skipTracks.length,
    deleted: classified.deletedTrackIds.length,
  });
}

function classifyTracks(
  apiTracks: Omit<Track, "updatedAt">[],
  cached: Record<string, Track>
) {
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
    newTracks,
    skipTracks,
    refreshTracks,
    deletedTrackIds,
  };
}

// Spotify API からトラックを全件取得（50件ずつ分割取得）
async function getTracksFromSpotify(token: string) {
  const tracks: Omit<Track, "updatedAt">[] = [];

  let offset = 0;
  let tryCount = 1;
  for (let i = 0; i < tryCount; i++) {
    const res = await getUsersSavedTracks(token, {
      limit: 50,
      offset,
    });

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
