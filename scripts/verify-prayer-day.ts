/**
 * Correctness check for what the salah card *says* on a given day.
 *
 * The card is day-shaped: Fridays name Jumu'ah instead of Dhuhr, and through
 * Ramadan it stops counting down to the next salah and starts counting the fast
 * — suhoor to iftar by day, iftar to suhoor by night. None of that can be seen
 * in a browser outside those windows, so it is verified here from real instants
 * instead: the expected phase, the length of the span the bar measures, and the
 * elapsed/remaining split are all recomputed from absolute Dhaka times and
 * compared with what `describePrayerCard` returns.
 *
 * Ramadan 1448 falls in February 2027, which is where the samples point.
 *
 * Run: node --experimental-strip-types scripts/verify-prayer-day.ts
 */

import { BD_TIMEZONE, bdDateParts, computePrayerTimes, findDistrict, toBnDigits } from "../src/lib/bn.ts";
import { describePrayerCard, prayerRowTag } from "../src/lib/prayer-day.ts";

const DISTRICT_IDS = ["dhaka", "coxsbazar", "rangpur"];
const RAMADAN_DAY = "2027-02-15";
const ORDINARY_DAY = "2026-11-17";
const EDGE_DAYS = ["2027-02-07", "2027-03-09"];

let checks = 0;
const failures: string[] = [];

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

/* --------------------------------- the sweep ------------------------------ */

function verify(districtId: string, at: Date) {
  const district = findDistrict(districtId);
  const schedule = computePrayerTimes(district, at, "hanafi");
  const card = describePrayerCard(schedule, at, "bn");
  const label = `${districtId} @ ${at.toISOString()}`;
  const d = (a: Date, b: Date) => (b.getTime() - a.getTime()) / 1000;

  const fajrClock = clockOf(schedule, "fajr");
  const maghribClock = clockOf(schedule, "maghrib");
  // The fast belongs to the Dhaka day being displayed, so its two ends are that
  // day's Fajr and Maghrib — not the previous Maghrib, which is what a
  // "latest instant behind us" search hands back all through the morning.
  const fajrToday = instant(0, fajrClock, at);
  const maghribToday = instant(0, maghribClock, at);
  const fajrNext = nearest(fajrClock, at, "future");
  const maghribPast = nearest(maghribClock, at, "past");

  // Jumu'ah is a weekday fact, independent of any schedule arithmetic.
  const expectJumuah = weekday(at) === 5;
  if (card.jumuah !== expectJumuah) {
    fail(label, `jumuah=${card.jumuah}, expected ${expectJumuah}`);
  }

  // Ramadan is a Hijri-month fact; the phase is the fast's own boundary test,
  // and the fast is exactly the interval between that day's two clocks.
  const ramadan = isRamadanByCalendar(at);
  const inFast = at.getTime() >= fajrToday.getTime() && at.getTime() < maghribToday.getTime();
  const expectedPhase = !ramadan ? "salah" : inFast ? "fasting" : "suhoor";

  if (card.phase !== expectedPhase) {
    fail(label, `phase=${card.phase}, expected ${expectedPhase}`);
    return;
  }

  if (ramadan) {
    // The bar measures the fast by day and the night by night, and it measures
    // the *real* gap between the two clocks, not a nominal duration.
    const start = card.phase === "fasting" ? fajrToday : maghribPast;
    const end = card.phase === "fasting" ? maghribToday : fajrNext;
    const expectedTotal = d(start, end);
    const expectedElapsed = d(start, at);

    if (Math.abs(card.total - expectedTotal) > 1) {
      fail(label, `span ${card.total}s, expected ${expectedTotal}s`);
    }
    if (Math.abs(card.elapsed - expectedElapsed) > 1.5) {
      fail(label, `elapsed ${card.elapsed}s, expected ${expectedElapsed}s`);
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
    // A normal day measures the salah window: the last prayer behind us to the
    // next one ahead, which is what the schedule's own flags must agree with.
    const congregational = schedule.times.filter((t) => t.name !== "sunrise");
    const past = congregational
      .map((t) => ({ t, at: nearest(t.time, at, "past") }))
      .filter((c) => c.at.getTime() <= at.getTime())
      .sort((a, b) => a.at.getTime() - b.at.getTime());
    const future = congregational
      .map((t) => ({ t, at: nearest(t.time, at, "future") }))
      .sort((a, b) => a.at.getTime() - b.at.getTime());
    const current = past[past.length - 1];
    const next = future[0];
    const expectedTotal = d(current.at, next.at);

    if (Math.abs(card.total - expectedTotal) > 1) {
      fail(label, `span ${card.total}s, expected ${expectedTotal}s`);
    }
    if (Math.abs(card.elapsed - d(current.at, at)) > 1.5) {
      fail(label, `elapsed ${card.elapsed}s, expected ${d(current.at, at)}s`);
    }
    const expectedEvent = expectJumuah && current.t.name === "dhuhr" ? "জুমা" : current.t.label.bn;
    if (card.eventLabel !== expectedEvent) {
      fail(label, `event "${card.eventLabel}", expected "${expectedEvent}"`);
    }
    const nextName = expectJumuah && next.t.name === "dhuhr" ? "জুমা" : next.t.label.bn;
    if (card.endAnchor !== `${nextName} ${toBnDigits(next.t.time)}`) {
      fail(label, `end anchor "${card.endAnchor}" for next ${nextName}`);
    }
    if (!card.startAnchor.endsWith(toBnDigits(current.t.time))) {
      fail(label, `start anchor "${card.startAnchor}" for current ${current.t.name}`);
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

/* --------------------------------- the run ------------------------------- */

if (dhakaOffset(new Date()) !== "+06:00") {
  failures.push("Dhaka offset is not +06:00 — the oracle assumes no DST");
}

for (const districtId of DISTRICT_IDS) {
  const schedule = computePrayerTimes(findDistrict(districtId), new Date(`${RAMADAN_DAY}T12:00:00Z`), "hanafi");
  for (const day of [RAMADAN_DAY, ORDINARY_DAY]) {
    const start = dayStart(day);
    for (let minute = 0; minute < 24 * 60; minute += 15) {
      verify(districtId, new Date(start + minute * 60_000 + 7_000));
    }
    for (const clock of schedule.times.map((t) => t.time)) {
      const boundary = new Date(`${day}T${clock}:00${dhakaOffset(new Date(`${day}T12:00:00Z`))}`).getTime();
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

if (failures.length > 0) {
  console.error(failures.slice(0, 20).join("\n"));
  console.error(`\n✗ ${failures.length} of ${checks} card-context checks failed.`);
  process.exitCode = 1;
} else {
  console.log(`✓ Salah card context verified: ${checks} checks across ${DISTRICT_IDS.length} districts.`);
}
