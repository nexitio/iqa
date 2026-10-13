import type { Scholar } from "../lib/types";

/**
 * A representative slice of the verified scholar directory. The full directory
 * lives on the web app; these are the scholars the mobile feed, stories and
 * profiles reference.
 *
 * A `name` is the person's name and nothing else; the title is `honorific`, and
 * every screen composes the two so a title is never printed twice.
 */
export const SCHOLARS: Scholar[] = [
  {
    id: "scholar-1",
    slug: "mufti-abdur-rahman",
    name: { bn: "আব্দুর রহমান", en: "Abdur Rahman" },
    honorific: { bn: "মুফতি", en: "Mufti" },
    avatarColor: "#0d6b4f",
    shortBio: {
      bn: "ফিকহ ও ফতোয়া শাস্ত্রের অভিজ্ঞ মুফতি, ১৮ বছরের শিক্ষাদান অভিজ্ঞতা",
      en: "Experienced mufti in fiqh and ifta, 18 years of teaching",
    },
    bio: {
      bn: "মুফতি আব্দুর রহমান দাওরায়ে হাদীস সম্পন্ন করার পর দারুল ইফতায় সাত বছর ইফতার প্রশিক্ষণ নিয়েছেন। তিনি পারিবারিক ও লেনদেন সংক্রান্ত মাসআলায় বিশেষ পারদর্শী এবং ধৈর্যসহকারে দলিলভিত্তিক উত্তর দেওয়ার জন্য পরিচিত।",
      en: "Mufti Abdur Rahman trained for seven years in a darul ifta and specialises in family and transactional rulings with evidence-backed answers.",
    },
    departmentIds: ["fiqh", "ibadah", "finance"],
    primaryDepartmentId: "fiqh",
    specialization: [
      { bn: "পারিবারিক ও বিবাহ ফিকহ", en: "Family and marriage fiqh" },
      { bn: "আর্থিক লেনদেন ও ফতোয়া", en: "Financial transactions and ifta" },
      { bn: "ইবাদতের বিধান", en: "Rulings of worship" },
      { bn: "ফারায়েজ ও উত্তরাধিকার", en: "Faraid and inheritance" },
    ],
    languages: ["বাংলা", "আরবি", "ইংরেজি"],
    credentials: [
      { id: "cred-1-1", title: { bn: "দাওরায়ে হাদীস (মাস্টার্স সমমান)", en: "Dawra-e-Hadith (Masters equivalent)" }, institution: { bn: "জামিয়া আহলিয়া দারুল উলূম মুঈনুল ইসলাম, হাটহাজারী", en: "Jamia Ahlia Darul Ulum Moinul Islam, Hathazari" }, year: "2005" },
      { id: "cred-1-2", title: { bn: "ইফতা কোর্স (দারুল ইফতা)", en: "Ifta course (Darul Ifta)" }, institution: { bn: "দারুল ইফতা, হাটহাজারী, চট্টগ্রাম", en: "Darul Ifta, Hathazari, Chattogram" }, year: "2012" },
      { id: "cred-1-3", title: { bn: "উসুলুল ফিকহ প্রশিক্ষণ", en: "Training in Usul al-Fiqh" }, institution: { bn: "আল-আজহার বিশ্ববিদ্যালয়, কায়রো", en: "Al-Azhar University, Cairo" }, year: "2015" },
    ],
    madrasah: { bn: "জামিয়া রাহমানিয়া আরাবিয়া, ঢাকা", en: "Jamia Rahmania Arabia, Dhaka" },
    district: "dhaka",
    verified: true,
    availableForQuestions: true,
    responseTimeHours: 6,
    rating: 4.9,
    stats: { answers: 2418, articles: 64, fatwas: 812, followers: 52400, helpfulVotes: 18620 },
    joinedAt: "2023-02-14T09:00:00.000Z",
    fiqhFocus: ["hanafi", "usul"],
  },
  {
    id: "scholar-2",
    slug: "dr-imran-hossain",
    name: { bn: "ইমরান হোসেন", en: "Imran Hossain" },
    honorific: { bn: "অধ্যাপক ড.", en: "Prof. Dr." },
    avatarColor: "#1f6f9e",
    shortBio: {
      bn: "আকীদা ও তুলনামূলক ধর্ম বিষয়ে গবেষক, বিশ্ববিদ্যালয়ের অধ্যাপক",
      en: "Researcher in aqeedah and comparative religion, university professor",
    },
    bio: {
      bn: "ড. ইমরান হোসেন আধুনিক সন্দেহ ও নাস্তিক্যবাদের জবাবে ইসলামি আকীদার যুক্তিভিত্তিক উপস্থাপনায় কাজ করেন। তিনি ঢাকা বিশ্ববিদ্যালয়ে ইসলামিক স্টাডিজে শিক্ষকতা করেন।",
      en: "Dr. Imran Hossain works on rational presentations of Islamic creed in response to modern doubt and atheism.",
    },
    departmentIds: ["aqeedah", "dawah", "hadith"],
    primaryDepartmentId: "aqeedah",
    specialization: [
      { bn: "তাওহীদ ও আকীদা", en: "Tawhid and creed" },
      { bn: "নাস্তিক্যবাদ ও সন্দেহের জবাব", en: "Atheism and answering doubts" },
      { bn: "তুলনামূলক ধর্মতত্ত্ব", en: "Comparative theology" },
      { bn: "হাদীসের সনদ যাচাই", en: "Hadith authentication" },
    ],
    languages: ["বাংলা", "ইংরেজি", "আরবি"],
    credentials: [
      { id: "cred-2-1", title: { bn: "ইসলামিক স্টাডিজে পিএইচডি", en: "PhD in Islamic Studies" }, institution: { bn: "ঢাকা বিশ্ববিদ্যালয়", en: "University of Dhaka" }, year: "2014" },
      { id: "cred-2-2", title: { bn: "এমএ, ইসলামিক স্টাডিজ", en: "MA in Islamic Studies" }, institution: { bn: "ইসলামী বিশ্ববিদ্যালয়, কুষ্টিয়া", en: "Islamic University, Kushtia" }, year: "2007" },
    ],
    madrasah: { bn: "ঢাকা বিশ্ববিদ্যালয়, ইসলামিক স্টাডিজ বিভাগ", en: "University of Dhaka, Department of Islamic Studies" },
    district: "dhaka",
    verified: true,
    availableForQuestions: true,
    responseTimeHours: 12,
    rating: 4.8,
    stats: { answers: 1642, articles: 88, fatwas: 96, followers: 44100, helpfulVotes: 14280 },
    joinedAt: "2023-03-02T10:30:00.000Z",
    fiqhFocus: ["general", "comparative"],
  },
  {
    id: "scholar-3",
    slug: "mufti-saiful-islam",
    name: { bn: "সাইফুল ইসলাম", en: "Saiful Islam" },
    honorific: { bn: "মুফতি", en: "Mufti" },
    avatarColor: "#a97a1f",
    shortBio: {
      bn: "ইসলামি ব্যাংকিং ও হালাল বিনিয়োগ বিষয়ে শরীয়াহ উপদেষ্টা",
      en: "Shariah advisor on Islamic banking and halal investment",
    },
    bio: {
      bn: "মুফতি সাইফুল ইসলাম দেশের কয়েকটি ইসলামি ব্যাংকের শরীয়াহ বোর্ডে দায়িত্ব পালন করেছেন এবং সুদমুক্ত ব্যাংকিংয়ের বাস্তব চ্যালেঞ্জগুলো প্রত্যক্ষভাবে জানেন।",
      en: "Mufti Saiful Islam has served on the Shariah boards of several Bangladeshi Islamic banks and knows the practical challenges of interest-free banking.",
    },
    departmentIds: ["finance", "fiqh", "technology"],
    primaryDepartmentId: "finance",
    specialization: [
      { bn: "ইসলামি ব্যাংকিং ও শরীয়াহ অডিট", en: "Islamic banking and Shariah audit" },
      { bn: "হালাল বিনিয়োগ ও শেয়ারবাজার", en: "Halal investment and the stock market" },
      { bn: "সুদ ও আধুনিক আর্থিক পণ্য", en: "Riba and modern financial products" },
      { bn: "আনলাইন আয়", en: "Online income" },
    ],
    languages: ["বাংলা", "আরবি", "ইংরেজি"],
    credentials: [
      { id: "cred-3-1", title: { bn: "দাওরায়ে হাদীস ও ইফতা", en: "Dawra-e-Hadith and Ifta" }, institution: { bn: "জামিয়া আহলিয়া দারুল উলূম মুঈনুল ইসলাম, হাটহাজারী", en: "Jamia Ahlia Darul Ulum Moinul Islam, Hathazari" }, year: "2008" },
      { id: "cred-3-2", title: { bn: "ইসলামিক ফাইন্যান্সে এমবিএ", en: "MBA in Islamic Finance" }, institution: { bn: "ইসলামী বিশ্ববিদ্যালয়, কুষ্টিয়া", en: "Islamic University, Kushtia" }, year: "2016" },
    ],
    madrasah: { bn: "মারকাযুল ফিকহিল ইসলামী, ঢাকা", en: "Markazul Fiqhil Islami, Dhaka" },
    district: "dhaka",
    verified: true,
    availableForQuestions: true,
    responseTimeHours: 9,
    rating: 4.7,
    stats: { answers: 1286, articles: 52, fatwas: 428, followers: 31200, helpfulVotes: 9840 },
    joinedAt: "2023-04-18T11:00:00.000Z",
    fiqhFocus: ["hanafi", "general"],
  },
  {
    id: "scholar-5",
    slug: "dr-faridah-yasmin",
    name: { bn: "ফরিদা ইয়াসমিন", en: "Faridah Yasmin" },
    honorific: { bn: "ড.", en: "Dr." },
    avatarColor: "#a3405f",
    shortBio: {
      bn: "পরিবার, নারী ও শিশু মনোবিজ্ঞানে ইসলামি দৃষ্টিভঙ্গির গবেষক",
      en: "Researcher on family, women and child psychology through an Islamic lens",
    },
    bio: {
      bn: "ড. ফরিদা ইয়াসমিন পারিবারিক সম্পর্ক, সন্তান প্রতিপালন ও নারীর অধিকার নিয়ে ইসলামি দৃষ্টিভঙ্গিতে কাজ করেন। তিনি জটিল পারিবারিক বিষয়ে কোমল ও কল্যাণকামী পরামর্শের জন্য পরিচিত।",
      en: "Dr. Faridah Yasmin works on family relationships, parenting and women's rights from an Islamic perspective.",
    },
    departmentIds: ["family", "women", "akhlaq"],
    primaryDepartmentId: "family",
    specialization: [
      { bn: "দাম্পত্য সম্পর্ক ও পারিবারিক কলহ", en: "Marital relations and family conflict" },
      { bn: "সন্তান প্রতিপালন", en: "Parenting" },
      { bn: "নারীর অধিকার ও সম্মান", en: "Women's rights and dignity" },
      { bn: "মাতৃত্ব ও মানসিক স্বাস্থ্য", en: "Motherhood and mental health" },
    ],
    languages: ["বাংলা", "ইংরেজি"],
    credentials: [
      { id: "cred-5-1", title: { bn: "ইসলামিক স্টাডিজে পিএইচডি", en: "PhD in Islamic Studies" }, institution: { bn: "ইসলামী বিশ্ববিদ্যালয়, কুষ্টিয়া", en: "Islamic University, Kushtia" }, year: "2016" },
      { id: "cred-5-2", title: { bn: "পরিবার কাউন্সেলিং সার্টিফিকেট", en: "Certification in family counselling" }, institution: { bn: "বাংলাদেশ ইনস্টিটিউট অব ফ্যামিলি স্টাডিজ", en: "Bangladesh Institute of Family Studies" }, year: "2019" },
    ],
    madrasah: { bn: "ইসলামী বিশ্ববিদ্যালয়, কুষ্টিয়া", en: "Islamic University, Kushtia" },
    district: "rajshahi",
    verified: true,
    availableForQuestions: true,
    responseTimeHours: 18,
    rating: 4.9,
    stats: { answers: 1842, articles: 96, fatwas: 214, followers: 46800, helpfulVotes: 16920 },
    joinedAt: "2023-05-22T08:45:00.000Z",
    fiqhFocus: ["general"],
  },
];

export const SCHOLAR_BY_ID: Record<string, Scholar> = Object.fromEntries(
  SCHOLARS.map((scholar) => [scholar.id, scholar]),
);

export function getScholar(idOrSlug: string): Scholar | undefined {
  return SCHOLARS.find((s) => s.id === idOrSlug || s.slug === idOrSlug);
}

/** "মুফতি আব্দুর রহমান" — title composed with the name, in the reader's language. */
export function scholarDisplayName(scholar: Scholar, locale: "bn" | "en" = "bn") {
  return `${scholar.honorific[locale]} ${scholar.name[locale]}`.trim();
}
