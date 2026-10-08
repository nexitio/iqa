/**
 * Bangladesh-specific locale helpers: Bengali numerals, Hijri calendar and
 * astronomically-computed prayer times.
 *
 * Prayer times are calculated from the sun's position for each district, so the
 * numbers are real rather than decorative — the UI simply has no need for a
 * server yet.
 */

import type { District, PrayerName, PrayerSchedule, PrayerTime, Locale } from "./types";

/* -------------------------------------------------------------------------- */
/* Bengali numerals                                                           */
/* -------------------------------------------------------------------------- */

const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

/** Convert every ASCII digit in a string to Bengali numerals. */
export function toBnDigits(input: string | number): string {
  return String(input).replace(/\d/g, (d) => BN_DIGITS[Number(d)]);
}

/** Locale-aware number: Bengali digits with Bengali grouping (১,২৩,৪৫৬). */
export function formatNumber(value: number, locale: Locale = "bn"): string {
  const grouped = new Intl.NumberFormat("en-IN").format(value);
  return locale === "bn" ? toBnDigits(grouped) : grouped;
}

/** Ordinal surah/ayah labels: "২:২৫৫" in Bangla, "2:255" in English. */
export function formatRef(value: string, locale: Locale = "bn"): string {
  return locale === "bn" ? toBnDigits(value) : value;
}

/** "২য়", "১২তম" — Bengali ordinals for lists and day counters. */
export function bnOrdinal(n: number): string {
  const special: Record<number, string> = {
    1: "১ম",
    2: "২য়",
    3: "৩য়",
    4: "৪র্থ",
    5: "৫ম",
    6: "৬ষ্ঠ",
    7: "৭ম",
    8: "৮ম",
    9: "৯ম",
    10: "১০ম",
  };
  return special[n] ?? `${toBnDigits(n)}তম`;
}

/* -------------------------------------------------------------------------- */
/* Dates                                                                      */
/* -------------------------------------------------------------------------- */

const GREGORIAN_MONTHS_BN = [
  "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
  "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর",
];

const WEEKDAYS_BN = [
  "রবিবার", "সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার", "শুক্রবার", "শনিবার",
];
const WEEKDAYS_BN_SHORT = ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহঃ", "শুক্র", "শনি"];

const HIJRI_MONTHS: { bn: string; en: string }[] = [
  { bn: "মুহাররম", en: "Muharram" },
  { bn: "সফর", en: "Safar" },
  { bn: "রবিউল আউয়াল", en: "Rabi' al-Awwal" },
  { bn: "রবিউস সানি", en: "Rabi' al-Thani" },
  { bn: "জুমাদাল উলা", en: "Jumada al-Awwal" },
  { bn: "জুমাদাস সানিয়া", en: "Jumada al-Thani" },
  { bn: "রজব", en: "Rajab" },
  { bn: "শাবান", en: "Sha'ban" },
  { bn: "রমজান", en: "Ramadan" },
  { bn: "শাওয়াল", en: "Shawwal" },
  { bn: "জিলকদ", en: "Dhul-Qa'dah" },
  { bn: "জিলহজ", en: "Dhul-Hijjah" },
];

/** Bangladesh Standard Time. */
export const BD_TIMEZONE = "Asia/Dhaka";

/** "১২ জিলহজ ১৪৪৭" — Umm al-Qura civil Hijri date, Bangla month names. */
export function hijriDate(date: Date, locale: Locale = "bn"): string {
  const parts = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    timeZone: BD_TIMEZONE,
  }).formatToParts(date);

  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  const day = get("day");
  const month = get("month");
  const year = get("year");
  const monthName = HIJRI_MONTHS[(month - 1 + 12) % 12];

  if (locale === "en") return `${day} ${monthName.en} ${year} AH`;
  return `${toBnDigits(day)} ${monthName.bn} ${toBnDigits(year)} হিজরি`;
}

/** Bangla Hijri month name only — used by the Ramadan banner. */
export function hijriMonthName(date: Date, locale: Locale = "bn") {
  const parts = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
    month: "numeric",
    timeZone: BD_TIMEZONE,
  }).formatToParts(date);
  const month = Number(parts.find((p) => p.type === "month")?.value ?? 1);
  return HIJRI_MONTHS[(month - 1 + 12) % 12][locale];
}

/** True during Ramadan — drives seasonal theming and the fasting banner. */
export function isRamadan(date: Date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
    month: "numeric",
    timeZone: BD_TIMEZONE,
  }).formatToParts(date);
  return Number(parts.find((p) => p.type === "month")?.value ?? 0) === 9;
}

/** Gregorian parts in Dhaka time, avoiding host-timezone drift. */
export function bdDateParts(date: Date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: BD_TIMEZONE,
  }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const weekdayIndex = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
  return {
    day: Number(get("day")),
    month: Number(get("month")),
    year: Number(get("year")),
    weekdayIndex: weekdayIndex < 0 ? 0 : weekdayIndex,
    hour: Number(get("hour")) % 24,
    minute: Number(get("minute")),
  };
}

/** "শুক্রবার, ৬ অক্টোবর ২০২৬" */
export function gregorianDateBn(date: Date = new Date(), locale: Locale = "bn"): string {
  const p = bdDateParts(date);
  if (locale === "en") {
    return new Intl.DateTimeFormat("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: BD_TIMEZONE,
    }).format(date);
  }
  return `${WEEKDAYS_BN[p.weekdayIndex]}, ${toBnDigits(p.day)} ${GREGORIAN_MONTHS_BN[p.month - 1]} ${toBnDigits(p.year)}`;
}

export function weekdayBn(date: Date, short = false): string {
  const p = bdDateParts(date);
  return short ? WEEKDAYS_BN_SHORT[p.weekdayIndex] : WEEKDAYS_BN[p.weekdayIndex];
}

/** Jumu'ah is Friday — the platform leans into it weekly. */
export function isJumuah(date: Date = new Date()) {
  return bdDateParts(date).weekdayIndex === 5;
}

export { WEEKDAYS_BN, WEEKDAYS_BN_SHORT, HIJRI_MONTHS };

/* -------------------------------------------------------------------------- */
/* Prayer times — real solar calculation                                      */
/* -------------------------------------------------------------------------- */

const D2R = Math.PI / 180;
const R2D = 180 / Math.PI;
const dsin = (d: number) => Math.sin(d * D2R);
const dcos = (d: number) => Math.cos(d * D2R);
const dtan = (d: number) => Math.tan(d * D2R);
const darcsin = (x: number) => R2D * Math.asin(x);
const darccos = (x: number) => R2D * Math.acos(x);
const darctan2 = (y: number, x: number) => R2D * Math.atan2(y, x);
const darccot = (x: number) => R2D * Math.atan(1 / x);

const fixAngle = (a: number) => ((a % 360) + 360) % 360;
const fixHour = (h: number) => ((h % 24) + 24) % 24;

function julianDate(year: number, month: number, day: number) {
  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  return (
    Math.floor(365.25 * (y + 4716)) +
    Math.floor(30.6001 * (m + 1)) +
    day +
    b -
    1524.5
  );
}

/** Sun declination and equation of time for a Julian day. */
function sunPosition(jd: number) {
  const d = jd - 2451545.0;
  const g = fixAngle(357.529 + 0.98560028 * d);
  const q = fixAngle(280.459 + 0.98564736 * d);
  const l = fixAngle(q + 1.915 * dsin(g) + 0.02 * dsin(2 * g));
  const e = 23.439 - 0.00000036 * d;
  const ra = darctan2(dcos(e) * dsin(l), dcos(l)) / 15;
  return {
    declination: darcsin(dsin(e) * dsin(l)),
    equation: q / 15 - fixHour(ra),
  };
}

interface TuningAngles {
  fajr: number;
  isha: number;
  /** Minutes after maghrib used when isha is "interval" based. */
  maghribMinutes: number;
  /** True for Bangladesh's official Islamic Foundation timetable style. */
  ishaAsInterval: boolean;
}

/** Islamic Foundation Bangladesh / University of Islamic Sciences, Karachi. */
const BD_TUNING: TuningAngles = {
  fajr: 18,
  isha: 18,
  maghribMinutes: 90,
  ishaAsInterval: false,
};

function pad(n: number) {
  return String(Math.floor(n)).padStart(2, "0");
}

/**
 * Format decimal solar hours as "HH:MM" (24h) local clock time.
 *
 * No timezone offset is applied: the caller's julian day is already shifted by
 * the district's longitude (`- lng / (15 * 24)`), so these hours *are* local
 * wall-clock hours. Adding +6 here as well would push every prayer 6 hours late.
 */
function hoursToClock(hours: number) {
  const t = fixHour(hours);
  const h = Math.floor(t);
  const m = Math.round((t - h) * 60);
  // Guard the 59.6 -> 60 rounding rollover.
  if (m === 60) return `${pad(h + 1)}:00`;
  return `${pad(h)}:${pad(m)}`;
}

/**
 * Compute the five daily prayers plus sunrise for a district and date.
 * `madhab: "hanafi"` doubles the Asr shadow length, matching South Asian practice.
 */
export function computePrayerTimes(
  district: District,
  date: Date = new Date(),
  madhab: "hanafi" | "shafi" = "hanafi",
  tuning: TuningAngles = BD_TUNING,
): PrayerSchedule {
  const { day, month, year } = bdDateParts(date);
  const jd = julianDate(year, month, day) - district.lng / (15 * 24);
  const { declination: decl, equation: eqt } = sunPosition(jd);

  const midDay = () => fixHour(12 - eqt);
  const sunAngleTime = (angle: number, t: number, ccw = false) => {
    const numerator = -dsin(angle) - dsin(decl) * dsin(district.lat);
    const denominator = dcos(decl) * dcos(district.lat);
    const ratio = numerator / denominator;
    if (ratio > 1 || ratio < -1) return Number.NaN;
    const delta = darccos(ratio) / 15;
    return midDay() + (ccw ? -delta : delta);
  };
  const asrTime = (factor: number, t: number) =>
    sunAngleTime(-darccot(factor + dtan(Math.abs(district.lat - decl))), t);

  // Iterate twice so the base time converges on the correct solar noon.
  let fajr = 5;
  let sunrise = 6;
  let dhuhr = 12;
  let asr = 13;
  let maghrib = 18;
  let isha = 19;
  for (let i = 0; i < 3; i++) {
    fajr = sunAngleTime(tuning.fajr, fajr, true);
    sunrise = sunAngleTime(0.833, sunrise, true);
    dhuhr = midDay();
    asr = asrTime(madhab === "hanafi" ? 2 : 1, asr);
    maghrib = sunAngleTime(0.833, maghrib, false);
    isha = tuning.ishaAsInterval ? maghrib + tuning.maghribMinutes / 60 : sunAngleTime(tuning.isha, isha, false);
  }

  const raw: { name: PrayerName; hours: number }[] = [
    { name: "fajr", hours: fajr },
    { name: "sunrise", hours: sunrise },
    { name: "dhuhr", hours: dhuhr },
    { name: "asr", hours: asr },
    { name: "maghrib", hours: maghrib },
    { name: "isha", hours: isha },
  ];

  const labels: Record<PrayerName, { bn: string; en: string }> = {
    fajr: { bn: "ফজর", en: "Fajr" },
    sunrise: { bn: "সূর্যোদয়", en: "Sunrise" },
    dhuhr: { bn: "যোহর", en: "Dhuhr" },
    asr: { bn: "আসর", en: "Asr" },
    maghrib: { bn: "মাগরিব", en: "Maghrib" },
    isha: { bn: "ইশা", en: "Isha" },
  };

  const nowParts = bdDateParts(date);
  const nowMinutes = nowParts.hour * 60 + nowParts.minute;

  const times: PrayerTime[] = raw.map(({ name, hours }) => {
    // Every offset is wrapped into (-12h, +12h] so a row always answers "when is
    // this prayer next": Fajr read at 21:41 is 7 hours away, not 17 hours behind.
    // The wrap has to work in both directions for that to hold.
    let away = Math.round((fixHour(hours) - nowMinutes / 60) * 60);
    if (away > 12 * 60) away -= 24 * 60;
    else if (away < -12 * 60) away += 24 * 60;
    return {
      name,
      label: labels[name],
      time: hoursToClock(hours),
      passed: away < 0,
      isCurrent: false,
      minutesAway: away,
    };
  });

  // The prayer in progress began most recently, and the next one begins soonest:
  // "the negative offset closest to zero" and "the positive offset closest to
  // zero". Magnitude decides rather than array order, because a wrapped offset
  // can put the earliest row in the list at the end of the day — which is how
  // the last negative used to resolve to Isha all through the morning.
  const congregational = times.filter((t) => t.name !== "sunrise");
  const current = congregational.reduce<PrayerTime | null>(
    (best, time) =>
      time.minutesAway <= 0 && (!best || time.minutesAway > best.minutesAway) ? time : best,
    null,
  );
  if (current) current.isCurrent = true;

  const nextPrayer: PrayerTime =
    congregational.reduce<PrayerTime | null>(
      (best, time) =>
        time.minutesAway > 0 && (!best || time.minutesAway < best.minutesAway) ? time : best,
      null,
    ) ??
    // Unreachable while the wrap above holds — there is always a prayer within
    // the next twelve hours — but a schedule should never come back without one.
    { ...congregational[0], minutesAway: congregational[0].minutesAway + 24 * 60 };

  return { district, date, times, nextPrayer, madhab };
}

/** "৩ ঘন্টা ২০ মিনিট বাকি" countdown copy. */
export function countdownBn(minutes: number, locale: Locale = "bn"): string {
  const m = Math.max(0, minutes);
  const h = Math.floor(m / 60);
  const rest = m % 60;
  if (locale === "en") {
    if (h === 0) return `${rest} min left`;
    return `${h}h ${rest}m left`;
  }
  if (h === 0) return `${toBnDigits(rest)} মিনিট বাকি`;
  if (rest === 0) return `${toBnDigits(h)} ঘন্টা বাকি`;
  return `${toBnDigits(h)} ঘন্টা ${toBnDigits(rest)} মিনিট বাকি`;
}

/** Clock countdown "০২:১৪:০৯" for the next-prayer widget. */
export function countdownClock(minutes: number): string {
  const total = Math.max(0, Math.round(minutes * 60));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return toBnDigits(`${pad(h)}:${pad(m)}:${pad(s)}`);
}

/* -------------------------------------------------------------------------- */
/* Districts of Bangladesh                                                    */
/* -------------------------------------------------------------------------- */

export const DISTRICTS: District[] = [
  { id: "dhaka", name: { bn: "ঢাকা", en: "Dhaka" }, division: { bn: "ঢাকা", en: "Dhaka" }, lat: 23.8103, lng: 90.4125, timezone: BD_TIMEZONE },
  { id: "gazipur", name: { bn: "গাজীপুর", en: "Gazipur" }, division: { bn: "ঢাকা", en: "Dhaka" }, lat: 23.9999, lng: 90.4203, timezone: BD_TIMEZONE },
  { id: "narayanganj", name: { bn: "নারায়ণগঞ্জ", en: "Narayanganj" }, division: { bn: "ঢাকা", en: "Dhaka" }, lat: 23.6238, lng: 90.4999, timezone: BD_TIMEZONE },
  { id: "chattogram", name: { bn: "চট্টগ্রাম", en: "Chattogram" }, division: { bn: "চট্টগ্রাম", en: "Chattogram" }, lat: 22.3569, lng: 91.7832, timezone: BD_TIMEZONE },
  { id: "coxsbazar", name: { bn: "কক্সবাজার", en: "Cox's Bazar" }, division: { bn: "চট্টগ্রাম", en: "Chattogram" }, lat: 21.4272, lng: 92.0058, timezone: BD_TIMEZONE },
  { id: "cumilla", name: { bn: "কুমিল্লা", en: "Cumilla" }, division: { bn: "চট্টগ্রাম", en: "Chattogram" }, lat: 23.4607, lng: 91.1809, timezone: BD_TIMEZONE },
  { id: "sylhet", name: { bn: "সিলেট", en: "Sylhet" }, division: { bn: "সিলেট", en: "Sylhet" }, lat: 24.8949, lng: 91.8687, timezone: BD_TIMEZONE },
  { id: "rajshahi", name: { bn: "রাজশাহী", en: "Rajshahi" }, division: { bn: "রাজশাহী", en: "Rajshahi" }, lat: 24.3745, lng: 88.6042, timezone: BD_TIMEZONE },
  { id: "bogura", name: { bn: "বগুড়া", en: "Bogura" }, division: { bn: "রাজশাহী", en: "Rajshahi" }, lat: 24.8465, lng: 89.3773, timezone: BD_TIMEZONE },
  { id: "khulna", name: { bn: "খুলনা", en: "Khulna" }, division: { bn: "খুলনা", en: "Khulna" }, lat: 22.8456, lng: 89.5403, timezone: BD_TIMEZONE },
  { id: "jashore", name: { bn: "যশোর", en: "Jashore" }, division: { bn: "খুলনা", en: "Khulna" }, lat: 23.1664, lng: 89.2081, timezone: BD_TIMEZONE },
  { id: "barishal", name: { bn: "বরিশাল", en: "Barishal" }, division: { bn: "বরিশাল", en: "Barishal" }, lat: 22.701, lng: 90.3535, timezone: BD_TIMEZONE },
  { id: "rangpur", name: { bn: "রংপুর", en: "Rangpur" }, division: { bn: "রংপুর", en: "Rangpur" }, lat: 25.7439, lng: 89.2752, timezone: BD_TIMEZONE },
  { id: "dinajpur", name: { bn: "দিনাজপুর", en: "Dinajpur" }, division: { bn: "রংপুর", en: "Rangpur" }, lat: 25.6217, lng: 88.6354, timezone: BD_TIMEZONE },
  { id: "mymensingh", name: { bn: "ময়মনসিংহ", en: "Mymensingh" }, division: { bn: "ময়মনসিংহ", en: "Mymensingh" }, lat: 24.7471, lng: 90.4203, timezone: BD_TIMEZONE },
  { id: "noakhali", name: { bn: "নোয়াখালী", en: "Noakhali" }, division: { bn: "চট্টগ্রাম", en: "Chattogram" }, lat: 22.8696, lng: 91.0995, timezone: BD_TIMEZONE },
];

export function findDistrict(id: string): District {
  return DISTRICTS.find((d) => d.id === id) ?? DISTRICTS[0];
}

/**
 * The district list as `Select` options — the picker appears in five places
 * (register, settings, the prayer widget, an admin filter, the scholar form),
 * so the shape is built once instead of five times.
 *
 * Both scripts are search keywords: a reader whose interface is Bangla may
 * still type "Cox's Bazar", and typing a division should surface its districts.
 * The division is also the quiet second line, which is what makes sixteen rows
 * scannable at a glance.
 */
export function districtOptions(locale: Locale = "bn") {
  return DISTRICTS.map((district) => ({
    value: district.id,
    label: district.name[locale],
    keywords: `${district.name.bn} ${district.name.en} ${district.division.bn} ${district.division.en}`,
    description:
      locale === "bn" ? `${district.division.bn} বিভাগ` : `${district.division.en} Division`,
  }));
}

/** Direction to the Ka'bah in degrees from true north. */
export function qiblaDirection(district: District): number {
  const kaabaLat = 21.4225;
  const kaabaLng = 39.8262;
  const dLng = kaabaLng - district.lng;
  const y = dsin(dLng);
  const x = dcos(district.lat) * dtan(kaabaLat) - dsin(district.lat) * dcos(dLng);
  return fixAngle(darctan2(y, x));
}

/** Great-circle distance to Makkah in kilometres — shown on the Qibla card. */
export function distanceToMakkah(district: District): number {
  const R = 6371;
  const kaabaLat = 21.4225;
  const kaabaLng = 39.8262;
  const dLat = (kaabaLat - district.lat) * D2R;
  const dLng = (kaabaLng - district.lng) * D2R;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(district.lat * D2R) * Math.cos(kaabaLat * D2R) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(a)));
}
