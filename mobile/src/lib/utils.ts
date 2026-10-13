import { toBnDigits } from "./bn";
import type { Locale } from "./types";

/** Compact version of a number for tight UI, Latin digits. */
export function compact(n: number) {
  if (n < 1000) return String(n);
  if (n < 100000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K`;
  if (n < 10000000) return `${(n / 100000).toFixed(n % 100000 === 0 ? 0 : 1)}L`;
  return `${(n / 10000000).toFixed(1)}Cr`;
}

/** The same compaction in the reader's numerals — "১.২K" in Bangla. */
export function formatCount(n: number, locale: Locale = "bn") {
  return locale === "bn" ? toBnDigits(compact(n)) : compact(n);
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
  if (min < 60) return `${toBnDigits(min)} মিনিট আগে`;
  if (hour < 24) return `${toBnDigits(hour)} ঘন্টা আগে`;
  if (day < 7) return `${toBnDigits(day)} দিন আগে`;
  if (day < 30) return `${toBnDigits(Math.floor(day / 7))} সপ্তাহ আগে`;
  if (day < 365) return `${toBnDigits(Math.floor(day / 30))} মাস আগে`;
  return `${toBnDigits(Math.floor(day / 365))} বছর আগে`;
}

/** Initials for avatar fallbacks (works for Bengali conjuncts). */
export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "؟";
  if (parts.length === 1) return Array.from(parts[0]).slice(0, 2).join("");
  return `${Array.from(parts[0])[0]}${Array.from(parts[parts.length - 1])[0]}`;
}

/** Normalise authored body text into paragraphs. */
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

/** Percentage, clamped 0-100. */
export function pct(value: number, total: number) {
  if (total <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((value / total) * 100)));
}

/** Number of lines a text block occupies, capped — a cheap RN substitute for line-clamp. */
export function clampLines(text: string, maxLines: number, charsPerLine = 46) {
  const maxChars = maxLines * charsPerLine;
  if (text.length <= maxChars) return text;
  return `${text.slice(0, maxChars).trimEnd()}…`;
}
