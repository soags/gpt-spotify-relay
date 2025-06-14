// src/controllers/tracksController.ts

import { Request, Response } from "express";
import { getAccessToken, getUsersSavedTracks } from "../lib/spotify";
import { Track } from "../types/tracks";
import {
  deleteTracks,
  getTracksAll,
  getTracksWithCursor,
  setTracks,
} from "../cache/tracks";
import { classifyItems, toCountResponse } from "../services/classifyItems";

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

export async function refreshTracks(req: Request, res: Response) {
  const token = await getAccessToken();

  // キャッシュから取得
  const cached = await getTracksAll();
  const cachedIds = Object.keys(cached);

  console.log(`Cached tracks: ${cachedIds.length}`);

  // Spotify API からトラックを全件取得（50件ずつ分割取得）
  const apiTracks = await getTracksFromSpotify(token);
  const apiIds = apiTracks.map((track) => track.id);

  console.log(`Fetched tracks: ${apiIds.length}`);

  const classifyResult = classifyItems<Track>({
    apiItems: apiTracks,
    cached,
    idSelector: (item) => item.id,
    equals: (api, cached) => {
      if (!cached) return false;
      return (
        cached.name === api.name &&
        cached.album === api.album &&
        cached.duration_ms === api.duration_ms &&
        cached.explicit === api.explicit &&
        cached.popularity === api.popularity &&
        cached.addedAt === api.addedAt &&
        JSON.stringify(cached.artists) === JSON.stringify(api.artists)
      );
    },
  });
  const { createItems, refreshItems, deletedIds } = classifyResult;

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
  if (deletedIds.length > 0) {
    console.log(`Deleting ${deletedIds.length} tracks from cache`);
    await deleteTracks(deletedIds);
  }

  return res.status(200).json(toCountResponse(classifyResult));
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
    const { total, items } = await getUsersSavedTracks(
      {
        limit: 50,
        offset,
      },
      token
    );
    console.log(`Fetched ${items.length} tracks`);

    const track = items.map((item) => convertToTrack(item));
    tracks.push(...track);

    if (i === 0) {
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
