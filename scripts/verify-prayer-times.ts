/**
 * Correctness check for the computed prayer schedule.
 *
 * `computePrayerTimes` answers three questions that a salah card, a countdown
 * and a progress bar all depend on: which prayer is current, which is next, and
 * how far away it is. All three are derived from minute offsets that are wrapped
 * into (-12h, +12h], which is exactly the kind of arithmetic that goes wrong
 * silently — a one-sided wrap once made Isha the current prayer from Fajr until
 * mid-morning, and an unwrapped Fajr read as "already passed" all evening.
 *
 * So this script answers the same questions the slow, obvious way: build an
 * absolute instant for every prayer in Dhaka time, subtract Dates, and compare.
 * It sweeps every 15 minutes of a Dhaka day in three districts, plus 20 seconds
 * either side of all six prayer times, so the midnight-crossing window is
 * covered from both directions.
 *
 * It also pins the madhab preference: choosing Hanafi or Shafi'i may move Asr —
 * and nothing else — because anything more would mean the preference leaked into
 * the rest of the schedule.
 *
 * Run: node --experimental-strip-types scripts/verify-prayer-times.ts
 */

import { BD_TIMEZONE, bdDateParts, computePrayerTimes, findDistrict } from "../src/lib/bn.ts";

const CONGREGATIONAL = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
const DISTRICT_IDS = ["dhaka", "coxsbazar", "rangpur"];
const TWELVE_HOURS = 12 * 3600;

/** Asia/Dhaka's fixed offset, read from Intl rather than assumed. */
function dhakaOffset(at: Date): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: BD_TIMEZONE,
    timeZoneName: "longOffset",
  }).formatToParts(at);
  return (parts.find((p) => p.type === "timeZoneName")?.value ?? "").replace("GMT", "");
}

/** Absolute instant of "HH:MM" on a Dhaka calendar day `dayOffset` away from `at`. */
function clockOf(schedule: ReturnType<typeof computePrayerTimes>, name: string): string {
  const time = schedule.times.find((candidate) => candidate.name === name);
  if (!time) throw new Error(`schedule has no ${name}`);
  return time.time;
}

function instant(dayOffset: number, clock: string, at: Date): Date {
  const p = bdDateParts(at);
  const base = new Date(Date.UTC(p.year, p.month - 1, p.day + dayOffset));
  const y = base.getUTCFullYear();
  const m = String(base.getUTCMonth() + 1).padStart(2, "0");
  const d = String(base.getUTCDate()).padStart(2, "0");
  return new Date(`${y}-${m}-${d}T${clock}:00${dhakaOffset(at)}`);
}

/** Most recent occurrence of "HH:MM" (Dhaka) at or before `at`. */
function latestPast(clock: string, at: Date): Date {
  const past = [-1, 0]
    .map((offset) => instant(offset, clock, at))
    .filter((candidate) => candidate.getTime() <= at.getTime());
  return past[past.length - 1] ?? instant(-1, clock, at);
}

/**
 * The same three questions, answered without any modulo arithmetic: the latest
 * prayer instants behind us, the earliest ahead of us, and the gaps between.
 */
function oracle(districtId: string, at: Date) {
  const schedule = computePrayerTimes(findDistrict(districtId), at, "hanafi");
  const times = schedule.times.filter((time) => time.name !== "sunrise");

  const candidates = times
    .flatMap((time) =>
      [-1, 0, 1].map((offset) => ({ name: time.name, clock: time.time, instant: instant(offset, time.time, at) })),
    )
    .sort((a, b) => a.instant.getTime() - b.instant.getTime());

  const past = candidates.filter((c) => c.instant.getTime() <= at.getTime());
  const future = candidates.filter((c) => c.instant.getTime() > at.getTime());
  const current = past[past.length - 1];
  const next = future[0];

  const elapsed = (at.getTime() - current.instant.getTime()) / 1000;
  const remaining = (next.instant.getTime() - at.getTime()) / 1000;
  const total = (next.instant.getTime() - current.instant.getTime()) / 1000;

  return { schedule, current, next, elapsed, remaining, total, percent: (elapsed / total) * 100 };
}

/* --------------------------------- the sweep ------------------------------ */

let checks = 0;
const failures: string[] = [];

function verify(districtId: string, at: Date) {
  const o = oracle(districtId, at);
  const label = `${districtId} @ ${at.toISOString()}`;
  const widgetCurrent = o.schedule.times.find((time) => time.isCurrent);

  if (widgetCurrent?.name !== o.current.name) {
    failures.push(`${label}: current ${widgetCurrent?.name} != oracle ${o.current.name}`);
  }
  if (o.schedule.nextPrayer.name !== o.next.name) {
    failures.push(`${label}: next ${o.schedule.nextPrayer.name} != oracle ${o.next.name}`);
  }

  // Out of order is only legitimate for the one window that crosses midnight.
  const wraps = o.current.name === "isha" && o.next.name === "fajr";
  if (!wraps && CONGREGATIONAL.indexOf(o.current.name) > CONGREGATIONAL.indexOf(o.next.name)) {
    failures.push(`${label}: window runs backwards (${o.current.name} -> ${o.next.name})`);
  }

  // `passed` means "the clock on this row is behind us": true exactly when that
  // row's most recent occurrence is within the last twelve hours. The schedule
  // is minute-resolution, so a prayer reads as under way for its first minute.
  for (const time of o.schedule.times) {
    const delta = (at.getTime() - latestPast(time.time, at).getTime()) / 1000;
    const shouldBePassed = delta >= 60 && delta <= TWELVE_HOURS;
    if (time.passed !== shouldBePassed) {
      failures.push(`${label}: ${time.name} passed=${time.passed}, expected ${shouldBePassed}`);
    }
  }

  // Sunrise is never a prayer, so it must never be the one we count down to.
  if (o.schedule.nextPrayer.name === "sunrise") {
    failures.push(`${label}: next prayer is sunrise`);
  }
  if (o.total <= 0) failures.push(`${label}: non-positive window length ${o.total}`);
  if (Math.abs(o.elapsed + o.remaining - o.total) > 1) {
    failures.push(`${label}: elapsed + remaining != window length`);
  }
  if (!(o.percent >= 0 && o.percent < 100)) {
    failures.push(`${label}: window progress out of range ${o.percent}`);
  }

  checks += 1;
}

/* ------------------------------ the madhab -------------------------------- */

function minutesOf(clock: string) {
  const [hours, minutes] = clock.split(":").map(Number);
  return hours * 60 + minutes;
}

function verifyMadhab(districtId: string, at: Date) {
  const district = findDistrict(districtId);
  const hanafi = computePrayerTimes(district, at, "hanafi");
  const shafi = computePrayerTimes(district, at, "shafi");
  const label = `${districtId} madhab @ ${at.toISOString()}`;
  const clock = (schedule: typeof hanafi, name: string) =>
    schedule.times.find((time) => time.name === name)?.time ?? "";

  const gap = minutesOf(clock(hanafi, "asr")) - minutesOf(clock(shafi, "asr"));
  if (gap <= 0) {
    failures.push(`${label}: Shafi'i Asr ${clock(shafi, "asr")} is not before Hanafi ${clock(hanafi, "asr")}`);
  }
  if (gap < 30 || gap > 180) {
    failures.push(`${label}: an Asr gap of ${gap} minutes is implausible`);
  }
  for (const name of ["fajr", "sunrise", "dhuhr", "maghrib", "isha"]) {
    if (clock(hanafi, name) !== clock(shafi, name)) {
      failures.push(`${label}: ${name} moved with the madhab (${clock(hanafi, name)} -> ${clock(shafi, name)})`);
    }
  }
  checks += 1;
}

const reference = new Date();
if (dhakaOffset(reference) !== "+06:00") {
  failures.push(`Dhaka offset is ${dhakaOffset(reference)}, expected +06:00 — the oracle assumes no DST`);
}

for (const districtId of DISTRICT_IDS) {
  for (const day of [reference, new Date("2027-02-15T06:00:00Z"), new Date("2027-06-21T06:00:00Z"), new Date("2026-12-21T06:00:00Z")]) {
    verifyMadhab(districtId, day);
  }
}

const dayStart = instant(0, "00:00", reference).getTime();
for (const districtId of DISTRICT_IDS) {
  for (let minute = 0; minute < 24 * 60; minute += 15) {
    verify(districtId, new Date(dayStart + minute * 60_000 + 7_000));
  }
  const schedule = computePrayerTimes(findDistrict(districtId), reference, "hanafi");
  for (const time of schedule.times) {
    const boundary = instant(0, time.time, reference).getTime();
    verify(districtId, new Date(boundary - 20_000));
    verify(districtId, new Date(boundary));
    verify(districtId, new Date(boundary + 20_000));
  }
}

if (failures.length > 0) {
  console.error(failures.slice(0, 20).join("\n"));
  console.error(`\n✗ ${failures.length} of ${checks} schedule checks failed.`);
  process.exitCode = 1;
} else {
  const today = computePrayerTimes(findDistrict("dhaka"), reference, "hanafi");
  const shafiToday = computePrayerTimes(findDistrict("dhaka"), reference, "shafi");
  const asrGap = minutesOf(clockOf(today, "asr")) - minutesOf(clockOf(shafiToday, "asr"));
  console.log(
    `✓ Prayer schedule verified: ${checks} checks across ${DISTRICT_IDS.length} districts` +
      ` (Dhaka Asr today: Hanafi ${clockOf(today, "asr")}, Shafi'i ${clockOf(shafiToday, "asr")}, gap ${asrGap} min).`,
  );
}
