export type RecentlyViewedListing = {
  href: string;
  title: string;
  priceCents: number;
};

const STORAGE_KEY = 'focused:recently-viewed';
const MAX_ENTRIES = 6;

export function readRecentlyViewed(): RecentlyViewedListing[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const entries = raw ? (JSON.parse(raw) as Partial<RecentlyViewedListing>[]) : [];
    return entries.filter(
      (entry): entry is RecentlyViewedListing => typeof entry.href === 'string',
    );
  } catch {
    return [];
  }
}

export function recordRecentlyViewed(entry: RecentlyViewedListing) {
  try {
    const rest = readRecentlyViewed().filter((other) => other.href !== entry.href);
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([entry, ...rest].slice(0, MAX_ENTRIES)),
    );
  } catch {}
}
