/**
 * Asking guidance copy, kept out of the form component so the questions asked
 * and the advice about asking stay in one place.
 */

export const ASKING_TIPS: string[] = [
  "একটি নির্দিষ্ট প্রশ্ন করুন — ভেতরে তিনটি আলাদা প্রশ্ন লুকিয়ে রাখবেন না।",
  "আপনার পরিস্থিতি সংক্ষেপে লিখুন: স্থান, সময়সীমা ও আগে কী সিদ্ধান্ত নিয়েছেন।",
  "যদি আগে কোনো ফতোয়া বা উত্তর পড়ে থাকেন, সেটিও উল্লেখ করুন।",
  "ফিকহি মতভেদের জায়গায় আপনার মাযহাব জানালে উত্তর নির্দিষ্ট হয়।",
];

/** Field names used by the ask form; exported so pages and tests can agree. */
export const askerFields = {
  title: "title",
  details: "details",
  departments: "departments",
  primaryDepartment: "primaryDepartment",
  visibility: "visibility",
  fatwaRequested: "fatwaRequested",
  urgent: "urgent",
} as const;
