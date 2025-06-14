// src/services/classifyItems.ts

type ClassifyResult<T> = {
  createItems: T[];
  refreshItems: T[];
  skipItems: T[];
  deletedIds: string[];
};

type ClassifyResultCount = {
  created: number;
  refreshed: number;
  skipped: number;
  deleted: number;
};

export function classifyItems<T>({
  apiItems,
  cached,
  idSelector,
  equals,
}: {
  apiItems: T[];
  cached: Record<string, T>;
  idSelector: (item: T) => string;
  equals: (api: T, cached: T) => boolean;
}): ClassifyResult<T> {
  const createItems: T[] = [];
  const skipItems: T[] = [];
  const refreshItems: T[] = [];

  // 効率化のため、APIトラックをIDベースのマップに変換
  const apiItemsMap = new Map<string, T>();
  apiItems.forEach((item) => apiItemsMap.set(idSelector(item), item));

  // APIトラックを走査して newTracks, skipTracks, refreshTracks を分類
  apiItems.forEach((apiItem) => {
    const cachedItem = cached[idSelector(apiItem)];

    // キャッシュとの変化点をチェック
    const isChanged = equals(apiItem, cachedItem);

    if (!cachedItem) {
      // キャッシュに存在しない場合は新規
      createItems.push(apiItem);
    } else if (isChanged) {
      // キャッシュと変化点がない場合はスキップ
      skipItems.push(apiItem);
    } else {
      // キャッシュと変化点がある場合は更新
      refreshItems.push(apiItem);
    }
  });

  // 削除されたアイテムを特定
  const deletedIds = Object.keys(cached).filter(
    (cachedId) => !apiItemsMap.has(cachedId)
  );

  return {
    createItems,
    skipItems,
    refreshItems,
    deletedIds,
  };
}

export function toCountResponse<T>(
  result: ClassifyResult<T>
): ClassifyResultCount {
  return {
    created: result.createItems.length,
    refreshed: result.refreshItems.length,
    skipped: result.skipItems.length,
    deleted: result.deletedIds.length,
  };
}
