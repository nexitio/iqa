/**
 * What the salah card should say today.
 *
 * The card is not only a timetable: on Fridays the Dhuhr row *is* Jumu'ah, and
 * through Ramadan the thing a reader is watching is the fast, not the next
 * salah. Both are day-shape decisions, so they live here as plain data rather
 * than as branches inside the component — this module has no JSX and no clock of
 * its own, which means every state (including the Ramadan ones, four months
 * away) can be verified against real instants from a script.
 */

import type { Locale, PrayerSchedule, PrayerTime } from "./types";
import { bdDateParts, isJumuah, isRamadan, toBnDigits } from "./bn.ts";

const DAY_SECONDS = 86_400;

/** "HH:MM" → seconds since midnight. */
function clockSeconds(clock: string) {
  const [hours, minutes] = clock.split(":").map(Number);
  return hours * 3600 + minutes * 60;
}

/** Seconds since midnight on Dhaka's wall clock — never the host's. */
function bdSeconds(now: Date) {
  const parts = bdDateParts(now);
  return parts.hour * 3600 + parts.minute * 60 + now.getSeconds();
}

/** Seconds from now until a "HH:MM" prayer, wrapped so tomorrow is reachable. */
export function secondsUntil(clock: string, now: Date): number {
  let diff = clockSeconds(clock) - bdSeconds(now);
  if (diff < 0) diff += DAY_SECONDS;
  return diff;
}

/**
 * How far through the span between two clocks we are.
 *
 * Elapsed time is taken modulo a day because the spans that matter here cross
 * midnight — Isha's window, Ramadan's night — while the remaining side is the
 * wrapped countdown, so the two always add up to the span's true length.
 */
export function windowBetween(startClock: string, endClock: string, now: Date) {
  const elapsed = (bdSeconds(now) - clockSeconds(startClock) + DAY_SECONDS) % DAY_SECONDS;
  const remaining = secondsUntil(endClock, now);
  const total = elapsed + remaining;
  return { elapsed, remaining, total, percent: total > 0 ? (elapsed / total) * 100 : 0 };
}

export type PrayerCardPhase = "salah" | "fasting" | "suhoor";

export interface PrayerCardContext {
  /** True on Friday, when the Dhuhr salah is Jumu'ah. */
  jumuah: boolean;
  /** `fasting` and `suhoor` only ever occur in Ramadan. */
  phase: PrayerCardPhase;
  /** The eyebrow: "এখন চলছে", "রোজা চলছে", "সেহরির শেষ সময়". */
  stateLabel: string;
  /** The headline value the countdown belongs to: a salah name or "ইফতার". */
  eventLabel: string;
  /** Left end of the progress bar, already formatted with its clock. */
  startAnchor: string;
  /** Right end of the progress bar. */
  endAnchor: string;
  elapsed: number;
  remaining: number;
  total: number;
  percent: number;
}

/**
 * The card's state for `now`, in `locale`.
 *
 * The two Ramadan phases are decided by comparing wall clocks, not by the
 * schedule's `passed` flags: a clock more than twelve hours ahead (Maghrib, read
 * at 05:30) is wrapped onto the *previous* day and so reads as passed, which said
 * "not fasting" for most of a fasting morning. Between Fajr and Maghrib the card
 * measures the fast; outside those two clocks it measures the night, which is the
 * window someone fasting is actually watching because it ends at suhoor. The
 * next-salah countdown gives way to those two for the month; the list below still
 * carries every salah and its state.
 */
export function describePrayerCard(
  schedule: PrayerSchedule,
  now: Date,
  locale: Locale,
): PrayerCardContext {
  const bn = locale === "bn";
  const jumuah = isJumuah(now);
  const current = schedule.times.find((time) => time.isCurrent) ?? null;
  const next = schedule.nextPrayer;

  const nameOf = (time: PrayerTime) =>
    jumuah && time.name === "dhuhr" ? (bn ? "জুমা" : "Jumu'ah") : time.label[locale];

  const fajr = schedule.times.find((time) => time.name === "fajr");
  const maghrib = schedule.times.find((time) => time.name === "maghrib");

  if (isRamadan(now) && fajr && maghrib) {
    const seconds = bdSeconds(now);
    const fasting = clockSeconds(fajr.time) <= seconds && seconds < clockSeconds(maghrib.time);
    const span = windowBetween(
      fasting ? fajr.time : maghrib.time,
      fasting ? maghrib.time : fajr.time,
      now,
    );
    const suhoorEnds = `${bn ? "সেহরি শেষ" : "Suhoor ends"} ${toBnDigits(fajr.time)}`;
    const iftar = `${bn ? "ইফতার" : "Iftar"} ${toBnDigits(maghrib.time)}`;

    return {
      jumuah,
      phase: fasting ? "fasting" : "suhoor",
      stateLabel: fasting ? (bn ? "রোজা চলছে" : "Fasting") : bn ? "সেহরির শেষ সময়" : "Suhoor deadline",
      eventLabel: fasting ? (bn ? "ইফতার" : "Iftar") : fajr.label[locale],
      startAnchor: fasting ? suhoorEnds : iftar,
      // The fast's far end is named after the salah, so the bar is anchored to
      // the same word the list uses for that row.
      endAnchor: fasting ? `${nameOf(maghrib)} ${toBnDigits(maghrib.time)}` : suhoorEnds,
      ...span,
    };
  }

  const span = current
    ? windowBetween(current.time, next.time, now)
    : { elapsed: 0, remaining: secondsUntil(next.time, now), total: 0, percent: 0 };

  return {
    jumuah,
    phase: "salah",
    stateLabel: current
      ? bn
        ? "এখন চলছে"
        : "In progress"
      : bn
        ? "পরবর্তী"
        : "Up next",
    eventLabel: nameOf(current ?? next),
    startAnchor: current ? `${bn ? "শুরু" : "Started"} ${toBnDigits(current.time)}` : "",
    endAnchor: `${nameOf(next)} ${toBnDigits(next.time)}`,
    ...span,
  };
}

/** Ramadan row tags: the two clock times a fasting day pivots on. */
export function prayerRowTag(name: PrayerTime["name"], locale: Locale): string | null {
  const bn = locale === "bn";
  if (name === "fajr") return bn ? "সেহরি শেষ" : "Suhoor ends";
  if (name === "maghrib") return bn ? "ইফতার" : "Iftar";
  return null;
}
