// src/lib/spotify/fetchApi.ts

export const fetchApi = async <T>(url: URL, token: string) => {
  console.log(`Fetching Spotify API: ${url.toString()}`);
  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const err: { error?: { message: string; status: number } } =
      await response.json();
    const status = err.error?.status || response.status;
    const message = err.error?.message || response.statusText;
    throw new Error(`Spotify API error: ${status} - ${message}`);
  }

  return (await response.json()) as T;
};

export async function fetchAllPaginated<T, R>({
  getUrl,
  extractItems,
  extractNext,
  limit = 50,
  delayMs = 500,
  token,
}: {
  getUrl: (page: number, limit: number, offset: number) => URL;
  extractItems: (res: R) => T[];
  extractNext?: (res: R, page: number, offset: number) => boolean;
  limit?: number;
  delayMs?: number;
  token: string;
}): Promise<T[]> {
  const all: T[] = [];
  let offset = 0;
  let page = 0;
  let hasNext = true;
  while (hasNext) {
    const url = getUrl(page, limit, offset);
    const res = await fetchApi<R>(url, token);
    const items = extractItems(res);
    all.push(...items);
    page++;
    offset += limit;
    if (extractNext) {
      hasNext = extractNext(res, page, offset);
    } else if (typeof (res as { next?: string }).next !== "undefined") {
      hasNext = Boolean((res as { next?: string }).next);
    } else if (typeof (res as { total?: number }).total !== "undefined") {
      hasNext = all.length < (res as { total: number }).total;
    } else {
      hasNext = items.length === limit;
    }
    if (hasNext && delayMs) await new Promise((r) => setTimeout(r, delayMs));
  }
  return all;
}
