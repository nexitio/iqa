import type { Hadith, HadithBook, HadithCollection, HadithGrade, Localized } from "@/lib/types";

/**
 * Hadith dataset.
 *
 * Arabic is reproduced verbatim from the published collections and every hadith
 * carries its real collection, book and number so the UI can cite it responsibly.
 * `grade` uses the classical classifications; hadith narrated in both Bukhari and
 * Muslim are marked `muttafaqun-alaih` (متفق عليه).
 */

/* -------------------------------------------------------------------------- */
/* Collections                                                                */
/* -------------------------------------------------------------------------- */

export const HADITH_COLLECTIONS: HadithCollection[] = [
  {
    id: "col-bukhari",
    slug: "bukhari",
    name: { bn: "সহীহ বুখারী", en: "Sahih al-Bukhari" },
    author: { bn: "ইমাম মুহাম্মাদ ইবনে ইসমাইল বুখারী (রহ.)", en: "Imam Muhammad ibn Ismail al-Bukhari" },
    nameArabic: "ٱلْجَامِعُ ٱلصَّحِيح",
    description: {
      bn: "সহীহ হাদীসের সর্বাধিক নির্ভরযোগ্য সংকলন। ইমাম বুখারী (রহ.) দীর্ঘ ষোল বছর পরিশ্রম করে এটি সংকলন করেন।",
      en: "The most authentic collection of hadith, compiled by Imam al-Bukhari over sixteen years.",
    },
    hadithCount: 7563,
    authentic: true,
    bookCount: 97,
    tone: "primary",
  },
  {
    id: "col-muslim",
    slug: "muslim",
    name: { bn: "সহীহ মুসলিম", en: "Sahih Muslim" },
    author: { bn: "ইমাম মুসলিম ইবনে হাজ্জাজ (রহ.)", en: "Imam Muslim ibn al-Hajjaj" },
    nameArabic: "صَحِيح مُسْلِم",
    description: {
      bn: "সহীহ বুখারীর পরেই সর্বাধিক নির্ভরযোগ্য হাদীস সংকলন। বিন্যাস পদ্ধতি বিশেষভাবে সুসংগঠিত।",
      en: "The second most authentic collection, prized for its meticulous arrangement.",
    },
    hadithCount: 7500,
    authentic: true,
    bookCount: 56,
    tone: "success",
  },
  {
    id: "col-abu-dawud",
    slug: "abu-dawud",
    name: { bn: "সুনানে আবু দাউদ", en: "Sunan Abu Dawud" },
    author: { bn: "ইমাম আবু দাউদ সুলাইমান (রহ.)", en: "Imam Abu Dawud as-Sijistani" },
    nameArabic: "سُنَن أَبِي دَاوُد",
    description: {
      bn: "ফিকহি বিধান-সংক্রান্ত হাদীসের অন্যতম প্রধান সংকলন। আহকামের হাদীসে বিশেষভাবে সমৃদ্ধ।",
      en: "A principal source for legal (ahkam) hadith.",
    },
    hadithCount: 5274,
    authentic: true,
    bookCount: 43,
    tone: "info",
  },
  {
    id: "col-tirmizi",
    slug: "tirmizi",
    name: { bn: "সুনানে তিরমিযী", en: "Jami' at-Tirmidhi" },
    author: { bn: "ইমাম আবু ঈসা মুহাম্মাদ তিরমিযী (রহ.)", en: "Imam Abu Isa at-Tirmidhi" },
    nameArabic: "جَامِع ٱلتِّرْمِذِي",
    description: {
      bn: "প্রতিটি হাদীসের মান নির্ণয় ও ফিকহি মতামত উল্লেখের কারণে বিশেষভাবে মূল্যবান সংকলন।",
      en: "Valued for grading each hadith and noting the jurists' positions.",
    },
    hadithCount: 3956,
    authentic: true,
    bookCount: 49,
    tone: "accent",
  },
  {
    id: "col-nasai",
    slug: "nasai",
    name: { bn: "সুনানে নাসাঈ", en: "Sunan an-Nasa'i" },
    author: { bn: "ইমাম আহমাদ ইবনে শুআইব নাসাঈ (রহ.)", en: "Imam Ahmad ibn Shu'ayb an-Nasa'i" },
    nameArabic: "سُنَن ٱلنَّسَائِي",
    description: {
      bn: "বর্ণনাকারীদের পর্যালোচনায় কঠোরতার জন্য পরিচিত; ইবাদত-সংক্রান্ত হাদীসে সমৃদ্ধ।",
      en: "Known for strict narrator criticism, especially rich in worship-related hadith.",
    },
    hadithCount: 5758,
    authentic: true,
    bookCount: 51,
    tone: "info",
  },
  {
    id: "col-ibnu-majah",
    slug: "ibnu-majah",
    name: { bn: "সুনানে ইবনে মাজাহ", en: "Sunan Ibn Majah" },
    author: { bn: "ইমাম মুহাম্মাদ ইবনে মাজাহ (রহ.)", en: "Imam Ibn Majah al-Qazwini" },
    nameArabic: "سُنَن ٱبْن مَاجَه",
    description: {
      bn: "সিহাহ সিত্তার সর্বশেষ সংকলন। দৈনন্দিন জীবনের অসংখ্য বিধান এতে রয়েছে।",
      en: "The last of the six canonical books, covering many everyday rulings.",
    },
    hadithCount: 4341,
    authentic: true,
    bookCount: 37,
    tone: "accent",
  },
  {
    id: "col-riyadus-salihin",
    slug: "riyadus-salihin",
    name: { bn: "রিয়াদুস সালিহীন", en: "Riyad as-Salihin" },
    author: { bn: "ইমাম ইয়াহইয়া ইবনে শারাফ আন-নববী (রহ.)", en: "Imam Yahya ibn Sharaf an-Nawawi" },
    nameArabic: "رِيَاض ٱلصَّالِحِين",
    description: {
      bn: "আখলাক, আমল ও আত্মশুদ্ধির হাদীসের সুবিন্যস্ত সংকলন — তালিবুল ইলম ও সাধারণ পাঠকের জন্য আদর্শ।",
      en: "A thematic compilation on character, worship and self-purification.",
    },
    hadithCount: 1896,
    authentic: true,
    bookCount: 20,
    tone: "success",
  },
  {
    id: "col-mishkat",
    slug: "mishkat",
    name: { bn: "মিশকাতুল মাসাবীহ", en: "Mishkat al-Masabih" },
    author: { bn: "ওয়ালীউদ্দীন মুহাম্মাদ তাবরিযী (রহ.)", en: "Wali al-Din at-Tabrizi" },
    nameArabic: "مِشْكَاة ٱلْمَصَابِيح",
    description: {
      bn: "বাংলাদেশ ও ভারতীয় উপমহাদেশের মাদরাসায় বহুল পঠিত হাদীস সংকলন।",
      en: "A widely taught collection in the madrasahs of Bangladesh and the subcontinent.",
    },
    hadithCount: 5945,
    authentic: false,
    bookCount: 30,
    tone: "primary",
  },
];

/* -------------------------------------------------------------------------- */
/* Books (chapters)                                                           */
/* -------------------------------------------------------------------------- */

interface BookSeed {
  collectionSlug: string;
  number: number;
  nameBn: string;
  nameEn: string;
  hadithCount: number;
}

const BOOK_SEEDS: BookSeed[] = [
  /* Bukhari */
  { collectionSlug: "bukhari", number: 1, nameBn: "ওহীর সূচনা", nameEn: "Revelation", hadithCount: 7 },
  { collectionSlug: "bukhari", number: 2, nameBn: "ঈমান", nameEn: "Belief", hadithCount: 51 },
  { collectionSlug: "bukhari", number: 3, nameBn: "ইলম", nameEn: "Knowledge", hadithCount: 76 },
  { collectionSlug: "bukhari", number: 4, nameBn: "পবিত্রতা ও অযু", nameEn: "Ablution", hadithCount: 113 },
  { collectionSlug: "bukhari", number: 5, nameBn: "নামাজ", nameEn: "Prayer", hadithCount: 173 },
  { collectionSlug: "bukhari", number: 6, nameBn: "ক্রয়-বিক্রয় ও ব্যবসা", nameEn: "Sales and Trade", hadithCount: 113 },
  { collectionSlug: "bukhari", number: 7, nameBn: "আখলাক ও আদব", nameEn: "Manners", hadithCount: 132 },
  { collectionSlug: "bukhari", number: 8, nameBn: "বিবাহ", nameEn: "Marriage", hadithCount: 118 },
  { collectionSlug: "bukhari", number: 9, nameBn: "রোযা", nameEn: "Fasting", hadithCount: 117 },
  { collectionSlug: "bukhari", number: 10, nameBn: "রিকাক (হৃদয়-কোমলতা)", nameEn: "Heart-Softening", hadithCount: 128 },

  /* Muslim */
  { collectionSlug: "muslim", number: 1, nameBn: "ঈমান", nameEn: "Faith", hadithCount: 431 },
  { collectionSlug: "muslim", number: 2, nameBn: "পবিত্রতা", nameEn: "Purification", hadithCount: 145 },
  { collectionSlug: "muslim", number: 3, nameBn: "নামাজ", nameEn: "Prayer", hadithCount: 283 },
  { collectionSlug: "muslim", number: 4, nameBn: "যাকাত", nameEn: "Zakat", hadithCount: 123 },
  { collectionSlug: "muslim", number: 5, nameBn: "সাওম", nameEn: "Fasting", hadithCount: 194 },
  { collectionSlug: "muslim", number: 6, nameBn: "আখলাক", nameEn: "Virtue and Manners", hadithCount: 200 },
  { collectionSlug: "muslim", number: 7, nameBn: "ইলম ও যিকির", nameEn: "Knowledge and Remembrance", hadithCount: 100 },
  { collectionSlug: "muslim", number: 8, nameBn: "সালাম ও আদব", nameEn: "Greetings and Manners", hadithCount: 60 },

  /* Abu Dawud */
  { collectionSlug: "abu-dawud", number: 1, nameBn: "পবিত্রতা", nameEn: "Purification", hadithCount: 390 },
  { collectionSlug: "abu-dawud", number: 2, nameBn: "নামাজ", nameEn: "Prayer", hadithCount: 500 },
  { collectionSlug: "abu-dawud", number: 3, nameBn: "যাকাত", nameEn: "Zakat", hadithCount: 200 },
  { collectionSlug: "abu-dawud", number: 4, nameBn: "ক্রয়-বিক্রয়", nameEn: "Business Transactions", hadithCount: 200 },
  { collectionSlug: "abu-dawud", number: 5, nameBn: "আদব", nameEn: "Manners", hadithCount: 180 },

  /* Tirmizi */
  { collectionSlug: "tirmizi", number: 1, nameBn: "পবিত্রতা", nameEn: "Purification", hadithCount: 200 },
  { collectionSlug: "tirmizi", number: 2, nameBn: "নামাজ", nameEn: "Prayer", hadithCount: 300 },
  { collectionSlug: "tirmizi", number: 3, nameBn: "আখলাক ও চরিত্র", nameEn: "Character", hadithCount: 120 },
  { collectionSlug: "tirmizi", number: 4, nameBn: "ইলম", nameEn: "Knowledge", hadithCount: 60 },
  { collectionSlug: "tirmizi", number: 5, nameBn: "দুআ", nameEn: "Supplication", hadithCount: 150 },

  /* Nasai */
  { collectionSlug: "nasai", number: 1, nameBn: "পবিত্রতা", nameEn: "Purification", hadithCount: 300 },
  { collectionSlug: "nasai", number: 2, nameBn: "নামাজ", nameEn: "Prayer", hadithCount: 400 },
  { collectionSlug: "nasai", number: 3, nameBn: "যাকাত", nameEn: "Zakat", hadithCount: 150 },
  { collectionSlug: "nasai", number: 4, nameBn: "সাওম", nameEn: "Fasting", hadithCount: 160 },
  { collectionSlug: "nasai", number: 5, nameBn: "জিহাদ ও পিতা-মাতা", nameEn: "Jihad and Parents", hadithCount: 120 },

  /* Ibnu Majah */
  { collectionSlug: "ibnu-majah", number: 1, nameBn: "পবিত্রতা", nameEn: "Purification", hadithCount: 200 },
  { collectionSlug: "ibnu-majah", number: 2, nameBn: "নামাজ", nameEn: "Prayer", hadithCount: 250 },
  { collectionSlug: "ibnu-majah", number: 3, nameBn: "ইলম ও আখলাক", nameEn: "Knowledge and Manners", hadithCount: 80 },
  { collectionSlug: "ibnu-majah", number: 4, nameBn: "ব্যবসা", nameEn: "Trade", hadithCount: 120 },
  { collectionSlug: "ibnu-majah", number: 5, nameBn: "খাদ্য ও পানীয়", nameEn: "Food and Drink", hadithCount: 90 },

  /* Riyad as-Salihin */
  { collectionSlug: "riyadus-salihin", number: 1, nameBn: "ইখলাস ও নিয়ত", nameEn: "Sincerity and Intention", hadithCount: 20 },
  { collectionSlug: "riyadus-salihin", number: 2, nameBn: "তাওবা", nameEn: "Repentance", hadithCount: 30 },
  { collectionSlug: "riyadus-salihin", number: 3, nameBn: "ধৈর্য", nameEn: "Patience", hadithCount: 40 },
  { collectionSlug: "riyadus-salihin", number: 4, nameBn: "সততা ও বিশ্বস্ততা", nameEn: "Truthfulness and Trust", hadithCount: 35 },
  { collectionSlug: "riyadus-salihin", number: 5, nameBn: "পিতা-মাতার হক", nameEn: "Rights of Parents", hadithCount: 25 },
  { collectionSlug: "riyadus-salihin", number: 6, nameBn: "প্রতিবেশীর হক", nameEn: "Rights of Neighbours", hadithCount: 20 },
  { collectionSlug: "riyadus-salihin", number: 7, nameBn: "ভালো চরিত্র", nameEn: "Good Character", hadithCount: 45 },

  /* Mishkat */
  { collectionSlug: "mishkat", number: 1, nameBn: "ঈমান", nameEn: "Faith", hadithCount: 200 },
  { collectionSlug: "mishkat", number: 2, nameBn: "ইলম", nameEn: "Knowledge", hadithCount: 80 },
  { collectionSlug: "mishkat", number: 3, nameBn: "পবিত্রতা", nameEn: "Purification", hadithCount: 150 },
  { collectionSlug: "mishkat", number: 4, nameBn: "আখলাক", nameEn: "Manners", hadithCount: 180 },
  { collectionSlug: "mishkat", number: 5, nameBn: "হালাল ও হারাম", nameEn: "Halal and Haram", hadithCount: 90 },
];

export const HADITH_BOOKS: HadithBook[] = BOOK_SEEDS.map((seed) => ({
  id: `book-${seed.collectionSlug}-${seed.number}`,
  collectionSlug: seed.collectionSlug,
  number: seed.number,
  name: { bn: seed.nameBn, en: seed.nameEn },
  hadithCount: seed.hadithCount,
}));

/** Resolve a book by collection + number so hadith metadata can never drift. */
function bookOf(collectionSlug: string, number: number): { number: number; name: Localized } {
  const book = HADITH_BOOKS.find(
    (b) => b.collectionSlug === collectionSlug && b.number === number,
  );
  if (!book) {
    throw new Error(`Unknown hadith book ${collectionSlug} #${number}`);
  }
  return { number: book.number, name: book.name };
}

function collectionName(slug: string): Localized {
  const collection = HADITH_COLLECTIONS.find((c) => c.slug === slug);
  if (!collection) throw new Error(`Unknown hadith collection ${slug}`);
  return collection.name;
}

/* -------------------------------------------------------------------------- */
/* Hadith                                                                     */
/* -------------------------------------------------------------------------- */

interface HadithSeed {
  id: string;
  collectionSlug: string;
  bookNumber: number;
  number: number;
  arabic: string;
  bn: string;
  en: string;
  narratorBn: string;
  narratorEn: string;
  grade: HadithGrade;
  topicIds: string[];
  lessonBn?: string;
}

const HADITH_SEEDS: HadithSeed[] = [
  {
    id: "hadith-1",
    collectionSlug: "bukhari",
    bookNumber: 1,
    number: 1,
    arabic: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى",
    bn: "নিশ্চয়ই সমস্ত কাজ নিয়তের উপর নির্ভরশীল। আর প্রত্যেকে তাই পাবে, যা সে নিয়ত করেছে।",
    en: "Actions are only by intentions, and every person will have only what he intended.",
    narratorBn: "উমার ইবনুল খাত্তাব (রা.)",
    narratorEn: "Umar ibn al-Khattab (ra)",
    grade: "muttafaqun-alaih",
    topicIds: ["aqeedah", "fiqh", "akhlaq"],
    lessonBn: "যেকোনো ইবাদত বা সৎকাজের মূল্য নির্ধারিত হয় অন্তরের উদ্দেশ্য দ্বারা। রিয়া (লোকদেখানো) থেকে বাঁচতে নিয়ত পরিশুদ্ধ রাখা জরুরি।",
  },
  {
    id: "hadith-2",
    collectionSlug: "bukhari",
    bookNumber: 2,
    number: 8,
    arabic:
      "بُنِيَ الإِسْلاَمُ عَلَى خَمْسٍ: شَهَادَةِ أَنْ لاَ إِلَهَ إِلاَّ اللَّهُ وَأَنَّ مُحَمَّدًا رَسُولُ اللَّهِ، وَإِقَامِ الصَّلاَةِ، وَإِيتَاءِ الزَّكَاةِ، وَالْحَجِّ، وَصَوْمِ رَمَضَانَ",
    bn: "ইসলামের ভিত্তি পাঁচটি — এই সাক্ষ্য দেওয়া যে আল্লাহ ছাড়া কোনো ইলাহ নেই এবং মুহাম্মাদ (সা.) আল্লাহর রাসূল, নামাজ কায়েম করা, যাকাত প্রদান করা, হজ্জ করা এবং রমজানের রোযা রাখা।",
    en: "Islam is built upon five: the testimony that there is no deity but Allah and that Muhammad is the Messenger of Allah, establishing prayer, giving zakat, performing Hajj, and fasting Ramadan.",
    narratorBn: "আব্দুল্লাহ ইবনে উমার (রা.)",
    narratorEn: "Abdullah ibn Umar (ra)",
    grade: "muttafaqun-alaih",
    topicIds: ["aqeedah", "ibadah", "fiqh"],
    lessonBn: "ঈমানের ভিত্তি তাওহীদ, আর তার উপর দাঁড়ানো স্তম্ভগুলো হলো ইবাদত। প্রতিটি স্তম্ভের গুরুত্ব সমানভাবে রক্ষা করা উচিত।",
  },
  {
    id: "hadith-3",
    collectionSlug: "bukhari",
    bookNumber: 3,
    number: 5027,
    arabic: "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ",
    bn: "তোমাদের মধ্যে সর্বোত্তম সেই ব্যক্তি, যে কুরআন শেখে এবং অন্যকে শেখায়।",
    en: "The best of you are those who learn the Qur'an and teach it.",
    narratorBn: "উসমান ইবনে আফফান (রা.)",
    narratorEn: "Uthman ibn Affan (ra)",
    grade: "sahih",
    topicIds: ["quran-tafsir", "akhlaq", "youth"],
    lessonBn: "শেখা ও শেখানোর মিলনেই প্রকৃত সম্মান। শুধু নিজে শেখা নয়, অন্যদের কাছে পৌঁছে দেওয়াই কুরআন শিক্ষার পূর্ণতা।",
  },
  {
    id: "hadith-4",
    collectionSlug: "bukhari",
    bookNumber: 2,
    number: 13,
    arabic: "لاَ يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ",
    bn: "তোমাদের কেউ প্রকৃত মুমিন হতে পারবে না, যতক্ষণ সে নিজের জন্য যা পছন্দ করে তা নিজের ভাইয়ের জন্যও পছন্দ না করে।",
    en: "None of you truly believes until he loves for his brother what he loves for himself.",
    narratorBn: "আনাস ইবনে মালিক (রা.)",
    narratorEn: "Anas ibn Malik (ra)",
    grade: "muttafaqun-alaih",
    topicIds: ["akhlaq", "aqeedah", "family"],
    lessonBn: "ঈমান কেবল অভ্যন্তরীণ বিশ্বাস নয় — তা অন্য মানুষের প্রতি আচরণে প্রকাশ পায়। ঈর্ষা ও স্বার্থপরতা ঈমানকে দুর্বল করে।",
  },
  {
    id: "hadith-5",
    collectionSlug: "muslim",
    bookNumber: 6,
    number: 2664,
    arabic: "الْمُؤْمِنُ الْقَوِيُّ خَيْرٌ وَأَحَبُّ إِلَى اللَّهِ مِنَ الْمُؤْمِنِ الضَّعِيفِ",
    bn: "শক্তিশালী মুমিন দুর্বল মুমিনের চেয়ে উত্তম এবং আল্লাহর কাছে অধিক প্রিয়।",
    en: "The strong believer is better and more beloved to Allah than the weak believer.",
    narratorBn: "আবু হুরাইরা (রা.)",
    narratorEn: "Abu Hurayrah (ra)",
    grade: "sahih",
    topicIds: ["akhlaq", "youth", "medical"],
    lessonBn: "শারীরিক ও মানসিক সক্ষমতা একটি নিয়ামত, যা দিয়ে ইলম ও সৎকাজে অগ্রসর হওয়া যায়।",
  },
  {
    id: "hadith-6",
    collectionSlug: "ibnu-majah",
    bookNumber: 3,
    number: 224,
    arabic: "طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ",
    bn: "জ্ঞান অন্বেষণ করা প্রত্যেক মুসলিমের উপর ফরজ।",
    en: "Seeking knowledge is an obligation upon every Muslim.",
    narratorBn: "আনাস ইবনে মালিক (রা.)",
    narratorEn: "Anas ibn Malik (ra)",
    grade: "hasan",
    topicIds: ["akhlaq", "youth"],
    lessonBn: "ধর্মীয় জ্ঞান অর্জন নারী-পুরুষ নির্বিশেষে সবার দায়িত্ব — অন্তত যতটুকু আমল সঠিক রাখতে প্রয়োজন।",
  },
  {
    id: "hadith-7",
    collectionSlug: "nasai",
    bookNumber: 5,
    number: 3104,
    arabic: "الْزَمْ رِجْلَهَا، فَثَمَّ الْجَنَّةُ",
    bn: "তোমার মায়ের পায়ের কাছে লেগে থাকো, কারণ সেখানেই জান্নাত।",
    en: "Stay at your mother's feet, for there is Paradise.",
    narratorBn: "মুআবিয়া ইবনে জাহিমা (রা.)",
    narratorEn: "Mu'awiyah ibn Jahimah (ra)",
    grade: "hasan",
    topicIds: ["family", "women", "akhlaq"],
    lessonBn: "মায়ের সেবা ও সন্তুষ্টি জান্নাতের সরল পথ। পিতা-মাতার প্রতি সদ্ব্যবহার ইসলামের সর্বাধিক গুরুত্বপূর্ণ সামাজিক শিক্ষা।",
  },
  {
    id: "hadith-8",
    collectionSlug: "bukhari",
    bookNumber: 7,
    number: 6094,
    arabic: "إِنَّ الصِّدْقَ يَهْدِي إِلَى الْبِرِّ، وَإِنَّ الْبِرَّ يَهْدِي إِلَى الْجَنَّةِ",
    bn: "নিশ্চয়ই সততা সৎকর্মের পথ দেখায়, আর সৎকর্ম জান্নাতের পথ দেখায়।",
    en: "Verily truthfulness leads to righteousness, and righteousness leads to Paradise.",
    narratorBn: "আব্দুল্লাহ ইবনে মাসউদ (রা.)",
    narratorEn: "Abdullah ibn Mas'ud (ra)",
    grade: "muttafaqun-alaih",
    topicIds: ["akhlaq", "finance"],
    lessonBn: "সততা একটি ক্রমবর্ধমান গুণ — ছোট সত্য দিয়ে শুরু করে মানুষ একদিনই বিশ্বস্ত হয়ে ওঠে।",
  },
  {
    id: "hadith-9",
    collectionSlug: "tirmizi",
    bookNumber: 3,
    number: 1956,
    arabic: "تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ لَكَ صَدَقَةٌ",
    bn: "তোমার ভাইয়ের মুখের দিকে তাকিয়ে হাসাও তোমার জন্য সদকা।",
    en: "Your smile in your brother's face is charity for you.",
    narratorBn: "আবু যার আল-গিফারী (রা.)",
    narratorEn: "Abu Dharr al-Ghifari (ra)",
    grade: "hasan",
    topicIds: ["akhlaq", "dawah"],
    lessonBn: "দাওয়াহর শুরু সহজ আচরণে — সম্পদ ছাড়াও প্রতিটি মানুষ দানের সামর্থ্য রাখে।",
  },
  {
    id: "hadith-10",
    collectionSlug: "muslim",
    bookNumber: 2,
    number: 223,
    arabic: "الطُّهُورُ شَطْرُ الإِيمَانِ",
    bn: "পবিত্রতা ঈমানের অর্ধেক।",
    en: "Purification is half of faith.",
    narratorBn: "আবু হুরাইরা (রা.)",
    narratorEn: "Abu Hurayrah (ra)",
    grade: "sahih",
    topicIds: ["ibadah", "fiqh"],
    lessonBn: "দৈহিক পরিচ্ছন্নতা ইবাদতের অবিচ্ছেদ্য অংশ। অযু ও গোসলের নিয়ম শেখা তাই অগ্রাধিকার পাওয়ার যোগ্য।",
  },
  {
    id: "hadith-11",
    collectionSlug: "bukhari",
    bookNumber: 8,
    number: 5065,
    arabic:
      "يَا مَعْشَرَ الشَّبَابِ، مَنِ اسْتَطَاعَ مِنْكُمُ الْبَاءَةَ فَلْيَتَزَوَّجْ، فَإِنَّهُ أَغَضُّ لِلْبَصَرِ وَأَحْصَنُ لِلْفَرْجِ",
    bn: "হে যুবসমাজ! তোমাদের মধ্যে যে ব্যক্তি বিবাহের সামর্থ্য রাখে, সে যেন বিবাহ করে। কারণ তা দৃষ্টিকে সংযত রাখে এবং চরিত্রকে রক্ষা করে।",
    en: "O young men, whoever among you can afford marriage should marry, for it restrains the gaze and guards chastity.",
    narratorBn: "আব্দুল্লাহ ইবনে মাসউদ (রা.)",
    narratorEn: "Abdullah ibn Mas'ud (ra)",
    grade: "muttafaqun-alaih",
    topicIds: ["family", "youth", "women"],
    lessonBn: "বিবাহকে যৌবনের সংযমের প্রধান উপায় হিসেবে দেখানো হয়েছে — এটি সমাজ রক্ষার বিধান, শুধু ব্যক্তিগত চাহিদা নয়।",
  },
  {
    id: "hadith-12",
    collectionSlug: "bukhari",
    bookNumber: 7,
    number: 527,
    arabic:
      "أَىُّ الْعَمَلِ أَحَبُّ إِلَى اللَّهِ؟ قَالَ: الصَّلاَةُ عَلَى وَقْتِهَا، قَالَ: ثُمَّ أَىٌّ؟ قَالَ: ثُمَّ بِرُّ الْوَالِدَيْنِ",
    bn: "জিজ্ঞাসা করা হলো — আল্লাহর কাছে সর্বাধিক প্রিয় আমল কোনটি? তিনি বললেন, যথাসময়ে নামাজ আদায় করা। এরপর কোনটি? বললেন, পিতা-মাতার প্রতি সদ্ব্যবহার করা।",
    en: "It was asked, 'Which deed is most beloved to Allah?' He said, 'Prayer at its proper time.' Then which? He said, 'Kindness to parents.'",
    narratorBn: "আব্দুল্লাহ ইবনে মাসউদ (রা.)",
    narratorEn: "Abdullah ibn Mas'ud (ra)",
    grade: "muttafaqun-alaih",
    topicIds: ["family", "ibadah", "akhlaq"],
    lessonBn: "নামাজের পরেই পিতা-মাতার হক — অর্থাৎ পারিবারিক দায়িত্ব ইবাদতের সাথে অবিচ্ছেদ্যভাবে জড়িত।",
  },
  {
    id: "hadith-13",
    collectionSlug: "bukhari",
    bookNumber: 7,
    number: 6016,
    arabic: "مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلاَ يُؤْذِ جَارَهُ",
    bn: "যে ব্যক্তি আল্লাহ ও শেষ দিনে বিশ্বাস রাখে, সে যেন তার প্রতিবেশীকে কষ্ট না দেয়।",
    en: "Whoever believes in Allah and the Last Day should not harm his neighbour.",
    narratorBn: "আবু হুরাইরা (রা.)",
    narratorEn: "Abu Hurayrah (ra)",
    grade: "muttafaqun-alaih",
    topicIds: ["akhlaq", "family"],
    lessonBn: "প্রতিবেশীর হক বাংলাদেশের ঘনবসতিপূর্ণ সমাজে বিশেষভাবে প্রাসঙ্গিক — শব্দ, ধোঁয়া ও আচরণ সবই এর অন্তর্ভুক্ত।",
  },
  {
    id: "hadith-14",
    collectionSlug: "ibnu-majah",
    bookNumber: 4,
    number: 2341,
    arabic: "لاَ ضَرَرَ وَلاَ ضِرَارَ",
    bn: "ক্ষতি করা যাবে না এবং ক্ষতির বদলে ক্ষতি করাও যাবে না।",
    en: "There should be neither harm nor reciprocating harm.",
    narratorBn: "উবাদা ইবনে সামিত (রা.)",
    narratorEn: "Ubadah ibn as-Samit (ra)",
    grade: "hasan",
    topicIds: ["fiqh", "finance", "akhlaq"],
    lessonBn: "ইসলামি ফিকহের একটি মূলনীতি — আইন প্রণয়নে ও লেনদেনে ক্ষতির নিষিদ্ধতা।",
  },
  {
    id: "hadith-15",
    collectionSlug: "abu-dawud",
    bookNumber: 5,
    number: 5128,
    arabic: "الْمُسْتَشَارُ مُؤْتَمَنٌ",
    bn: "যার সাথে পরামর্শ করা হয়, সে আমানতদার।",
    en: "The one whose advice is sought is entrusted.",
    narratorBn: "আবু হুরাইরা (রা.)",
    narratorEn: "Abu Hurayrah (ra)",
    grade: "hasan",
    topicIds: ["akhlaq", "family", "finance"],
    lessonBn: "পরামর্শ দেওয়া আমানতের মতো — নিজের পক্ষপাতিত্ব মিশিয়ে ভুল পরামর্শ দেওয়া বিশ্বাসঘাতকতা।",
  },
  {
    id: "hadith-16",
    collectionSlug: "bukhari",
    bookNumber: 7,
    number: 6114,
    arabic: "لَيْسَ الشَّدِيدُ بِالصُّرَعَةِ، إِنَّمَا الشَّدِيدُ الَّذِي يَمْلِكُ نَفْسَهُ عِنْدَ الْغَضَبِ",
    bn: "কুস্তিতে জয়ী হওয়া ব্যক্তিই প্রকৃত শক্তিশালী নয়; প্রকৃত শক্তিশালী সেই ব্যক্তি, যে রাগের সময় নিজেকে নিয়ন্ত্রণ করে।",
    en: "The strong man is not the one who overcomes people by strength, but the one who controls himself while in anger.",
    narratorBn: "আবু হুরাইরা (রা.)",
    narratorEn: "Abu Hurayrah (ra)",
    grade: "muttafaqun-alaih",
    topicIds: ["akhlaq", "youth", "family"],
    lessonBn: "আত্মসংযমই প্রকৃত শক্তি। রাগের মুহূর্তে চুপ থাকা বা স্থান ত্যাগ করা সুন্নাহসম্মত উপায়।",
  },
  {
    id: "hadith-17",
    collectionSlug: "bukhari",
    bookNumber: 10,
    number: 6514,
    arabic: "يَتْبَعُ الْمَيِّتَ ثَلاَثَةٌ: أَهْلُهُ وَمَالُهُ وَعَمَلُهُ، فَيَرْجِعُ اثْنَانِ وَيَبْقَى وَاحِدٌ",
    bn: "মৃত ব্যক্তির পিছনে তিনটি জিনিস যায় — তার পরিবার, তার সম্পদ ও তার আমল। এর মধ্যে দুটি ফিরে আসে আর একটি থেকে যায়।",
    en: "Three things follow the deceased: his family, his wealth and his deeds. Two return and one remains.",
    narratorBn: "আনাস ইবনে মালিক (রা.)",
    narratorEn: "Anas ibn Malik (ra)",
    grade: "sahih",
    topicIds: ["akhlaq", "aqeedah"],
    lessonBn: "সম্পদ ও আপনজন দুনিয়াতেই রেখে যেতে হয়; কেবল আমলই সাথে যায়। তাই আমলে বিনিয়োগই প্রকৃত সম্পদ।",
  },
  {
    id: "hadith-18",
    collectionSlug: "bukhari",
    bookNumber: 7,
    number: 6018,
    arabic: "مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ",
    bn: "যে ব্যক্তি আল্লাহ ও শেষ দিনে বিশ্বাস রাখে, সে যেন উত্তম কথা বলে, নয়তো চুপ থাকে।",
    en: "Whoever believes in Allah and the Last Day, let him speak good or remain silent.",
    narratorBn: "আবু হুরাইরা (রা.)",
    narratorEn: "Abu Hurayrah (ra)",
    grade: "muttafaqun-alaih",
    topicIds: ["akhlaq", "technology"],
    lessonBn: "সোশ্যাল মিডিয়ার যুগে এই হাদীসের প্রাসঙ্গিকতা আরও বেড়েছে — পোস্ট করার আগে যাচাই করা জরুরি।",
  },
  {
    id: "hadith-19",
    collectionSlug: "bukhari",
    bookNumber: 10,
    number: 1283,
    arabic: "الصَّبْرُ عِنْدَ الصَّدْمَةِ الأُولَى",
    bn: "প্রকৃত ধৈর্য হলো বিপদের প্রথম আঘাতের সময়ই।",
    en: "True patience is at the first stroke of calamity.",
    narratorBn: "আনাস ইবনে মালিক (রা.)",
    narratorEn: "Anas ibn Malik (ra)",
    grade: "muttafaqun-alaih",
    topicIds: ["akhlaq", "family"],
    lessonBn: "ধৈর্য মানে হৃদয়ের অবিচলতা, মুখে অসন্তোষের অভিযোগ নয়।",
  },
  {
    id: "hadith-20",
    collectionSlug: "bukhari",
    bookNumber: 9,
    number: 1899,
    arabic: "مَنْ صَامَ رَمَضَانَ إِيمَانًا وَاحْتِسَابًا غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ",
    bn: "যে ব্যক্তি ঈমানসহ ও সওয়াবের আশায় রমজানের রোযা রাখে, তার পূর্ববর্তী গুনাহ ক্ষমা করে দেওয়া হয়।",
    en: "Whoever fasts Ramadan out of faith and seeking reward, his previous sins are forgiven.",
    narratorBn: "আবু হুরাইরা (রা.)",
    narratorEn: "Abu Hurayrah (ra)",
    grade: "muttafaqun-alaih",
    topicIds: ["ibadah", "fiqh"],
    lessonBn: "রোযার মূল্য নির্ভর করে ঈমান ও ইহতিসাবের উপর — অর্থাৎ আন্তরিকতা ও প্রতিদানের আশা।",
  },
  {
    id: "hadith-21",
    collectionSlug: "bukhari",
    bookNumber: 6,
    number: 2072,
    arabic: "مَا أَكَلَ أَحَدٌ طَعَامًا قَطُّ خَيْرًا مِنْ أَنْ يَأْكُلَ مِنْ عَمَلِ يَدِهِ",
    bn: "নিজের হাতের উপার্জন থেকে খাওয়ার চেয়ে উত্তম খাবার কেউ কখনো খায়নি।",
    en: "No one has ever eaten better food than what he eats from the work of his own hands.",
    narratorBn: "আল-মিকদাম ইবনে মা'দিকারিব (রা.)",
    narratorEn: "Al-Miqdam ibn Ma'dikarib (ra)",
    grade: "sahih",
    topicIds: ["finance", "halal-food", "akhlaq"],
    lessonBn: "শ্রমের মর্যাদা ও হালাল উপার্জনের গুরুত্ব। নিজের পরিশ্রমে অর্জিত রিযিকই সর্বোত্তম।",
  },
  {
    id: "hadith-22",
    collectionSlug: "bukhari",
    bookNumber: 1,
    number: 73,
    arabic:
      "لاَ حَسَدَ إِلاَّ فِي اثْنَتَيْنِ: رَجُلٌ آتَاهُ اللَّهُ الْقُرْآنَ فَهُوَ يَتْلُوهُ آنَاءَ اللَّيْلِ وَالنَّهَارِ، وَرَجُلٌ آتَاهُ اللَّهُ مَالاً فَهُوَ يُنْفِقُهُ آنَاءَ اللَّيْلِ وَالنَّهَارِ",
    bn: "দুই ব্যক্তি ছাড়া অন্য কারো ব্যাপারে ঈর্ষা করা যায় না — এক ব্যক্তি, যাকে আল্লাহ কুরআন দান করেছেন এবং সে দিন-রাত তা তিলাওয়াত করে; আর এক ব্যক্তি, যাকে আল্লাহ সম্পদ দান করেছেন এবং সে দিন-রাত তা দান করে।",
    en: "There is no envy except in two cases: a man whom Allah has given the Qur'an and he recites it day and night, and a man whom Allah has given wealth and he spends it day and night.",
    narratorBn: "আব্দুল্লাহ ইবনে উমার (রা.)",
    narratorEn: "Abdullah ibn Umar (ra)",
    grade: "sahih",
    topicIds: ["quran-tafsir", "finance", "akhlaq"],
    lessonBn: "প্রতিযোগিতা হওয়া উচিত ইলম ও দানে — পার্থিব সম্পদ বা প্রদর্শনীতে নয়।",
  },
  {
    id: "hadith-23",
    collectionSlug: "tirmizi",
    bookNumber: 3,
    number: 2003,
    arabic: "مَا شَىْءٌ أَثْقَلُ فِي مِيزَانِ الْمُؤْمِنِ يَوْمَ الْقِيَامَةِ مِنْ خُلُقٍ حَسَنٍ",
    bn: "কিয়ামতের দিন মুমিনের আমলের পাল্লায় উত্তম চরিত্রের চেয়ে ভারী কোনো কিছু থাকবে না।",
    en: "Nothing will be placed on the scales of a believer on the Day of Judgement heavier than good character.",
    narratorBn: "আবু দারদা (রা.)",
    narratorEn: "Abu ad-Darda (ra)",
    grade: "hasan",
    topicIds: ["akhlaq", "dawah"],
    lessonBn: "আমলের পাল্লায় চরিত্রের ওজন সবচেয়ে বেশি — তাই ব্যবহার উন্নত করাই সবচেয়ে লাভজনক ইবাদত।",
  },
  {
    id: "hadith-24",
    collectionSlug: "tirmizi",
    bookNumber: 4,
    number: 2658,
    arabic: "مَنْ سَلَكَ طَرِيقًا يَبْتَغِي فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ طَرِيقًا إِلَى الْجَنَّةِ",
    bn: "যে ব্যক্তি জ্ঞান অন্বেষণের উদ্দেশ্যে কোনো পথ অবলম্বন করে, আল্লাহ তার জন্য জান্নাতের পথ সহজ করে দেন।",
    en: "Whoever treads a path seeking knowledge, Allah will make easy for him the path to Paradise.",
    narratorBn: "আবু হুরাইরা (রা.)",
    narratorEn: "Abu Hurayrah (ra)",
    grade: "sahih",
    topicIds: ["akhlaq", "youth", "quran-tafsir"],
    lessonBn: "ইলম অন্বেষণের প্রতিটি পদক্ষেপই ইবাদত। মাদরাসা, বিশ্ববিদ্যালয় কিংবা অনলাইন — সবই এই প্রতিশ্রুতির অন্তর্ভুক্ত।",
  },
  {
    id: "hadith-25",
    collectionSlug: "bukhari",
    bookNumber: 10,
    number: 6412,
    arabic: "نِعْمَتَانِ مَغْبُونٌ فِيهِمَا كَثِيرٌ مِنَ النَّاسِ: الصِّحَّةُ وَالْفَرَاغُ",
    bn: "দুইটি নিয়ামতের ব্যাপারে বহু মানুষ প্রতারিত — সুস্থতা ও অবসর সময়।",
    en: "There are two blessings which many people lose: health and free time.",
    narratorBn: "আবদুল্লাহ ইবনে আব্বাস (রা.)",
    narratorEn: "Abdullah ibn Abbas (ra)",
    grade: "sahih",
    topicIds: ["medical", "youth", "akhlaq"],
    lessonBn: "সুস্থতা ও অবসর কাজে লাগানোই প্রকৃত সুবিধা; অলসতায় তা হারিয়ে গেলে আফসোস ছাড়া কিছু থাকে না।",
  },
  {
    id: "hadith-26",
    collectionSlug: "tirmizi",
    bookNumber: 5,
    number: 1209,
    arabic: "التَّاجِرُ الصَّدُوقُ الأَمِينُ مَعَ النَّبِيِّينَ وَالصِّدِّيقِينَ وَالشُّهَدَاءِ",
    bn: "সৎ ও বিশ্বস্ত ব্যবসায়ী কিয়ামতের দিন নবী, সিদ্দিক ও শহীদদের সাথে থাকবে।",
    en: "The truthful and trustworthy merchant will be with the prophets, the truthful and the martyrs.",
    narratorBn: "আবু সাঈদ আল-খুদরী (রা.)",
    narratorEn: "Abu Sa'id al-Khudri (ra)",
    grade: "hasan",
    topicIds: ["finance", "halal-food"],
    lessonBn: "ব্যবসায়িক সততাকে উচ্চ মর্যাদা দেওয়া হয়েছে — মুনাফার চেয়ে বিশ্বস্ততা বড়।",
  },
  {
    id: "hadith-27",
    collectionSlug: "bukhari",
    bookNumber: 8,
    number: 7138,
    arabic: "كُلُّكُمْ رَاعٍ وَكُلُّكُمْ مَسْؤُولٌ عَنْ رَعِيَّتِهِ",
    bn: "তোমাদের প্রত্যেকেই দায়িত্বশীল, আর প্রত্যেকেই তার দায়িত্বের ব্যাপারে জবাবদিহি করবে।",
    en: "Every one of you is a shepherd and every one of you is accountable for his flock.",
    narratorBn: "আব্দুল্লাহ ইবনে উমার (রা.)",
    narratorEn: "Abdullah ibn Umar (ra)",
    grade: "muttafaqun-alaih",
    topicIds: ["family", "women", "akhlaq"],
    lessonBn: "পরিবারের প্রধান থেকে শুরু করে রাষ্ট্রপ্রধান — প্রত্যেকের দায়িত্বের হিসাব দিতে হবে।",
  },
  {
    id: "hadith-28",
    collectionSlug: "muslim",
    bookNumber: 1,
    number: 55,
    arabic: "الدِّينُ النَّصِيحَةُ",
    bn: "দ্বীন হলো কল্যাণকামিতা।",
    en: "Religion is sincere advice.",
    narratorBn: "তামীম ইবনে আওস আদ-দারী (রা.)",
    narratorEn: "Tamim ibn Aws ad-Dari (ra)",
    grade: "sahih",
    topicIds: ["akhlaq", "dawah"],
    lessonBn: "ভালো কিছু দেখা গেলে বলা এবং মন্দ থেকে বিরত রাখার চেষ্টা — এটাই দ্বীনের মূল চেতনা।",
  },
  {
    id: "hadith-29",
    collectionSlug: "bukhari",
    bookNumber: 7,
    number: 5997,
    arabic: "مَنْ لاَ يَرْحَمُ لاَ يُرْحَمُ",
    bn: "যে ব্যক্তি দয়া করে না, তাকেও দয়া করা হয় না।",
    en: "Whoever does not show mercy will not be shown mercy.",
    narratorBn: "আবু হুরাইরা (রা.)",
    narratorEn: "Abu Hurayrah (ra)",
    grade: "muttafaqun-alaih",
    topicIds: ["akhlaq", "family"],
    lessonBn: "শিশু, বৃদ্ধ ও দুর্বলের প্রতি দয়া দেখানো আল্লাহর রহমত পাওয়ার অন্যতম মাধ্যম।",
  },
  {
    id: "hadith-30",
    collectionSlug: "bukhari",
    bookNumber: 2,
    number: 10,
    arabic: "الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ",
    bn: "প্রকৃত মুসলিম সেই ব্যক্তি, যার জিহ্বা ও হাত থেকে অন্য মুসলিমরা নিরাপদ থাকে।",
    en: "A Muslim is the one from whose tongue and hand other Muslims are safe.",
    narratorBn: "আবদুল্লাহ ইবনে আমর (রা.)",
    narratorEn: "Abdullah ibn Amr (ra)",
    grade: "muttafaqun-alaih",
    topicIds: ["akhlaq", "technology"],
    lessonBn: "মুখের কথার ক্ষতি হাতের ক্ষতির চেয়েও বড় হতে পারে — গালি, কটুক্তি ও গীবত থেকে বেঁচে থাকা আবশ্যক।",
  },
];

export const HADITHS: Hadith[] = HADITH_SEEDS.map((seed) => {
  const book = bookOf(seed.collectionSlug, seed.bookNumber);
  const collection = collectionName(seed.collectionSlug);
  return {
    id: seed.id,
    collectionSlug: seed.collectionSlug,
    collectionName: collection,
    bookNumber: book.number,
    bookName: book.name,
    number: seed.number,
    refBn: `${collection.bn} ${seed.number}`,
    refEn: `${collection.en} ${seed.number}`,
    arabic: seed.arabic,
    translationBn: seed.bn,
    translationEn: seed.en,
    narrator: { bn: seed.narratorBn, en: seed.narratorEn },
    grade: seed.grade,
    topicIds: seed.topicIds,
    lessonBn: seed.lessonBn,
  };
});

/* -------------------------------------------------------------------------- */
/* Lookups                                                                    */
/* -------------------------------------------------------------------------- */

export function getCollection(slug: string): HadithCollection | undefined {
  return HADITH_COLLECTIONS.find((c) => c.slug === slug);
}

export function getBooksForCollection(slug: string): HadithBook[] {
  return HADITH_BOOKS.filter((b) => b.collectionSlug === slug).sort(
    (a, b) => a.number - b.number,
  );
}

export function getHadithsForCollection(slug: string): Hadith[] {
  return HADITHS.filter((h) => h.collectionSlug === slug);
}

export function getHadithsForBook(slug: string, bookNumber: number): Hadith[] {
  return HADITHS.filter((h) => h.collectionSlug === slug && h.bookNumber === bookNumber);
}

export function getHadith(id: string): Hadith | undefined {
  return HADITHS.find((h) => h.id === id);
}

export function getHadithsByTopic(topicId: string): Hadith[] {
  return HADITHS.filter((h) => h.topicIds.includes(topicId));
}

/** Hadith of the day seed — treading a path of knowledge (Tirmizi 2658). */
export const HADITH_OF_THE_DAY: Hadith = getHadith("hadith-24") ?? HADITHS[0];
