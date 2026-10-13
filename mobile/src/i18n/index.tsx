import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { pickLocale, translate, translateList } from "./dictionary";
import type { Locale, Localized } from "../lib/types";

export type { Locale } from "../lib/types";

const STORAGE_KEY = "ilm.locale";

interface I18nValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  tList: (key: string) => string[];
  pick: (value: Localized | undefined, fallback?: string) => string;
  isBn: boolean;
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("bn");

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved === "bn" || saved === "en") setLocaleState(saved);
    });
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  }, []);

  const value = useMemo<I18nValue>(
    () => ({
      locale,
      setLocale,
      toggleLocale: () => setLocale(locale === "bn" ? "en" : "bn"),
      t: (key, vars) => translate(key, locale, vars),
      tList: (key) => translateList(key, locale),
      pick: (input, fallback = "") => pickLocale(input, locale, fallback),
      isBn: locale === "bn",
    }),
    [locale, setLocale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
}
