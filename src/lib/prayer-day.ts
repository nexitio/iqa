/**
 * What the salah card should say today.
 *
 * A timetable of start clocks is not a day. Every salah has a window that closes
 * on the next prayer, three stretches of it are closed to salah altogether, and
 * the forenoon between them belongs to no salah at all — so the card has to know
 * which interval the reader is standing in before it can say how long is left.
 * On top of that, Fridays make the Dhuhr row *Jumu'ah*, and through Ramadan the
 * thing a reader is watching is the fast, not the next salah.
 *
 * All of it is day-shape rather than presentation, so it lives here as plain data
 * instead of as branches inside the component — this module has no JSX and no
 * clock of its own, which means every state (including the Ramadan ones, four
 * months away) can be verified against real instants from a script.
 */

import type { Locale, Localized, PrayerSchedule, PrayerTime } from "./types";
import { bdDateParts, isJumuah, isRamadan, toBnDigits } from "./bn.ts";

const DAY_SECONDS = 86_400;

/** "HH:MM" → seconds since midnight. */
function clockSeconds(clock: string) {
  const [hours, minutes] = clock.split(":").map(Number);
  return hours * 3600 + minutes * 60;
}

/** Seconds since midnight → "HH:MM". */
function clockFromSeconds(total: number) {
  const seconds = ((total % DAY_SECONDS) + DAY_SECONDS) % DAY_SECONDS;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

/** "HH:MM" moved by `minutes`, wrapped inside the day. */
export function shiftClock(clock: string, minutes: number): string {
  return clockFromSeconds(clockSeconds(clock) + minutes * 60);
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

/* ------------------------------- the day's shape --------------------------- */

/**
 * The three stretches in which no salah may be offered.
 *
 * They are real solar events rather than fixed clock times: salah is forbidden
 * while the sun is coming up, while it stands still at its zenith, and while it
 * is going down. Each is stored as a *length* rather than as a time, so the
 * interval travels with the season exactly the way the prayers do.
 */
export const SUNRISE_SPAN_MINUTES = 20;
export const ZENITH_SPAN_MINUTES = 10;
export const SUNSET_SPAN_MINUTES = 15;

export type DaySegmentKind = "salah" | "forbidden" | "duha";

export interface DaySegment {
  kind: DaySegmentKind;
  /** The row's identity: a prayer's name, or the interval's own key. */
  key: PrayerTime["name"] | "zenith" | "sunset" | "duha";
  label: Localized;
  /** "HH:MM" — the instant the interval opens. */
  start: string;
  /** "HH:MM" — the instant it closes, which is the next interval's first moment. */
  end: string;
  /** What closes it: the next row's label, so an end anchor can name its clock. */
  nextLabel: Localized;
  /** Why the stretch is closed to salah — only forbidden intervals carry one. */
  note?: Localized;
}

/**
 * A day as the intervals it is actually made of.
 *
 * Every salah owns a window that closes where the next one opens, and the three
 * forbidden stretches sit between them: Fajr ends at sunrise, Asr ends when the
 * sun starts to go down, and the forenoon belongs to no salah at all — it is
 * duha, nafl time only. A timetable of six start clocks cannot answer "how long
 * have I got", which is the only question someone reading a prayer card while
 * looking at a clock is asking.
 */
export function daySegments(schedule: PrayerSchedule): DaySegment[] {
  const clock = (name: PrayerTime["name"]) =>
    schedule.times.find((time) => time.name === name)?.time ?? "00:00";
  const labelOf = (name: PrayerTime["name"]): Localized =>
    schedule.times.find((time) => time.name === name)?.label ?? { bn: name, en: name };

  const fajr = clock("fajr");
  const sunrise = clock("sunrise");
  const dhuhr = clock("dhuhr");
  const asr = clock("asr");
  const maghrib = clock("maghrib");
  const isha = clock("isha");

  const ishraq = shiftClock(sunrise, SUNRISE_SPAN_MINUTES);
  const zenith = shiftClock(dhuhr, -ZENITH_SPAN_MINUTES);
  const dusk = shiftClock(maghrib, -SUNSET_SPAN_MINUTES);

  const open: Omit<DaySegment, "nextLabel">[] = [
    { kind: "salah", key: "fajr", label: labelOf("fajr"), start: fajr, end: sunrise },
    {
      kind: "forbidden",
      key: "sunrise",
      label: { bn: "সূর্যোদয়", en: "Sunrise" },
      start: sunrise,
      end: ishraq,
      note: { bn: "সূর্য পুরোপুরি ওঠা পর্যন্ত", en: "Until the sun has fully risen" },
    },
    {
      kind: "duha",
      key: "duha",
      label: { bn: "দুহা", en: "Duha" },
      start: ishraq,
      end: zenith,
      note: { bn: "নফল নামাজ পড়া যাবে", en: "Nafl prayer is allowed" },
    },
    {
      kind: "forbidden",
      key: "zenith",
      label: { bn: "সূর্য মধ্যগগণে", en: "Solar zenith" },
      start: zenith,
      end: dhuhr,
      note: { bn: "সূর্য হেলে পড়া পর্যন্ত", en: "Until the sun has passed its zenith" },
    },
    { kind: "salah", key: "dhuhr", label: labelOf("dhuhr"), start: dhuhr, end: asr },
    { kind: "salah", key: "asr", label: labelOf("asr"), start: asr, end: dusk },
    {
      kind: "forbidden",
      key: "sunset",
      label: { bn: "সূর্য ডোবার আগে", en: "Before sunset" },
      start: dusk,
      end: maghrib,
      note: { bn: "সূর্য ডুবে যাওয়া পর্যন্ত", en: "Until the sun has set" },
    },
    { kind: "salah", key: "maghrib", label: labelOf("maghrib"), start: maghrib, end: isha },
    { kind: "salah", key: "isha", label: labelOf("isha"), start: isha, end: fajr },
  ];

  // An interval is closed by the next one opening, so the row that follows is
  // what its end anchor names. The last row wraps to the morning's Fajr.
  return open.map((segment, index) => ({
    ...segment,
    nextLabel: open[(index + 1) % open.length].label,
  }));
}

/** The interval `now` falls in. The day wraps, so nothing can fall outside it. */
export function segmentAt(segments: DaySegment[], now: Date): DaySegment {
  const seconds = bdSeconds(now);
  return (
    segments.find((segment) => {
      const start = clockSeconds(segment.start);
      const end = clockSeconds(segment.end);
      // Isha's window closes on tomorrow's Fajr, so its clock runs backwards.
      return end > start ? seconds >= start && seconds < end : seconds >= start || seconds < end;
    }) ?? segments[segments.length - 1]
  );
}

export type PrayerCardPhase = "salah" | "forbidden" | "duha" | "fasting" | "suhoor";

export interface PrayerCardContext {
  /** True on Friday, when the Dhuhr salah is Jumu'ah. */
  jumuah: boolean;
  /** `fasting` and `suhoor` only ever occur in Ramadan. */
  phase: PrayerCardPhase;
  /** The salah whose window is running; null in a gap or a forbidden stretch. */
  prayerName: PrayerTime["name"] | null;
  /** The eyebrow: "এখন চলছে", "নামাজ নিষিদ্ধ সময়", "রোজা চলছে". */
  stateLabel: string;
  /** The headline value the countdown belongs to: a salah name or "ইফতার". */
  eventLabel: string;
  /** Why a forbidden stretch is closed, when one is. */
  note: Localized | null;
  /** Left end of the progress bar, already formatted with its clock. */
  startAnchor: string;
  /** Right end of the progress bar: the next interval's name and opening clock. */
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
      prayerName: null,
      stateLabel: fasting ? (bn ? "রোজা চলছে" : "Fasting") : bn ? "সেহরির শেষ সময়" : "Suhoor deadline",
      eventLabel: fasting ? (bn ? "ইফতার" : "Iftar") : fajr.label[locale],
      note: null,
      startAnchor: fasting ? suhoorEnds : iftar,
      // The fast's far end is named after the salah, so the bar is anchored to
      // the same word the list uses for that row.
      endAnchor: fasting ? `${nameOf(maghrib)} ${toBnDigits(maghrib.time)}` : suhoorEnds,
      ...span,
    };
  }

  /* Outside Ramadan the card measures the interval the reader is actually in —
     a salah's own window, a stretch where salah is forbidden, or the forenoon
     between them — rather than the distance to the next start time. The bar has
     to end where that interval ends, or "how long have I got" is answered by the
     wrong clock: Saying "Fajr, ends at Dhuhr" all through the forenoon was the
     old card's answer, and Fajr's window had closed at sunrise. */
  const segments = daySegments(schedule);
  const segment = segmentAt(segments, now);
  const next = segments[(segments.indexOf(segment) + 1) % segments.length];
  const prayer =
    segment.kind === "salah"
      ? (schedule.times.find((time) => time.name === segment.key) ?? null)
      : null;

  /** A row's name as the card should write it — Jumu'ah included. */
  const labelOfSegment = (target: DaySegment) => {
    const time = schedule.times.find((entry) => entry.name === target.key);
    return time ? nameOf(time) : target.label[locale];
  };

  return {
    jumuah,
    phase:
      segment.kind === "salah" ? "salah" : segment.kind === "forbidden" ? "forbidden" : "duha",
    prayerName: prayer?.name ?? null,
    stateLabel:
      segment.kind === "salah"
        ? bn
          ? "এখন চলছে"
          : "In progress"
        : segment.kind === "forbidden"
          ? bn
            ? "নামাজ নিষিদ্ধ সময়"
            : "Forbidden for salah"
          : bn
            ? "নামাজের ওয়াক্ত নেই"
            : "No salah window",
    eventLabel: labelOfSegment(segment),
    note: segment.note ?? null,
    startAnchor: `${bn ? "শুরু" : "Started"} ${toBnDigits(segment.start)}`,
    endAnchor: `${labelOfSegment(next)} ${toBnDigits(next.start)}`,
    ...windowBetween(segment.start, segment.end, now),
  };
}

/** Ramadan row tags: the two clock times a fasting day pivots on. */
export function prayerRowTag(name: DaySegment["key"], locale: Locale): string | null {
  const bn = locale === "bn";
  if (name === "fajr") return bn ? "সেহরি শেষ" : "Suhoor ends";
  if (name === "maghrib") return bn ? "ইফতার" : "Iftar";
  return null;
}
