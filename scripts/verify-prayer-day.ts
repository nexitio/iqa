/**
 * Correctness check for what the salah card *says* on a given day.
 *
 * The card is day-shaped in more ways than one. Every salah owns a window that
 * closes where the next prayer opens, three stretches of the day are closed to
 * salah altogether — while the sun comes up, while it stands still at its
 * zenith, and while it goes down — and the forenoon between them belongs to no
 * salah at all. On top of that, Fridays name Jumu'ah instead of Dhuhr, and
 * through Ramadan the card stops measuring salah and starts measuring the fast.
 *
 * None of that can be seen in a browser outside those windows, so it is verified
 * here from real instants instead: which interval contains the instant, the
 * length of the span the bar measures, and the elapsed/remaining split are all
 * recomputed from absolute Dhaka times — never from the card's own arithmetic —
 * and compared with what `describePrayerCard` returns.
 *
 * Ramadan 1448 falls in February 2027, which is where the samples point.
 *
 * Run: node --experimental-strip-types scripts/verify-prayer-day.ts
 */

import {
  BD_TIMEZONE,
  bdDateParts,
  computePrayerTimes,
  findDistrict,
  toBnDigits,
} from "../src/lib/bn.ts";
import {
  SUNRISE_SPAN_MINUTES,
  SUNSET_SPAN_MINUTES,
  ZENITH_SPAN_MINUTES,
  describePrayerCard,
  prayerRowTag,
} from "../src/lib/prayer-day.ts";

const DISTRICT_IDS = ["dhaka", "coxsbazar", "rangpur"];
const RAMADAN_DAY = "2027-02-15";
const ORDINARY_DAY = "2026-11-17";
/** A plain Friday, swept because the whole Dhuhr row is renamed Jumu'ah on it. */
const FRIDAY = "2026-11-20";
const EDGE_DAYS = ["2027-02-07", "2027-03-09"];
const DAY_MS = 86_400_000;

let checks = 0;
const failures: string[] = [];
/** How many instants landed in each card state — the sweep has to visit them all. */
const phaseCounts: Record<string, number> = {};

function fail(label: string, message: string) {
  failures.push(`${label}: ${message}`);
}

/** Asia/Dhaka offset, read from Intl rather than assumed. */
function dhakaOffset(at: Date): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: BD_TIMEZONE,
    timeZoneName: "longOffset",
  }).formatToParts(at);
  return (parts.find((p) => p.type === "timeZoneName")?.value ?? "").replace("GMT", "");
}

/** Absolute instant of "HH:MM" on a Dhaka day `dayOffset` from `at`. */
function instant(dayOffset: number, clock: string, at: Date): Date {
  const p = bdDateParts(at);
  const base = new Date(Date.UTC(p.year, p.month - 1, p.day + dayOffset));
  const y = base.getUTCFullYear();
  const m = String(base.getUTCMonth() + 1).padStart(2, "0");
  const d = String(base.getUTCDate()).padStart(2, "0");
  return new Date(`${y}-${m}-${d}T${clock}:00${dhakaOffset(at)}`);
}

/** "HH:MM" on Dhaka's wall clock for an absolute instant. */
function hhmm(at: Date): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: BD_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(at);
  const hour = parts.find((p) => p.type === "hour")?.value ?? "00";
  const minute = parts.find((p) => p.type === "minute")?.value ?? "00";
  return `${hour === "24" ? "00" : hour}:${minute}`;
}

/** Dhaka weekday index (5 = Friday), read independently of the app's helper. */
function weekday(at: Date): number {
  const name = new Intl.DateTimeFormat("en-GB", { timeZone: BD_TIMEZONE, weekday: "short" }).format(at);
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(name);
}

/** The occurrence of a clock in this district's schedule nearest to `at`. */
function nearest(clock: string, at: Date, direction: "past" | "future"): Date {
  const deltas = direction === "past" ? [0, -1, 1, -2] : [0, 1, -1, 2];
  const candidates = deltas
    .map((offset) => instant(offset, clock, at))
    .filter((candidate) =>
      direction === "past" ? candidate.getTime() <= at.getTime() : candidate.getTime() > at.getTime(),
    )
    .sort((a, b) => a.getTime() - b.getTime());
  return direction === "past" ? candidates[candidates.length - 1] : candidates[0];
}

function clockOf(schedule: ReturnType<typeof computePrayerTimes>, name: string): string {
  const time = schedule.times.find((t) => t.name === name);
  if (!time) throw new Error(`schedule has no ${name}`);
  return time.time;
}

/* ------------------------------ the day's shape --------------------------- */

type IntervalKind = "salah" | "forbidden" | "duha";

interface Interval {
  kind: IntervalKind;
  key: string;
  /** The row's Bangla name on this day — Jumu'ah included. */
  name: string;
  start: Date;
  end: Date;
}

/**
 * One Dhaka day as the intervals it is actually made of.
 *
 * The forbidden stretches are lengths rather than clock times — the sun's own
 * events decide where they open — so each is measured off *this* day's sunrise,
 * zenith and sunset instead of off a fixed hour.
 */
function dayOf(districtId: string, at: Date) {
  const schedule = computePrayerTimes(findDistrict(districtId), at, "hanafi");
  const expectJumuah = weekday(at) === 5;
  const clock = (name: string) => clockOf(schedule, name);
  const onDay = (offset: number, name: string) => instant(offset, clock(name), at);
  const bout = (date: Date, minutes: number) => new Date(date.getTime() + minutes * 60_000);
  const nameOf = (name: string) => {
    if (expectJumuah && name === "dhuhr") return "জুমা";
    return schedule.times.find((time) => time.name === name)?.label.bn ?? name;
  };

  const fajrToday = onDay(0, "fajr");
  const maghribToday = onDay(0, "maghrib");
  const sunrise = onDay(0, "sunrise");
  const dhuhr = onDay(0, "dhuhr");
  const asr = onDay(0, "asr");
  const isha = onDay(0, "isha");
  const ishraq = bout(sunrise, SUNRISE_SPAN_MINUTES);
  const zenith = bout(dhuhr, -ZENITH_SPAN_MINUTES);
  const dusk = bout(maghribToday, -SUNSET_SPAN_MINUTES);

  const intervals: Interval[] = [
    { kind: "salah", key: "fajr", name: nameOf("fajr"), start: fajrToday, end: sunrise },
    { kind: "forbidden", key: "sunrise", name: "সূর্যোদয়", start: sunrise, end: ishraq },
    { kind: "duha", key: "duha", name: "দুহা", start: ishraq, end: zenith },
    { kind: "forbidden", key: "zenith", name: "সূর্য মধ্যগগণে", start: zenith, end: dhuhr },
    { kind: "salah", key: "dhuhr", name: nameOf("dhuhr"), start: dhuhr, end: asr },
    { kind: "salah", key: "asr", name: nameOf("asr"), start: asr, end: dusk },
    { kind: "forbidden", key: "sunset", name: "সূর্য ডোবার আগে", start: dusk, end: maghribToday },
    { kind: "salah", key: "maghrib", name: nameOf("maghrib"), start: maghribToday, end: isha },
    { kind: "salah", key: "isha", name: nameOf("isha"), start: isha, end: nearest(clock("fajr"), at, "future") },
  ];

  // Before dawn the interval in force is *yesterday's* Isha window — the same row
  // the card counts down from all night long.
  const overnight: Interval = {
    kind: "salah",
    key: "isha",
    name: nameOf("isha"),
    start: instant(-1, clock("isha"), at),
    end: fajrToday,
  };

  return {
    schedule,
    intervals,
    overnight,
    expectJumuah,
    fajrToday,
    maghribToday,
    fajrNext: nearest(clock("fajr"), at, "future"),
    maghribPast: nearest(clock("maghrib"), at, "past"),
  };
}

/* --------------------------------- the sweep ------------------------------ */

function verify(districtId: string, at: Date) {
  const day = dayOf(districtId, at);
  const { schedule, intervals, overnight, expectJumuah } = day;
  const card = describePrayerCard(schedule, at, "bn");
  const label = `${districtId} @ ${at.toISOString()}`;
  const d = (a: Date, b: Date) => (b.getTime() - a.getTime()) / 1000;

  // Jumu'ah is a weekday fact, independent of any schedule arithmetic.
  if (card.jumuah !== expectJumuah) {
    fail(label, `jumuah=${card.jumuah}, expected ${expectJumuah}`);
  }

  // Ramadan is a Hijri-month fact; the phase is the fast's own boundary test,
  // and the fast is exactly the interval between that day's two clocks.
  const ramadan = isRamadanByCalendar(at);
  const inFast = at.getTime() >= day.fajrToday.getTime() && at.getTime() < day.maghribToday.getTime();
  const expectedPhase = !ramadan ? "salah" : inFast ? "fasting" : "suhoor";
  phaseCounts[card.phase] = (phaseCounts[card.phase] ?? 0) + 1;

  if (ramadan) {
    if (card.phase !== expectedPhase) {
      fail(label, `phase=${card.phase}, expected ${expectedPhase}`);
      return;
    }

    // The bar measures the fast by day and the night by night, and it measures
    // the *real* gap between the two clocks, not a nominal duration.
    const start = card.phase === "fasting" ? day.fajrToday : day.maghribPast;
    const end = card.phase === "fasting" ? day.maghribToday : day.fajrNext;

    if (Math.abs(card.total - d(start, end)) > 1) {
      fail(label, `span ${card.total}s, expected ${d(start, end)}s`);
    }
    if (Math.abs(card.elapsed - d(start, at)) > 1.5) {
      fail(label, `elapsed ${card.elapsed}s, expected ${d(start, at)}s`);
    }
    if (Math.abs(card.remaining - d(at, end)) > 1.5) {
      fail(label, `remaining ${card.remaining}s, expected ${d(at, end)}s`);
    }
    if (card.phase === "fasting" && card.eventLabel !== "ইফতার") {
      fail(label, `fasting event "${card.eventLabel}"`);
    }
    if (card.phase === "suhoor" && !card.endAnchor.startsWith("সেহরি শেষ")) {
      fail(label, `suhoor end anchor "${card.endAnchor}"`);
    }
    if (!card.startAnchor || !card.endAnchor) fail(label, "missing span anchors");
  } else {
    // Which interval is this instant inside? The search covers the overnight Isha
    // window first, so nothing can fall through.
    const candidates = [overnight, ...intervals];
    const index = candidates.findIndex(
      (interval) =>
        at.getTime() >= interval.start.getTime() && at.getTime() < interval.end.getTime(),
    );
    if (index === -1) {
      fail(label, "no interval contains this instant");
      return;
    }

    const current = candidates[index];
    // A window is closed by the next one opening — and the last window of the day
    // is Isha's, which is closed by tomorrow's Fajr.
    const next =
      index === candidates.length - 1
        ? { name: intervals[0].name, start: day.fajrNext }
        : candidates[index + 1];

    if (card.phase !== current.kind) {
      fail(label, `phase=${card.phase}, expected ${current.kind} (${current.key})`);
    }
    if (card.prayerName !== (current.kind === "salah" ? current.key : null)) {
      fail(label, `prayerName=${card.prayerName}, expected ${current.kind === "salah" ? current.key : "null"}`);
    }
    if (card.eventLabel !== current.name) {
      fail(label, `event "${card.eventLabel}", expected "${current.name}"`);
    }

    const expectedState =
      current.kind === "salah"
        ? "এখন চলছে"
        : current.kind === "forbidden"
          ? "নামাজ নিষিদ্ধ সময়"
          : "নামাজের ওয়াক্ত নেই";
    if (card.stateLabel !== expectedState) {
      fail(label, `state "${card.stateLabel}", expected "${expectedState}"`);
    }

    // Both anchors are clock facts: where the interval opened, and where the next
    // one opens — which is exactly where this one closes.
    if (card.startAnchor !== `শুরু ${toBnDigits(hhmm(current.start))}`) {
      fail(label, `start anchor "${card.startAnchor}" for ${current.key}`);
    }
    if (card.endAnchor !== `${next.name} ${toBnDigits(hhmm(next.start))}`) {
      fail(label, `end anchor "${card.endAnchor}", expected "${next.name} ${toBnDigits(hhmm(next.start))}"`);
    }

    // The span the bar measures is the current interval's own length, and the two
    // sides of it have to add up to that length.
    if (Math.abs(card.total - d(current.start, current.end)) > 1) {
      fail(label, `span ${card.total}s, expected ${d(current.start, current.end)}s`);
    }
    if (Math.abs(card.elapsed - d(current.start, at)) > 1.5) {
      fail(label, `elapsed ${card.elapsed}s, expected ${d(current.start, at)}s`);
    }
    if (Math.abs(card.remaining - d(at, current.end)) > 1.5) {
      fail(label, `remaining ${card.remaining}s, expected ${d(at, current.end)}s`);
    }

    // A closed stretch explains itself — that is the line that turns a clock into
    // an instruction — while a running salah has nothing to explain.
    const expectsNote = current.kind !== "salah";
    if ((card.note !== null) !== expectsNote) {
      fail(label, `note ${card.note ? "present" : "absent"} for a ${current.kind} interval`);
    }
    if (card.note && (!card.note.bn || !card.note.en)) {
      fail(label, "note is not bilingual");
    }
  }

  if (card.percent < 0 || card.percent >= 100) fail(label, `percent out of range ${card.percent}`);
  if (card.remaining <= 0 || card.remaining > 86_400) fail(label, `remaining out of range ${card.remaining}`);

  checks += 1;
}

/** Hijri month check that does not lean on the app's own helper. */
function isRamadanByCalendar(at: Date): boolean {
  const month = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
    timeZone: BD_TIMEZONE,
    month: "numeric",
  }).formatToParts(at);
  // The app treats month 9 as Ramadan; assert the same date range from the
  // calendar alone so a wrong constant cannot pass on both sides.
  return Number(month.find((p) => p.type === "month")?.value ?? 0) === 9;
}

function dayStart(day: string): number {
  return new Date(`${day}T00:00:00${dhakaOffset(new Date(`${day}T12:00:00Z`))}`).getTime();
}

/** "HH:MM" moved by `minutes`, wrapped inside the day. */
function shiftClock(clock: string, minutes: number): string {
  const [hours, mins] = clock.split(":").map(Number);
  const total = (((hours * 60 + mins + minutes) % 1440) + 1440) % 1440;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

/** The extra instants the day pivots on: where each forbidden stretch opens. */
function haramBoundaries(schedule: ReturnType<typeof computePrayerTimes>): string[] {
  return [
    shiftClock(clockOf(schedule, "sunrise"), SUNRISE_SPAN_MINUTES),
    shiftClock(clockOf(schedule, "dhuhr"), -ZENITH_SPAN_MINUTES),
    shiftClock(clockOf(schedule, "maghrib"), -SUNSET_SPAN_MINUTES),
  ];
}

/* --------------------------------- the run ------------------------------- */

if (dhakaOffset(new Date()) !== "+06:00") {
  failures.push("Dhaka offset is not +06:00 — the oracle assumes no DST");
}

// The three forbidden stretches are lengths, not clock times, and the card is
// built on exactly these conventions (Ishraq 20 minutes, Istiwa' 10, pre-sunset
// 15). Pinning them here keeps a silent change from passing as a refactor.
if (SUNRISE_SPAN_MINUTES !== 20) failures.push(`sunrise span is ${SUNRISE_SPAN_MINUTES}, expected 20`);
if (ZENITH_SPAN_MINUTES !== 10) failures.push(`zenith span is ${ZENITH_SPAN_MINUTES}, expected 10`);
if (SUNSET_SPAN_MINUTES !== 15) failures.push(`sunset span is ${SUNSET_SPAN_MINUTES}, expected 15`);

// The day has to be *covered* by its intervals: each one ends exactly where the
// next opens, and the nine of them are a full 24 hours. A gap would be an instant
// the card has no answer for; an overlap would be two rows claiming it.
const covered = dayOf("dhaka", new Date(`${ORDINARY_DAY}T04:00:00Z`));
let cursor = covered.fajrToday.getTime();
for (const interval of covered.intervals) {
  if (interval.start.getTime() !== cursor) {
    failures.push(`interval ${interval.key} opens at ${hhmm(interval.start)}, not where the previous one closed`);
  }
  if (interval.end.getTime() <= interval.start.getTime()) {
    failures.push(`interval ${interval.key} is empty or runs backwards`);
  }
  cursor = interval.end.getTime();
}
if (cursor - covered.fajrToday.getTime() !== DAY_MS) {
  failures.push(`the day's intervals cover ${(cursor - covered.fajrToday.getTime()) / 3_600_000}h, expected 24h`);
}

for (const districtId of DISTRICT_IDS) {
  for (const day of [RAMADAN_DAY, ORDINARY_DAY, FRIDAY]) {
    const schedule = computePrayerTimes(
      findDistrict(districtId),
      new Date(`${day}T12:00:00Z`),
      "hanafi",
    );
    const offset = dhakaOffset(new Date(`${day}T12:00:00Z`));
    const start = dayStart(day);
    for (let minute = 0; minute < 24 * 60; minute += 15) {
      verify(districtId, new Date(start + minute * 60_000 + 7_000));
    }
    // Twenty seconds either side of every instant the day pivots on: the six
    // clocks, plus where each forbidden stretch opens and closes.
    for (const clock of [...schedule.times.map((t) => t.time), ...haramBoundaries(schedule)]) {
      const boundary = new Date(`${day}T${clock}:00${offset}`).getTime();
      verify(districtId, new Date(boundary - 20_000));
      verify(districtId, new Date(boundary));
      verify(districtId, new Date(boundary + 20_000));
    }
  }
  for (const day of EDGE_DAYS) {
    const start = dayStart(day);
    for (let hour = 0; hour < 24; hour += 2) {
      verify(districtId, new Date(start + hour * 3_600_000 + 13_000));
    }
  }
}

// Tags exist only for the two clocks a fasting day pivots on.
if (prayerRowTag("fajr", "bn") !== "সেহরি শেষ") failures.push("fajr row tag missing");
if (prayerRowTag("maghrib", "bn") !== "ইফতার") failures.push("maghrib row tag missing");
for (const name of ["dhuhr", "asr", "isha", "sunrise"] as const) {
  if (prayerRowTag(name, "bn") !== null) failures.push(`${name} should carry no Ramadan tag`);
}
for (const name of ["zenith", "sunset", "duha"] as const) {
  if (prayerRowTag(name, "bn") !== null) failures.push(`${name} should carry no Ramadan tag`);
}

// English wording, since the card is bilingual. Dhaka 04:00 is 22:00Z the day
// before, and Dhaka 10:00 is 04:00Z — one sample on each side of Fajr.
const preDawn = new Date("2027-02-14T22:00:00Z");
const midMorning = new Date("2027-02-15T04:00:00Z");
const districtDk = findDistrict("dhaka");
const suhoorCard = describePrayerCard(computePrayerTimes(districtDk, preDawn, "hanafi"), preDawn, "en");
const fastingCard = describePrayerCard(computePrayerTimes(districtDk, midMorning, "hanafi"), midMorning, "en");
if (suhoorCard.phase !== "suhoor") failures.push(`English pre-dawn phase was ${suhoorCard.phase}`);
if (!suhoorCard.endAnchor.includes("Suhoor ends")) failures.push(`English suhoor anchor "${suhoorCard.endAnchor}"`);
if (fastingCard.phase !== "fasting") failures.push(`English mid-morning phase was ${fastingCard.phase}`);
if (fastingCard.eventLabel !== "Iftar") failures.push(`English fasting event "${fastingCard.eventLabel}"`);

// ...and the same states in English on an ordinary day: the forenoon, the stretch
// before sunset, and a window that is simply running.
const englishDay = "2026-11-17";
const englishRef = new Date(`${englishDay}T06:00:00Z`);
const englishSchedule = computePrayerTimes(districtDk, englishRef, "hanafi");
const forenoon = new Date(`${englishDay}T03:30:00Z`); // 09:30 Dhaka, mid-forenoon
// Five minutes before the sun goes down, whenever that is on this day.
const beforeSunset = instant(0, shiftClock(clockOf(englishSchedule, "maghrib"), -5), englishRef);
const englishForenoon = describePrayerCard(computePrayerTimes(districtDk, forenoon, "hanafi"), forenoon, "en");
const englishSunset = describePrayerCard(englishSchedule, beforeSunset, "en");
if (englishForenoon.stateLabel !== "No salah window") {
  failures.push(`English forenoon state "${englishForenoon.stateLabel}"`);
}
if (englishForenoon.eventLabel !== "Duha") failures.push(`English forenoon event "${englishForenoon.eventLabel}"`);
if (englishSunset.phase !== "forbidden") failures.push(`English pre-sunset phase was ${englishSunset.phase}`);
if (englishSunset.stateLabel !== "Forbidden for salah") {
  failures.push(`English pre-sunset state "${englishSunset.stateLabel}"`);
}
if (!englishSunset.note?.en) failures.push("English pre-sunset note missing");

// Every state has to be *reachable* — a sweep that never enters a forbidden
// stretch would pass while the state it is meant to exercise is broken.
for (const phase of ["salah", "forbidden", "duha", "fasting", "suhoor"]) {
  if (!phaseCounts[phase]) failures.push(`the sweep never visited a ${phase} state`);
}

if (failures.length > 0) {
  console.error(failures.slice(0, 20).join("\n"));
  console.error(`\n✗ ${failures.length} of ${checks} card-context checks failed.`);
  process.exitCode = 1;
} else {
  const seen = ["salah", "forbidden", "duha", "fasting", "suhoor"]
    .map((phase) => `${phase} ${phaseCounts[phase]}`)
    .join(", ");
  console.log(
    `✓ Salah card context verified: ${checks} checks across ${DISTRICT_IDS.length} districts (${seen}).`,
  );
}
