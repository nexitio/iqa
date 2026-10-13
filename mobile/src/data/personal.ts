import type {
  AppNotification,
  Bookmark,
  Journey,
  JourneyDay,
  ReadingProgress,
  User,
} from "../lib/types";

/**
 * The personal layer: who is signed in, what they saved, what they are reading,
 * the journeys they are enrolled in and their notifications.
 *
 * `followingScholarIds` and `followingDepartmentSlugs` are the exact IDs present
 * in the mobile dataset, so the home stories rail resolves to real records.
 */
export const CURRENT_USER: User = {
  id: "user-me",
  name: "আব্দুল্লাহ আল-মামুন",
  email: "abdullah.almamun@gmail.com",
  role: "user",
  avatarColor: "#0d6b4f",
  district: "dhaka",
  joinedAt: "2025-11-14T10:20:00+06:00",
  interests: ["fiqh", "family", "finance", "quran-tafsir", "akhlaq", "youth", "ibadah", "seerah"],
  followingScholarIds: ["scholar-1", "scholar-2", "scholar-3", "scholar-5"],
  followingDepartmentSlugs: ["fiqh", "family", "finance", "akhlaq"],
  isVerified: true,
};

export const USER_STREAK_DAYS = 12;

export function getUser(id: string): User | undefined {
  if (id === CURRENT_USER.id) return CURRENT_USER;
  return undefined;
}

/* -------------------------------------------------------------------------- */
/* Library                                                                    */
/* -------------------------------------------------------------------------- */

export const BOOKMARKS: Bookmark[] = [
  {
    id: "bm-1",
    kind: "ayah",
    titleBn: "আয়াতুল কুরসি",
    previewBn: "আল্লাহ, তিনি ছাড়া কোনো উপাস্য নেই। তিনি চিরঞ্জীব, সর্বসত্তার ধারক।",
    refBn: "সূরা আল-বাকারা, আয়াত ২৫৫",
    href: "/quran/2?ayah=255",
    savedAt: "2026-09-12T08:15:00+06:00",
    collectionId: "col-favourite-ayah",
  },
  {
    id: "bm-2",
    kind: "ayah",
    titleBn: "কষ্টের পরই স্বস্তি",
    previewBn: "নিশ্চয়ই কষ্টের সাথে স্বস্তি রয়েছে।",
    refBn: "সূরা আশ-শারহ, আয়াত ৫",
    href: "/quran/94?ayah=5",
    savedAt: "2026-09-20T22:40:00+06:00",
    collectionId: "col-favourite-ayah",
  },
  {
    id: "bm-3",
    kind: "ayah",
    titleBn: "যিকিরে অন্তরের প্রশান্তি",
    previewBn: "জেনে রাখুন, আল্লাহর স্মরণেই অন্তর প্রশান্তি লাভ করে।",
    refBn: "সূরা আর-রা'দ, আয়াত ২৮",
    href: "/quran/13?ayah=28",
    savedAt: "2026-08-30T06:05:00+06:00",
    collectionId: "col-favourite-ayah",
  },
  {
    id: "bm-4",
    kind: "hadith",
    titleBn: "নিয়তের উপর আমলের মূল্য",
    previewBn: "নিশ্চয়ই সকল আমল নিয়তের উপর নির্ভরশীল।",
    refBn: "সহীহ বুখারী, হাদীস ১",
    href: "/hadith/bukhari/hadith-1",
    savedAt: "2026-09-01T10:30:00+06:00",
    collectionId: "col-youth",
  },
  {
    id: "bm-5",
    kind: "hadith",
    titleBn: "জ্ঞানের পথে চললে জান্নাতের পথ সহজ হয়",
    previewBn: "যে ব্যক্তি জ্ঞান অন্বেষণে বের হয়, আল্লাহ তার জন্য জান্নাতের পথ সহজ করে দেন।",
    refBn: "সুনানে তিরমিযী, হাদীস ২৬৫৮",
    href: "/hadith/tirmizi/hadith-24",
    savedAt: "2026-09-05T19:20:00+06:00",
    collectionId: "col-youth",
  },
  {
    id: "bm-6",
    kind: "article",
    titleBn: "সুদমুক্ত জীবন: ব্যাংক, মোবাইল ব্যাংকিং ও হালাল উপার্জনের পথ",
    previewBn: "সুদ একটি কাঠামোগত ফাঁদ। এখানে আলোচনা করা হয়েছে কীভাবে ধাপে ধাপে হালাল উপার্জনে ফেরা যায়।",
    refBn: "প্রবন্ধ · অর্থনীতি ও ব্যাংকিং",
    href: "/articles/sud-mukt-jibon-halal-uparjon",
    savedAt: "2026-09-25T14:10:00+06:00",
    collectionId: "col-finance",
  },
  {
    id: "bm-7",
    kind: "fatwa",
    titleBn: "মোবাইল ব্যাংকিং ও সঞ্চয় স্কিমের মুনাফা কি হালাল?",
    previewBn: "মুনাফার হার পূর্বনির্ধারিত থাকলে সেটি সুদের শামিল হয় — বিস্তারিত রায় দলিলসহ।",
    refBn: "ফতোয়া · অর্থনীতি ও ব্যাংকিং",
    href: "/fatwas/mobail-banking-sud-o-kashbyak",
    savedAt: "2026-09-29T17:35:00+06:00",
    collectionId: "col-finance",
  },
  {
    id: "bm-8",
    kind: "dua",
    titleBn: "যানবাহনে ওঠার দুআ",
    previewBn: "পবিত্র সেই সত্তা, যিনি এটি আমাদের অধীন করেছেন, অথচ আমরা এটিকে বশ করতে সক্ষম ছিলাম না।",
    refBn: "সূরা আয-যুখরুফ ৪৩:১৩ · সহীহ মুসলিম ১৩৪২",
    href: "/duas/boarding-a-vehicle",
    savedAt: "2026-10-01T07:25:00+06:00",
    collectionId: "col-daily-dua",
  },
];

export const BOOKMARK_COLLECTIONS = [
  { id: "col-favourite-ayah", nameBn: "প্রিয় আয়াত", tone: "primary", count: 3 },
  { id: "col-youth", nameBn: "তরুণদের জন্য", tone: "info", count: 2 },
  { id: "col-finance", nameBn: "অর্থ ও ব্যবসা", tone: "warning", count: 2 },
  { id: "col-daily-dua", nameBn: "দৈনন্দিন দুআ", tone: "accent", count: 1 },
];

/* -------------------------------------------------------------------------- */
/* Reading progress                                                           */
/* -------------------------------------------------------------------------- */

export const READING_PROGRESS: ReadingProgress[] = [
  {
    id: "prog-1",
    kind: "quran",
    titleBn: "সূরা আল-বাকারা",
    subtitleBn: "২৮৬ আয়াত · মাদানী",
    href: "/quran/2?ayah=254",
    progress: 62,
    lastReadAt: "2026-10-05T22:30:00+06:00",
    resumeLabelBn: "আয়াত ২৫৪ থেকে চালিয়ে যান",
  },
  {
    id: "prog-2",
    kind: "journey",
    titleBn: "৩০ দিনে কুরআন বোঝা",
    subtitleBn: "১২ / ৩০ দিন সম্পন্ন",
    href: "/journey/thirty-dine-quran-bojha",
    progress: 40,
    lastReadAt: "2026-10-06T06:10:00+06:00",
    resumeLabelBn: "আজকের ১৩তম দিন শুরু করুন",
  },
  {
    id: "prog-3",
    kind: "article",
    titleBn: "সুদমুক্ত জীবন: ব্যাংক, মোবাইল ব্যাংকিং ও হালাল উপার্জনের পথ",
    subtitleBn: "৯ মিনিটের পড়া · অর্থনীতি ও ব্যাংকিং",
    href: "/articles/sud-mukt-jibon-halal-uparjon",
    progress: 35,
    lastReadAt: "2026-10-04T20:15:00+06:00",
    resumeLabelBn: "«হালাল উপার্জনের পথ» অংশ থেকে",
  },
  {
    id: "prog-4",
    kind: "hadith",
    titleBn: "সহীহ বুখারী — ঈমান অধ্যায়",
    subtitleBn: "হাদীস ৮ / ৫১",
    href: "/hadith/bukhari/hadith-2",
    progress: 16,
    lastReadAt: "2026-10-03T19:05:00+06:00",
    resumeLabelBn: "হাদীস ৮ থেকে চালিয়ে যান",
  },
];

/* -------------------------------------------------------------------------- */
/* Learning journeys                                                          */
/* -------------------------------------------------------------------------- */

function buildDays(titles: { title: string; subtitle: string; kind: JourneyDay["kind"]; minutes: number }[], completed: number, base: string): JourneyDay[] {
  return titles.map((day, index) => ({
    day: index + 1,
    titleBn: day.title,
    subtitleBn: day.subtitle,
    kind: day.kind,
    minutes: day.minutes,
    completed: index < completed,
    href: `${base}?day=${index + 1}`,
  }));
}

const SALAH_DAYS = [
  { title: "নামাজ কী এবং কেন", subtitle: "নামাজের মর্যাদা ও ফজিলত", kind: "reflection" as const, minutes: 10 },
  { title: "ওযুর ধাপগুলো", subtitle: "অযুর ফরজ ও সুন্নত", kind: "article" as const, minutes: 10 },
  { title: "ফরজ নামাজের রাকাত সংখ্যা", subtitle: "পাঁচ ওয়াক্তের হিসাব", kind: "quiz" as const, minutes: 10 },
  { title: "সিজদার দুআ ও তাসবিহ", subtitle: "নামাজের ভেতরের যিকির", kind: "hadith" as const, minutes: 10 },
  { title: "নামাজ ভঙ্গের কারণ", subtitle: "সাধারণ ভুল ও সতর্কতা", kind: "reflection" as const, minutes: 10 },
  { title: "জামাতে নামাজের ফজিলত", subtitle: "২৭ গুণ সওয়াব", kind: "hadith" as const, minutes: 10 },
  { title: "খুশু কীভাবে অর্জন করবেন", subtitle: "মনোযোগী নামাজের পথ", kind: "reflection" as const, minutes: 12 },
];

const QURAN_DAYS = [
  { title: "কুরআন বোঝার প্রয়োজন", subtitle: "শুধু পড়া নয়, বোঝা", kind: "reflection" as const, minutes: 20 },
  { title: "সূরা আল-ফাতিহার ব্যাখ্যা", subtitle: "প্রতিদিনের দুআ", kind: "quran" as const, minutes: 20 },
  { title: "আয়াতুল কুরসি", subtitle: "কুরআনের সর্বশ্রেষ্ঠ আয়াত", kind: "quran" as const, minutes: 20 },
  { title: "তাফসীর কীভাবে পড়বেন", subtitle: "নির্ভরযোগ্য কিতাবের পরিচয়", kind: "article" as const, minutes: 20 },
  { title: "কুরআন ও প্রাত্যহিক জীবন", subtitle: "আয়াত থেকে আমল", kind: "reflection" as const, minutes: 20 },
];

export const JOURNEYS: Journey[] = [
  {
    id: "journey-1",
    slug: "sat-dine-namajer-prostuti",
    titleBn: "৭ দিনে নামাজের প্রস্তুতি",
    descriptionBn:
      "নামাজ প্রতিদিনের ইবাদত, অথচ অনেকেই এর ফরজ-সুন্নত ও আত্মিক দিকটি জানি না। এই ৭ দিনে আপনি ওযু থেকে সিজদার দুআ পর্যন্ত প্রতিটি ধাপ আরামে শিখবেন — প্রতিদিন মাত্র ১০ মিনিট দিয়ে।",
    durationLabelBn: "৭ দিন · প্রতিদিন ১০ মিনিট",
    enrolled: 24580,
    completedDays: 5,
    totalDays: 7,
    days: buildDays(SALAH_DAYS, 5, "/journey/sat-dine-namajer-prostuti"),
    tone: "primary",
    categoryBn: "ইবাদত",
  },
  {
    id: "journey-2",
    slug: "thirty-dine-quran-bojha",
    titleBn: "৩০ দিনে কুরআন বোঝা",
    descriptionBn:
      "শুধু পড়া নয়, বোঝা — এই যাত্রার লক্ষ্য। প্রতিদিন একটি আয়াত, একটি সূরার প্রেক্ষাপট কিংবা একটি তাফসীরের অংশ শিখবেন। এক মাস শেষে কুরআনের মূল বার্তা আপনার কাছে পরিষ্কার হয়ে উঠবে ইনশাআল্লাহ।",
    durationLabelBn: "৩০ দিন · প্রতিদিন ২০ মিনিট",
    enrolled: 41200,
    completedDays: 12,
    totalDays: 30,
    days: buildDays(QURAN_DAYS, 5, "/journey/thirty-dine-quran-bojha"),
    tone: "accent",
    categoryBn: "কুরআন",
  },
  {
    id: "journey-3",
    slug: "ramjaner-prostuti",
    titleBn: "১৪ দিনে রমজানের প্রস্তুতি",
    descriptionBn:
      "রমজান শুরু হওয়ার দুই সপ্তাহ আগে থেকেই প্রস্তুতি নিলে মাসটি অনেক বেশি কাজে আসে। রোযার বিধান, যাকাতুল ফিতর, ইতিকাফ ও লাইলাতুল কদর — সবকিছুর ব্যবহারিক নির্দেশনা একসাথে।",
    durationLabelBn: "১৪ দিন · প্রতিদিন ১০ মিনিট",
    enrolled: 33870,
    completedDays: 0,
    totalDays: 14,
    days: buildDays(SALAH_DAYS.slice(0, 5), 0, "/journey/ramjaner-prostuti"),
    tone: "success",
    categoryBn: "ইবাদত",
  },
  {
    id: "journey-4",
    slug: "notun-muslimer-prothom-dhap",
    titleBn: "নতুন মুসলিমের প্রথম ধাপ",
    descriptionBn:
      "ইসলাম গ্রহণ করেছেন কিন্তু কোথা থেকে শুরু করবেন বুঝতে পারছেন না? এই পাঁচ দিনের যাত্রা একেবারে ভিত্তি থেকে শুরু — তাওহীদ, নামাজ, পবিত্রতা ও কুরআনের পরিচয়, কোনো তাড়াহুড়ো ছাড়াই।",
    durationLabelBn: "৫ দিন · প্রতিদিন ১২ মিনিট",
    enrolled: 12480,
    completedDays: 5,
    totalDays: 5,
    days: buildDays(QURAN_DAYS.slice(0, 5), 5, "/journey/notun-muslimer-prothom-dhap"),
    tone: "info",
    categoryBn: "আকীদা",
  },
];

/* -------------------------------------------------------------------------- */
/* Notifications                                                              */
/* -------------------------------------------------------------------------- */

export const NOTIFICATIONS: AppNotification[] = [
  {
    id: "notif-1",
    kind: "answer",
    titleBn: "আপনার প্রশ্নের উত্তর এসেছে",
    bodyBn: "মুফতি আব্দুর রহমান আপনার প্রশ্ন 'ছেলের পরিবার বিয়েতে চার লাখ টাকা যৌতুক চাইছে' — এর উত্তর দিয়েছেন।",
    createdAt: "2026-10-06T08:20:00+06:00",
    read: false,
    href: "/questions/joutuk-char-lakh-taka-dabi",
    actorId: "scholar-1",
  },
  {
    id: "notif-2",
    kind: "daily",
    titleBn: "আজকের আয়াত প্রস্তুত",
    bodyBn: "সূরা আল-বাকারা, আয়াত ২৫৫ — আজকের পাঠ শুরু করুন।",
    createdAt: "2026-10-06T05:00:00+06:00",
    read: false,
    href: "/daily",
  },
  {
    id: "notif-3",
    kind: "journey",
    titleBn: "আপনার যাত্রার ১৩তম দিন",
    bodyBn: "৩০ দিনে কুরআন বোঝা — আজকের দিনটি এখনো সম্পন্ন হয়নি।",
    createdAt: "2026-10-06T06:00:00+06:00",
    read: false,
    href: "/journey/thirty-dine-quran-bojha",
  },
  {
    id: "notif-4",
    kind: "follow",
    titleBn: "নতুন আলেম ফলো করছেন",
    bodyBn: "আপনি ড. ফরিদা ইয়াসমিনকে ফলো করছেন। তাঁর নতুন লেখা আপনার ফিডে দেখা যাবে।",
    createdAt: "2026-10-05T19:40:00+06:00",
    read: false,
    href: "/scholars/dr-faridah-yasmin",
    actorId: "scholar-5",
  },
  {
    id: "notif-5",
    kind: "reshare",
    titleBn: "আপনার সংরক্ষিত প্রবন্ধ অনেকে পড়ছেন",
    bodyBn: "'সুদমুক্ত জীবন' প্রবন্ধটি এই সপ্তাহে ১,২০০ বারের বেশি পড়া হয়েছে।",
    createdAt: "2026-10-05T12:15:00+06:00",
    read: true,
    href: "/articles/sud-mukt-jibon-halal-uparjon",
  },
  {
    id: "notif-6",
    kind: "moderation",
    titleBn: "একটি রিপোর্ট পর্যালোচনায় রয়েছে",
    bodyBn: "আপনি যে উত্তরটি রিপোর্ট করেছিলেন সেটি মডারেটরের পর্যালোচনায় আছে এবং বিষয়টি সক্রিয় রাখা হয়েছে।",
    createdAt: "2026-10-03T17:25:00+06:00",
    read: true,
    href: "/discussions/joutuk-chara-bibaho-bangladesh-somaj",
  },
  {
    id: "notif-7",
    kind: "system",
    titleBn: "নামাজের সময় এখন আপনার জেলা অনুযায়ী",
    bodyBn: "সেটিংসে আপনার জেলা চট্টগ্রাম থেকে ঢাকা করা হয়েছে। সময়সূচি হালনাগাদ হয়েছে।",
    createdAt: "2026-10-02T09:50:00+06:00",
    read: true,
    href: "/settings",
  },
];
