export type RecentlyViewedListing = {
  id: string;
  title: string;
  priceCents: number;
};

const STORAGE_KEY = 'focused:recently-viewed';
const MAX_ENTRIES = 6;

export function readRecentlyViewed(): RecentlyViewedListing[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as RecentlyViewedListing[]) : [];
  } catch {
    return [];
  }
}

export function recordRecentlyViewed(entry: RecentlyViewedListing) {
  try {
    const rest = readRecentlyViewed().filter((other) => other.id !== entry.id);
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([entry, ...rest].slice(0, MAX_ENTRIES)),
    );
  } catch {}
}
