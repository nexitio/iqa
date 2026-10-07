"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { pickLocale, translate, translateList } from "./dictionary";
import { setStored, useStoredValue } from "./client-store";
import type { Locale, Localized } from "./types";

/**
 * Bangla-first i18n provider.
 *
 * The audience is Bangladeshi Muslims, so `bn` is the default. Authored
 * *content* lives in the data layer as `Localized` objects and is resolved with
 * `pick()`; interface chrome comes from the dictionary.
 *
 * The dictionary itself and the pure resolution helpers live in
 * `src/lib/dictionary.ts`, which has no "use client" directive. That separation
 * matters: server components cannot import values from a client module, and
 * pages need to translate too — they use `translate` directly or the `<T>` /
 * `<Pick>` bridges in `src/components/i18n-text.tsx`.
 */

export type { Locale };
export type { TKey } from "./dictionary";

/*
 * Deliberately NOT re-exported here: `DICTIONARY`, `translate`, `translateList`
 * and `pickLocale`. Re-exporting a value from a "use client" module turns it
 * into a client reference, so a server component importing it would fail at
 * runtime. Server code imports them from `@/lib/dictionary` instead.
 */

const STORAGE_KEY = "ilm.locale";

interface I18nValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  /** Resolve an interface string. */
  t: (key: string, vars?: Record<string, string | number>) => string;
  /** Resolve a dictionary entry that holds a list (e.g. discussion rules). */
  tList: (key: string) => string[];
  /** Resolve a bilingual data field, falling back to Bangla. */
  pick: (value: Localized | undefined, fallback?: string) => string;
  dir: "ltr" | "rtl";
  isBn: boolean;
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({
  children,
  initialLocale = "bn",
}: {
  children: ReactNode;
  initialLocale?: Locale;
}) {
  /** A choice made in this session, which outranks whatever is in storage. */
  const [chosen, setChosen] = useState<Locale | null>(null);
  // Read through the storage store rather than restoring in an effect: the
  // snapshot is `null` on the server and on the first client render, so the
  // markup and the server-rendered `lang` attribute agree before it updates.
  const stored = useStoredValue(STORAGE_KEY);
  const locale: Locale = chosen ?? (stored === "en" || stored === "bn" ? stored : initialLocale);

  // The document's language is an external system; writing it belongs in an effect.
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setChosen(next);
    setStored(STORAGE_KEY, next);
  }, []);
  const toggleLocale = useCallback(
    () => setLocale(locale === "bn" ? "en" : "bn"),
    [locale, setLocale],
  );

  const value = useMemo<I18nValue>(() => {
    const t = (key: string, vars?: Record<string, string | number>) =>
      translate(key, locale, vars);
    const tList = (key: string) => translateList(key, locale);
    const pick = (input: Localized | undefined, fallback = "") =>
      pickLocale(input, locale, fallback);
    return {
      locale,
      setLocale,
      toggleLocale,
      t,
      tList,
      pick,
      dir: "ltr",
      isBn: locale === "bn",
    };
  }, [locale, setLocale, toggleLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used inside <I18nProvider>");
  }
  return ctx;
}
