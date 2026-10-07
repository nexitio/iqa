"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * A tiny `localStorage` store read through `useSyncExternalStore`.
 *
 * Reading storage during render is impure, and restoring it from an effect
 * costs an extra render pass and produces a hydration mismatch. Treating
 * storage as the external system it actually is fixes both, and gives us
 * cross-tab synchronisation (via the `storage` event) for free.
 *
 * Values are cached so `getSnapshot` is stable — returning a freshly parsed
 * object each call would make React throw "getSnapshot should be cached".
 */

const rawCache = new Map<string, string | null>();
const parsedCache = new Map<string, { raw: string | null; value: unknown }>();
const listeners = new Map<string, Set<() => void>>();

function readRaw(key: string): string | null {
  if (!rawCache.has(key)) {
    let value: string | null = null;
    try {
      value = window.localStorage.getItem(key);
    } catch {
      /* storage can be unavailable (private mode, blocked cookies) */
    }
    rawCache.set(key, value);
  }
  return rawCache.get(key) ?? null;
}

function emit(key: string) {
  const set = listeners.get(key);
  if (set) for (const listener of set) listener();
}

/** Write a value and notify every subscriber in this tab. */
export function setStored(key: string, value: string | null) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    /* ignore quota / availability errors — the in-memory cache still updates */
  }
  rawCache.set(key, value);
  emit(key);
}

/** Read a stored string without subscribing (event handlers, one-off reads). */
export function getStored(key: string): string | null {
  return readRaw(key);
}

function subscribe(key: string, listener: () => void) {
  let set = listeners.get(key);
  if (!set) {
    set = new Set();
    listeners.set(key, set);
  }
  set.add(listener);

  const onStorage = (event: StorageEvent) => {
    if (event.key !== null && event.key !== key) return;
    rawCache.set(key, event.newValue);
    parsedCache.delete(key);
    emit(key);
  };
  window.addEventListener("storage", onStorage);

  return () => {
    set.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** Subscribe to a stored string. Returns null on the server and before hydration. */
export function useStoredValue(key: string): string | null {
  return useSyncExternalStore(
    useCallback((listener: () => void) => subscribe(key, listener), [key]),
    useCallback(() => readRaw(key), [key]),
    () => null,
  );
}

/** Subscribe to a JSON-encoded stored value, falling back before hydration. */
export function useStoredJson<T>(key: string, fallback: T): T {
  const snapshot = useSyncExternalStore(
    useCallback((listener: () => void) => subscribe(key, listener), [key]),
    useCallback(() => readRaw(key), [key]),
    () => null,
  );

  if (snapshot === null) return fallback;

  const cached = parsedCache.get(key);
  if (cached && cached.raw === snapshot) return cached.value as T;

  let value: T = fallback;
  try {
    value = JSON.parse(snapshot) as T;
  } catch {
    value = fallback;
  }
  parsedCache.set(key, { raw: snapshot, value });
  return value;
}

/** Store a JSON-encoded value. */
export function setStoredJson<T>(key: string, value: T) {
  setStored(key, JSON.stringify(value));
}

/** Storage keys used across the app, kept in one place to avoid typos. */
export const STORAGE_KEYS = {
  locale: "ilm.locale",
  theme: "ilm.theme",
  district: "ilm.district",
  madhab: "ilm.madhab",
  quranSize: "ilm.quran.size",
  prefs: "ilm.prefs",
} as const;
