const cache = new Map<string, { data: unknown; ts: number }>();

export async function cachedFetch<T>(
  url: string,
  ttlMs = 300_000  // 5 minutes default
): Promise<T> {
  const now = Date.now();
  const hit = cache.get(url);

  if (hit && now - hit.ts < ttlMs) {
    return hit.data as T;
  }

  const res = await fetch(url);

  if (!res.ok) {
    // If we have stale data, return it rather than throwing
    if (hit) return hit.data as T;
    throw new Error(`Request failed: ${res.status} ${url}`);
  }

  const data = await res.json();
  cache.set(url, { data, ts: now });
  return data as T;
}

export function invalidateCache(url: string) {
  cache.delete(url);
}

export function clearCache() {
  cache.clear();
}