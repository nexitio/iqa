import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes with conflict resolution. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Deterministic pseudo-id for mock data / keys. */
export function makeId(prefix: string, n: number | string) {
  return `${prefix}_${n}`;
}

/** URL-safe slug from mixed Bengali/Latin text. */
export function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/**
 * Compact version of a number for tight UI (stats, badges).
 * Uses Latin digits on purpose — call `formatCount` for locale-aware output.
 */
export function compact(n: number) {
  if (n < 1000) return String(n);
  if (n < 100000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K`;
  if (n < 10000000) return `${(n / 100000).toFixed(n % 100000 === 0 ? 0 : 1)}L`;
  return `${(n / 10000000).toFixed(1)}Cr`;
}

/** "৩ ঘন্টা আগে" style relative time from an ISO string. */
export function relativeTime(
  iso: string,
  locale: "bn" | "en" = "bn",
  now: Date = new Date(),
) {
  const then = new Date(iso).getTime();
  const diff = Math.max(0, now.getTime() - then);
  const min = Math.floor(diff / 60000);
  const hour = Math.floor(min / 60);
  const day = Math.floor(hour / 24);

  if (locale === "en") {
    if (min < 1) return "just now";
    if (min < 60) return `${min}m ago`;
    if (hour < 24) return `${hour}h ago`;
    if (day < 7) return `${day}d ago`;
    if (day < 30) return `${Math.floor(day / 7)}w ago`;
    if (day < 365) return `${Math.floor(day / 30)}mo ago`;
    return `${Math.floor(day / 365)}y ago`;
  }

  if (min < 1) return "এইমাত্র";
  if (min < 60) return `${min} মিনিট আগে`;
  if (hour < 24) return `${hour} ঘন্টা আগে`;
  if (day < 7) return `${day} দিন আগে`;
  if (day < 30) return `${Math.floor(day / 7)} সপ্তাহ আগে`;
  if (day < 365) return `${Math.floor(day / 30)} মাস আগে`;
  return `${Math.floor(day / 365)} বছর আগে`;
}

/** Reading-time estimate that accounts for Arabic script density. */
export function readingMinutes(text: string, locale: "bn" | "en" = "bn") {
  const words = text.trim().split(/\s+/).length;
  const wpm = locale === "bn" ? 150 : 220;
  return Math.max(1, Math.round(words / wpm));
}

/** Initials for avatar fallbacks (works for Bengali conjuncts). */
export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "؟";
  if (parts.length === 1) return Array.from(parts[0]).slice(0, 2).join("");
  return `${Array.from(parts[0])[0]}${Array.from(parts[parts.length - 1])[0]}`;
}

/**
 * Normalise authored body text into paragraphs.
 *
 * Articles and fatwas store `bodyBn` as a string[], while answers and replies
 * store it as one string with newline breaks. The `Prose` renderer wants
 * paragraphs either way, so both shapes funnel through here.
 */
export function toParagraphs(text: string | string[]): string[] {
  if (Array.isArray(text)) return text.map((p) => p.trim()).filter(Boolean);
  const blocks = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (blocks.length > 1) return blocks;
  return text
    .split(/\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/** Truncate on word boundary. */
export function truncate(text: string, max: number) {
  if (text.length <= max) return text;
  return `${text.slice(0, text.lastIndexOf(" ", max)).trimEnd()}…`;
}

/** Group a flat list into a record by key. */
export function groupBy<T, K extends string | number>(
  items: T[],
  key: (item: T) => K,
): Record<K, T[]> {
  return items.reduce(
    (acc, item) => {
      const k = key(item);
      (acc[k] ||= []).push(item);
      return acc;
    },
    {} as Record<K, T[]>,
  );
}

/** Simple array shuffle with a seed so SSR and client agree. */
export function seededShuffle<T>(items: T[], seed: number): T[] {
  const out = [...items];
  let s = seed;
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Pick the first N items — used to cap "related content" rails. */
export function take<T>(items: T[], n: number): T[] {
  return items.slice(0, n);
}

/** Percentage, clamped 0-100. */
export function pct(value: number, total: number) {
  if (total <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((value / total) * 100)));
}

export function range(n: number) {
  return Array.from({ length: n }, (_, i) => i);
}
