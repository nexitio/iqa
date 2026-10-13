import type { Department, Topic } from "../lib/types";

/**
 * Canonical department taxonomy, ported from the web app. `Department.id` equals
 * its slug on purpose — the routing engine treats the department as the unit of
 * expertise, and slugs are what appear in URLs.
 */
export const DEPARTMENTS: Department[] = [
  {
    id: "aqeedah",
    slug: "aqeedah",
    name: { bn: "আকীদা ও বিশ্বাস", en: "Aqeedah & Belief" },
    shortName: { bn: "আকীদা", en: "Aqeedah" },
    description: {
      bn: "তাওহীদ, ঈমান, রিসালাত, আখিরাত ও অদৃশ্য জগৎ সংক্রান্ত বিশ্বাসের মূল ভিত্তি। সন্দেহ, কুফরি প্রশ্ন ও আকীদাগত বিভ্রান্তির জবাব এখানে আলোচিত হয়।",
      en: "The foundations of belief: tawhid, iman, prophethood, the hereafter and the unseen.",
    },
    icon: "Sparkles",
    tone: "primary",
    scholarIds: ["scholar-2"],
    trending: false,
    stats: { questions: 1840, answered: 1712, articles: 128, fatwas: 96, followers: 21400 },
  },
  {
    id: "fiqh",
    slug: "fiqh",
    name: { bn: "ফিকহ ও ইসলামি আইন", en: "Fiqh (Islamic Law)" },
    shortName: { bn: "ফিকহ", en: "Fiqh" },
    description: {
      bn: "ইবাদত, লেনদেন, পারিবারিক জীবন ও সামাজিক বিধান সংক্রান্ত হানাফী ফিকহভিত্তিক বিস্তারিত আলোচনা ও মাসআলা।",
      en: "Detailed Hanafi rulings on worship, transactions, family life and social conduct.",
    },
    icon: "Scale",
    tone: "scholar",
    scholarIds: ["scholar-1", "scholar-3"],
    trending: true,
    stats: { questions: 5240, answered: 4820, articles: 214, fatwas: 1620, followers: 48300 },
  },
  {
    id: "quran-tafsir",
    slug: "quran-tafsir",
    name: { bn: "কুরআন ও তাফসীর", en: "Quran & Tafsir" },
    shortName: { bn: "তাফসীর", en: "Tafsir" },
    description: {
      bn: "আয়াতের অর্থ, শানে নুযুল, তাফসীরের নির্ভরযোগ্য কিতাব ও কুরআন বুঝে পড়ার পদ্ধতি নিয়ে আলোচনা।",
      en: "Meaning of the ayat, contexts of revelation and how to read the Quran with understanding.",
    },
    icon: "BookOpen",
    tone: "success",
    scholarIds: ["scholar-4"],
    trending: false,
    stats: { questions: 2960, answered: 2584, articles: 246, fatwas: 84, followers: 32700 },
  },
  {
    id: "hadith",
    slug: "hadith",
    name: { bn: "হাদীস শাস্ত্র", en: "Hadith Sciences" },
    shortName: { bn: "হাদীস", en: "Hadith" },
    description: {
      bn: "হাদীসের সনদ যাচাই, সহীহ-যঈফ নির্ণয়, মুহাদ্দিসীনের পদ্ধতি ও প্রচলিত ভুল হাদীস সম্পর্কে সতর্কতা।",
      en: "Hadith authentication, distinction of sahih and da'if, and the muhaddithin's method.",
    },
    icon: "Library",
    tone: "info",
    scholarIds: ["scholar-2", "scholar-4"],
    trending: false,
    stats: { questions: 2120, answered: 1876, articles: 168, fatwas: 62, followers: 26900 },
  },
  {
    id: "seerah",
    slug: "seerah",
    name: { bn: "সীরাত ও ইসলামের ইতিহাস", en: "Seerah & History" },
    shortName: { bn: "সীরাত", en: "Seerah" },
    description: {
      bn: "রাসূলুল্লাহ ﷺ এর জীবনী, সাহাবায়ে কেরাম, তাবেয়ীন এবং উপমহাদেশের ইসলামি ইতিহাসের নিরপেক্ষ পাঠ।",
      en: "The life of the Prophet ﷺ, the Companions and South Asian Islamic history.",
    },
    icon: "ScrollText",
    tone: "accent",
    scholarIds: ["scholar-4"],
    trending: false,
    stats: { questions: 1480, answered: 1312, articles: 142, fatwas: 28, followers: 18200 },
  },
  {
    id: "family",
    slug: "family",
    name: { bn: "পরিবার ও বিবাহ", en: "Family & Marriage" },
    shortName: { bn: "পরিবার", en: "Family" },
    description: {
      bn: "বিবাহ, যৌতুক, দাম্পত্য অধিকার, সন্তান প্রতিপালন, তালাক ও পারিবারিক কলহের ইসলামি সমাধান।",
      en: "Marriage, dowry, marital rights, raising children and Islamic solutions to family conflict.",
    },
    icon: "Users",
    tone: "user",
    scholarIds: ["scholar-5", "scholar-1"],
    trending: true,
    stats: { questions: 4120, answered: 3764, articles: 186, fatwas: 1120, followers: 39800 },
  },
  {
    id: "finance",
    slug: "finance",
    name: { bn: "অর্থনীতি ও ব্যাংকিং", en: "Finance & Banking" },
    shortName: { bn: "অর্থনীতি", en: "Finance" },
    description: {
      bn: "সুদ, ইসলামি ব্যাংকিং, হালাল বিনিয়োগ, যাকাত ও আধুনিক আর্থিক লেনদেনের বিধান।",
      en: "Riba, Islamic banking, halal investment, zakat and modern transactions.",
    },
    icon: "Coins",
    tone: "warning",
    scholarIds: ["scholar-3"],
    trending: true,
    stats: { questions: 3180, answered: 2860, articles: 132, fatwas: 940, followers: 34100 },
  },
  {
    id: "akhlaq",
    slug: "akhlaq",
    name: { bn: "আখলাক ও আত্মশুদ্ধি", en: "Character & Purification" },
    shortName: { bn: "আখলাক", en: "Akhlaq" },
    description: {
      bn: "নৈতিকতা, ব্যক্তিত্ব গঠন, তাযকিয়া, পারিবারিক ও সামাজিক আদব এবং অন্তরের রোগের চিকিৎসা।",
      en: "Morals, character formation, tazkiyah and the diseases of the heart.",
    },
    icon: "HeartHandshake",
    tone: "success",
    scholarIds: ["scholar-2"],
    trending: false,
    stats: { questions: 2240, answered: 2020, articles: 192, fatwas: 44, followers: 24600 },
  },
  {
    id: "ibadah",
    slug: "ibadah",
    name: { bn: "ইবাদত", en: "Worship" },
    shortName: { bn: "ইবাদত", en: "Worship" },
    description: {
      bn: "নামাজ, রোযা, হজ্জ, যাকাত, পবিত্রতা ও দুআ — ইবাদতের বিধান ও আত্মিক গভীরতা।",
      en: "Salah, fasting, Hajj, zakat, purification and dua — the rulings and the spiritual depth.",
    },
    icon: "HandHeart",
    tone: "primary",
    scholarIds: ["scholar-1"],
    trending: false,
    stats: { questions: 3860, answered: 3520, articles: 208, fatwas: 680, followers: 36400 },
  },
  {
    id: "youth",
    slug: "youth",
    name: { bn: "তরুণ ও শিক্ষার্থী", en: "Youth & Students" },
    shortName: { bn: "তরুণ", en: "Youth" },
    description: {
      bn: "শিক্ষার্থী ও তরুণদের জীবনের প্রশ্ন — পড়াশোনা, ক্যারিয়ার, বিনোদন, বন্ধুত্ব ও পর্দার বিধান।",
      en: "Questions of student life — study, career, entertainment, friendship and modesty.",
    },
    icon: "GraduationCap",
    tone: "info",
    scholarIds: ["scholar-2"],
    trending: true,
    stats: { questions: 2940, answered: 2480, articles: 174, fatwas: 120, followers: 31200 },
  },
];

export function getDepartment(idOrSlug: string): Department | undefined {
  return DEPARTMENTS.find((d) => d.id === idOrSlug || d.slug === idOrSlug);
}

export function getDepartments(ids: string[]): Department[] {
  return ids.map(getDepartment).filter((d): d is Department => Boolean(d));
}

/* -------------------------------------------------------------------------- */
/* Topics                                                                     */
/* -------------------------------------------------------------------------- */

export const TOPICS: Topic[] = [
  {
    id: "interest-banking",
    slug: "interest-banking",
    name: { bn: "সুদ ও ব্যাংকিং", en: "Riba & Banking" },
    description: { bn: "সুদ, ডিপিএস, সঞ্চয়পত্র ও ইসলামি ব্যাংকিংয়ের বিধান।", en: "Riba, DPS, savings certificates and Islamic banking." },
    departmentSlugs: ["finance", "fiqh"],
    contentCount: 86,
    trending: true,
  },
  {
    id: "halal-earning",
    slug: "halal-earning",
    name: { bn: "হালাল উপার্জন", en: "Halal Earnings" },
    description: { bn: "অনলাইন আয়, ব্যবসা ও চাকরির হালাল-হারাম বিধান।", en: "Online income, business and employment rulings." },
    departmentSlugs: ["finance"],
    contentCount: 54,
    trending: true,
  },
  {
    id: "zakat",
    slug: "zakat",
    name: { bn: "যাকাত ও নিসাব", en: "Zakat & Nisab" },
    description: { bn: "স্বর্ণ, নগদ ও ব্যবসার সম্পদের যাকাত হিসাব।", en: "Calculating zakat on gold, cash and business assets." },
    departmentSlugs: ["finance", "ibadah"],
    contentCount: 72,
    trending: false,
  },
  {
    id: "dowry",
    slug: "dowry",
    name: { bn: "যৌতুক", en: "Dowry" },
    description: { bn: "যৌতুকের বিধান ও সামাজিক সমাধান।", en: "The ruling on dowry and its social remedies." },
    departmentSlugs: ["family"],
    contentCount: 38,
    trending: true,
  },
  {
    id: "parents-rights",
    slug: "parents-rights",
    name: { bn: "পিতা-মাতার হক", en: "Parents' Rights" },
    description: { bn: "মা-বাবার সেবা, আনুগত্য ও তাদের সাথে সদ্ব্যবহার।", en: "Serving and honouring one's parents." },
    departmentSlugs: ["family", "akhlaq"],
    contentCount: 44,
    trending: false,
  },
  {
    id: "quran-memorization",
    slug: "quran-memorization",
    name: { bn: "হিফজুল কুরআন", en: "Quran Memorisation" },
    description: { bn: "হিফজের রুটিন, সবক ও রিভিশনের পদ্ধতি।", en: "Routines, new lessons and revision for memorisation." },
    departmentSlugs: ["quran-tafsir", "youth"],
    contentCount: 61,
    trending: true,
  },
  {
    id: "salah",
    slug: "salah",
    name: { bn: "নামাজ ও কাজা", en: "Salah & Missed Prayers" },
    description: { bn: "পাঁচ ওয়াক্ত, কাজা ও তারাবীহর বিধান।", en: "The five prayers, making them up, and tarawih." },
    departmentSlugs: ["ibadah", "fiqh"],
    contentCount: 118,
    trending: false,
  },
  {
    id: "ramadan",
    slug: "ramadan",
    name: { bn: "রমজান ও রোযা", en: "Ramadan & Fasting" },
    description: { bn: "রোযার বিধান, ইফতার, তারাবীহ ও লাইলাতুল কদর।", en: "Fasting rulings, iftar, tarawih and Laylatul Qadr." },
    departmentSlugs: ["ibadah"],
    contentCount: 94,
    trending: true,
  },
  {
    id: "adab",
    slug: "adab",
    name: { bn: "আদব ও আখলাক", en: "Adab & Manners" },
    description: { bn: "মতপার্থক্যে আদব, কথা বলার নিয়ম ও সামাজিক আচরণ।", en: "Adab in disagreement, speech and social conduct." },
    departmentSlugs: ["akhlaq"],
    contentCount: 66,
    trending: false,
  },
  {
    id: "inheritance",
    slug: "inheritance",
    name: { bn: "ফারায়েজ ও উত্তরাধিকার", en: "Inheritance (Faraid)" },
    description: { bn: "সম্পদ বণ্টনের ইসলামি হিসাব।", en: "The Islamic rules for distributing an estate." },
    departmentSlugs: ["fiqh", "family"],
    contentCount: 29,
    trending: false,
  },
];

export const TRENDING_TOPICS: Topic[] = TOPICS.filter((t) => t.trending);

export function getTopic(slug: string): Topic | undefined {
  return TOPICS.find((t) => t.slug === slug || t.id === slug);
}
