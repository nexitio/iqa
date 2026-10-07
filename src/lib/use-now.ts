"use client";

import { useSyncExternalStore } from "react";

/**
 * A ticking clock read through `useSyncExternalStore`.
 *
 * Two problems are solved by doing it this way rather than with a
 * `useEffect(() => setInterval(() => setNow(new Date())))`:
 *
 *  1. Correctness — `useSyncExternalStore` has an explicit server snapshot, so
 *     a component that renders relative time or a prayer countdown produces
 *     identical markup on the server and on the first client render, then
 *     updates. Calling `setState` in an effect body after reading the clock
 *     instead causes a cascading render and a hydration mismatch on any
 *     prerendered page.
 *  2. React's rules — no setState inside an effect, and the snapshot is cached
 *     (a bare `Date.now()` getter would make React throw "getSnapshot should
 *     be cached" because it changes on every call).
 *
 * Each interval shares one module-level timer, so N components ticking at the
 * same rate cost one interval between them.
 */

interface Registry {
  now: number;
  listeners: Set<() => void>;
  timer: ReturnType<typeof setInterval> | null;
}

const registries = new Map<number, Registry>();

function registryFor(intervalMs: number): Registry {
  let registry = registries.get(intervalMs);
  if (!registry) {
    registry = { now: Date.now(), listeners: new Set(), timer: null };
    registries.set(intervalMs, registry);
  }
  return registry;
}

function subscribeTo(intervalMs: number, listener: () => void) {
  const registry = registryFor(intervalMs);
  registry.listeners.add(listener);

  if (registry.timer === null) {
    registry.timer = setInterval(() => {
      registry.now = Date.now();
      for (const l of registry.listeners) l();
    }, intervalMs);
  }

  return () => {
    registry.listeners.delete(listener);
    if (registry.listeners.size === 0 && registry.timer !== null) {
      clearInterval(registry.timer);
      registry.timer = null;
    }
  };
}

/**
 * Milliseconds since the epoch, re-read on the given interval.
 * Returns the server's build time (0) before hydration, so callers should treat
 * a falsy value as "not yet mounted".
 */
export function useNow(intervalMs = 1000): number {
  return useSyncExternalStore(
    (listener) => subscribeTo(intervalMs, listener),
    () => registryFor(intervalMs).now,
    () => 0,
  );
}

/**
 * `false` during the server render and the first client render, then `true`.
 *
 * Use it for browser-only output (a live countdown, a stored preference) so the
 * server and client markup agree.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}
