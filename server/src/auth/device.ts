/**
 * Naming a device from its User-Agent.
 *
 * A deliberately coarse heuristic, not an identification: the header is
 * self-reported and trivially forged, so its only honest use is to answer "do I
 * recognise this?" on a device list. It exists so the screen does not have to
 * show a reader 120 characters of Mozilla/5.0, and it avoids pulling in a
 * user-agent database to guess anything more precise than this.
 *
 * Order matters in both tables: Edge and Opera also claim to be Chrome, and
 * Chrome also claims to be Safari.
 */

import type { MaybeLocalized } from "@/lib/types";

const PLATFORMS: [RegExp, MaybeLocalized][] = [
  [/iPhone|iPad|iPod/i, { bn: "আইফোন/আইপ্যাড", en: "iPhone/iPad" }],
  [/Android/i, { bn: "অ্যান্ড্রয়েড", en: "Android" }],
  [/Windows/i, { bn: "উইন্ডোজ", en: "Windows" }],
  [/CrOS/i, { bn: "ক্রোমবুক", en: "ChromeOS" }],
  [/Macintosh|Mac OS X/i, { bn: "ম্যাক", en: "macOS" }],
  [/Linux/i, { bn: "লিনাক্স", en: "Linux" }],
];

const BROWSERS: [RegExp, string][] = [
  [/Edg\//i, "Edge"],
  [/OPR\/|Opera/i, "Opera"],
  [/Firefox\//i, "Firefox"],
  [/Chrome\//i, "Chrome"],
  [/Safari\//i, "Safari"],
];

const UNKNOWN: MaybeLocalized = { bn: "অজানা ডিভাইস", en: "Unknown device" };

/** Browser · platform, or whatever part could be told apart. */
export function describeUserAgent(userAgent: string | null): string {
  if (!userAgent) return `${UNKNOWN.bn} / ${UNKNOWN.en}`;

  const browser = BROWSERS.find(([pattern]) => pattern.test(userAgent))?.[1];
  const platform = PLATFORMS.find(([pattern]) => pattern.test(userAgent))?.[1];

  if (browser && platform) return `${browser} · ${platform.bn}`;
  if (browser) return browser;
  if (platform) return platform.bn;
  return `${UNKNOWN.bn} / ${UNKNOWN.en}`;
}
