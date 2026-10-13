import type { QuranAyah, QuranSurah, RevelationPlace } from "../lib/types";
import { toBnDigits } from "../lib/bn";

/**
 * Qur'an dataset (mobile subset).
 *
 * IMPORTANT: the Arabic text below is the actual Qur'anic text and must never be
 * machine-generated or "roughly remembered"— it is reproduced verbatim from the
 * web dataset, only for surahs whose text is available locally. Any surah without
 * text carries `hasText: false`, which makes the reader show an honest "not added
 * yet" state instead of fabricating an ayah.
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
  { number: 1, slug: "al-fatihah", nameArabic: "ٱلْفَاتِحَة", nameBn: "আল-ফাতিহা", nameEn: "Al-Fatihah", meaningBn: "সূচনা", meaningEn: "The Opening", ayahCount: 7, revelation: "meccan", juz: 1, aboutBn: "কুরআনের প্রথম সূরা, যা প্রতিটি নামাজে পাঠ করা হয়। একে 'উম্মুল কুরআন' (কুরআনের মা) বলা হয়।" },
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
  { number: 25, slug: "al-furqan", nameArabic: "ٱلْفُرْقَان", nameBn: "আল-ফুরকান", nameEn: "Al-Furqan", meaningBn: "সত্য-মিথ্যার পার্থক্যকারী", meaningEn: "The Criterion", ayahCount: 77, revelation: "meccan", juz: 18 },
  { number: 36, slug: "yaseen", nameArabic: "يس", nameBn: "ইয়াসীন", nameEn: "Yaseen", meaningBn: "ইয়াসীন", meaningEn: "Ya-Sin", ayahCount: 83, revelation: "meccan", juz: 22, aboutBn: "কুরআনের হৃদয় বলা হয়। বাংলাদেশে গুরুত্বপূর্ণ সময়ে পাঠের প্রচলন রয়েছে।" },
  { number: 39, slug: "az-zumar", nameArabic: "ٱلزُّمَر", nameBn: "আজ-জুমার", nameEn: "Az-Zumar", meaningBn: "দলবদ্ধ জনতা", meaningEn: "The Troops", ayahCount: 75, revelation: "meccan", juz: 23, aboutBn: "আল্লাহর কাছে খাঁটি ইবাদতের আহ্বান ও তাঁর রহমত থেকে নিরাশ না হওয়ার বার্তাসমৃদ্ধ সূরা।" },
  { number: 40, slug: "ghafir", nameArabic: "غَافِر", nameBn: "গাফির", nameEn: "Ghafir", meaningBn: "ক্ষমাশীল", meaningEn: "The Forgiver", ayahCount: 85, revelation: "meccan", juz: 24, aboutBn: "মুমিন ব্যক্তির দৃঢ়তার কাহিনী এবং দুআ কবুল হওয়ার প্রতিশ্রুতি রয়েছে এতে।" },
  { number: 55, slug: "ar-rahman", nameArabic: "ٱلرَّحْمَٰن", nameBn: "আর-রাহমান", nameEn: "Ar-Rahman", meaningBn: "পরম করুণাময়", meaningEn: "The Most Merciful", ayahCount: 78, revelation: "medinan", juz: 27, aboutBn: "আল্লাহর নিয়ামতের বিবরণে পূর্ণ।" },
  { number: 65, slug: "at-talaq", nameArabic: "ٱلطَّلَاق", nameBn: "আত-তালাক", nameEn: "At-Talaq", meaningBn: "তালাক", meaningEn: "Divorce", ayahCount: 12, revelation: "medinan", juz: 28, aboutBn: "তালাক ও ইদ্দতের বিধান এবং তাকওয়ার পুরস্কার এতে বর্ণিত।" },
  { number: 67, slug: "al-mulk", nameArabic: "ٱلْمُلْك", nameBn: "আল-মুলক", nameEn: "Al-Mulk", meaningBn: "রাজত্ব", meaningEn: "The Sovereignty", ayahCount: 30, revelation: "meccan", juz: 29, aboutBn: "রাতে পাঠের বিশেষ ফজিলত বর্ণিত হয়েছে; কবরের শাস্তি থেকে রক্ষা করে।" },
  { number: 94, slug: "ash-sharh", nameArabic: "ٱلشَّرْح", nameBn: "আশ-শারহ", nameEn: "Ash-Sharh", meaningBn: "প্রশস্তকরণ", meaningEn: "The Relief", ayahCount: 8, revelation: "meccan", juz: 30, aboutBn: "কষ্টের পর স্বস্তির প্রতিশ্রুতি। কঠিন সময়ে এই সূরাটি পাঠ অন্তরকে শক্তি দেয়।" },
  { number: 112, slug: "al-ikhlas", nameArabic: "ٱلْإِخْلَاص", nameBn: "আল-ইখলাস", nameEn: "Al-Ikhlas", meaningBn: "একনিষ্ঠতা", meaningEn: "Sincerity", ayahCount: 4, revelation: "meccan", juz: 30, aboutBn: "কুরআনের এক-তৃতীয়াংশের সমান ফজিলত বলা হয়েছে এই সূরার।" },
  { number: 113, slug: "al-falaq", nameArabic: "ٱلْفَلَق", nameBn: "আল-ফালাক", nameEn: "Al-Falaq", meaningBn: "ভোর", meaningEn: "The Daybreak", ayahCount: 5, revelation: "meccan", juz: 30 },
  { number: 114, slug: "an-nas", nameArabic: "ٱلنَّاس", nameBn: "আন-নাস", nameEn: "An-Nas", meaningBn: "মানুষ", meaningEn: "Mankind", ayahCount: 6, revelation: "meccan", juz: 30 },
];

/** Surahs whose text is present in QURAN_AYAHS. */
const SURAHS_WITH_TEXT = new Set([1, 2, 3, 13, 17, 18, 36, 39, 40, 55]);

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
  { surah: 1, number: 1, arabic: "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ", bn: "পরম করুণাময়, অসীম দয়ালু আল্লাহর নামে শুরু করছি।", en: "In the name of Allah, the Entirely Merciful, the Especially Merciful.", pron: "বিসমিল্লা-হির রাহমা-নির রাহীম।" },
  { surah: 1, number: 2, arabic: "ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ", bn: "সমস্ত প্রশংসা আল্লাহর, যিনি সমস্ত জগতের প্রতিপালক।", en: "All praise is due to Allah, Lord of the worlds.", pron: "আলহামদু লিল্লা-হি রাব্বিল আ-লামীন।", tafsirBn: "'রাব্ব' অর্থ প্রতিপালক ও লালন-পালনকারী। প্রশংসা কেবল আল্লাহর জন্যই নির্দিষ্ট।" },
  { surah: 1, number: 3, arabic: "ٱلرَّحْمَٰنِ ٱلرَّحِيمِ", bn: "যিনি পরম করুণাময়, অসীম দয়ালু।", en: "The Entirely Merciful, the Especially Merciful.", pron: "আর-রাহমা-নির রাহীম।" },
  { surah: 1, number: 4, arabic: "مَٰلِكِ يَوْمِ ٱلدِّينِ", bn: "যিনি বিচার দিনের মালিক।", en: "Sovereign of the Day of Recompense.", pron: "মা-লিকি ইয়াওমিদ্দীন।" },
  { surah: 1, number: 5, arabic: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ", bn: "আমরা কেবল তোমারই ইবাদত করি এবং কেবল তোমারই সাহায্য প্রার্থনা করি।", en: "It is You we worship and You we ask for help.", pron: "ইয়্যা-কা না'বুদু ওয়া ইয়্যা-কা নাসতাঈন।" },
  { surah: 1, number: 6, arabic: "ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ", bn: "আমাদেরকে সরল পথ দেখাও।", en: "Guide us to the straight path.", pron: "ইহদিনাস সিরা-তাল মুসতাকীম।", tafsirBn: "'সিরাতে মুস্তাকীম' হলো সেই পথ যা আল্লাহর সন্তুষ্টির দিকে নিয়ে যায় — ইসলামের স্পষ্ট পথ।" },
  { surah: 1, number: 7, arabic: "صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ", bn: "তাদের পথ, যাদের উপর তুমি অনুগ্রহ করেছ — তাদের পথ নয়, যারা অভিশপ্ত হয়েছে এবং যারা পথভ্রষ্ট হয়েছে।", en: "The path of those upon whom You have bestowed favour, not of those who have evoked anger or of those who are astray.", pron: "সিরা-তাল্লাযীনা আনআমতা আলাইহিম, গাইরিল মাগদূবি আলাইহিম ওয়ালাদ্দোয়া-ল্লীন।" },

  /* ---------------- 2. Al-Baqarah ---------------- */
  { surah: 2, number: 1, arabic: "الٓمٓ", bn: "আলিফ-লাম-মীম।", en: "Alif, Lam, Meem.", pron: "আলিফ লা-ম মীম।" },
  { surah: 2, number: 2, arabic: "ذَٰلِكَ ٱلْكِتَٰبُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِّلْمُتَّقِينَ", bn: "এই কিতাবের মধ্যে কোনো সন্দেহ নেই; এটি মুত্তাকীদের জন্য হিদায়াত।", en: "This is the Book about which there is no doubt, a guidance for those conscious of Allah.", pron: "যা-লিকাল কিতা-বু লা- রাইবা ফীহ, হুদাল লিল মুত্তাকীন।" },
  { surah: 2, number: 3, arabic: "ٱلَّذِينَ يُؤْمِنُونَ بِٱلْغَيْبِ وَيُقِيمُونَ ٱلصَّلَوٰةَ وَمِمَّا رَزَقْنَٰهُمْ يُنفِقُونَ", bn: "যারা অদৃশ্যে বিশ্বাস করে, নামাজ কায়েম করে এবং আমি তাদের যে রিযিক দিয়েছি তা থেকে দান করে।", en: "Who believe in the unseen, establish prayer, and spend out of what We have provided for them.", pron: "আল্লাযীনা ইউ'মিনূনা বিল গাইবি ওয়া ইউকীমূনাস সলা-তা, ওয়া মিম্মা- রাযাকনা-হুম ইউনফিকূন।" },
  { surah: 2, number: 4, arabic: "وَٱلَّذِينَ يُؤْمِنُونَ بِمَآ أُنزِلَ إِلَيْكَ وَمَآ أُنزِلَ مِن قَبْلِكَ وَبِٱلْآخِرَةِ هُمْ يُوقِنُونَ", bn: "আর যারা বিশ্বাস করে, যা তোমার প্রতি নাযিল করা হয়েছে এবং যা তোমার পূর্বে নাযিল করা হয়েছে; আর আখিরাতের ব্যাপারে তারা নিশ্চিত বিশ্বাসী।", en: "And who believe in what has been revealed to you and what was revealed before you, and of the Hereafter they are certain.", pron: "ওয়াল্লাযীনা ইউ'মিনূনা বিমা- উনযিলা ইলাইকা ওয়া মা- উনযিলা মিন কাবলিকা, ওয়া বিল আ-খিরাতি হুম ইউকিনূন।" },
  { surah: 2, number: 5, arabic: "أُوْلَٰئِكَ عَلَىٰ هُدًى مِّن رَّبِّهِمْ ۖ وَأُوْلَٰئِكَ هُمُ ٱلْمُفْلِحُونَ", bn: "তারাই তাদের প্রতিপালকের পক্ষ থেকে হিদায়াতের উপর প্রতিষ্ঠিত এবং তারাই সফলকাম।", en: "Those are upon guidance from their Lord, and it is those who are the successful.", pron: "উলাইকা আলা- হুদাম মির রাব্বিহিম, ওয়া উলাইকা হুমুল মুফলিহূন।" },
  { surah: 2, number: 152, arabic: "فَٱذْكُرُونِى أَذْكُرْكُمْ وَٱشْكُرُوا۟ لِى وَلَا تَكْفُرُونِ", bn: "অতএব তোমরা আমাকে স্মরণ করো, আমিও তোমাদের স্মরণ করব। আমার প্রতি কৃতজ্ঞতা প্রকাশ করো এবং অকৃতজ্ঞ হয়ো না।", en: "So remember Me; I will remember you. And be grateful to Me and do not deny Me.", pron: "ফাযকুরূনী আযকুরকুম ওয়াশকুরূ লী ওয়ালা- তাকফুরূন।", tafsirBn: "যিকিরের বিনিময় আল্লাহ নিজেই দেন — বান্দা একবার স্মরণ করলে আল্লাহ দশবার স্মরণ করেন।" },
  { surah: 2, number: 183, arabic: "يَٰٓأَيُّهَا ٱلَّذِينَ آمَنُوا۟ كُتِبَ عَلَيْكُمُ ٱلصِّيَامُ كَمَا كُتِبَ عَلَى ٱلَّذِينَ مِن قَبْلِكُمْ لَعَلَّكُمْ تَتَّقُونَ", bn: "হে ঈমানদারগণ! তোমাদের উপর রোযা ফরজ করা হয়েছে, যেমন তোমাদের পূর্ববর্তীদের উপর ফরজ করা হয়েছিল, যাতে তোমরা তাকওয়া অর্জন করতে পারো।", en: "O you who have believed, decreed upon you is fasting as it was decreed upon those before you, that you may become righteous.", pron: "ইয়া- আইয়ুহাল্লাযীনা আ-মানূ কুতিবা আলাইকুমুস সিয়ামু কামা- কুতিবা আলাল্লাযীনা মিন কাবলিকুম লাআল্লাকুম তাত্তাকূন।" },
  { surah: 2, number: 254, arabic: "يَٰٓأَيُّهَا ٱلَّذِينَ آمَنُوٓا۟ أَنفِقُوا۟ مِمَّا رَزَقْنَٰكُم مِّن قَبْلِ أَن يَأْتِىَ يَوْمٌ لَّا بَيْعٌ فِيهِ وَلَا خُلَّةٌ وَلَا شَفَٰعَةٌ ۗ وَٱلْكَٰفِرُونَ هُمُ ٱلظَّٰلِمُونَ", bn: "হে ঈমানদারগণ! আমি তোমাদের যে রিযিক দিয়েছি তা থেকে ব্যয় করো, সেই দিন আসার আগেই — যেদিন কোনো ক্রয়-বিক্রয় থাকবে না, বন্ধুত্বও কাজে আসবে না, আর কোনো সুপারিশও গ্রহণ করা হবে না।", en: "O you who have believed, spend from that which We have provided for you before there comes a Day in which there is no exchange and no friendship and no intercession.", pron: "ইয়া- আইয়ুহাল্লাযীনা আ-মানূ আনফিকূ মিম্মা- রাযাকনা-কুম মিন কাবলি আন ইা'তিয়া ইয়াওমুল লা- বাইউন ফীহি ওয়ালা- খুল্লাতুও ওয়ালা- শাফা-আ।" },
  { surah: 2, number: 255, arabic: "ٱللَّهُ لَآ إِلَٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ ۚ لَا تَأْخُذُهُۥ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُۥ مَا فِى ٱلسَّمَٰوَٰتِ وَمَا فِى ٱلْأَرْضِ ۗ مَن ذَا ٱلَّذِى يَشْفَعُ عِندَهُۥٓ إِلَّا بِإِذْنِهِۦ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَىْءٍ مِّنْ عِلْمِهِۦٓ إِلَّا بِمَا شَآءَ ۚ وَسِعَ كُرْسِيُّهُ ٱلسَّمَٰوَٰتِ وَٱلْأَرْضَ ۖ وَلَا يَئُودُهُۥ حِفْظُهُمَا ۚ وَهُوَ ٱلْعَلِىُّ ٱلْعَظِيمُ", bn: "আল্লাহ — তিনি ছাড়া কোনো সত্য ইলাহ নেই। তিনি চিরঞ্জীব, সবকিছুর ধারক। তন্দ্রা বা নিদ্রা তাঁকে স্পর্শ করে না। আসমান ও জমিনে যা কিছু আছে সবই তাঁর। কে আছে যে তাঁর অনুমতি ছাড়া তাঁর কাছে সুপারিশ করবে? তিনি জানেন তাদের সামনে ও পিছনে যা কিছু আছে। তাঁর কুরসি আসমান ও জমিন পরিব্যাপ্ত করে আছে এবং এ দুটি রক্ষা করা তাঁর জন্য কষ্টকর নয়। তিনি সুউচ্চ, মহান।", en: "Allah — there is no deity except Him, the Ever-Living, the Sustainer of existence. Neither drowsiness overtakes Him nor sleep...", pron: "আল্লা-হু লা- ইলা-হা ইল্লা- হুওয়াল হাইয়্যুল কাইয়্যূম। লা- তা'খুযুহূ সিনাতুও ওয়ালা- নাউম। লাহূ মা- ফিস সামা-ওয়া-তি ওয়া মা- ফিল আরদ।", tafsirBn: "আয়াতুল কুরসি কুরআনের সর্বশ্রেষ্ঠ আয়াত। প্রতিটি ফরজ নামাজের পর পাঠের বিশেষ ফজিলত বর্ণিত আছে।" },
  { surah: 2, number: 286, arabic: "لَا يُكَلِّفُ ٱللَّهُ نَفْسًا إِلَّا وُسْعَهَا ۚ لَهَا مَا كَسَبَتْ وَعَلَيْهَا مَا ٱكْتَسَبَتْ ۗ رَبَّنَا لَا تُؤَاخِذْنَآ إِن نَّسِينَآ أَوْ أَخْطَأْنَا ۚ رَبَّنَا وَلَا تَحْمِلْ عَلَيْنَآ إِصْرًا كَمَا حَمَلْتَهُۥ عَلَى ٱلَّذِينَ مِن قَبْلِنَا ۚ رَبَّنَا وَلَا تُحَمِّلْنَا مَا لَا طَاقَةَ لَنَا بِهِۦ ۖ وَٱعْفُ عَنَّا وَٱغْفِرْ لَنَا وَٱرْحَمْنَا ۚ أَنتَ مَوْلَىٰنَا فَٱنصُرْنَا عَلَى ٱلْقَوْمِ ٱلْكَٰفِرِينَ", bn: "আল্লাহ কারো উপর তার সামর্থ্যের অতিরিক্ত বোঝা চাপান না। ... 'হে আমাদের প্রতিপালক! আমরা ভুলে গেলে বা ভুল করে ফেললে আমাদের পাকড়াও করবেন না। ... আমাদের ক্ষমা করুন, আমাদের পাপ মার্জনা করুন, আমাদের প্রতি দয়া করুন।'", en: "Allah does not charge a soul except with that within its capacity... 'Our Lord, do not impose blame upon us if we have forgotten or erred...'", pron: "লা- ইউকাল্লিফুল্লা-হু নাফসান ইল্লা- উস'আহা। লাহা- মা- কাসাবাত ওয়া আলাইহা- মাকতাসাবাত।", tafsirBn: "সূরা বাকারার শেষ আয়াত। যে ব্যক্তি রাতে এই দুই আয়াত পাঠ করবে তা তার জন্য যথেষ্ট হবে।" },

  /* ---------------- 3, 13, 17 ---------------- */
  { surah: 3, number: 139, arabic: "وَلَا تَهِنُوا۟ وَلَا تَحْزَنُوا۟ وَأَنتُمُ ٱلْأَعْلَوْنَ إِن كُنتُم مُّؤْمِنِينَ", bn: "আর তোমরা শিথিল হয়ো না এবং দুঃখ করো না; তোমরাই বিজয়ী হবে, যদি তোমরা মুমিন হও।", en: "And do not weaken and do not grieve, and you will be superior if you are true believers.", pron: "ওয়া লা- তাহিনূ ওয়া লা- তাহযানূ ওয়া আনতুমুল আ'লাওনা ইন কুনতুম মু'মিনীন।" },
  { surah: 13, number: 28, arabic: "ٱلَّذِينَ آمَنُوا۟ وَتَطْمَئِنُّ قُلُوبُهُم بِذِكْرِ ٱللَّهِ ۗ أَلَا بِذِكْرِ ٱللَّهِ تَطْمَئِنُّ ٱلْقُلُوبُ", bn: "যারা ঈমান এনেছে এবং আল্লাহর স্মরণে যাদের অন্তর প্রশান্তি লাভ করে। জেনে রাখো, আল্লাহর স্মরণেই অন্তরসমূহ প্রশান্তি পায়।", en: "Those who have believed and whose hearts are assured by the remembrance of Allah. Unquestionably, by the remembrance of Allah hearts are assured.", pron: "আল্লাযীনা আ-মানূ ওয়া তাতমাইন্নু কুলূবুহুম বিযিকরিল্লা-হ। আলা- বিযিকরিল্লা-হি তাতমাইন্নুল কুলূব।", tafsirBn: "দুশ্চিন্তা ও উদ্বেগের সময়ের সর্বোত্তম প্রতিকার — আল্লাহর যিকির।" },
  { surah: 17, number: 23, arabic: "وَقَضَىٰ رَبُّكَ أَلَّا تَعْبُدُوٓا۟ إِلَّآ إِيَّاهُ وَبِٱلْوَٰلِدَيْنِ إِحْسَٰنًا ۚ إِمَّا يَبْلُغَنَّ عِندَكَ ٱلْكِبَرَ أَحَدُهُمَآ أَوْ كِلَاهُمَا فَلَا تَقُل لَّهُمَآ أُفٍّ وَلَا تَنْهَرْهُمَا وَقُل لَّهُمَا قَوْلًا كَرِيمًا", bn: "তোমার প্রতিপালক আদেশ দিয়েছেন যে, তোমরা তিনি ছাড়া অন্য কারো ইবাদত করবে না এবং মা-বাবার সাথে সদ্ব্যবহার করবে। তাদের একজন বা উভয়ে তোমার কাছে বৃদ্ধ বয়সে পৌঁছে গেলে তাদের 'উফ' শব্দটিও বলো না, ধমক দিও না; বরং তাদের সাথে সম্মানজনক কথা বলো।", en: "And your Lord has decreed that you not worship except Him, and to parents, good treatment...", pron: "ওয়া কাদা- রাব্বুকা আল্লা- তা'বুদূ ইল্লা- ইইয়া-হু ওয়া বিল ওয়া-লিদাইনি ইহসা-না।" },

  /* ---------------- 18, 36, 39, 40, 55 ---------------- */
  { surah: 18, number: 1, arabic: "ٱلْحَمْدُ لِلَّهِ ٱلَّذِىٓ أَنزَلَ عَلَىٰ عَبْدِهِ ٱلْكِتَٰبَ وَلَمْ يَجْعَل لَّهُۥ عِوَجًا", bn: "সমস্ত প্রশংসা আল্লাহর, যিনি তাঁর বান্দার প্রতি কিতাব নাযিল করেছেন এবং তাতে কোনো বক্রতা রাখেননি।", en: "All praise is due to Allah, who has sent down upon His Servant the Book and has not made therein any deviance.", pron: "আলহামদু লিল্লা-হিল্লাযী আনযালা আলা- আবদিহিল কিতা-বা ওয়া লাম ইয়াজআল লাহূ ইওয়াজা।" },
  { surah: 18, number: 2, arabic: "قَيِّمًا لِّيُنذِرَ بَأْسًا شَدِيدًا مِّن لَّدُنْهُ وَيُبَشِّرَ ٱلْمُؤْمِنِينَ ٱلَّذِينَ يَعْمَلُونَ ٱلصَّٰلِحَٰتِ أَنَّ لَهُمْ أَجْرًا حَسَنًا", bn: "সরল, যাতে তিনি তাঁর পক্ষ থেকে কঠিন শাস্তির সতর্কবাণী দেন এবং সুসংবাদ দেন সেই মুমিনদের, যারা সৎকর্ম করে — যে তাদের জন্য রয়েছে উত্তম প্রতিদান।", en: "Straight, to warn of severe punishment from Him and to give good tidings to the believers who do righteous deeds.", pron: "কাইয়্যিমাল লিউনযিরা বা'সান শাদীদাম মিল লাদুনহু ওয়া ইউবাশশিরাল মু'মিনীনাল্লাযীনা ইয়া'মালূনাস সা-লিহা-তি।" },
  { surah: 18, number: 3, arabic: "مَّٰكِثِينَ فِيهِ أَبَدًا", bn: "যেখানে তারা চিরকাল অবস্থান করবে।", en: "In which they will remain forever.", pron: "মা-কিছীনা ফীহি আবাদা।" },
  { surah: 18, number: 4, arabic: "وَيُنذِرَ ٱلَّذِينَ قَالُوا۟ ٱتَّخَذَ ٱللَّهُ وَلَدًا", bn: "এবং সতর্ক করে তাদের, যারা বলে — আল্লাহ সন্তান গ্রহণ করেছেন।", en: "And to warn those who say, 'Allah has taken a son.'", pron: "ওয়া ইউনযিরাল্লাযীনা কা-লুত্তাখাযাল্লা-হু ওয়ালাদা।" },
  { surah: 18, number: 5, arabic: "مَّا لَهُم بِهِۦ مِنْ عِلْمٍ وَلَا لِآبَآئِهِمْ ۚ كَبُرَتْ كَلِمَةً تَخْرُجُ مِنْ أَفْوَٰهِهِمْ ۚ إِن يَقُولُونَ إِلَّا كَذِبًا", bn: "তাদেরও না, তাদের পিতৃপুরুষদেরও না — এ বিষয়ে কোনো জ্ঞানই নেই। তাদের মুখ থেকে যে কথাটি বের হয় তা কতই না জঘন্য! তারা শুধু মিথ্যাই বলে।", en: "They have no knowledge of it, nor had their fathers. Grave is the word that comes out of their mouths.", pron: "মা- লাহুম বিহী মিন ইলমিও ওয়ালা- লিআ-বা-ইহিম।" },
  { surah: 36, number: 1, arabic: "يسٓ", bn: "ইয়াসীন।", en: "Ya, Seen.", pron: "ইয়া-সীন।" },
  { surah: 36, number: 2, arabic: "وَٱلْقُرْءَانِ ٱلْحَكِيمِ", bn: "প্রজ্ঞাময় কুরআনের কসম।", en: "By the wise Qur'an.", pron: "ওয়াল কুরআ-নিল হাকীম।" },
  { surah: 36, number: 3, arabic: "إِنَّكَ لَمِنَ ٱلْمُرْسَلِينَ", bn: "নিশ্চয়ই আপনি রাসূলগণের অন্তর্ভুক্ত।", en: "Indeed you are among the messengers.", pron: "ইন্নাকা লামিনাল মুরসালীন।" },
  { surah: 36, number: 4, arabic: "عَلَىٰ صِرَٰطٍ مُّسْتَقِيمٍ", bn: "সরল পথে প্রতিষ্ঠিত।", en: "On a straight path.", pron: "আলা- সিরা-তিম মুসতাকীম।" },
  { surah: 36, number: 5, arabic: "تَنزِيلَ ٱلْعَزِيزِ ٱلرَّحِيمِ", bn: "এটি পরাক্রমশালী, পরম দয়ালুর পক্ষ থেকে নাযিলকৃত।", en: "A revelation from the Almighty, the Most Merciful.", pron: "তানযীলাল আযীযির রাহীম।" },
  { surah: 39, number: 53, arabic: "قُلْ يَٰعِبَادِىَ ٱلَّذِينَ أَسْرَفُوا۟ عَلَىٰٓ أَنفُسِهِمْ لَا تَقْنَطُوا۟ مِن رَّحْمَةِ ٱللَّهِ ۚ إِنَّ ٱللَّهَ يَغْفِرُ ٱلذُّنُوبَ جَمِيعًا ۚ إِنَّهُۥ هُوَ ٱلْغَفُورُ ٱلرَّحِيمُ", bn: "বলো, 'হে আমার বান্দারা! যারা নিজেদের প্রতি সীমালঙ্ঘন করেছ, আল্লাহর রহমত থেকে নিরাশ হয়ো না। নিশ্চয়ই আল্লাহ সমস্ত গুনাহ ক্ষমা করে দেন। তিনিই ক্ষমাশীল, পরম দয়ালু।'", en: "Say, 'O My servants who have transgressed against themselves, do not despair of the mercy of Allah...'", pron: "কুল ইয়া- ইবা-দিয়াল্লাযীনা আসরাফূ আলা- আনফুসিহিম লা- তাকনাতূ মির রাহমাতিল্লা-হ।", tafsirBn: "কুরআনের সবচেয়ে আশাব্যঞ্জক আয়াতগুলোর একটি। পাপ যত বড়ই হোক, আল্লাহর রহমত থেকে নিরাশ হওয়া নিষিদ্ধ।" },
  { surah: 40, number: 60, arabic: "وَقَالَ رَبُّكُمُ ٱدْعُونِى أَسْتَجِبْ لَكُمْ ۚ إِنَّ ٱلَّذِينَ يَسْتَكْبِرُونَ عَنْ عِبَادَتِى سَيَدْخُلُونَ جَهَنَّمَ دَاخِرِينَ", bn: "তোমাদের প্রতিপালক বলেছেন, 'তোমরা আমাকে ডাকো, আমি তোমাদের ডাকে সাড়া দেব।' নিশ্চয়ই যারা অহংকারবশত আমার ইবাদত থেকে মুখ ফিরিয়ে নেয়, তারা অবশ্যই অপমানিত অবস্থায় জাহান্নামে প্রবেশ করবে।", en: "And your Lord says, 'Call upon Me; I will respond to you.'", pron: "ওয়া কা-লা রাব্বুকুমুদ'ঊনী আস্তাজিব লাকুম।", tafsirBn: "দুআ করাই ইবাদতের মূল। এই আয়াত দুআ কবুলের সরাসরি প্রতিশ্রুতি দেয়।" },
  { surah: 55, number: 1, arabic: "ٱلرَّحْمَٰنُ", bn: "পরম করুণাময়।", en: "The Most Merciful.", pron: "আর-রাহমা-ন।" },
  { surah: 55, number: 2, arabic: "عَلَّمَ ٱلْقُرْءَانَ", bn: "তিনি কুরআন শিক্ষা দিয়েছেন।", en: "Taught the Qur'an.", pron: "আল্লামাল কুরআ-ন।" },
  { surah: 55, number: 3, arabic: "خَلَقَ ٱلْإِنسَٰنَ", bn: "তিনি মানুষ সৃষ্টি করেছেন।", en: "Created man.", pron: "খলাকাল ইনসা-ন।" },
  { surah: 55, number: 4, arabic: "عَلَّمَهُ ٱلْبَيَانَ", bn: "তিনি তাকে ভাষা ও প্রকাশক্ষমতা শিখিয়েছেন।", en: "And taught him eloquence.", pron: "আল্লামাহুল বায়া-ন।" },
  { surah: 55, number: 5, arabic: "ٱلشَّمْسُ وَٱلْقَمَرُ بِحُسْبَانٍ", bn: "সূর্য ও চন্দ্র চলে এক নির্দিষ্ট হিসাবে।", en: "The sun and the moon move by precise calculation.", pron: "আশশামসু ওয়াল কামারু বিহুসবা-ন।" },
  { surah: 55, number: 6, arabic: "وَٱلنَّجْمُ وَٱلشَّجَرُ يَسْجُدَانِ", bn: "নক্ষত্র ও বৃক্ষ সিজদা করে।", en: "And the stars and trees prostrate.", pron: "ওয়ান্নাজমু ওয়াশশাজারু ইয়াসজুদা-ন।" },
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

export function getSurah(number: number | string): QuranSurah | undefined {
  const n = typeof number === "string" ? Number(number) : number;
  return QURAN_SURAHS.find((s) => s.number === n);
}

export function getAyah(ref: string): QuranAyah | undefined {
  return QURAN_AYAHS.find((a) => a.ref === ref);
}

export function getAyahsForSurah(number: number | string): QuranAyah[] {
  const n = typeof number === "string" ? Number(number) : number;
  return QURAN_AYAHS.filter((a) => a.surah === n).sort((a, b) => a.number - b.number);
}

/** "সূরা আল-বাকারা · আয়াত ২৫৫" / "Surah Al-Baqarah · Ayah 255" */
export function ayahCitation(ayah: QuranAyah, locale: "bn" | "en" = "bn") {
  const surah = getSurah(ayah.surah);
  const name = surah ? surah.name[locale] : String(ayah.surah);
  if (locale === "en") return `Surah ${name} · Ayah ${ayah.number}`;
  return `সূরা ${name} · আয়াত ${toBnDigits(ayah.number)}`;
}

export const AYAH_OF_THE_DAY: QuranAyah = getAyah("2:255") ?? QURAN_AYAHS[0];
