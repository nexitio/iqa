"use client";

import { useCallback } from "react";
import { DISTRICTS } from "./bn";
import { STORAGE_KEYS, setStored, useStoredValue } from "./client-store";
import type { Locale } from "./types";

/**
 * The two prayer-time preferences a reader owns: where they are, and which
 * calculation they follow.
 *
 * Both are read straight from the same storage store the theme uses, so the
 * salah card, the countdowns on /daily and the settings page are all looking at
 * one value. Changing the madhab in settings therefore re-reads the schedule
 * everywhere, instead of only where someone remembered to thread a prop through.
 */

export type Madhab = "hanafi" | "shafi";

/**
 * The choice moves exactly one prayer: Asr. Hanafi uses twice the object's
 * shadow, Shafi'i uses once, which in Bangladesh is a gap of one to two hours.
 */
export const MADHABS: {
  id: Madhab;
  name: LocalizedText;
  asr: LocalizedText;
}[] = [
  {
    id: "hanafi",
    name: { bn: "হানাফী", en: "Hanafi" },
    asr: { bn: "আসর: দ্বিগুণ ছায়া", en: "Asr: shadow ×2" },
  },
  {
    id: "shafi",
    name: { bn: "শাফেঈ", en: "Shafi'i" },
    asr: { bn: "আসর: একগুণ ছায়া", en: "Asr: shadow ×1" },
  },
];

type LocalizedText = { bn: string; en: string };

export const DEFAULT_MADHAB: Madhab = "hanafi";
const DEFAULT_DISTRICT = DISTRICTS[0].id;

/** Anything unknown — an older key, a hand-edited value — falls back to the default. */
export function normalizeMadhab(value: string | null | undefined): Madhab {
  return MADHABS.some((madhab) => madhab.id === value) ? (value as Madhab) : DEFAULT_MADHAB;
}

/** "হানাফী" / "Hanafi" — for the card's calculation note and the settings select. */
export function madhabName(madhab: Madhab, locale: Locale): string {
  return (MADHABS.find((option) => option.id === madhab) ?? MADHABS[0]).name[locale];
}

/** Shared district preference, persisted per browser and shared with settings. */
export function useDistrictPreference(initialId?: string) {
  // Storage is an external system, so it is subscribed to rather than restored in
  // an effect: the snapshot is null until hydration, which keeps the server
  // markup and the first client render identical.
  const stored = useStoredValue(STORAGE_KEYS.district);
  const valid = stored && DISTRICTS.some((district) => district.id === stored) ? stored : null;
  const districtId = initialId ?? valid ?? DEFAULT_DISTRICT;

  const update = useCallback((next: string) => setStored(STORAGE_KEYS.district, next), []);

  return [districtId, update] as const;
}

/** Shared calculation madhab. Drives every prayer time the app computes. */
export function useMadhab() {
  const stored = useStoredValue(STORAGE_KEYS.madhab);
  const madhab = normalizeMadhab(stored);

  const update = useCallback((next: Madhab) => setStored(STORAGE_KEYS.madhab, next), []);

  return [madhab, update] as const;
}
