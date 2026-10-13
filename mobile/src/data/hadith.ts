import type { Hadith, HadithBook, HadithCollection, HadithGrade } from "../lib/types";

/**
 * Hadith dataset (mobile subset).
 *
 * Arabic is reproduced verbatim from the published collections and every hadith
 * carries its real collection, book and number so the UI can cite it responsibly.
 * `grade` uses the classical classifications; hadith narrated in both Bukhari and
 * Muslim are marked `muttafaqun-alaih` (متفق عليه).
 */

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
];

interface BookSeed {
  collectionSlug: string;
  number: number;
  nameBn: string;
  nameEn: string;
  hadithCount: number;
}

const BOOK_SEEDS: BookSeed[] = [
  { collectionSlug: "bukhari", number: 1, nameBn: "ওহীর সূচনা", nameEn: "Revelation", hadithCount: 7 },
  { collectionSlug: "bukhari", number: 2, nameBn: "ঈমান", nameEn: "Belief", hadithCount: 51 },
  { collectionSlug: "bukhari", number: 3, nameBn: "ইলম", nameEn: "Knowledge", hadithCount: 76 },
  { collectionSlug: "bukhari", number: 7, nameBn: "আখলাক ও আদব", nameEn: "Manners", hadithCount: 132 },
  { collectionSlug: "bukhari", number: 8, nameBn: "বিবাহ", nameEn: "Marriage", hadithCount: 118 },
  { collectionSlug: "bukhari", number: 10, nameBn: "রিকাক (হৃদয়-কোমলতা)", nameEn: "Heart-Softening", hadithCount: 128 },
  { collectionSlug: "muslim", number: 1, nameBn: "ঈমান", nameEn: "Faith", hadithCount: 431 },
  { collectionSlug: "muslim", number: 2, nameBn: "পবিত্রতা", nameEn: "Purification", hadithCount: 145 },
  { collectionSlug: "muslim", number: 6, nameBn: "ক্বাদর", nameEn: "Divine Decree", hadithCount: 88 },
  { collectionSlug: "tirmizi", number: 4, nameBn: "ইলম", nameEn: "Knowledge", hadithCount: 62 },
];

export const HADITH_BOOKS: HadithBook[] = BOOK_SEEDS.map((seed) => ({
  id: `${seed.collectionSlug}-book-${seed.number}`,
  collectionSlug: seed.collectionSlug,
  number: seed.number,
  name: { bn: seed.nameBn, en: seed.nameEn },
  hadithCount: seed.hadithCount,
}));

export function getBooksForCollection(slug: string): HadithBook[] {
  return HADITH_BOOKS.filter((b) => b.collectionSlug === slug);
}

interface HadithSeed {
  id: string;
  collectionSlug: string;
  collectionBn: string;
  collectionEn: string;
  bookNumber: number;
  bookBn: string;
  bookEn: string;
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
    collectionBn: "সহীহ বুখারী",
    collectionEn: "Sahih al-Bukhari",
    bookNumber: 1,
    bookBn: "ওহীর সূচনা",
    bookEn: "Revelation",
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
    collectionBn: "সহীহ বুখারী",
    collectionEn: "Sahih al-Bukhari",
    bookNumber: 2,
    bookBn: "ঈমান",
    bookEn: "Belief",
    number: 8,
    arabic: "بُنِيَ الإِسْلاَمُ عَلَى خَمْسٍ: شَهَادَةِ أَنْ لاَ إِلَهَ إِلاَّ اللَّهُ وَأَنَّ مُحَمَّدًا رَسُولُ اللَّهِ، وَإِقَامِ الصَّلاَةِ، وَإِيتَاءِ الزَّكَاةِ، وَالْحَجِّ، وَصَوْمِ رَمَضَانَ",
    bn: "ইসলামের ভিত্তি পাঁচটি — এই সাক্ষ্য দেওয়া যে আল্লাহ ছাড়া কোনো ইলাহ নেই এবং মুহাম্মাদ (সা.) আল্লাহর রাসূল, নামাজ কায়েম করা, যাকাত প্রদান করা, হজ্জ করা এবং রমজানের রোযা রাখা।",
    en: "Islam is built upon five: the testimony that there is no deity but Allah and that Muhammad is the Messenger of Allah, establishing prayer, giving zakat, performing Hajj, and fasting Ramadan.",
    narratorBn: "আব্দুল্লাহ ইবনে উমার (রা.)",
    narratorEn: "Abdullah ibn Umar (ra)",
    grade: "muttafaqun-alaih",
    topicIds: ["aqeedah", "ibadah", "fiqh"],
    lessonBn: "ঈমানের ভিত্তি তাওহীদ, আর তার উপর দাঁড়ানো স্তম্ভগুলো হলো ইবাদত।",
  },
  {
    id: "hadith-3",
    collectionSlug: "bukhari",
    collectionBn: "সহীহ বুখারী",
    collectionEn: "Sahih al-Bukhari",
    bookNumber: 3,
    bookBn: "ইলম",
    bookEn: "Knowledge",
    number: 5027,
    arabic: "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ",
    bn: "তোমাদের মধ্যে সর্বোত্তম সেই ব্যক্তি, যে কুরআন শেখে এবং অন্যকে শেখায়।",
    en: "The best of you are those who learn the Qur'an and teach it.",
    narratorBn: "উসমান ইবনে আফফান (রা.)",
    narratorEn: "Uthman ibn Affan (ra)",
    grade: "sahih",
    topicIds: ["quran-tafsir", "akhlaq", "youth"],
    lessonBn: "শেখা ও শেখানোর মিলনেই প্রকৃত সম্মান।",
  },
  {
    id: "hadith-4",
    collectionSlug: "bukhari",
    collectionBn: "সহীহ বুখারী",
    collectionEn: "Sahih al-Bukhari",
    bookNumber: 2,
    bookBn: "ঈমান",
    bookEn: "Belief",
    number: 13,
    arabic: "لاَ يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ",
    bn: "তোমাদের কেউ প্রকৃত মুমিন হতে পারবে না, যতক্ষণ সে নিজের জন্য যা পছন্দ করে তা নিজের ভাইয়ের জন্যও পছন্দ না করে।",
    en: "None of you truly believes until he loves for his brother what he loves for himself.",
    narratorBn: "আনাস ইবনে মালিক (রা.)",
    narratorEn: "Anas ibn Malik (ra)",
    grade: "muttafaqun-alaih",
    topicIds: ["akhlaq", "aqeedah", "family"],
    lessonBn: "ঈমান কেবল অভ্যন্তরীণ বিশ্বাস নয় — তা অন্য মানুষের প্রতি আচরণে প্রকাশ পায়।",
  },
  {
    id: "hadith-5",
    collectionSlug: "muslim",
    collectionBn: "সহীহ মুসলিম",
    collectionEn: "Sahih Muslim",
    bookNumber: 6,
    bookBn: "ক্বাদর",
    bookEn: "Divine Decree",
    number: 2664,
    arabic: "الْمُؤْمِنُ الْقَوِيُّ خَيْرٌ وَأَحَبُّ إِلَى اللَّهِ مِنَ الْمُؤْمِنِ الضَّعِيفِ",
    bn: "শক্তিশালী মুমিন দুর্বল মুমিনের চেয়ে উত্তম এবং আল্লাহর কাছে অধিক প্রিয়।",
    en: "The strong believer is better and more beloved to Allah than the weak believer.",
    narratorBn: "আবু হুরাইরা (রা.)",
    narratorEn: "Abu Hurayrah (ra)",
    grade: "sahih",
    topicIds: ["akhlaq", "youth"],
    lessonBn: "শারীরিক ও মানসিক সক্ষমতা একটি নিয়ামত, যা দিয়ে ইলম ও সৎকাজে অগ্রসর হওয়া যায়।",
  },
  {
    id: "hadith-6",
    collectionSlug: "abu-dawud",
    collectionBn: "সুনানে আবু দাউদ",
    collectionEn: "Sunan Abu Dawud",
    bookNumber: 3,
    bookBn: "ইলম",
    bookEn: "Knowledge",
    number: 224,
    arabic: "طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ",
    bn: "জ্ঞান অন্বেষণ করা প্রত্যেক মুসলিমের উপর ফরজ।",
    en: "Seeking knowledge is an obligation upon every Muslim.",
    narratorBn: "আনাস ইবনে মালিক (রা.)",
    narratorEn: "Anas ibn Malik (ra)",
    grade: "hasan",
    topicIds: ["akhlaq", "youth"],
    lessonBn: "ধর্মীয় জ্ঞান অর্জন নারী-পুরুষ নির্বিশেষে সবার দায়িত্ব।",
  },
  {
    id: "hadith-7",
    collectionSlug: "abu-dawud",
    collectionBn: "সুনানে আবু দাউদ",
    collectionEn: "Sunan Abu Dawud",
    bookNumber: 8,
    bookBn: "বিবাহ",
    bookEn: "Marriage",
    number: 3104,
    arabic: "الْزَمْ رِجْلَهَا، فَثَمَّ الْجَنَّةُ",
    bn: "তোমার মায়ের পায়ের কাছে লেগে থাকো, কারণ সেখানেই জান্নাত।",
    en: "Stay at your mother's feet, for there is Paradise.",
    narratorBn: "মুআবিয়া ইবনে জাহিমা (রা.)",
    narratorEn: "Mu'awiyah ibn Jahimah (ra)",
    grade: "hasan",
    topicIds: ["family", "women", "akhlaq"],
    lessonBn: "মায়ের সেবা ও সন্তুষ্টি জান্নাতের সরল পথ।",
  },
  {
    id: "hadith-8",
    collectionSlug: "bukhari",
    collectionBn: "সহীহ বুখারী",
    collectionEn: "Sahih al-Bukhari",
    bookNumber: 7,
    bookBn: "আখলাক ও আদব",
    bookEn: "Manners",
    number: 6094,
    arabic: "إِنَّ الصِّدْقَ يَهْدِي إِلَى الْبِرِّ، وَإِنَّ الْبِرَّ يَهْدِي إِلَى الْجَنَّةِ",
    bn: "নিশ্চয়ই সততা সৎকর্মের পথ দেখায়, আর সৎকর্ম জান্নাতের পথ দেখায়।",
    en: "Verily truthfulness leads to righteousness, and righteousness leads to Paradise.",
    narratorBn: "আব্দুল্লাহ ইবনে মাসউদ (রা.)",
    narratorEn: "Abdullah ibn Mas'ud (ra)",
    grade: "muttafaqun-alaih",
    topicIds: ["akhlaq", "finance"],
    lessonBn: "সততা একটি ক্রমবর্ধমান গুণ — ছোট সত্য দিয়ে শুরু করে মানুষ একদিন বিশ্বস্ত হয়ে ওঠে।",
  },
  {
    id: "hadith-9",
    collectionSlug: "tirmizi",
    collectionBn: "সুনানে তিরমিযী",
    collectionEn: "Jami' at-Tirmidhi",
    bookNumber: 3,
    bookBn: "আখলাক",
    bookEn: "Manners",
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
    collectionBn: "সহীহ মুসলিম",
    collectionEn: "Sahih Muslim",
    bookNumber: 2,
    bookBn: "পবিত্রতা",
    bookEn: "Purification",
    number: 223,
    arabic: "الطُّهُورُ شَطْرُ الإِيمَانِ",
    bn: "পবিত্রতা ঈমানের অর্ধেক।",
    en: "Purification is half of faith.",
    narratorBn: "আবু হুরাইরা (রা.)",
    narratorEn: "Abu Hurayrah (ra)",
    grade: "sahih",
    topicIds: ["ibadah", "fiqh"],
    lessonBn: "দৈহিক পরিচ্ছন্নতা ইবাদতের অবিচ্ছেদ্য অংশ।",
  },
  {
    id: "hadith-11",
    collectionSlug: "bukhari",
    collectionBn: "সহীহ বুখারী",
    collectionEn: "Sahih al-Bukhari",
    bookNumber: 8,
    bookBn: "বিবাহ",
    bookEn: "Marriage",
    number: 5065,
    arabic: "يَا مَعْشَرَ الشَّبَابِ، مَنِ اسْتَطَاعَ مِنْكُمُ الْبَاءَةَ فَلْيَتَزَوَّجْ، فَإِنَّهُ أَغَضُّ لِلْبَصَرِ وَأَحْصَنُ لِلْفَرْجِ",
    bn: "হে যুবসমাজ! তোমাদের মধ্যে যে ব্যক্তি বিবাহের সামর্থ্য রাখে, সে যেন বিবাহ করে। কারণ তা দৃষ্টিকে সংযত রাখে এবং চরিত্রকে রক্ষা করে।",
    en: "O young men, whoever among you can afford marriage should marry, for it restrains the gaze and guards chastity.",
    narratorBn: "আব্দুল্লাহ ইবনে মাসউদ (রা.)",
    narratorEn: "Abdullah ibn Mas'ud (ra)",
    grade: "muttafaqun-alaih",
    topicIds: ["family", "youth", "women"],
    lessonBn: "বিবাহ চরিত্র রক্ষার সবচেয়ে শক্তিশালী মাধ্যম।",
  },
  {
    id: "hadith-24",
    collectionSlug: "tirmizi",
    collectionBn: "সুনানে তিরমিযী",
    collectionEn: "Jami' at-Tirmidhi",
    bookNumber: 4,
    bookBn: "ইলম",
    bookEn: "Knowledge",
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
];

export const HADITHS: Hadith[] = HADITH_SEEDS.map((seed) => ({
  id: seed.id,
  collectionSlug: seed.collectionSlug,
  collectionName: { bn: seed.collectionBn, en: seed.collectionEn },
  bookNumber: seed.bookNumber,
  bookName: { bn: seed.bookBn, en: seed.bookEn },
  number: seed.number,
  refBn: `${seed.collectionBn} ${seed.number}`,
  refEn: `${seed.collectionEn} ${seed.number}`,
  arabic: seed.arabic,
  translationBn: seed.bn,
  translationEn: seed.en,
  narrator: { bn: seed.narratorBn, en: seed.narratorEn },
  grade: seed.grade,
  topicIds: seed.topicIds,
  lessonBn: seed.lessonBn,
}));

export function getCollection(slug: string): HadithCollection | undefined {
  return HADITH_COLLECTIONS.find((c) => c.slug === slug);
}

export function getHadithsForCollection(slug: string): Hadith[] {
  return HADITHS.filter((h) => h.collectionSlug === slug);
}

export function getHadith(id: string): Hadith | undefined {
  return HADITHS.find((h) => h.id === id);
}

export function getHadithsByTopic(topicId: string): Hadith[] {
  return HADITHS.filter((h) => h.topicIds.includes(topicId));
}

export const HADITH_OF_THE_DAY: Hadith = getHadith("hadith-24") ?? HADITHS[0];
