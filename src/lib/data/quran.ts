import type { QuranAyah, QuranSurah, RevelationPlace } from "@/lib/types";

/**
 * Qur'an dataset.
 *
 * IMPORTANT: the Arabic text below is the actual Qur'anic text and must never be
 * machine-generated or "roughly remembered" — it is reproduced verbatim and only
 * for surahs whose text is available locally. Any surah without text carries
 * `hasText: false`, which makes the reader show an honest "not added yet" state
 * instead of fabricating an ayah.
 *
 * Translations follow the style of the Islamic Foundation Bangladesh Bangla
 * translation, with a Bengali transliteration (উচ্চারণ) aid because a large share
 * of Bangladeshi readers recite from transliteration rather than Arabic script.
 */

interface SurahSeed {
  number: number;
  slug: string;
  nameArabic: string;
  nameBn: string;
  nameEn: string;
  meaningBn: string;
  meaningEn: string;
  ayahCount: number;
  revelation: RevelationPlace;
  juz: number;
  aboutBn?: string;
}

const SURAH_SEEDS: SurahSeed[] = [
  { number: 1, slug: "al-fatihah", nameArabic: "ٱلْفَاتِحَة", nameBn: "আল-ফাতিহা", nameEn: "Al-Fatihah", meaningBn: "সূচনা", meaningEn: "The Opening", ayahCount: 7, revelation: "meccan", juz: 1, aboutBn: "কুরআনের প্রথম সূরা, যা প্রতিটি নামাজে recited হয়। একে 'উম্মুল কুরআন' (কুরআনের মা) বলা হয়।" },
  { number: 2, slug: "al-baqarah", nameArabic: "ٱلْبَقَرَة", nameBn: "আল-বাকারা", nameEn: "Al-Baqarah", meaningBn: "গাভী", meaningEn: "The Cow", ayahCount: 286, revelation: "medinan", juz: 1, aboutBn: "কুরআনের দীর্ঘতম সূরা। এতে রয়েছে আয়াতুল কুরসি এবং বহু ফিকহি বিধান।" },
  { number: 3, slug: "ali-imran", nameArabic: "آل عِمْرَان", nameBn: "আলে-ইমরান", nameEn: "Ali 'Imran", meaningBn: "ইমরান পরিবার", meaningEn: "Family of Imran", ayahCount: 200, revelation: "medinan", juz: 3 },
  { number: 4, slug: "an-nisa", nameArabic: "ٱلنِّسَاء", nameBn: "আন-নিসা", nameEn: "An-Nisa", meaningBn: "নারী", meaningEn: "The Women", ayahCount: 176, revelation: "medinan", juz: 4, aboutBn: "উত্তরাধিকার, বিবাহ ও পারিবারিক বিধান সম্বলিত সূরা।" },
  { number: 5, slug: "al-maidah", nameArabic: "ٱلْمَائِدَة", nameBn: "আল-মায়িদা", nameEn: "Al-Ma'idah", meaningBn: "খাদ্যপূর্ণ টেবিল", meaningEn: "The Table Spread", ayahCount: 120, revelation: "medinan", juz: 6 },
  { number: 6, slug: "al-anam", nameArabic: "ٱلْأَنْعَام", nameBn: "আল-আনআম", nameEn: "Al-An'am", meaningBn: "গবাদি পশু", meaningEn: "The Cattle", ayahCount: 165, revelation: "meccan", juz: 7 },
  { number: 7, slug: "al-araf", nameArabic: "ٱلْأَعْرَاف", nameBn: "আল-আরাফ", nameEn: "Al-A'raf", meaningBn: "উঁচু স্থান", meaningEn: "The Heights", ayahCount: 206, revelation: "meccan", juz: 8 },
  { number: 8, slug: "al-anfal", nameArabic: "ٱلْأَنفَال", nameBn: "আল-আনফাল", nameEn: "Al-Anfal", meaningBn: "যুদ্ধলব্ধ সম্পদ", meaningEn: "The Spoils of War", ayahCount: 75, revelation: "medinan", juz: 9 },
  { number: 9, slug: "at-tawbah", nameArabic: "ٱلتَّوْبَة", nameBn: "আত-তাওবা", nameEn: "At-Tawbah", meaningBn: "অনুতাপ", meaningEn: "The Repentance", ayahCount: 129, revelation: "medinan", juz: 10 },
  { number: 10, slug: "yunus", nameArabic: "يُونُس", nameBn: "ইউনুস", nameEn: "Yunus", meaningBn: "ইউনুস", meaningEn: "Jonah", ayahCount: 109, revelation: "meccan", juz: 11 },
  { number: 11, slug: "hud", nameArabic: "هُود", nameBn: "হুদ", nameEn: "Hud", meaningBn: "হুদ", meaningEn: "Hud", ayahCount: 123, revelation: "meccan", juz: 11 },
  { number: 12, slug: "yusuf", nameArabic: "يُوسُف", nameBn: "ইউসুফ", nameEn: "Yusuf", meaningBn: "ইউসুফ", meaningEn: "Joseph", ayahCount: 111, revelation: "meccan", juz: 12, aboutBn: "সম্পূর্ণ একটি সূরা যা একটিমাত্র কাহিনী — ইউসুফ (আ.)-এর জীবনী।" },
  { number: 13, slug: "ar-rad", nameArabic: "ٱلرَّعْد", nameBn: "আর-রাদ", nameEn: "Ar-Ra'd", meaningBn: "বজ্রপাত", meaningEn: "The Thunder", ayahCount: 43, revelation: "medinan", juz: 13 },
  { number: 14, slug: "ibrahim", nameArabic: "إِبْرَاهِيم", nameBn: "ইব্রাহীম", nameEn: "Ibrahim", meaningBn: "ইব্রাহীম", meaningEn: "Abraham", ayahCount: 52, revelation: "meccan", juz: 13 },
  { number: 15, slug: "al-hijr", nameArabic: "ٱلْحِجْر", nameBn: "আল-হিজর", nameEn: "Al-Hijr", meaningBn: "পাথুরে পাহাড়", meaningEn: "The Rocky Tract", ayahCount: 99, revelation: "meccan", juz: 14 },
  { number: 16, slug: "an-nahl", nameArabic: "ٱلنَّحْل", nameBn: "আন-নাহল", nameEn: "An-Nahl", meaningBn: "মধুমক্ষিকা", meaningEn: "The Bee", ayahCount: 128, revelation: "meccan", juz: 14 },
  { number: 17, slug: "al-isra", nameArabic: "ٱلْإِسْرَاء", nameBn: "আল-ইসরা", nameEn: "Al-Isra", meaningBn: "রাত্রিভ্রমণ", meaningEn: "The Night Journey", ayahCount: 111, revelation: "meccan", juz: 15 },
  { number: 18, slug: "al-kahf", nameArabic: "ٱلْكَهْف", nameBn: "আল-কাহফ", nameEn: "Al-Kahf", meaningBn: "গুহা", meaningEn: "The Cave", ayahCount: 110, revelation: "meccan", juz: 15, aboutBn: "প্রতি শুক্রবার পাঠের ফজিলত রয়েছে। এতে চারটি শিক্ষণীয় কাহিনী রয়েছে।" },
  { number: 19, slug: "maryam", nameArabic: "مَرْيَم", nameBn: "মারইয়াম", nameEn: "Maryam", meaningBn: "মারইয়াম", meaningEn: "Mary", ayahCount: 98, revelation: "meccan", juz: 16 },
  { number: 20, slug: "taha", nameArabic: "طه", nameBn: "ত্বা-হা", nameEn: "Taha", meaningBn: "ত্বা-হা", meaningEn: "Ta-Ha", ayahCount: 135, revelation: "meccan", juz: 16 },
  { number: 21, slug: "al-anbiya", nameArabic: "ٱلْأَنْبِيَاء", nameBn: "আল-আম্বিয়া", nameEn: "Al-Anbiya", meaningBn: "নবীগণ", meaningEn: "The Prophets", ayahCount: 112, revelation: "meccan", juz: 17 },
  { number: 22, slug: "al-hajj", nameArabic: "ٱلْحَجّ", nameBn: "আল-হাজ্জ", nameEn: "Al-Hajj", meaningBn: "হজ্জ", meaningEn: "The Pilgrimage", ayahCount: 78, revelation: "medinan", juz: 17 },
  { number: 23, slug: "al-muminun", nameArabic: "ٱلْمُؤْمِنُون", nameBn: "আল-মুমিনূন", nameEn: "Al-Mu'minun", meaningBn: "মুমিনগণ", meaningEn: "The Believers", ayahCount: 118, revelation: "meccan", juz: 18 },
  { number: 24, slug: "an-nur", nameArabic: "ٱلنُّور", nameBn: "আন-নূর", nameEn: "An-Nur", meaningBn: "আলো", meaningEn: "The Light", ayahCount: 64, revelation: "medinan", juz: 18 },
  { number: 25, slug: "al-furqan", nameArabic: "ٱلْفُرْقَان", nameBn: "আল-ফুরকান", nameEn: "Al-Furqan", meaningBn: "সত্য-মিথ্যার পার্থক্যকারী", meaningEn: "The Criterion", ayahCount: 77, revelation: "meccan", juz: 18 },
  { number: 26, slug: "ash-shuara", nameArabic: "ٱلشُّعَرَاء", nameBn: "আশ-শুআরা", nameEn: "Ash-Shu'ara", meaningBn: "কবিগণ", meaningEn: "The Poets", ayahCount: 227, revelation: "meccan", juz: 19 },
  { number: 27, slug: "an-naml", nameArabic: "ٱلنَّمْل", nameBn: "আন-নামল", nameEn: "An-Naml", meaningBn: "পিপীলিকা", meaningEn: "The Ant", ayahCount: 93, revelation: "meccan", juz: 19 },
  { number: 28, slug: "al-qasas", nameArabic: "ٱلْقَصَص", nameBn: "আল-কাসাস", nameEn: "Al-Qasas", meaningBn: "কাহিনী", meaningEn: "The Stories", ayahCount: 88, revelation: "meccan", juz: 20 },
  { number: 29, slug: "al-ankabut", nameArabic: "ٱلْعَنكَبُوت", nameBn: "আল-আনকাবূত", nameEn: "Al-Ankabut", meaningBn: "মাকড়সা", meaningEn: "The Spider", ayahCount: 69, revelation: "meccan", juz: 20 },
  { number: 30, slug: "ar-rum", nameArabic: "ٱلرُّوم", nameBn: "আর-রূম", nameEn: "Ar-Rum", meaningBn: "রোমীয়গণ", meaningEn: "The Romans", ayahCount: 60, revelation: "meccan", juz: 21 },
  { number: 36, slug: "yaseen", nameArabic: "يس", nameBn: "ইয়াসীন", nameEn: "Yaseen", meaningBn: "ইয়াসীন", meaningEn: "Ya-Sin", ayahCount: 83, revelation: "meccan", juz: 22, aboutBn: "কুরআনের হৃদয় বলা হয়। বাংলাদেশে মৃত ব্যক্তির জন্য ও গুরুত্বপূর্ণ সময়ে পাঠের প্রচলন রয়েছে।" },
  { number: 39, slug: "az-zumar", nameArabic: "ٱلزُّمَر", nameBn: "আজ-জুমার", nameEn: "Az-Zumar", meaningBn: "দলবদ্ধ জনতা", meaningEn: "The Troops", ayahCount: 75, revelation: "meccan", juz: 23, aboutBn: "আল্লাহর কাছে খাঁটি ইবাদতের আহ্বান ও তাঁর রহমত থেকে নিরাশ না হওয়ার বার্তাসমৃদ্ধ সূরা।" },
  { number: 40, slug: "ghafir", nameArabic: "غَافِر", nameBn: "গাফির", nameEn: "Ghafir", meaningBn: "ক্ষমাশীল", meaningEn: "The Forgiver", ayahCount: 85, revelation: "meccan", juz: 24, aboutBn: "মুমিন ব্যক্তির দৃঢ়তার কাহিনী এবং দুআ কবুল হওয়ার প্রতিশ্রুতি রয়েছে এতে।" },
  { number: 55, slug: "ar-rahman", nameArabic: "ٱلرَّحْمَٰن", nameBn: "আর-রাহমান", nameEn: "Ar-Rahman", meaningBn: "পরম করুণাময়", meaningEn: "The Most Merciful", ayahCount: 78, revelation: "medinan", juz: 27, aboutBn: "আল্লাহর নিয়ামতের বিবরণে পূর্ণ। 'فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ' আয়াতটি ৩১ বার এসেছে।" },
  { number: 65, slug: "at-talaq", nameArabic: "ٱلطَّلَاق", nameBn: "আত-তালাক", nameEn: "At-Talaq", meaningBn: "তালাক", meaningEn: "Divorce", ayahCount: 12, revelation: "medinan", juz: 28, aboutBn: "তালাক ও ইদ্দতের বিধান এবং তাকওয়ার পুরস্কার — 'যে আল্লাহকে ভয় করে তিনি তার জন্য উত্তরণের পথ করে দেন' — এতে বর্ণিত।" },
  { number: 67, slug: "al-mulk", nameArabic: "ٱلْمُلْك", nameBn: "আল-মুলক", nameEn: "Al-Mulk", meaningBn: "রাজত্ব", meaningEn: "The Sovereignty", ayahCount: 30, revelation: "meccan", juz: 29, aboutBn: "রাতে পাঠের বিশেষ ফজিলত বর্ণিত হয়েছে; কবরের শাস্তি থেকে রক্ষা করে।" },
  { number: 94, slug: "ash-sharh", nameArabic: "ٱلشَّرْح", nameBn: "আশ-শারহ", nameEn: "Ash-Sharh", meaningBn: "প্রশস্তকরণ", meaningEn: "The Relief", ayahCount: 8, revelation: "meccan", juz: 30, aboutBn: "কষ্টের পর স্বস্তির প্রতিশ্রুতি। কঠিন সময়ে এই সূরাটি পাঠ অন্তরকে শক্তি দেয়।" },
  { number: 112, slug: "al-ikhlas", nameArabic: "ٱلْإِخْلَاص", nameBn: "আল-ইখলাস", nameEn: "Al-Ikhlas", meaningBn: "একনিষ্ঠতা", meaningEn: "Sincerity", ayahCount: 4, revelation: "meccan", juz: 30, aboutBn: "কুরআনের এক-তৃতীয়াংশের সমান ফজিলত বলা হয়েছে এই সূরার।" },
  { number: 113, slug: "al-falaq", nameArabic: "ٱلْفَلَق", nameBn: "আল-ফালাক", nameEn: "Al-Falaq", meaningBn: "ভোর", meaningEn: "The Daybreak", ayahCount: 5, revelation: "meccan", juz: 30 },
  { number: 114, slug: "an-nas", nameArabic: "ٱلنَّاس", nameBn: "আন-নাস", nameEn: "An-Nas", meaningBn: "মানুষ", meaningEn: "Mankind", ayahCount: 6, revelation: "meccan", juz: 30 },
];

/** Surahs whose text is present in QURAN_AYAHS. */
const SURAHS_WITH_TEXT = new Set([1, 2, 3, 13, 17, 18, 36, 39, 40, 55, 65, 67, 94, 112, 113, 114]);

export const QURAN_SURAHS: QuranSurah[] = SURAH_SEEDS.map((seed) => ({
  number: seed.number,
  slug: seed.slug,
  nameArabic: seed.nameArabic,
  name: { bn: seed.nameBn, en: seed.nameEn },
  meaning: { bn: seed.meaningBn, en: seed.meaningEn },
  ayahCount: seed.ayahCount,
  revelation: seed.revelation,
  hasText: SURAHS_WITH_TEXT.has(seed.number),
  juz: seed.juz,
  about: seed.aboutBn ? { bn: seed.aboutBn, en: "" } : undefined,
}));

/* -------------------------------------------------------------------------- */
/* Ayah text                                                                  */
/* -------------------------------------------------------------------------- */

interface AyahSeed {
  surah: number;
  number: number;
  arabic: string;
  bn: string;
  en: string;
  pron: string;
  tafsirBn?: string;
  sajda?: boolean;
}

const AYAH_SEEDS: AyahSeed[] = [
  /* ---------------- 1. Al-Fatihah ---------------- */
  {
    surah: 1,
    number: 1,
    arabic: "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
    bn: "পরম করুণাময়, অসীম দয়ালু আল্লাহর নামে শুরু করছি।",
    en: "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
    pron: "বিসমিল্লা-হির রাহমা-নির রাহীম।",
    tafsirBn: "প্রতিটি সৎকর্ম শুরু করার আগে আল্লাহর নাম নেওয়া সুন্নত। এই বাক্যে আল্লাহর দুইটি গুণ প্রকাশ পায় — রাহমান (সবার প্রতি দয়ালু) ও রাহীম (মুমিনদের প্রতি বিশেষ দয়ালু)।",
  },
  {
    surah: 1,
    number: 2,
    arabic: "ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ",
    bn: "সমস্ত প্রশংসা আল্লাহর, যিনি সমস্ত জগতের প্রতিপালক।",
    en: "All praise is due to Allah, Lord of the worlds.",
    pron: "আলহামদু লিল্লা-হি রাব্বিল আ-লামীন।",
    tafsirBn: "'রাব্ব' অর্থ প্রতিপালক ও লালন-পালনকারী। প্রশংসা কেবল আল্লাহর জন্যই নির্দিষ্ট, কারণ তিনি একাই সবকিছু সৃষ্টি করেন, রিযিক দেন ও পরিচালনা করেন।",
  },
  {
    surah: 1,
    number: 3,
    arabic: "ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
    bn: "যিনি পরম করুণাময়, অসীম দয়ালু।",
    en: "The Entirely Merciful, the Especially Merciful.",
    pron: "আর-রাহমা-নির রাহীম।",
    tafsirBn: "আগের আয়াতে প্রশংসার কথা আসার পর দয়ার কথা পুনরায় উল্লেখ করে বোঝানো হয়েছে — আল্লাহর রহমত তাঁর ক্রোধের চেয়ে অগ্রগামী।",
  },
  {
    surah: 1,
    number: 4,
    arabic: "مَٰلِكِ يَوْمِ ٱلدِّينِ",
    bn: "যিনি বিচার দিনের মালিক।",
    en: "Sovereign of the Day of Recompense.",
    pron: "মা-লিকি ইয়াওমিদ্দীন।",
    tafsirBn: "কিয়ামতের দিনে কোনো ক্ষমতা আল্লাহ ছাড়া অন্য কারো থাকবে না। এই বিশ্বাস মানুষকে গোপন পাপ থেকেও বিরত রাখে।",
  },
  {
    surah: 1,
    number: 5,
    arabic: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
    bn: "আমরা কেবল তোমারই ইবাদত করি এবং কেবল তোমারই সাহায্য প্রার্থনা করি।",
    en: "It is You we worship and You we ask for help.",
    pron: "ইয়্যা-কা না'বুদু ওয়া ইয়্যা-কা নাসতাঈন।",
    tafsirBn: "আয়াতে 'ইয়্যাকা' (কেবল তোমাকে) আগে উল্লেখ করা হয়েছে, যার অর্থ ইবাদত ও সাহায্য — দুটোই একমাত্র আল্লাহর জন্য নির্দিষ্ট। শিরকের মূল উৎপাটন এখানেই।",
  },
  {
    surah: 1,
    number: 6,
    arabic: "ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ",
    bn: "আমাদেরকে সরল পথ দেখাও।",
    en: "Guide us to the straight path.",
    pron: "ইহদিনাস সিরা-তাল মুসতাকীম।",
    tafsirBn: "'সিরাতে মুস্তাকীম' হলো সেই পথ যা আল্লাহর সন্তুষ্টির দিকে নিয়ে যায় — অর্থাৎ ইসলামের স্পষ্ট পথ। প্রতিদিন অন্তত সতেরোবার এই দুআ করা প্রতিটি মুসলিমের কর্তব্য।",
  },
  {
    surah: 1,
    number: 7,
    arabic: "صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ",
    bn: "তাদের পথ, যাদের উপর তুমি অনুগ্রহ করেছ — তাদের পথ নয়, যারা অভিশপ্ত হয়েছে এবং যারা পথভ্রষ্ট হয়েছে।",
    en: "The path of those upon whom You have bestowed favour, not of those who have evoked anger or of those who are astray.",
    pron: "সিরা-তাল্লাযীনা আনআমতা আলাইহিম, গাইরিল মাগদূবি আলাইহিম ওয়ালাদ্দোয়া-ল্লীন।",
    tafsirBn: "অনুগ্রহপ্রাপ্তরা হলেন নবী, সিদ্দিক, শহীদ ও সৎকর্মপরায়ণ মানুষ। অভিশপ্ত বলা হয়েছে তাদের, যারা জেনেও সত্য অস্বীকার করেছে; আর পথভ্রষ্ট তারা, যারা না জেনে ভুল পথে চলেছে।",
  },

  /* ---------------- 2. Al-Baqarah 1-5 ---------------- */
  {
    surah: 2,
    number: 1,
    arabic: "الٓمٓ",
    bn: "আলিফ-লাম-মীম।",
    en: "Alif, Lam, Meem.",
    pron: "আলিফ লা-ম মীম।",
  },
  {
    surah: 2,
    number: 2,
    arabic: "ذَٰلِكَ ٱلْكِتَٰبُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِّلْمُتَّقِينَ",
    bn: "এই কিতাবের মধ্যে কোনো সন্দেহ নেই; এটি মুত্তাকীদের জন্য হিদায়াত।",
    en: "This is the Book about which there is no doubt, a guidance for those conscious of Allah.",
    pron: "যা-লিকাল কিতা-বু লা- রাইবা ফীহ, হুদাল লিল মুত্তাকীন।",
  },
  {
    surah: 2,
    number: 3,
    arabic: "ٱلَّذِينَ يُؤْمِنُونَ بِٱلْغَيْبِ وَيُقِيمُونَ ٱلصَّلَوٰةَ وَمِمَّا رَزَقْنَٰهُمْ يُنفِقُونَ",
    bn: "যারা অদৃশ্যে বিশ্বাস করে, নামাজ কায়েম করে এবং আমি তাদের যে রিযিক দিয়েছি তা থেকে দান করে।",
    en: "Who believe in the unseen, establish prayer, and spend out of what We have provided for them.",
    pron: "আল্লাযীনা ইউ'মিনূনা বিল গাইবি ওয়া ইউকীমূনাস সলা-তা, ওয়া মিম্মা- রাযাকনা-হুম ইউনফিকূন।",
  },
  {
    surah: 2,
    number: 4,
    arabic: "وَٱلَّذِينَ يُؤْمِنُونَ بِمَآ أُنزِلَ إِلَيْكَ وَمَآ أُنزِلَ مِن قَبْلِكَ وَبِٱلْآخِرَةِ هُمْ يُوقِنُونَ",
    bn: "আর যারা বিশ্বাস করে, যা তোমার প্রতি নাযিল করা হয়েছে এবং যা তোমার পূর্বে নাযিল করা হয়েছে; আর আখিরাতের ব্যাপারে তারা নিশ্চিত বিশ্বাসী।",
    en: "And who believe in what has been revealed to you and what was revealed before you, and of the Hereafter they are certain.",
    pron: "ওয়াল্লাযীনা ইউ'মিনূনা বিমা- উনযিলা ইলাইকা ওয়া মা- উনযিলা মিন কাবলিকা, ওয়া বিল আ-খিরাতি হুম ইউকিনূন।",
  },
  {
    surah: 2,
    number: 5,
    arabic: "أُوْلَٰئِكَ عَلَىٰ هُدًى مِّن رَّبِّهِمْ ۖ وَأُوْلَٰئِكَ هُمُ ٱلْمُفْلِحُونَ",
    bn: "তারাই তাদের প্রতিপালকের পক্ষ থেকে হিদায়াতের উপর প্রতিষ্ঠিত এবং তারাই সফলকাম।",
    en: "Those are upon guidance from their Lord, and it is those who are the successful.",
    pron: "উলাইকা আলা- হুদাম মির রাব্বিহিম, ওয়া উলাইকা হুমুল মুফলিহূন।",
  },

  /* ---------------- 2:255 Ayatul Kursi ---------------- */
  {
    surah: 2,
    number: 255,
    arabic:
      "ٱللَّهُ لَآ إِلَٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ ۚ لَا تَأْخُذُهُۥ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُۥ مَا فِى ٱلسَّمَٰوَٰتِ وَمَا فِى ٱلْأَرْضِ ۗ مَن ذَا ٱلَّذِى يَشْفَعُ عِندَهُۥٓ إِلَّا بِإِذْنِهِۦ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَىْءٍ مِّنْ عِلْمِهِۦٓ إِلَّا بِمَا شَآءَ ۚ وَسِعَ كُرْسِيُّهُ ٱلسَّمَٰوَٰتِ وَٱلْأَرْضَ ۖ وَلَا يَئُودُهُۥ حِفْظُهُمَا ۚ وَهُوَ ٱلْعَلِىُّ ٱلْعَظِيمُ",
    bn: "আল্লাহ — তিনি ছাড়া কোনো সত্য ইলাহ নেই। তিনি চিরঞ্জীব, সবকিছুর ধারক। তন্দ্রা বা নিদ্রা তাঁকে স্পর্শ করে না। আসমান ও জমিনে যা কিছু আছে সবই তাঁর। কে আছে যে তাঁর অনুমতি ছাড়া তাঁর কাছে সুপারিশ করবে? তিনি জানেন তাদের সামনে ও পিছনে যা কিছু আছে। তারা তাঁর জ্ঞানের কিছুই আয়ত্ত করতে পারে না, কেবল যতটা তিনি চান। তাঁর কুরসি আসমান ও জমিন পরিব্যাপ্ত করে আছে এবং এ দুটি রক্ষা করা তাঁর জন্য কষ্টকর নয়। তিনি সুউচ্চ, মহান।",
    en: "Allah — there is no deity except Him, the Ever-Living, the Sustainer of existence. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in the heavens and whatever is on the earth. Who is it that can intercede with Him except by His permission? He knows what is before them and what will be after them, and they encompass not a thing of His knowledge except for what He wills. His Kursi extends over the heavens and the earth, and their preservation tires Him not. And He is the Most High, the Most Great.",
    pron:
      "আল্লা-হু লা- ইলা-হা ইল্লা- হুওয়াল হাইয়্যুল কাইয়্যূম। লা- তা'খুযুহূ সিনাতুও ওয়ালা- নাউম। লাহূ মা- ফিস সামা-ওয়া-তি ওয়া মা- ফিল আরদ। মান যাল্লাযী ইয়াশফাউ ইনদাহূ ইল্লা- বিইযনিহ। ইয়া'লামু মা- বাইনা আইদীহিম ওয়া মা- খলফাহুম, ওয়ালা- ইউহীতূনা বিশাইইম মিন ইলমিহী ইল্লা- বিমা- শা-আ। ওয়াসিআ কুরসিয়্যুহুস সামা-ওয়া-তি ওয়াল আরদ, ওয়ালা- ইয়াঊদুহূ হিফযুহুমা-। ওয়া হুওয়াল আলিয়্যুল আযীম।",
    tafsirBn:
      "আয়াতুল কুরসি কুরআনের সর্বশ্রেষ্ঠ আয়াত। ইমাম বুখারী (রহ.) বর্ণনা করেন, রাসূলুল্লাহ (সা.) উবাই ইবনে কা'ব (রা.)-কে জিজ্ঞাসা করেছিলেন কুরআনের কোন আয়াতটি সর্বশ্রেষ্ঠ — তিনি আয়াতুল কুরসি বলেছিলেন এবং নবী (সা.) তা সমর্থন করেছিলেন। প্রতিটি ফরজ নামাজের পর পাঠের বিশেষ ফজিলত বর্ণিত আছে। এতে আল্লাহর তাওহীদ, জ্ঞান, ক্ষমতা ও মহত্ত্ব সবচেয়ে সুন্দরভাবে বর্ণিত হয়েছে।",
  },

  /* ---------------- 2:152 ---------------- */
  {
    surah: 2,
    number: 152,
    arabic: "فَٱذْكُرُونِى أَذْكُرْكُمْ وَٱشْكُرُوا۟ لِى وَلَا تَكْفُرُونِ",
    bn: "অতএব তোমরা আমাকে স্মরণ করো, আমিও তোমাদের স্মরণ করব। আমার প্রতি কৃতজ্ঞতা প্রকাশ করো এবং অকৃতজ্ঞ হয়ো না।",
    en: "So remember Me; I will remember you. And be grateful to Me and do not deny Me.",
    pron: "ফাযকুরূনী আযকুরকুম ওয়াশকুরূ লী ওয়ালা- তাকফুরূন।",
    tafsirBn: "যিকিরের বিনিময় আল্লাহ নিজেই দেন — বান্দা একবার স্মরণ করলে আল্লাহ দশবার স্মরণ করেন (হাদীসে বর্ণিত)। কৃতজ্ঞতা প্রকাশ করা ঈমানের অংশ।",
  },
  {
    surah: 2,
    number: 183,
    arabic: "يَٰٓأَيُّهَا ٱلَّذِينَ آمَنُوا۟ كُتِبَ عَلَيْكُمُ ٱلصِّيَامُ كَمَا كُتِبَ عَلَى ٱلَّذِينَ مِن قَبْلِكُمْ لَعَلَّكُمْ تَتَّقُونَ",
    bn: "হে ঈমানদারগণ! তোমাদের উপর রোযা ফরজ করা হয়েছে, যেমন তোমাদের পূর্ববর্তীদের উপর ফরজ করা হয়েছিল, যাতে তোমরা তাকওয়া অর্জন করতে পারো।",
    en: "O you who have believed, decreed upon you is fasting as it was decreed upon those before you, that you may become righteous.",
    pron: "ইয়া- আইয়ুহাল্লাযীনা আ-মানূ কুতিবা আলাইকুমুস সিয়ামু কামা- কুতিবা আলাল্লাযীনা মিন কাবলিকুম লাআল্লাকুম তাত্তাকূন।",
    tafsirBn: "রোযার মূল উদ্দেশ্য তাকওয়া — অর্থাৎ আল্লাহর ভয় ও আত্মসংযম। এটি স্পষ্ট করে যে রোযা আগের উম্মতদের উপরও ফরজ ছিল।",
  },
  {
    surah: 2,
    number: 254,
    arabic: "يَٰٓأَيُّهَا ٱلَّذِينَ آمَنُوٓا۟ أَنفِقُوا۟ مِمَّا رَزَقْنَٰكُم مِّن قَبْلِ أَن يَأْتِىَ يَوْمٌ لَّا بَيْعٌ فِيهِ وَلَا خُلَّةٌ وَلَا شَفَٰعَةٌ ۗ وَٱلْكَٰفِرُونَ هُمُ ٱلظَّٰلِمُونَ",
    bn: "হে ঈমানদারগণ! আমি তোমাদের যে রিযিক দিয়েছি তা থেকে ব্যয় করো, সেই দিন আসার আগেই — যেদিন কোনো ক্রয়-বিক্রয় থাকবে না, বন্ধুত্বও কাজে আসবে না, আর কোনো সুপারিশও গ্রহণ করা হবে না। প্রকৃত জালিম তারাই, যারা অস্বীকার করে।",
    en: "O you who have believed, spend from that which We have provided for you before there comes a Day in which there is no exchange and no friendship and no intercession. And the disbelievers — they are the wrongdoers.",
    pron: "ইয়া- আইয়ুহাল্লাযীনা আ-মানূ আনফিকূ মিম্মা- রাযাকনা-কুম মিন কাবলি আন ইা'তিয়া ইয়াওমুল লা- বাইউন ফীহি ওয়ালা- খুল্লাতুও ওয়ালা- শাফা-আ। ওয়াল কা-ফিরূনা হুমুয যা-লিমূন।",
  },
  {
    surah: 2,
    number: 286,
    arabic: "لَا يُكَلِّفُ ٱللَّهُ نَفْسًا إِلَّا وُسْعَهَا ۚ لَهَا مَا كَسَبَتْ وَعَلَيْهَا مَا ٱكْتَسَبَتْ ۗ رَبَّنَا لَا تُؤَاخِذْنَآ إِن نَّسِينَآ أَوْ أَخْطَأْنَا ۚ رَبَّنَا وَلَا تَحْمِلْ عَلَيْنَآ إِصْرًا كَمَا حَمَلْتَهُۥ عَلَى ٱلَّذِينَ مِن قَبْلِنَا ۚ رَبَّنَا وَلَا تُحَمِّلْنَا مَا لَا طَاقَةَ لَنَا بِهِۦ ۖ وَٱعْفُ عَنَّا وَٱغْفِرْ لَنَا وَٱرْحَمْنَا ۚ أَنتَ مَوْلَىٰنَا فَٱنصُرْنَا عَلَى ٱلْقَوْمِ ٱلْكَٰفِرِينَ",
    bn: "আল্লাহ কারো উপর তার সামর্থ্যের অতিরিক্ত বোঝা চাপান না। সে যা ভালো উপার্জন করে তা তারই জন্য, আর যা মন্দ করে তার পরিণাম তারই উপর। 'হে আমাদের প্রতিপালক! আমরা ভুলে গেলে বা ভুল করে ফেললে আমাদের পাকড়াও করবেন না। হে আমাদের প্রতিপালক! আমাদের উপর এমন বোঝা চাপাবেন না, যেমন আমাদের পূর্ববর্তীদের উপর চাপিয়েছিলেন। হে আমাদের প্রতিপালক! আমাদের সামর্থ্যের বাইরে এমন বোঝা চাপাবেন না। আমাদের ক্ষমা করুন, আমাদের পাপ মার্জনা করুন, আমাদের প্রতি দয়া করুন। আপনিই আমাদের অভিভাবক; কাজেই অস্বীকারকারী সম্প্রদায়ের বিরুদ্ধে আমাদের সাহায্য করুন।'",
    en: "Allah does not charge a soul except with that within its capacity. It will have the consequence of what good it has gained, and it will bear the consequence of what evil it has earned. 'Our Lord, do not impose blame upon us if we have forgotten or erred. Our Lord, and lay not upon us a burden like that which You laid upon those before us. Our Lord, and burden us not with that which we have no ability to bear. And pardon us; and forgive us; and have mercy upon us. You are our Protector, so grant us victory over the disbelieving people.'",
    pron: "লা- ইউকাল্লিফুল্লা-হু নাফসান ইল্লা- উস'আহা। লাহা- মা- কাসাবাত ওয়া আলাইহা- মাকতাসাবাত। রাব্বানা- লা- তুআ-খিযনা- ইন নাসীনা- আও আখতা'না। রাব্বানা- ওয়ালা- তাহমিল আলাইনা- ইসরান কামা- হামালতাহূ আলাল্লাযীনা মিন কাবলিনা-। রাব্বানা- ওয়ালা- তুহাম্মিলনা- মা- লা- তা-কাতা লানা- বিহ। ওয়া'ফু আন্না- ওয়াগফির লানা- ওয়ারহামনা-। আনতা মাওলা-না- ফানসুরনা- আলাল কাওমিল কা-ফিরীন।",
    tafsirBn: "সূরা বাকারার শেষ আয়াত। রাসূলুল্লাহ (সা.) বলেছেন, যে ব্যক্তি রাতে এই দুই আয়াত (২৮৫-২৮৬) পাঠ করবে তা তার জন্য যথেষ্ট হবে। এতে আল্লাহর সহজতার নীতি ও বান্দার দুআর শিক্ষা রয়েছে।",
  },
  {
    surah: 3,
    number: 139,
    arabic: "وَلَا تَهِنُوا۟ وَلَا تَحْزَنُوا۟ وَأَنتُمُ ٱلْأَعْلَوْنَ إِن كُنتُم مُّؤْمِنِينَ",
    bn: "আর তোমরা শিথিল হয়ো না এবং দুঃখ করো না; তোমরাই বিজয়ী হবে, যদি তোমরা মুমিন হও।",
    en: "And do not weaken and do not grieve, and you will be superior if you are true believers.",
    pron: "ওয়া লা- তাহিনূ ওয়া লা- তাহযানূ ওয়া আনতুমুল আ'লাওনা ইন কুনতুম মু'মিনীন।",
  },
  {
    surah: 13,
    number: 28,
    arabic: "ٱلَّذِينَ آمَنُوا۟ وَتَطْمَئِنُّ قُلُوبُهُم بِذِكْرِ ٱللَّهِ ۗ أَلَا بِذِكْرِ ٱللَّهِ تَطْمَئِنُّ ٱلْقُلُوبُ",
    bn: "যারা ঈমান এনেছে এবং আল্লাহর স্মরণে যাদের অন্তর প্রশান্তি লাভ করে। জেনে রাখো, আল্লাহর স্মরণেই অন্তরসমূহ প্রশান্তি পায়।",
    en: "Those who have believed and whose hearts are assured by the remembrance of Allah. Unquestionably, by the remembrance of Allah hearts are assured.",
    pron: "আল্লাযীনা আ-মানূ ওয়া তাতমাইন্নু কুলূবুহুম বিযিকরিল্লা-হ। আলা- বিযিকরিল্লা-হি তাতমাইন্নুল কুলূব।",
    tafsirBn: "দুশ্চিন্তা ও উদ্বেগের সময়ের সর্বোত্তম প্রতিকার — আল্লাহর যিকির। বাংলাদেশে মানসিক চাপে থাকা তরুণদের জন্য এই আয়াতটি বিশেষভাবে সান্ত্বনাদায়ক।",
  },
  {
    surah: 17,
    number: 23,
    arabic: "وَقَضَىٰ رَبُّكَ أَلَّا تَعْبُدُوٓا۟ إِلَّآ إِيَّاهُ وَبِٱلْوَٰلِدَيْنِ إِحْسَٰنًا ۚ إِمَّا يَبْلُغَنَّ عِندَكَ ٱلْكِبَرَ أَحَدُهُمَآ أَوْ كِلَاهُمَا فَلَا تَقُل لَّهُمَآ أُفٍّ وَلَا تَنْهَرْهُمَا وَقُل لَّهُمَا قَوْلًا كَرِيمًا",
    bn: "তোমার প্রতিপালক আদেশ দিয়েছেন যে, তোমরা তিনি ছাড়া অন্য কারো ইবাদত করবে না এবং মা-বাবার সাথে সদ্ব্যবহার করবে। তাদের একজন বা উভয়ে তোমার কাছে বৃদ্ধ বয়সে পৌঁছে গেলে তাদের 'উফ' শব্দটিও বলো না, ধমক দিও না; বরং তাদের সাথে সম্মানজনক কথা বলো।",
    en: "And your Lord has decreed that you not worship except Him, and to parents, good treatment. Whether one or both of them reach old age with you, say not to them 'uff' and do not repel them, but speak to them a noble word.",
    pron: "ওয়া কাদা- রাব্বুকা আল্লা- তা'বুদূ ইল্লা- ইইয়া-হু ওয়া বিল ওয়া-লিদাইনি ইহসা-না। ইম্মা- ইয়াবলুগান্না ইনদাকাল কিবারা আহাদুহুমা- আও কিলা-হুমা- ফালা- তাকুল লাহুমা- উফফিন ওয়ালা- তানহারহুমা- ওয়া কুল লাহুমা- কাওলান কারীমা।",
    tafsirBn: "তাওহীদের নির্দেশের সাথে সাথেই মা-বাবার হকের কথা বলা হয়েছে — এটাই তাদের মর্যাদার প্রমাণ। বৃদ্ধ বয়সে তাদের সেবা করা সর্বোচ্চ ইবাদতের অন্তর্ভুক্ত।",
  },

  /* ---------------- 18. Al-Kahf 1-5 ---------------- */
  {
    surah: 18,
    number: 1,
    arabic: "ٱلْحَمْدُ لِلَّهِ ٱلَّذِىٓ أَنزَلَ عَلَىٰ عَبْدِهِ ٱلْكِتَٰبَ وَلَمْ يَجْعَل لَّهُۥ عِوَجًا",
    bn: "সমস্ত প্রশংসা আল্লাহর, যিনি তাঁর বান্দার প্রতি কিতাব নাযিল করেছেন এবং তাতে কোনো বক্রতা রাখেননি।",
    en: "All praise is due to Allah, who has sent down upon His Servant the Book and has not made therein any deviance.",
    pron: "আলহামদু লিল্লা-হিল্লাযী আনযালা আলা- আবদিহিল কিতা-বা ওয়া লাম ইয়াজআল লাহূ ইওয়াজা।",
  },
  {
    surah: 18,
    number: 2,
    arabic: "قَيِّمًا لِّيُنذِرَ بَأْسًا شَدِيدًا مِّن لَّدُنْهُ وَيُبَشِّرَ ٱلْمُؤْمِنِينَ ٱلَّذِينَ يَعْمَلُونَ ٱلصَّٰلِحَٰتِ أَنَّ لَهُمْ أَجْرًا حَسَنًا",
    bn: "সরল, যাতে তিনি তাঁর পক্ষ থেকে কঠিন শাস্তির সতর্কবাণী দেন এবং সুসংবাদ দেন সেই মুমিনদের, যারা সৎকর্ম করে — যে তাদের জন্য রয়েছে উত্তম প্রতিদান।",
    en: "Straight, to warn of severe punishment from Him and to give good tidings to the believers who do righteous deeds that they will have a good reward.",
    pron: "কাইয়্যিমাল লিউনযিরা বা'সান শাদীদাম মিল লাদুনহু ওয়া ইউবাশশিরাল মু'মিনীনাল্লাযীনা ইয়া'মালূনাস সা-লিহা-তি আন্না লাহুম আজরান হাসানা।",
  },
  {
    surah: 18,
    number: 3,
    arabic: "مَّٰكِثِينَ فِيهِ أَبَدًا",
    bn: "যেখানে তারা চিরকাল অবস্থান করবে।",
    en: "In which they will remain forever.",
    pron: "মা-কিছীনা ফীহি আবাদা।",
  },
  {
    surah: 18,
    number: 4,
    arabic: "وَيُنذِرَ ٱلَّذِينَ قَالُوا۟ ٱتَّخَذَ ٱللَّهُ وَلَدًا",
    bn: "এবং সতর্ক করে তাদের, যারা বলে — আল্লাহ সন্তান গ্রহণ করেছেন।",
    en: "And to warn those who say, 'Allah has taken a son.'",
    pron: "ওয়া ইউনযিরাল্লাযীনা কা-লুত্তাখাযাল্লা-হু ওয়ালাদা।",
  },
  {
    surah: 18,
    number: 5,
    arabic: "مَّا لَهُم بِهِۦ مِنْ عِلْمٍ وَلَا لِآبَآئِهِمْ ۚ كَبُرَتْ كَلِمَةً تَخْرُجُ مِنْ أَفْوَٰهِهِمْ ۚ إِن يَقُولُونَ إِلَّا كَذِبًا",
    bn: "তাদেরও না, তাদের পিতৃপুরুষদেরও না — এ বিষয়ে কোনো জ্ঞানই নেই। তাদের মুখ থেকে যে কথাটি বের হয় তা কতই না জঘন্য! তারা শুধু মিথ্যাই বলে।",
    en: "They have no knowledge of it, nor had their fathers. Grave is the word that comes out of their mouths; they speak nothing but a lie.",
    pron: "মা- লাহুম বিহী মিন ইলমিও ওয়ালা- লিআ-বা-ইহিম। কাবুরাত কালিমাতান তাখরুজু মিন আফওয়া-হিহিম। ইন ইয়াকূলূনা ইল্লা- কাযিবা।",
  },

  /* ---------------- 36. Yaseen 1-5 ---------------- */
  {
    surah: 36,
    number: 1,
    arabic: "يسٓ",
    bn: "ইয়াসীন।",
    en: "Ya, Seen.",
    pron: "ইয়া-সীন।",
  },
  {
    surah: 36,
    number: 2,
    arabic: "وَٱلْقُرْءَانِ ٱلْحَكِيمِ",
    bn: "প্রজ্ঞাময় কুরআনের কসম।",
    en: "By the wise Qur'an.",
    pron: "ওয়াল কুরআ-নিল হাকীম।",
  },
  {
    surah: 36,
    number: 3,
    arabic: "إِنَّكَ لَمِنَ ٱلْمُرْسَلِينَ",
    bn: "নিশ্চয়ই আপনি রাসূলগণের অন্তর্ভুক্ত।",
    en: "Indeed you are among the messengers.",
    pron: "ইন্নাকা লামিনাল মুরসালীন।",
  },
  {
    surah: 36,
    number: 4,
    arabic: "عَلَىٰ صِرَٰطٍ مُّسْتَقِيمٍ",
    bn: "সরল পথে প্রতিষ্ঠিত।",
    en: "On a straight path.",
    pron: "আলা- সিরা-তিম মুসতাকীম।",
  },
  {
    surah: 36,
    number: 5,
    arabic: "تَنزِيلَ ٱلْعَزِيزِ ٱلرَّحِيمِ",
    bn: "এটি পরাক্রমশালী, পরম দয়ালুর পক্ষ থেকে নাযিলকৃত।",
    en: "A revelation from the Almighty, the Most Merciful.",
    pron: "তানযীলাল আযীযির রাহীম।",
  },

  /* ---------------- 39:53 ---------------- */
  {
    surah: 39,
    number: 53,
    arabic: "قُلْ يَٰعِبَادِىَ ٱلَّذِينَ أَسْرَفُوا۟ عَلَىٰٓ أَنفُسِهِمْ لَا تَقْنَطُوا۟ مِن رَّحْمَةِ ٱللَّهِ ۚ إِنَّ ٱللَّهَ يَغْفِرُ ٱلذُّنُوبَ جَمِيعًا ۚ إِنَّهُۥ هُوَ ٱلْغَفُورُ ٱلرَّحِيمُ",
    bn: "বলো, 'হে আমার বান্দারা! যারা নিজেদের প্রতি সীমালঙ্ঘন করেছ, আল্লাহর রহমত থেকে নিরাশ হয়ো না। নিশ্চয়ই আল্লাহ সমস্ত গুনাহ ক্ষমা করে দেন। তিনিই ক্ষমাশীল, পরম দয়ালু।'",
    en: "Say, 'O My servants who have transgressed against themselves, do not despair of the mercy of Allah. Indeed, Allah forgives all sins. Indeed, it is He who is the Forgiving, the Merciful.'",
    pron: "কুল ইয়া- ইবা-দিয়াল্লাযীনা আসরাফূ আলা- আনফুসিহিম লা- তাকনাতূ মির রাহমাতিল্লা-হ। ইন্নাল্লা-হা ইয়াগফিরুয যুনূবা জামীআ। ইন্নাহূ হুওয়াল গাফূরুর রাহীম।",
    tafsirBn: "কুরআনের সবচেয়ে আশাব্যঞ্জক আয়াতগুলোর একটি। পাপ যত বড়ই হোক, আল্লাহর রহমত থেকে নিরাশ হওয়া নিষিদ্ধ। ইবন আব্বাস (রা.) বলেন, এটি সেই আয়াত যার মাধ্যমে অসংখ্য মানুষ ইসলামে ফিরে এসেছে।",
  },
  {
    surah: 40,
    number: 60,
    arabic: "وَقَالَ رَبُّكُمُ ٱدْعُونِى أَسْتَجِبْ لَكُمْ ۚ إِنَّ ٱلَّذِينَ يَسْتَكْبِرُونَ عَنْ عِبَادَتِى سَيَدْخُلُونَ جَهَنَّمَ دَاخِرِينَ",
    bn: "তোমাদের প্রতিপালক বলেছেন, 'তোমরা আমাকে ডাকো, আমি তোমাদের ডাকে সাড়া দেব।' নিশ্চয়ই যারা অহংকারবশত আমার ইবাদত থেকে মুখ ফিরিয়ে নেয়, তারা অবশ্যই অপমানিত অবস্থায় জাহান্নামে প্রবেশ করবে।",
    en: "And your Lord says, 'Call upon Me; I will respond to you.' Indeed, those who disdain My worship will enter Hell contemptible.",
    pron: "ওয়া কা-লা রাব্বুকুমুদ'ঊনী আস্তাজিব লাকুম। ইন্নাল্লাযীনা ইয়াসতাকবিরূনা আন ইবা-দাতী সাইয়াদখুলূনা জাহান্নামা দা-খিরীন।",
    tafsirBn: "দুআ করাই ইবাদতের মূল। এই আয়াত দুআ কবুলের সরাসরি প্রতিশ্রুতি দেয়, তাই দুআ থেকে বিরত থাকা উচিত নয় — যদিও উত্তর দেরিতে আসে বা ভিন্ন রূপে আসে।",
  },

  /* ---------------- 55. Ar-Rahman 1-13 ---------------- */
  {
    surah: 55,
    number: 1,
    arabic: "ٱلرَّحْمَٰنُ",
    bn: "পরম করুণাময়।",
    en: "The Most Merciful.",
    pron: "আর-রাহমা-ন।",
  },
  {
    surah: 55,
    number: 2,
    arabic: "عَلَّمَ ٱلْقُرْءَانَ",
    bn: "তিনি কুরআন শিক্ষা দিয়েছেন।",
    en: "Taught the Qur'an.",
    pron: "আল্লামাল কুরআ-ন।",
  },
  {
    surah: 55,
    number: 3,
    arabic: "خَلَقَ ٱلْإِنسَٰنَ",
    bn: "তিনি মানুষ সৃষ্টি করেছেন।",
    en: "Created man.",
    pron: "খলাকাল ইনসা-ন।",
  },
  {
    surah: 55,
    number: 4,
    arabic: "عَلَّمَهُ ٱلْبَيَانَ",
    bn: "তিনি তাকে ভাষা ও প্রকাশক্ষমতা শিখিয়েছেন।",
    en: "And taught him eloquence.",
    pron: "আল্লামাহুল বায়া-ন।",
  },
  {
    surah: 55,
    number: 5,
    arabic: "ٱلشَّمْسُ وَٱلْقَمَرُ بِحُسْبَانٍ",
    bn: "সূর্য ও চন্দ্র চলে এক নির্দিষ্ট হিসাবে।",
    en: "The sun and the moon move by precise calculation.",
    pron: "আশশামসু ওয়াল কামারু বিহুসবা-ন।",
  },
  {
    surah: 55,
    number: 6,
    arabic: "وَٱلنَّجْمُ وَٱلشَّجَرُ يَسْجُدَانِ",
    bn: "তারা (নক্ষত্র) ও বৃক্ষ সিজদা করে।",
    en: "And the stars and trees prostrate.",
    pron: "ওয়ান্নাজমু ওয়াশশাজারু ইয়াসজুদা-ন।",
  },
  {
    surah: 55,
    number: 7,
    arabic: "وَٱلسَّمَآءَ رَفَعَهَا وَوَضَعَ ٱلْمِيزَانَ",
    bn: "তিনি আকাশকে উঁচু করেছেন এবং স্থাপন করেছেন ভারসাম্যের মানদণ্ড।",
    en: "And the heaven He raised and imposed the balance.",
    pron: "ওয়াসসামা-আ রাফাআহা ওয়া ওয়াদাআল মীযা-ন।",
  },
  {
    surah: 55,
    number: 8,
    arabic: "أَلَّا تَطْغَوْا۟ فِى ٱلْمِيزَانِ",
    bn: "যাতে তোমরা ভারসাম্যে সীমালঙ্ঘন না করো।",
    en: "That you not transgress within the balance.",
    pron: "আল্লা- তাতগাও ফিল মীযা-ন।",
  },
  {
    surah: 55,
    number: 9,
    arabic: "وَأَقِيمُوا۟ ٱلْوَزْنَ بِٱلْقِسْطِ وَلَا تُخْسِرُوا۟ ٱلْمِيزَانَ",
    bn: "আর ন্যায্যসহকারে ওজন প্রতিষ্ঠা করো এবং ওজনে কম দিও না।",
    en: "And establish weight in justice and do not cause deficiency in the balance.",
    pron: "ওয়া আকীমুল ওয়াযনা বিল কিস্তি ওয়ালা- তুখসিরুল মীযা-ন।",
  },
  {
    surah: 55,
    number: 10,
    arabic: "وَٱلْأَرْضَ وَضَعَهَا لِلْأَنَامِ",
    bn: "আর তিনি পৃথিবীকে সৃষ্টজীবের জন্য বিছিয়ে দিয়েছেন।",
    en: "And the earth He laid out for the creatures.",
    pron: "ওয়াল আরদা ওয়াদাআহা লিলআনা-ম।",
  },
  {
    surah: 55,
    number: 11,
    arabic: "فِيهَا فَٰكِهَةٌ وَٱلنَّخْلُ ذَاتُ ٱلْأَكْمَامِ",
    bn: "তাতে আছে ফলমূল এবং আবরণযুক্ত খেজুর গাছ।",
    en: "Therein is fruit and palm trees having sheaths of dates.",
    pron: "ফীহা- ফা-কিহাতুও ওয়ান্নাখলু যা-তুল আকমা-ম।",
  },
  {
    surah: 55,
    number: 12,
    arabic: "وَٱلْحَبُّ ذُو ٱلْعَصْفِ وَٱلرَّيْحَانُ",
    bn: "আর আছে খোসাযুক্ত দানা ও সুগন্ধি গাছ।",
    en: "And grain having husks and scented plants.",
    pron: "ওয়ালহাব্বু যুল আসফি ওয়াররাইহা-ন।",
  },
  {
    surah: 55,
    number: 13,
    arabic: "فَبِأَىِّ ءَالَآءِ رَبِّكُمَا تُكَذِّبَانِ",
    bn: "তাহলে তোমরা তোমাদের প্রতিপালকের কোন নিয়ামত অস্বীকার করবে?",
    en: "So which of the favours of your Lord would you deny?",
    pron: "ফাবিআইয়ি আ-লা-ই রাব্বিকুমা- তুকাযযিবা-ন।",
  },

  /* ---------------- 65:2 ---------------- */
  {
    surah: 65,
    number: 2,
    arabic: "فَإِذَا بَلَغْنَ أَجَلَهُنَّ فَأَمْسِكُوهُنَّ بِمَعْرُوفٍ أَوْ فَارِقُوهُنَّ بِمَعْرُوفٍ وَأَشْهِدُوا۟ ذَوَىْ عَدْلٍ مِّنكُمْ وَأَقِيمُوا۟ ٱلشَّهَٰدَةَ لِلَّهِ ۚ ذَٰلِكُمْ يُوعَظُ بِهِۦ مَن كَانَ يُؤْمِنُ بِٱللَّهِ وَٱلْيَوْمِ ٱلْآخِرِ ۚ وَمَن يَتَّقِ ٱللَّهَ يَجْعَل لَّهُۥ مَخْرَجًا",
    bn: "অতঃপর তারা যখন তাদের ইদ্দতকাল পূর্ণ করে, তখন তাদেরকে যথাবিধি রেখে দাও অথবা যথাবিধি পৃথক করে দাও। আর তোমাদের মধ্যে দুজন ন্যায়পরায়ণ ব্যক্তিকে সাক্ষী রাখো এবং আল্লাহর উদ্দেশে সঠিক সাক্ষ্য দাও। এভাবে তাকে উপদেশ দেওয়া হয়, যে আল্লাহ ও শেষ দিনে বিশ্বাস রাখে। আর যে আল্লাহকে ভয় করে, তিনি তার জন্য বের হওয়ার পথ করে দেন।",
    en: "And when they have fulfilled their term, either retain them according to acceptable terms or part with them according to acceptable terms. And bring to witness two just men from among you and establish the testimony for Allah. That is instructed to whoever should believe in Allah and the Last Day. And whoever fears Allah — He will make for him a way out.",
    pron: "ফা-ইযা- বালাগনা আজালাহুন্না ফাআমসিকূহুন্না বিমা'রূফিন আও ফা-রিকূহুন্না বিমা'রূফিন ওয়া আশহিদূ যাওয়াই আদলিম মিনকুম ওয়া আকীমুশ শাহা-দাতা লিল্লা-হ। যা-লিকুম ইউ'আজু বিহী মান কা-না ইউ'মিনু বিল্লা-হি ওয়াল ইয়াওমিল আ-খির। ওয়া মান ইয়াত্তাকিল্লা-হা ইয়াজআল লাহূ মাখরাজা।",
    tafsirBn: "তালাক-সংক্রান্ত বিধানের মাঝে তাকওয়ার প্রতিশ্রুতি দেওয়া হয়েছে — বিপদে আল্লাহর ভয় অবলম্বন করলে তিনি এমন পথ খুলে দেন যা কল্পনাও করা যায়নি।",
  },

  /* ---------------- 67. Al-Mulk 1-5 ---------------- */
  {
    surah: 67,
    number: 1,
    arabic: "تَبَٰرَكَ ٱلَّذِى بِيَدِهِ ٱلْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَىْءٍ قَدِيرٌ",
    bn: "মহিমান্বিত তিনি, যাঁর হাতে সমস্ত রাজত্ব এবং তিনি সবকিছুর উপর ক্ষমতাবান।",
    en: "Blessed is He in whose hand is dominion, and He is over all things competent.",
    pron: "তাবা-রাকাল্লাযী বিয়াদিহিল মুলকু ওয়া হুয়া আলা- কুল্লি শাইইন কাদীর।",
  },
  {
    surah: 67,
    number: 2,
    arabic: "ٱلَّذِى خَلَقَ ٱلْمَوْتَ وَٱلْحَيَٰوةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًا ۚ وَهُوَ ٱلْعَزِيزُ ٱلْغَفُورُ",
    bn: "যিনি মৃত্যু ও জীবন সৃষ্টি করেছেন তোমাদের পরীক্ষা করার জন্য — তোমাদের মধ্যে কে সর্বোত্তম আমল করে। তিনি পরাক্রমশালী, ক্ষমাশীল।",
    en: "He who created death and life to test you as to which of you is best in deed. And He is the Almighty, the Forgiving.",
    pron: "আল্লাযী খলাকাল মাওতা ওয়াল হাইয়া-তা লিইয়াবলুওয়াকুম আইয়্যুকুম আহসানু আমালা। ওয়া হুয়াল আযীযুল গাফূর।",
    tafsirBn:
      "লক্ষণীয় — আয়াতে 'কত বেশি আমল' না বলে 'কত উত্তম আমল' বলা হয়েছে। অর্থাৎ আমলের গুণ ও ইখলাসই মূল, শুধু সংখ্যা নয়। এই আয়াতটি প্রতিদিনের আমল মূল্যায়নের এক শক্তিশালী মাপকাঠি।",
  },
  {
    surah: 67,
    number: 3,
    arabic: "ٱلَّذِى خَلَقَ سَبْعَ سَمَٰوَٰتٍ طِبَاقًا ۖ مَّا تَرَىٰ فِى خَلْقِ ٱلرَّحْمَٰنِ مِن تَفَٰوُتٍ ۖ فَٱرْجِعِ ٱلْبَصَرَ هَلْ تَرَىٰ مِن فُطُورٍ",
    bn: "যিনি সাতটি আকাশ স্তরে স্তরে সৃষ্টি করেছেন। করুণাময়ের সৃষ্টিতে তুমি কোনো অসঙ্গতি দেখবে না। আবার চোখ ফিরিয়ে দেখো — কোনো ফাটল দেখতে পাও কি?",
    en: "He who created seven heavens in layers. You will not see any flaw in the creation of the Most Merciful. So look again — do you see any breaks?",
    pron: "আল্লাযী খলাকা সাবআ সামা-ওয়া-তিন তিবা-কা। মা- তারো ফী খলকির রাহমা-নি মিন তাফা-ওত। ফারজিইল বাসারা, হাল তারো মিন ফুতূর।",
  },
  {
    surah: 67,
    number: 4,
    arabic: "ثُمَّ ٱرْجِعِ ٱلْبَصَرَ كَرَّتَيْنِ يَنقَلِبْ إِلَيْكَ ٱلْبَصَرُ خَاسِئًا وَهُوَ حَسِيرٌ",
    bn: "এরপর আবার দুইবার চোখ ফিরিয়ে দেখো — চোখ ব্যর্থ ও ক্লান্ত হয়ে তোমার কাছে ফিরে আসবে।",
    en: "Then look again and yet again; your vision will return to you humbled while it is fatigued.",
    pron: "ছুম্মারজিইল বাসারা কাররাতাইনি ইয়ানকালিব ইলাইকা বাসারু খা-সিআন ওয়া হুয়া হাসীর।",
  },
  {
    surah: 67,
    number: 5,
    arabic: "وَلَقَدْ زَيَّنَّا ٱلسَّمَآءَ ٱلدُّنْيَا بِمَصَٰبِيحَ وَجَعَلْنَٰهَا رُجُومًا لِّلشَّيَٰطِينِ ۖ وَأَعْتَدْنَا لَهُمْ عَذَابَ ٱلسَّعِيرِ",
    bn: "আমি নিকটবর্তী আকাশকে প্রদীপমালায় সজ্জিত করেছি এবং সেগুলোকে শয়তানের জন্য নিক্ষেপক বানিয়েছি; আর তাদের জন্য প্রস্তুত রেখেছি জ্বলন্ত আগুনের শাস্তি।",
    en: "And We have decorated the nearest heaven with lamps and made them as stones for the devils, and We have prepared for them the punishment of the Blaze.",
    pron: "ওয়ালাকাদ যাইয়ান্নাস সামা-আদ দুন্ইয়া- বিমাসা-বীহা ওয়া জাআলনা-হা- রুজূমাল লিশশাইয়া-তীন, ওয়া আতাদনা- লাহুম আযা-বাস সাঈর।",
  },

  /* ---------------- 94:5 ---------------- */
  {
    surah: 94,
    number: 5,
    arabic: "فَإِنَّ مَعَ ٱلْعُسْرِ يُسْرًا",
    bn: "নিশ্চয়ই কষ্টের সাথেই রয়েছে স্বস্তি।",
    en: "For indeed, with hardship comes ease.",
    pron: "ফা-ইন্না মাআল উসরি ইউসরা।",
    tafsirBn: "عُسْر (কষ্ট) শব্দটি এখানে নির্দিষ্ট (আল-ইফরাদ) কিন্তু يُسْر (স্বস্তি) শব্দটি সাধারণ — তাই একটি কষ্টের সাথে দুই বা ততোধিক স্বস্তি রয়েছে বলে আলেমগণ ব্যাখ্যা করেছেন।",
  },

  /* ---------------- 112. Al-Ikhlas ---------------- */
  {
    surah: 112,
    number: 1,
    arabic: "قُلْ هُوَ ٱللَّهُ أَحَدٌ",
    bn: "বলুন, তিনিই আল্লাহ, এক ও অদ্বিতীয়।",
    en: "Say, 'He is Allah, the One.'",
    pron: "কুল হুওয়াল্লা-হু আহাদ।",
  },
  {
    surah: 112,
    number: 2,
    arabic: "ٱللَّهُ ٱلصَّمَدُ",
    bn: "আল্লাহ অমুখাপেক্ষী।",
    en: "Allah, the Eternal Refuge.",
    pron: "আল্লা-হুস সমাদ।",
  },
  {
    surah: 112,
    number: 3,
    arabic: "لَمْ يَلِدْ وَلَمْ يُولَدْ",
    bn: "তিনি কারো জন্ম দেননি এবং তাঁকেও জন্ম দেওয়া হয়নি।",
    en: "He neither begets nor is born.",
    pron: "লাম ইয়ালিদ ওয়া লাম ইউলাদ।",
  },
  {
    surah: 112,
    number: 4,
    arabic: "وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌ",
    bn: "আর তাঁর সমতুল্য কেউ নেই।",
    en: "Nor is there to Him any equivalent.",
    pron: "ওয়া লাম ইয়াকুল লাহূ কুফুওয়ান আহাদ।",
  },

  /* ---------------- 113. Al-Falaq ---------------- */
  {
    surah: 113,
    number: 1,
    arabic: "قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ",
    bn: "বলুন, আমি আশ্রয় চাই ভোরের প্রতিপালকের কাছে।",
    en: "Say, 'I seek refuge in the Lord of daybreak.'",
    pron: "কুল আউযু বিরাব্বিল ফালাক।",
  },
  {
    surah: 113,
    number: 2,
    arabic: "مِن شَرِّ مَا خَلَقَ",
    bn: "তিনি যা সৃষ্টি করেছেন তার অনিষ্ট থেকে।",
    en: "From the evil of that which He created.",
    pron: "মিন শাররি মা- খলাক।",
  },
  {
    surah: 113,
    number: 3,
    arabic: "وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ",
    bn: "আর অন্ধকার রাতের অনিষ্ট থেকে, যখন তা ছেয়ে যায়।",
    en: "And from the evil of darkness when it settles.",
    pron: "ওয়া মিন শাররি গা-সিকিন ইযা- ওয়াকাব।",
  },
  {
    surah: 113,
    number: 4,
    arabic: "وَمِن شَرِّ ٱلنَّفَّٰثَٰتِ فِى ٱلْعُقَدِ",
    bn: "আর গ্রন্থিতে ফুঁ দিয়ে জাদুকারীদের অনিষ্ট থেকে।",
    en: "And from the evil of the blowers in knots.",
    pron: "ওয়া মিন শাররিন নাফফা-ছা-তি ফিল উকাদ।",
  },
  {
    surah: 113,
    number: 5,
    arabic: "وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ",
    bn: "আর হিংসুকের অনিষ্ট থেকে, যখন সে হিংসা করে।",
    en: "And from the evil of an envier when he envies.",
    pron: "ওয়া মিন শাররি হা-সিদিন ইযা- হাসাদ।",
  },

  /* ---------------- 114. An-Nas ---------------- */
  {
    surah: 114,
    number: 1,
    arabic: "قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ",
    bn: "বলুন, আমি আশ্রয় চাই মানুষের প্রতিপালকের কাছে।",
    en: "Say, 'I seek refuge in the Lord of mankind.'",
    pron: "কুল আউযু বিরাব্বিন না-স।",
  },
  {
    surah: 114,
    number: 2,
    arabic: "مَلِكِ ٱلنَّاسِ",
    bn: "মানুষের অধিপতির কাছে।",
    en: "The Sovereign of mankind.",
    pron: "মালিকিন না-স।",
  },
  {
    surah: 114,
    number: 3,
    arabic: "إِلَٰهِ ٱلنَّاسِ",
    bn: "মানুষের ইলাহের কাছে।",
    en: "The God of mankind.",
    pron: "ইলা-হিন না-স।",
  },
  {
    surah: 114,
    number: 4,
    arabic: "مِن شَرِّ ٱلْوَسْوَاسِ ٱلْخَنَّاسِ",
    bn: "কুমন্ত্রণাদাতা, আত্মগোপনকারীর অনিষ্ট থেকে।",
    en: "From the evil of the retreating whisperer.",
    pron: "মিন শাররিল ওয়াসওয়া-সিল খান্না-স।",
  },
  {
    surah: 114,
    number: 5,
    arabic: "ٱلَّذِى يُوَسْوِسُ فِى صُدُورِ ٱلنَّاسِ",
    bn: "যে মানুষের অন্তরে কুমন্ত্রণা দেয়।",
    en: "Who whispers in the breasts of mankind.",
    pron: "আল্লাযী ইউওয়াসবিসু ফী সুদূরিন না-স।",
  },
  {
    surah: 114,
    number: 6,
    arabic: "مِنَ ٱلْجِنَّةِ وَٱلنَّاسِ",
    bn: "জিন ও মানুষের মধ্য থেকে।",
    en: "From among the jinn and mankind.",
    pron: "মিনাল জিন্নাতি ওয়ান্না-স।",
  },
];

export const QURAN_AYAHS: QuranAyah[] = AYAH_SEEDS.map((seed) => ({
  surah: seed.surah,
  number: seed.number,
  ref: `${seed.surah}:${seed.number}`,
  arabic: seed.arabic,
  translationBn: seed.bn,
  translationEn: seed.en,
  transliterationBn: seed.pron,
  tafsirBn: seed.tafsirBn,
  sajda: seed.sajda,
}));

/* -------------------------------------------------------------------------- */
/* Lookups                                                                    */
/* -------------------------------------------------------------------------- */

export function surahSlugToNumber(slug: string): number | undefined {
  return QURAN_SURAHS.find((s) => s.slug === slug)?.number;
}

export function getSurah(n: number): QuranSurah | undefined {
  return QURAN_SURAHS.find((s) => s.number === n);
}

export function getAyahsForSurah(n: number): QuranAyah[] {
  return QURAN_AYAHS.filter((a) => a.surah === n).sort((a, b) => a.number - b.number);
}

export function getAyah(ref: string): QuranAyah | undefined {
  return QURAN_AYAHS.find((a) => a.ref === ref);
}

/** Popular reads in Bangladesh — drives the Quran index quick-picks. */
export const POPULAR_SURAHS: number[] = [36, 55, 67, 18, 1, 112, 113, 114, 2, 19];

/** Ayah of the day seed — Al-Mulk 67:2, on why life is a test of quality. */
export const AYAH_OF_THE_DAY: QuranAyah =
  getAyah("67:2") ??
  QURAN_AYAHS[0];
