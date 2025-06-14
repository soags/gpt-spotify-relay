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

export function classifyItems<T extends { updatedAt: string }>({
  apiItems,
  cached,
  idSelector,
  equals,
}: {
  apiItems: Omit<T, "updatedAt">[];
  cached: Record<string, T>;
  idSelector: (item: Omit<T, "updatedAt">) => string;
  equals: (api: Omit<T, "updatedAt">, cached: T) => boolean;
}): ClassifyResult<T> {
  const createItems: T[] = [];
  const skipItems: T[] = [];
  const refreshItems: T[] = [];

  // 効率化のため、APIトラックをIDベースのマップに変換
  const apiItemsMap = new Map<string, Omit<T, "updatedAt">>();
  apiItems.forEach((item) => apiItemsMap.set(idSelector(item), item));

  // APIトラックを走査して newTracks, skipTracks, refreshTracks を分類
  apiItems.forEach((apiItem) => {
    const cachedItem = cached[idSelector(apiItem)];

    // キャッシュとの変化点をチェック
    const isChanged = equals(apiItem, cachedItem);

    // キャッシュと変化点がない場合は更新日時を引き継ぐ
    const merged: T = {
      ...apiItem,
      updatedAt: isChanged
        ? new Date().toISOString()
        : cachedItem?.updatedAt || new Date().toISOString(),
    } as T;

    if (!cachedItem) {
      // キャッシュに存在しない場合は新規
      createItems.push(merged);
    } else if (isChanged) {
      // キャッシュと変化点がない場合はスキップ
      skipItems.push(merged);
    } else {
      // キャッシュと変化点がある場合は更新
      refreshItems.push(merged);
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
