/**
 * Page readiness registry.
 *
 * Data-fetching components call markPageDataReady(key) when their CMS data has
 * loaded. A page (e.g. the homepage) awaits a set of keys so the branded
 * loader can stay on screen until everything has actually loaded — instead of
 * revealing skeletons or fallback images mid-load.
 *
 * Marks are idempotent and persist for the SPA session, so repeat visits and
 * realtime refetches don't re-trigger the wait.
 */

const resolved = new Map<string, boolean>();
const waiters = new Map<string, Set<() => void>>();

export function markPageDataReady(key: string): void {
  if (resolved.get(key)) return;
  resolved.set(key, true);
  waiters.get(key)?.forEach((fn) => fn());
  waiters.delete(key);
}

/**
 * Resolves when every key is marked ready — or after timeoutMs, whichever
 * comes first. Also enforces a minimum display time (minMs) so the branded
 * loader never just flickers past.
 */
export function waitPageData(keys: string[], timeoutMs = 8000, minMs = 1600): Promise<void> {
  const waitKey = (key: string): Promise<void> => {
    if (resolved.get(key)) return Promise.resolve();
    return new Promise<void>((res) => {
      const set = waiters.get(key) ?? new Set<() => void>();
      set.add(res);
      waiters.set(key, set);
    });
  };

  return Promise.all([
    Promise.all(keys.map(waitKey)),
    new Promise<void>((res) => setTimeout(res, minMs)),
    new Promise<void>((res) => setTimeout(res, timeoutMs)),
  ]).then(() => undefined);
}
