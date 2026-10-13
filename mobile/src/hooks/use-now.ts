import { useEffect, useState } from "react";

/**
 * The current time, re-read on an interval.
 *
 * Prayer countdowns need the clock to move, and the widget re-renders cheaply,
 * so one shared hook keeps every countdown in the app honest without each
 * component inventing its own timer.
 */
export function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}
