"use client";

import { useEffect, useRef } from "react";

/**
 * Closes a popover on outside pointer-down or Escape.
 *
 * The account menu used to render a `fixed inset-0` sheet behind itself and
 * close when that sheet was clicked. It never fired inside the header: the bar
 * carries `backdrop-blur`, and a `backdrop-filter` makes its element the
 * *containing block* for fixed-position descendants, so the "full screen" sheet
 * was only ever as tall as the bar — every click below the header landed on the
 * page instead. A document listener has no such dependency on which ancestor
 * happens to be filtered, and it also covers a panel rendered through a portal.
 *
 * `isInside` is checked against the event target, so a trigger, its panel and
 * anything portalled elsewhere can all count as "inside".
 */
export function useDismissable(
  open: boolean,
  onDismiss: () => void,
  isInside: (target: Node) => boolean,
) {
  // Read through a ref so the listeners are bound once per open, not re-bound
  // (and not re-entered mid-gesture) on every render of the caller.
  const latest = useRef({ onDismiss, isInside });

  useEffect(() => {
    latest.current = { onDismiss, isInside };
  });

  useEffect(() => {
    if (!open) return;

    // Capture phase on purpose: the panel closes on the way *down*, before the
    // click reaches whatever the pointer landed on.
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (!latest.current.isInside(target)) latest.current.onDismiss();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") latest.current.onDismiss();
    };

    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);
}
