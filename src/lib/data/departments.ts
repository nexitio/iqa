import type { Department, Topic } from "@/lib/types";

/**
 * Canonical department taxonomy.
 *
 * `Department.id` equals its slug on purpose: the routing engine treats the
 * department as the unit of expertise, and slugs are what appear in URLs
 * (`/departments/fiqh`), so keeping them identical removes a mapping layer.
 *
 * `scholarIds` here is the exact inverse of `Scholar.departmentIds` in
 * `./scholars.ts`. Both directions are asserted by the routing layer, so if you
 * change one, change the other.
 */

export const DEPARTMENTS: Department[] = [
  {
    id: "aqeedah",
    slug: "aqeedah",
    name: { bn: "আকীদা ও বিশ্বাস", en: "Aqeedah & Belief" },
    shortName: { bn: "আকীদা", en: "Aqeedah" },
    description: {
      bn: "তাওহীদ, ঈমান, রিসালাত, আখিরাত ও অদৃশ্য জগৎ সংক্রান্ত বিশ্বাসের মূল ভিত্তি। সন্দেহ, কুফরি প্রশ্ন ও আকীদাগত বিভ্রান্তির জবাব এখানে আলোচিত হয়।",
      en: "The foundations of belief: tawhid, iman, prophethood, the hereafter and the unseen. Doubts, creedal questions and confusions are addressed here.",
    },
    icon: "Sparkles",
    tone: "primary",
    scholarIds: ["scholar-2", "scholar-8", "scholar-11"],
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
    scholarIds: ["scholar-1", "scholar-3", "scholar-6", "scholar-9"],
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
      en: "Meaning of the ayat, contexts of revelation, trusted tafsir works and how to read the Quran with understanding.",
    },
    icon: "BookOpen",
    tone: "success",
    scholarIds: ["scholar-4", "scholar-8"],
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
      en: "Hadith authentication, distinction of sahih and da'if, the muhaddithin's method, and warnings about widely-circulated weak narrations.",
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
      en: "The life of the Prophet ﷺ, the Companions, the Successors and a balanced reading of South Asian Islamic history.",
    },
    icon: "ScrollText",
    tone: "accent",
    scholarIds: ["scholar-4", "scholar-11"],
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
      en: "Marriage, dowry, marital rights, raising children, divorce and Islamic solutions to family conflict.",
    },
    icon: "Users",
    tone: "user",
    scholarIds: ["scholar-5", "scholar-10"],
    trending: true,
    stats: { questions: 4120, answered: 3764, articles: 186, fatwas: 1120, followers: 39800 },
  },
  {
    id: "finance",
    slug: "finance",
    name: { bn: "অর্থনীতি ও ব্যাংকিং", en: "Finance & Banking" },
    shortName: { bn: "অর্থনীতি", en: "Finance" },
    description: {
      bn: "সুদ, ইসলামি ব্যাংকিং, হালাল বিনিয়োগ, শেয়ারবাজার, বিমা, যাকাত হিসাব ও ঋণ সংক্রান্ত হালাল-হারাম নির্ণয়।",
      en: "Riba, Islamic banking, halal investment, the stock market, insurance, zakat accounting and the halal status of loans.",
    },
    icon: "Wallet",
    tone: "warning",
    scholarIds: ["scholar-1", "scholar-3", "scholar-12"],
    trending: true,
    stats: { questions: 3180, answered: 2812, articles: 154, fatwas: 940, followers: 33400 },
  },
  {
    id: "youth",
    slug: "youth",
    name: { bn: "তরুণ ও শিক্ষার্থী", en: "Youth & Students" },
    shortName: { bn: "তরুণ", en: "Youth" },
    description: {
      bn: "শিক্ষার্থীদের পড়াশোনা, ক্যারিয়ার, বন্ধুত্ব, আসক্তি, প্রেম ও বয়ঃসন্ধিকালীন প্রশ্নের সরল ও বাস্তবভিত্তিক উত্তর।",
      en: "Straight answers for students on study, career, friendship, addiction, relationships and adolescence.",
    },
    icon: "GraduationCap",
    tone: "info",
    scholarIds: ["scholar-7"],
    trending: true,
    stats: { questions: 2460, answered: 2118, articles: 132, fatwas: 42, followers: 24100 },
  },
  {
    id: "women",
    slug: "women",
    name: { bn: "নারী বিষয়ক", en: "Women's Matters" },
    shortName: { bn: "নারী", en: "Women" },
    description: {
      bn: "পর্দা, হায়েজ-নেফাস, নারীর কর্মক্ষেত্র, শিক্ষা ও অধিকার সংক্রান্ত ফিকহি আলোচনা — মহিলা আলেমাদের প্রাধান্য সহ।",
      en: "Purdah, menstruation rulings, women in the workplace, education and rights — with priority given to female scholars.",
    },
    icon: "HeartHandshake",
    tone: "admin",
    scholarIds: ["scholar-5", "scholar-10"],
    trending: false,
    stats: { questions: 2740, answered: 2486, articles: 138, fatwas: 680, followers: 28800 },
  },
  {
    id: "ibadah",
    slug: "ibadah",
    name: { bn: "ইবাদত", en: "Worship" },
    shortName: { bn: "ইবাদত", en: "Worship" },
    description: {
      bn: "নামাজ, রোযা, হজ, যাকাত, কুরবানি ও দুআ-যিকির সংক্রান্ত বিধান এবং প্রচলিত ভুলগুলো।",
      en: "Prayer, fasting, Hajj, zakat, qurbani, dua and dhikr — with the common mistakes people make.",
    },
    icon: "Moon",
    tone: "success",
    scholarIds: ["scholar-1", "scholar-6", "scholar-8"],
    trending: false,
    stats: { questions: 4680, answered: 4322, articles: 176, fatwas: 1240, followers: 41600 },
  },
  {
    id: "akhlaq",
    slug: "akhlaq",
    name: { bn: "আখলাক ও আত্মশুদ্ধি", en: "Akhlaq & Self-Purification" },
    shortName: { bn: "আখলাক", en: "Akhlaq" },
    description: {
      bn: "চরিত্র গঠন, তাযকিয়া, গীবত থেকে বাঁচা, রাগ নিয়ন্ত্রণ, হিংসা-লোভ ও অন্তরের রোগের চিকিৎসা।",
      en: "Character formation, tazkiyah, guarding the tongue, anger, envy, greed and the diseases of the heart.",
    },
    icon: "Sprout",
    tone: "primary",
    scholarIds: ["scholar-5", "scholar-7", "scholar-10"],
    trending: false,
    stats: { questions: 1960, answered: 1704, articles: 148, fatwas: 38, followers: 19800 },
  },
  {
    id: "dawah",
    slug: "dawah",
    name: { bn: "দাওয়াহ ও তুলনামূলক ধর্ম", en: "Dawah & Comparative Religion" },
    shortName: { bn: "দাওয়াহ", en: "Dawah" },
    description: {
      bn: "অমুসলিমদের কাছে ইসলাম পৌঁছানোর পদ্ধতি, সন্দেহের জবাব, তুলনামূলক ধর্মতত্ত্ব ও খ্রিস্টান-হিন্দু ধর্মীয় জিজ্ঞাসা।",
      en: "Reaching others with Islam, answering doubts, comparative theology and questions from Christian and Hindu interlocutors.",
    },
    icon: "Compass",
    tone: "accent",
    scholarIds: ["scholar-2", "scholar-11"],
    trending: false,
    stats: { questions: 1240, answered: 1042, articles: 118, fatwas: 24, followers: 14200 },
  },
  {
    id: "medical",
    slug: "medical",
    name: { bn: "চিকিৎসা ও স্বাস্থ্য", en: "Medical & Health" },
    shortName: { bn: "চিকিৎসা", en: "Medical" },
    description: {
      bn: "চিকিৎসা, ওষুধ, অঙ্গদান, জন্মনিয়ন্ত্রণ, মৃত্যুসহায়তা ও মানসিক স্বাস্থ্য সংক্রান্ত ফিকহি ও নৈতিক দিক।",
      en: "Fiqhi and ethical dimensions of treatment, medication, organ donation, contraception, end-of-life care and mental health.",
    },
    icon: "HeartPulse",
    tone: "danger",
    scholarIds: ["scholar-9", "scholar-12"],
    trending: false,
    stats: { questions: 1680, answered: 1402, articles: 96, fatwas: 320, followers: 17600 },
  },
  {
    id: "halal-food",
    slug: "halal-food",
    name: { bn: "হালাল-হারাম ও খাদ্য", en: "Halal & Haram" },
    shortName: { bn: "হালাল", en: "Halal" },
    description: {
      bn: "খাদ্য, পোশাক, কসমেটিকস, ওষুধ ও রেস্টুরেন্টে ব্যবহৃত উপাদানের হালাল-হারাম নির্ণয় — বাংলাদেশের বাজারের বাস্তবতা অনুসারে।",
      en: "The halal status of food, clothing, cosmetics, medicine and restaurant ingredients — grounded in the realities of Bangladeshi markets.",
    },
    icon: "UtensilsCrossed",
    tone: "warning",
    scholarIds: ["scholar-6", "scholar-9"],
    trending: false,
    stats: { questions: 2240, answered: 1978, articles: 104, fatwas: 520, followers: 21900 },
  },
  {
    id: "technology",
    slug: "technology",
    name: { bn: "প্রযুক্তি ও আধুনিক বিষয়", en: "Technology & Modern Issues" },
    shortName: { bn: "প্রযুক্তি", en: "Technology" },
    description: {
      bn: "সোশ্যাল মিডিয়া, ক্রিপ্টোকারেন্সি, অনলাইন আয়, ডিজিটাল গোপনীয়তা ও কৃত্রিম বুদ্ধিমত্তা সংক্রান্ত আধুনিক মাসআলা।",
      en: "Social media, cryptocurrency, online income, digital privacy and artificial intelligence — contemporary issues in fiqh.",
    },
    icon: "Cpu",
    tone: "scholar",
    scholarIds: ["scholar-3", "scholar-7", "scholar-12"],
    trending: true,
    stats: { questions: 1520, answered: 1246, articles: 88, fatwas: 260, followers: 16300 },
  },
];

/** O(1) lookups used by routing, feeds and breadcrumbs. */
export const DEPARTMENT_BY_SLUG: Record<string, Department> = Object.fromEntries(
  DEPARTMENTS.map((d) => [d.slug, d]),
);

export function getDepartment(slug: string): Department | undefined {
  return DEPARTMENT_BY_SLUG[slug];
}

export function getDepartmentBySlug(slug: string): Department | undefined {
  return DEPARTMENT_BY_SLUG[slug];
}

/** Resolve a list of ids/slugs to departments, dropping unknown values. */
export function getDepartments(ids: string[]): Department[] {
  return ids.map((id) => DEPARTMENT_BY_SLUG[id]).filter((d): d is Department => Boolean(d));
}

/* -------------------------------------------------------------------------- */
/* Topics — concrete concerns Bangladeshi Muslims actually ask about          */
/* -------------------------------------------------------------------------- */

export const TOPICS: Topic[] = [
  {
    id: "topic-dowry",
    slug: "dowry",
    name: { bn: "ডাউরি ও যৌতুক", en: "Dowry" },
    description: {
      bn: "যৌতুকের সামাজিক অভিশাপ, এর ইসলামি বিধান এবং যৌতুক চাওয়া-দেওয়ার শরীয়াহ রায়।",
      en: "Dowry as a social harm, its Islamic ruling and the shariah position on demanding or paying it.",
    },
    departmentSlugs: ["family", "women"],
    contentCount: 214,
    trending: true,
  },
  {
    id: "topic-riba-banking",
    slug: "riba-banking",
    name: { bn: "সুদ ও ব্যাংকিং", en: "Interest & Banking" },
    description: {
      bn: "সুদভিত্তিক ব্যাংক, ডিপিএস, সঞ্চয়পত্র, ক্রেডিট কার্ড ও ইসলামি ব্যাংকের প্রকৃত অবস্থা।",
      en: "Conventional banks, DPS schemes, savings certificates, credit cards and the real state of Islamic banking.",
    },
    departmentSlugs: ["finance", "fiqh"],
    contentCount: 342,
    trending: true,
  },
  {
    id: "topic-halal-investment",
    slug: "halal-investment",
    name: { bn: "হালাল বিনিয়োগ", en: "Halal Investment" },
    description: {
      bn: "শেয়ারবাজার, মিউচুয়াল ফান্ড, সোনা, জমি ও ব্যবসায় হালাল বিনিয়োগের নীতিমালা।",
      en: "Principles for halal investment in the stock market, mutual funds, gold, land and trade.",
    },
    departmentSlugs: ["finance", "technology"],
    contentCount: 186,
    trending: false,
  },
  {
    id: "topic-pardah",
    slug: "pardah",
    name: { bn: "পর্দা ও শালীনতা", en: "Purdah & Modesty" },
    description: {
      bn: "পর্দার ফিকহি সীমা, পোশাকের শর্ত, দৃষ্টি সংযত রাখা ও কর্মক্ষেত্রে পর্দা রক্ষা।",
      en: "The fiqhi boundaries of purdah, clothing conditions, guarding the gaze and modesty in the workplace.",
    },
    departmentSlugs: ["women", "akhlaq"],
    contentCount: 268,
    trending: false,
  },
  {
    id: "topic-talaq",
    slug: "talaq",
    name: { bn: "তালাক ও বিচ্ছেদ", en: "Divorce & Separation" },
    description: {
      bn: "তালাকের ধরন, ইদ্দত, খুলা, ভরণপোষণ ও বাংলাদেশের পারিবারিক আইনের সাথে শরীয়াহর সম্পর্ক।",
      en: "Forms of talaq, iddah, khula, maintenance and how shariah relates to Bangladeshi family law.",
    },
    departmentSlugs: ["family", "fiqh"],
    contentCount: 197,
    trending: false,
  },
  {
    id: "topic-inheritance",
    slug: "inheritance",
    name: { bn: "উত্তরাধিকার", en: "Inheritance" },
    description: {
      bn: "ফারায়েজ অনুসারে সম্পত্তি বণ্টন, কন্যাদের অংশ, উইল ও বঞ্চিত করার ভুল পদ্ধতি।",
      en: "Distributing property per faraid, daughters' shares, wills and common ways heirs are wrongfully deprived.",
    },
    departmentSlugs: ["family", "fiqh"],
    contentCount: 231,
    trending: false,
  },
  {
    id: "topic-parents-rights",
    slug: "parents-rights",
    name: { bn: "মা-বাবার অধিকার", en: "Rights of Parents" },
    description: {
      bn: "মা-বাবার সেবা, তাদের অবাধ্য হওয়ার পরিণাম, বৃদ্ধাশ্রম ও বয়স্ক পিতামাতার যত্ন।",
      en: "Serving ageing parents, the sin of disobedience, care homes and looking after elderly parents.",
    },
    departmentSlugs: ["family", "akhlaq"],
    contentCount: 164,
    trending: false,
  },
  {
    id: "topic-parenting",
    slug: "parenting",
    name: { bn: "সন্তান প্রতিপালন", en: "Parenting" },
    description: {
      bn: "সন্তানকে ইসলামি শিক্ষা দেওয়া, ছেলেমেয়ের প্রতি সমতা, পড়াশোনা ও শৃঙ্খলার ভারসাম্য।",
      en: "Islamic upbringing of children, fairness between sons and daughters, education and balancing discipline.",
    },
    departmentSlugs: ["family", "youth"],
    contentCount: 242,
    trending: false,
  },
  {
    id: "topic-fasting-prayer",
    slug: "fasting-prayer",
    name: { bn: "রোযা ও নামাজ", en: "Fasting & Prayer" },
    description: {
      bn: "নামাজের নিয়ম, কাজা-কসর, রোযা ভাঙা-না-ভাঙার মাসআলা, তারাবীহ ও সেহরি-ইফতারের সময়।",
      en: "Rules of prayer, missed and shortened prayers, what breaks a fast, tarawih and sehri-iftar timings.",
    },
    departmentSlugs: ["ibadah", "fiqh"],
    contentCount: 486,
    trending: true,
  },
  {
    id: "topic-hajj-umrah",
    slug: "hajj-umrah",
    name: { bn: "হজ ও উমরাহ", en: "Hajj & Umrah" },
    description: {
      bn: "হজের ফরজ-ওয়াজিব, হজ এজেন্সির টাকা, সৌদি ভিসা, বদলি হজ ও স্বপ্ন পূরণের বাস্তবতা।",
      en: "Obligations of Hajj, Hajj agency money, Saudi visas, Hajj on behalf of others and the practical realities.",
    },
    departmentSlugs: ["ibadah", "finance"],
    contentCount: 178,
    trending: false,
  },
  {
    id: "topic-entertainment",
    slug: "entertainment",
    name: { bn: "সংগীত ও বিনোদন", en: "Music & Entertainment" },
    description: {
      bn: "সংগীত, সিনেমা, নাটক, ক্রিকেট ও অবসর সময় কাটানোর ইসলামি সীমা।",
      en: "Music, cinema, drama, cricket and the Islamic limits of leisure.",
    },
    departmentSlugs: ["akhlaq", "youth"],
    contentCount: 156,
    trending: false,
  },
  {
    id: "topic-social-media",
    slug: "social-media",
    name: { bn: "সোশ্যাল মিডিয়া ও টিকটক", en: "Social Media & TikTok" },
    description: {
      bn: "টিকটক, ফেসবুক, রিলস, ইনফ্লুয়েন্সার সংস্কৃতি ও সামাজিক যোগাযোগমাধ্যমে সময়ের হিসাব।",
      en: "TikTok, Facebook, reels, influencer culture and being accountable for the time spent online.",
    },
    departmentSlugs: ["technology", "youth"],
    contentCount: 203,
    trending: true,
  },
  {
    id: "topic-student-life",
    slug: "student-life",
    name: { bn: "শিক্ষার্থীদের পড়াশোনা", en: "Student Life" },
    description: {
      bn: "পড়াশোনায় মনোযোগ, পরীক্ষার দুশ্চিন্তা, কোচিং, দোয়া ও শিক্ষার্থীর প্রতিদিনের রুটিন।",
      en: "Focus in study, exam anxiety, coaching centres, dua and a student's daily routine.",
    },
    departmentSlugs: ["youth", "akhlaq"],
    contentCount: 188,
    trending: false,
  },
  {
    id: "topic-job-rizq",
    slug: "job-rizq",
    name: { bn: "চাকরি ও রিজিক", en: "Job & Provision" },
    description: {
      bn: "হালাল চাকরি, বেতন, ঘুষ, কর্পোরেট পরিবেশ, বেকারত্ব ও রিজিকের তাকদীর।",
      en: "Halal employment, salary, bribery, corporate environments, unemployment and sustenance being decreed.",
    },
    departmentSlugs: ["finance", "youth"],
    contentCount: 221,
    trending: false,
  },
  {
    id: "topic-mental-health",
    slug: "mental-health",
    name: { bn: "মানসিক স্বাস্থ্য", en: "Mental Health" },
    description: {
      bn: "হতাশা, দুশ্চিন্তা, একাকীত্ব, আত্মহত্যার চিন্তা ও কাউন্সেলিং নেওয়া — দ্বীনি দৃষ্টিকোণ থেকে।",
      en: "Depression, anxiety, loneliness, suicidal thoughts and seeking counselling — from a deeni perspective.",
    },
    departmentSlugs: ["medical", "akhlaq"],
    contentCount: 147,
    trending: true,
  },
  {
    id: "topic-illness-qadar",
    slug: "illness-qadar",
    name: { bn: "রোগ ও তাকদীর", en: "Illness & Qadar" },
    description: {
      bn: "মারাত্মক রোগে ধৈর্য, ক্যান্সার-বিরল রোগ, শিফার জন্য দুআ ও তাকদীরে বিশ্বাস।",
      en: "Patience through serious illness, cancer and rare diseases, dua for healing and belief in qadar.",
    },
    departmentSlugs: ["medical", "aqeedah"],
    contentCount: 118,
    trending: false,
  },
  {
    id: "topic-janaza",
    slug: "janaza",
    name: { bn: "জানাজা ও দাফন", en: "Funeral Rites" },
    description: {
      bn: "মৃতের গোসল, কাফন, জানাজার নামাজ, দাফন, কবর যিয়ারত ও বিদআতি প্রথা।",
      en: "Washing the deceased, shrouding, janazah prayer, burial, visiting graves and innovations to avoid.",
    },
    departmentSlugs: ["fiqh", "ibadah"],
    contentCount: 132,
    trending: false,
  },
  {
    id: "topic-zakat",
    slug: "zakat-calculation",
    name: { bn: "যাকাত হিসাব", en: "Zakat Calculation" },
    description: {
      bn: "নিসাব, সোনা-রূপার যাকাত, ব্যবসার মাল, ফসল, ঋণ বাদ দেওয়া ও যাকাতের যোগ্য খাত।",
      en: "Nisab, zakat on gold and silver, trade goods, produce, deducting debts and who is eligible to receive.",
    },
    departmentSlugs: ["finance", "ibadah"],
    contentCount: 264,
    trending: false,
  },
  {
    id: "topic-qurbani",
    slug: "qurbani",
    name: { bn: "কুরবানি", en: "Qurbani" },
    description: {
      bn: "কুরবানির শর্ত, পশুর বয়স ও ত্রুটি, গোশত বণ্টন, চামড়ার বিধান ও অনলাইন কুরবানি।",
      en: "Conditions of qurbani, animal age and defects, meat distribution, hide rulings and online qurbani.",
    },
    departmentSlugs: ["ibadah", "halal-food"],
    contentCount: 176,
    trending: false,
  },
  {
    id: "topic-aqiqah",
    slug: "aqiqah",
    name: { bn: "আকিকা", en: "Aqiqah" },
    description: {
      bn: "সন্তান জন্মের পর আকিকা, নাম রাখা, চুল কাটা ও খতনার বিধান।",
      en: "Aqiqah after a birth, naming the child, shaving the hair and circumcision.",
    },
    departmentSlugs: ["family", "ibadah"],
    contentCount: 94,
    trending: false,
  },
  {
    id: "topic-interest-free-loan",
    slug: "interest-free-loan",
    name: { bn: "সুদমুক্ত ঋণ ও সহায়তা", en: "Interest-free Loans" },
    description: {
      bn: "কর্জে হাসানা, সমবায়, এনজিওর সুদমুক্ত প্রকল্প, দেনা পরিশোধ ও ঋণগ্রস্ত মানুষের দুআ।",
      en: "Qard hasanah, cooperatives, NGO interest-free schemes, repaying debt and dua for those in debt.",
    },
    departmentSlugs: ["finance", "dawah"],
    contentCount: 109,
    trending: false,
  },
  {
    id: "topic-neighbour-rights",
    slug: "neighbour-rights",
    name: { bn: "প্রতিবেশীর অধিকার", en: "Rights of Neighbours" },
    description: {
      bn: "প্রতিবেশীর হক, শব্দদূষণ, সীমানা বিরোধ, রাস্তা দখল ও আবাসিক সম্প্রীতি।",
      en: "A neighbour's rights, noise, boundary disputes, occupying shared roads and peaceful co-existence.",
    },
    departmentSlugs: ["akhlaq", "family"],
    contentCount: 87,
    trending: false,
  },
  {
    id: "topic-shab-e-barat",
    slug: "shab-e-barat",
    name: { bn: "শবে বরাত ও কদর", en: "Shab-e-Barat & Laylatul Qadr" },
    description: {
      bn: "শবে বরাত, শবে কদর, মধ্যশাবানের আমল ও এ উপলক্ষে প্রচলিত বিদআতি প্রথা।",
      en: "Shab-e-Barat, Laylatul Qadr, mid-Sha'ban practices and the innovations commonly attached to them.",
    },
    departmentSlugs: ["ibadah", "seerah"],
    contentCount: 143,
    trending: false,
  },
  {
    id: "topic-travel-prayer",
    slug: "travel-prayer",
    name: { bn: "ভ্রমণে নামাজ", en: "Prayer While Travelling" },
    description: {
      bn: "কসর, জমা, ভ্রমণের দূরত্ব, বিমানে নামাজ, প্রবাসীদের নামাজ ও সময়ের হিসাব।",
      en: "Shortening and combining prayers, travel distance, praying on a plane, expatriate prayers and time zones.",
    },
    departmentSlugs: ["ibadah", "fiqh"],
    contentCount: 121,
    trending: false,
  },
  {
    id: "topic-food-halal",
    slug: "food-additives",
    name: { bn: "খাদ্যে হালাল-হারাম", en: "Halal Food & Additives" },
    description: {
      bn: "ই-নম্বর, জেলাটিন, ভিনেগার, রেস্টুরেন্টের মাংস, রমজানে হোটেল-বাজার ও প্যাকেজিং লেবেল পড়া।",
      en: "E-numbers, gelatin, vinegar, restaurant meat, Ramadan market food and how to read packaging labels.",
    },
    departmentSlugs: ["halal-food", "medical"],
    contentCount: 158,
    trending: false,
  },
  {
    id: "topic-digital-dawah",
    slug: "digital-dawah",
    name: { bn: "অনলাইনে দাওয়াহ", en: "Digital Dawah" },
    description: {
      bn: "ফেসবুক-ইউটিউবে দ্বীনি কাজ, ভুল দলিল ছড়ানো থেকে বাঁচা ও অনলাইন দ্বীনি কনটেন্টের নীতিমালা।",
      en: "Dawah on Facebook and YouTube, avoiding the spread of weak evidence and ethics of online religious content.",
    },
    departmentSlugs: ["dawah", "technology"],
    contentCount: 96,
    trending: false,
  },
  {
    id: "topic-marriage-choice",
    slug: "marriage-choice",
    name: { bn: "পাত্র-পাত্রী নির্বাচন", en: "Choosing a Spouse" },
    description: {
      bn: "সম্প্রদায়-গোত্রের ভিত্তিতে বিয়ে, প্রেমের বিয়ে, অভিভাবকের সম্মতি ও পাত্রী দেখা।",
      en: "Marrying on caste or clan lines, love marriage, guardian consent and the meeting before marriage.",
    },
    departmentSlugs: ["family", "youth"],
    contentCount: 172,
    trending: false,
  },
  {
    id: "topic-mosque-community",
    slug: "mosque-community",
    name: { bn: "মসজিদ ও সমাজ", en: "Mosque & Community" },
    description: {
      bn: "মসজিদের জামাত, ইমামের হক, মসজিদ কমিটি, ওয়াকফ সম্পত্তি ও সমাজে দ্বীনি ভূমিকা।",
      en: "Congregational prayer, the imam's rights, mosque committees, waqf property and serving the community.",
    },
    departmentSlugs: ["ibadah", "dawah"],
    contentCount: 113,
    trending: false,
  },
  {
    id: "topic-riba",
    slug: "riba",
    name: { bn: "সুদ ও রিবা", en: "Riba (Interest)" },
    description: {
      bn: "সুদের সংজ্ঞা ও প্রকারভেদ, কুরআন-হাদীসে এর কঠোর নিষেধাজ্ঞা এবং সুদমুক্ত জীবনের ব্যবহারিক পথ।",
      en: "The definition and kinds of riba, the severe prohibition in Quran and Hadith, and practical paths to an interest-free life.",
    },
    departmentSlugs: ["finance", "fiqh"],
    contentCount: 331,
    trending: true,
  },
  {
    id: "topic-interest-banking",
    slug: "interest-banking",
    name: { bn: "ব্যাংক সুদ ও আধুনিক ব্যাংকিং", en: "Banking & Interest" },
    description: {
      bn: "সঞ্চয়ী হিসাব, ডিপিএস, সঞ্চয়পত্র, ক্রেডিট কার্ড, ব্যাংক ঋণ ও ইসলামি ব্যাংকের শরীয়াহ সম্মতি যাচাই।",
      en: "Savings accounts, DPS, savings certificates, credit cards, bank loans and checking whether Islamic banks comply with shariah.",
    },
    departmentSlugs: ["finance", "fiqh"],
    contentCount: 298,
    trending: false,
  },
  {
    id: "topic-halal-earning",
    slug: "halal-earning",
    name: { bn: "হালাল উপার্জন", en: "Halal Earnings" },
    description: {
      bn: "চাকরি, ব্যবসা, ফ্রিল্যান্সিং ও বেতনের উৎস হালাল কিনা তা যাচাইয়ের নীতিমালা এবং সন্দেহমুক্ত রুজির উপায়।",
      en: "How to verify the lawfulness of a job, business, freelancing income or salary, and ways to earn without doubt.",
    },
    departmentSlugs: ["finance", "fiqh"],
    contentCount: 276,
    trending: true,
  },
  {
    id: "topic-zakat",
    slug: "zakat",
    name: { bn: "যাকাত", en: "Zakat" },
    description: {
      bn: "নিসাব নির্ধারণ, সোনা-রুপা ও টাকার যাকাত হিসাব, যাকাতের আট খাত এবং বিতরণের সঠিক নিয়ম।",
      en: "Determining nisab, calculating zakat on gold, silver and cash, the eight categories and correct distribution.",
    },
    departmentSlugs: ["finance", "ibadah"],
    contentCount: 407,
    trending: true,
  },
  {
    id: "topic-ramadan",
    slug: "ramadan",
    name: { bn: "রমজান", en: "Ramadan" },
    description: {
      bn: "রোযার ফজিলত ও বিধান, সেহরি-ইফতার, কাজা-কাফফারা, তারাবীহ এবং শেষ দশক ও লাইলাতুল কদরের আমল।",
      en: "The virtue and rules of fasting, suhoor and iftar, make-up and expiation, tarawih, and the last ten nights including Laylat al-Qadr.",
    },
    departmentSlugs: ["ibadah"],
    contentCount: 452,
    trending: true,
  },
  {
    id: "topic-quran-recitation",
    slug: "quran-recitation",
    name: { bn: "কুরআন তিলাওয়াত ও হিফজ", en: "Quran Recitation" },
    description: {
      bn: "সহীহ তিলাওয়াত শেখা, তাজবীদের মৌলিক নিয়ম, প্রচলিত ভুল সংশোধন ও প্রতিদিনের তিলাওয়াতের রুটিন।",
      en: "Learning correct recitation, the fundamentals of tajwid, correcting common mistakes and building a daily recitation routine.",
    },
    departmentSlugs: ["quran-tafsir"],
    contentCount: 238,
    trending: false,
  },
  {
    id: "topic-quran-memorization",
    slug: "quran-memorization",
    name: { bn: "কুরআন মুখস্থ (হিফজ)", en: "Quran Memorisation" },
    description: {
      bn: "হিফজের কার্যকর পদ্ধতি, নিয়মিত রিভিশন, মুখস্থ ভেঙে যাওয়ার কারণ এবং কর্মজীবী মানুষের জন্য বাস্তব পরিকল্পনা।",
      en: "An effective memorisation method, steady revision, why memorisation slips, and a realistic plan for working professionals.",
    },
    departmentSlugs: ["quran-tafsir", "youth"],
    contentCount: 176,
    trending: false,
  },
  {
    id: "topic-hijab",
    slug: "hijab",
    name: { bn: "পর্দা ও হিজাব", en: "Hijab" },
    description: {
      bn: "হিজাবের শরীয়াহ বিধান, পোশাকের শর্তাবলি, পরিবারে পর্দার চর্চা এবং আধুনিক আপত্তিগুলোর যুক্তিসঙ্গত জবাব।",
      en: "The shariah ruling on hijab, conditions of dress, cultivating modesty at home, and reasoned answers to modern objections.",
    },
    departmentSlugs: ["women", "fiqh"],
    contentCount: 289,
    trending: false,
  },
  {
    id: "topic-marriage",
    slug: "marriage",
    name: { bn: "বিবাহ", en: "Marriage" },
    description: {
      bn: "বিবাহের প্রস্তুতি, পাত্র-পাত্রী নির্বাচন, আকদের শর্ত, দেনমোহর ও বরকতময় সংসার গড়ার নীতিমালা।",
      en: "Preparing for marriage, choosing a spouse, the conditions of the nikah contract, mahr, and building a blessed household.",
    },
    departmentSlugs: ["family", "women"],
    contentCount: 364,
    trending: true,
  },
  {
    id: "topic-masjid",
    slug: "masjid",
    name: { bn: "মসজিদ ও জামাত", en: "Mosque & Congregation" },
    description: {
      bn: "জামাতে নামাজের ফজিলত, ইমাম-মুক্তাদির বিধান, মসজিদের আদব এবং মসজিদভিত্তিক তালিম ও সমাজসেবা।",
      en: "The virtue of praying in congregation, rules for imam and follower, mosque etiquette, and mosque-based study circles.",
    },
    departmentSlugs: ["ibadah", "akhlaq"],
    contentCount: 201,
    trending: false,
  },
  {
    id: "topic-adab",
    slug: "adab",
    name: { bn: "আদব ও শিষ্টাচার", en: "Adab & Manners" },
    description: {
      bn: "বড়দের সম্মান, ছোটদের স্নেহ, শালীন আচরণ, কথা বলার আদব ও দ্বীনি ভ্রাতৃত্ব রক্ষার নিয়ম।",
      en: "Respecting elders, affection for the young, modest conduct, the etiquette of speech and preserving religious brotherhood.",
    },
    departmentSlugs: ["akhlaq"],
    contentCount: 187,
    trending: false,
  },
  {
    id: "topic-tawakkul",
    slug: "tawakkul",
    name: { bn: "তাওয়াক্কুল ও ভরসা", en: "Tawakkul & Trust" },
    description: {
      bn: "আল্লাহর উপর ভরসা, উদ্বেগ ও দুশ্চিন্তা থেকে মুক্তির পথ এবং চেষ্টার সাথে তাওয়াক্কুলের সমন্বয়।",
      en: "Reliance on Allah, relief from anxiety and worry, and how effort and tawakkul work together.",
    },
    departmentSlugs: ["akhlaq", "aqeedah"],
    contentCount: 164,
    trending: false,
  },
  {
    id: "topic-waswas",
    slug: "waswas",
    name: { bn: "ওয়াসওয়াসা", en: "Waswas (Whispering)" },
    description: {
      bn: "শয়তানের কুমন্ত্রণা, নামাজ ও অজুতে সন্দেহের সমস্যা, ঈমানদারকে আক্রান্ত করার রূপ ও তার প্রতিকার।",
      en: "Satanic whispering, doubts during prayer and wudu, the ways it troubles believers and how to remedy it.",
    },
    departmentSlugs: ["akhlaq", "medical"],
    contentCount: 129,
    trending: false,
  },
  {
    id: "topic-gheebah",
    slug: "gheebah",
    name: { bn: "গীবত ও অপবাদ", en: "Gheebah (Backbiting)" },
    description: {
      bn: "গীবত ও কুৎসার পার্থক্য, সামাজিক মাধ্যমে গীবতের ভয়াবহতা এবং শরীয়তে অনুমোদিত ব্যতিক্রমসমূহ।",
      en: "The difference between backbiting and slander, its seriousness on social media, and the exceptions shariah permits.",
    },
    departmentSlugs: ["akhlaq", "technology"],
    contentCount: 142,
    trending: false,
  },
  {
    id: "topic-arabic-language",
    slug: "arabic-language",
    name: { bn: "আরবি ভাষা শিক্ষা", en: "Learning Arabic" },
    description: {
      bn: "বাংলাভাষীদের জন্য আরবি শেখার ধাপ, প্রয়োজনীয় শব্দভান্ডার, মৌলিক ব্যাকরণ ও কুরআন বোঝার দক্ষতা গড়ার উপায়।",
      en: "A step-by-step path to Arabic for Bangla speakers: essential vocabulary, basic grammar and the skill to understand the Quran.",
    },
    departmentSlugs: ["quran-tafsir", "youth"],
    contentCount: 156,
    trending: false,
  },
  {
    id: "topic-madrasah-education",
    slug: "madrasah-education",
    name: { bn: "মাদরাসা শিক্ষা", en: "Madrasah Education" },
    description: {
      bn: "মাদরাসা শিক্ষার স্তর ও পদ্ধতি, দাওরা ও ইফতা, মাদরাসা বনাম সাধারণ শিক্ষা এবং উভয়ের সমন্বয়ের সুযোগ।",
      en: "The stages and method of madrasah education, dawra and ifta, madrasah versus general schooling, and combining both.",
    },
    departmentSlugs: ["youth", "seerah"],
    contentCount: 148,
    trending: false,
  },
];

export const TOPIC_BY_SLUG: Record<string, Topic> = Object.fromEntries(
  TOPICS.map((t) => [t.slug, t]),
);

export function getTopic(slug: string): Topic | undefined {
  return TOPIC_BY_SLUG[slug];
}

/** Topics a scholar would be recommended under, based on their departments. */
export function getTopicsByDepartment(slug: string): Topic[] {
  return TOPICS.filter((t) => t.departmentSlugs.includes(slug));
}

export const TRENDING_TOPICS: Topic[] = TOPICS.filter((t) => t.trending);
