/**
 * Referential-integrity check for the mock dataset.
 *
 * TypeScript proves the *shape* of each record but says nothing about whether
 * the ids inside them point at things that exist. The mock data was authored
 * across several parallel workstreams, so this script is the thing that catches
 * a department slug, hadith id or href that resolves to nothing.
 *
 * Run: node --experimental-strip-types scripts/verify-data.ts
 */

import { ARTICLES, FATWAS } from "../src/lib/data/content.ts";
import { DEPARTMENTS, TOPICS } from "../src/lib/data/departments.ts";
import { HADITHS, HADITH_COLLECTIONS, HADITH_BOOKS } from "../src/lib/data/hadith.ts";
import { SCHOLARS, SCHOLAR_BY_ID } from "../src/lib/data/scholars.ts";
import { SCHOLAR_BIOGRAPHIES } from "../src/lib/data/scholar-bios.ts";
import { QURAN_SURAHS, QURAN_AYAHS } from "../src/lib/data/quran.ts";
import {
  ANSWERS,
  QUESTIONS,
  ROUTING_CANDIDATES,
  REFERENCE_SUGGESTIONS,
} from "../src/lib/data/questions.ts";
import { DISCUSSIONS, DISCUSSION_REPLIES } from "../src/lib/data/community.ts";
import {
  BOOKMARKS,
  BOOKMARK_COLLECTIONS,
  JOURNEYS,
  READING_PROGRESS,
  USER_PROFILES,
  CURRENT_USER,
  NOTIFICATIONS,
} from "../src/lib/data/personal.ts";
import { DUAS, DUA_CATEGORIES } from "../src/lib/data/duas.ts";
import { FEED } from "../src/lib/data/feed.ts";
import { DAILY_AYAH_REFS, DAILY_HADITH_IDS } from "../src/lib/data/daily.ts";

const errors: string[] = [];
const warnings: string[] = [];

const fail = (msg: string) => errors.push(msg);
const warn = (msg: string) => warnings.push(msg);

/* ---------------------------------------------------------------- id sets */

const deptSlugs = new Set(DEPARTMENTS.map((d) => d.slug));
const deptIds = new Set(DEPARTMENTS.map((d) => d.id));
const scholarIds = new Set(SCHOLARS.map((s) => s.id));
const questionIds = new Set(QUESTIONS.map((q) => q.id));
const articleIds = new Set(ARTICLES.map((a) => a.id));
const fatwaIds = new Set(FATWAS.map((f) => f.id));
const hadithIds = new Set(HADITHS.map((h) => h.id));
const collectionSlugs = new Set(HADITH_COLLECTIONS.map((c) => c.slug));
const userIds = new Set([CURRENT_USER.id, ...USER_PROFILES.map((u) => u.id)]);
const discussionIds = new Set(DISCUSSIONS.map((d) => d.id));
const journeyIds = new Set(JOURNEYS.map((j) => j.id));
const ayahRefs = new Set(QURAN_AYAHS.map((a) => a.ref));
const surahNumbers = new Set(QURAN_SURAHS.map((s) => s.number));
const topicSlugs = new Set(TOPICS.map((t) => t.slug));
const bookmarkCollectionIds = new Set(BOOKMARK_COLLECTIONS.map((c) => c.id));
const duaSlugs = new Set(DUAS.map((d) => d.slug));
const duaCategorySlugs = new Set(DUA_CATEGORIES.map((c) => c.slug));

/** Accept either the department id or its slug — both are used in the data. */
const knownDept = (v: string) => deptSlugs.has(v) || deptIds.has(v);

function checkDeptList(label: string, values: string[]) {
  for (const v of values) {
    if (!knownDept(v)) fail(`${label}: unknown department "${v}"`);
  }
}

/* --------------------------------------------------------------- referential */

// Departments <-> scholars, both directions.
for (const d of DEPARTMENTS) {
  for (const sid of d.scholarIds) {
    if (!scholarIds.has(sid)) fail(`Department "${d.id}".scholarIds: unknown scholar "${sid}"`);
    else {
      const s = SCHOLAR_BY_ID[sid];
      if (!s.departmentIds.includes(d.id) && !s.departmentIds.includes(d.slug)) {
        fail(`Department "${d.id}" lists ${sid}, but ${sid}.departmentIds lacks it`);
      }
    }
  }
}
for (const s of SCHOLARS) {
  for (const did of s.departmentIds) {
    if (!knownDept(did)) fail(`Scholar "${s.id}".departmentIds: unknown department "${did}"`);
  }
  if (!s.departmentIds.includes(s.primaryDepartmentId)) {
    fail(`Scholar "${s.id}": primaryDepartmentId "${s.primaryDepartmentId}" not in departmentIds`);
  }
  if (s.departmentIds.length < 2) {
    warn(`Scholar "${s.id}" belongs to only ${s.departmentIds.length} department`);
  }
}

// Biographies. The profile page renders this archive as long-form prose, so a
// missing field or a paragraph the prose renderer would mistake for a heading is
// a visible defect rather than a silent one.
function checkBioText(label: string, value: { bn: string; en: string } | undefined) {
  if (!value) {
    fail(`${label}: missing`);
    return;
  }
  if (!value.bn.trim()) fail(`${label}: empty bn`);
  if (!value.en.trim()) fail(`${label}: empty en`);
}

const bioById = new Map(SCHOLAR_BIOGRAPHIES.map((b) => [b.scholarId, b]));
const todayIso = new Date().toISOString().slice(0, 10);

for (const s of SCHOLARS) {
  if (!bioById.has(s.id)) warn(`Scholar "${s.id}" has no biography in the archive`);
}
for (const b of SCHOLAR_BIOGRAPHIES) {
  const who = `Biography "${b.scholarId}"`;
  if (!scholarIds.has(b.scholarId)) fail(`${who}: unknown scholar`);
  if (bioById.get(b.scholarId) !== b) fail(`${who}: duplicate biography for this scholar`);

  checkBioText(`${who}.born`, b.born);
  checkBioText(`${who}.family`, b.family);
  checkBioText(`${who}.narrative`, b.narrative);
  checkBioText(`${who}.now`, b.now);
  if (b.sources.length === 0) fail(`${who}: no sources`);
  for (const source of b.sources) checkBioText(`${who}.source`, source);

  // The prose renderer turns an unpunctuated short line into a heading — right
  // for a manuscript, wrong for a biography, so every block must end a sentence.
  const paragraphs = b.narrative.bn.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  if (paragraphs.length < 2) fail(`${who}.narrative: only ${paragraphs.length} paragraph(s)`);
  for (const paragraph of paragraphs) {
    if (!/[।.!?]$/.test(paragraph)) {
      fail(`${who}.narrative: paragraph does not end a sentence — "${paragraph.slice(-24)}"`);
    }
  }

  const checkRows = <T extends { id: string }>(
    section: string,
    rows: T[],
    fields: (keyof T & string)[],
  ) => {
    if (rows.length === 0) fail(`${who}.${section}: empty list`);
    const ids = new Set<string>();
    for (const row of rows) {
      if (ids.has(row.id)) fail(`${who}.${section}: duplicate id "${row.id}"`);
      ids.add(row.id);
      for (const field of fields) {
        checkBioText(`${who}.${section}[${row.id}].${field}`, row[field] as { bn: string; en: string });
      }
    }
  };

  checkRows("teachers", b.teachers, ["name", "note"]);
  checkRows("ijazah", b.ijazah, ["title", "grantedBy"]);
  checkRows("service", b.service, ["title", "place", "period"]);
  checkRows("works", b.works, ["title", "year", "kind", "note"]);
  checkRows("students", b.students, ["name", "note"]);
  checkRows("awards", b.awards, ["title", "year"]);

  // Optional detail still has to be complete when it is there.
  for (const post of b.service) {
    if (post.note) checkBioText(`${who}.service[${post.id}].note`, post.note);
  }
  for (const award of b.awards) {
    if (award.note) checkBioText(`${who}.awards[${award.id}].note`, award.note);
  }

  // A year a reader can place: four ASCII digits in the English record.
  for (const work of b.works) {
    if (!/^\d{4}$/.test(work.year.en)) fail(`${who}.works[${work.id}]: year.en "${work.year.en}" is not a year`);
  }
  for (const award of b.awards) {
    if (!/^\d{4}$/.test(award.year.en)) fail(`${who}.awards[${award.id}]: year.en "${award.year.en}" is not a year`);
  }

  // "Last checked" must be a real date that has already happened.
  if (!/^\d{4}-\d{2}-\d{2}$/.test(b.updatedAt) || Number.isNaN(Date.parse(b.updatedAt))) {
    fail(`${who}.updatedAt "${b.updatedAt}" is not an ISO date`);
  } else if (b.updatedAt > todayIso) {
    fail(`${who}.updatedAt "${b.updatedAt}" is in the future`);
  }
}

// Every department should have at least one scholar so routing has a target.
for (const d of DEPARTMENTS) {
  if (d.scholarIds.length === 0) fail(`Department "${d.id}" has no scholars assigned`);
}

// Topics -> departments.
for (const t of TOPICS) {
  checkDeptList(`Topic "${t.slug}".departmentSlugs`, t.departmentSlugs);
}

// Topic references may legitimately point at a Topic *or* at a Department —
// departments are themselves browsable subjects, and authored content tags
// itself with both. Only a value that is neither is a real defect.
function checkTopics(label: string, values: string[]) {
  for (const v of values) {
    if (!topicSlugs.has(v) && !knownDept(v)) {
      fail(`${label}: "${v}" is neither a Topic nor a Department`);
    }
  }
}

// Authored content.
for (const a of ARTICLES) {
  checkDeptList(`Article "${a.id}".departmentIds`, a.departmentIds);
  if (!scholarIds.has(a.authorId)) fail(`Article "${a.id}": unknown author "${a.authorId}"`);
  checkTopics(`Article "${a.id}".topicIds`, a.topicIds);
}
for (const f of FATWAS) {
  checkDeptList(`Fatwa "${f.id}".departmentIds`, f.departmentIds);
  if (!scholarIds.has(f.muftiId)) fail(`Fatwa "${f.id}": unknown muftiId "${f.muftiId}"`);
  for (const c of f.coSignerIds) {
    if (!scholarIds.has(c)) fail(`Fatwa "${f.id}".coSignerIds: unknown scholar "${c}"`);
  }
}

// Q&A.
for (const q of QUESTIONS) {
  checkDeptList(`Question "${q.id}".departmentIds`, q.departmentIds);
  checkTopics(`Question "${q.id}".topicIds`, q.topicIds);
  if (!userIds.has(q.askerId)) fail(`Question "${q.id}": unknown askerId "${q.askerId}"`);
}
for (const a of ANSWERS) {
  if (!questionIds.has(a.questionId)) {
    fail(`Answer "${a.id}": unknown questionId "${a.questionId}"`);
  }
  if (!scholarIds.has(a.scholarId)) fail(`Answer "${a.id}": unknown scholarId "${a.scholarId}"`);
  if (a.becameFatwaSlug) {
    const ok = FATWAS.some((f) => f.slug === a.becameFatwaSlug);
    if (!ok) fail(`Answer "${a.id}": becameFatwaSlug "${a.becameFatwaSlug}" matches no fatwa slug`);
  }
}
// answerCount must match reality.
for (const q of QUESTIONS) {
  const actual = ANSWERS.filter((a) => a.questionId === q.id).length;
  if (actual !== q.answerCount) {
    fail(`Question "${q.id}": answerCount=${q.answerCount} but ${actual} answers exist`);
  }
}
// Answered questions need an accepted answer.
for (const q of QUESTIONS) {
  if (q.status !== "answered" && q.status !== "closed") continue;
  const accepted = ANSWERS.filter((a) => a.questionId === q.id && a.accepted).length;
  if (accepted !== 1) {
    fail(`Question "${q.id}" (${q.status}) has ${accepted} accepted answers, expected 1`);
  }
}

// Routing.
for (const [qid, candidates] of Object.entries(ROUTING_CANDIDATES)) {
  if (!questionIds.has(qid)) fail(`ROUTING_CANDIDATES: unknown question key "${qid}"`);
  const question = QUESTIONS.find((q) => q.id === qid);
  const scores = candidates.map((c) => c.score);
  for (let i = 1; i < scores.length; i++) {
    if (scores[i] > scores[i - 1]) fail(`ROUTING_CANDIDATES["${qid}"]: scores not descending`);
  }
  candidates.forEach((c, i) => {
    if (c.priority !== i + 1) fail(`ROUTING_CANDIDATES["${qid}"]: priority mismatch at index ${i}`);
    if (!scholarIds.has(c.scholarId)) fail(`ROUTING_CANDIDATES["${qid}"]: unknown scholar "${c.scholarId}"`);
    checkDeptList(`ROUTING_CANDIDATES["${qid}"]`, c.matchedDepartmentIds);
  });
  if (question && candidates.length > 0) {
    const top = SCHOLAR_BY_ID[candidates[0].scholarId];
    const overlaps = top
      ? top.departmentIds.filter((d) => question.departmentIds.includes(d))
      : [];
    if (overlaps.length === 0) {
      fail(`ROUTING_CANDIDATES["${qid}"]: top scholar "${candidates[0].scholarId}" shares no department with the question`);
    }
  }
}
// Every non-closed question should have routing candidates.
for (const q of QUESTIONS) {
  if (q.status === "closed") continue;
  const c = ROUTING_CANDIDATES[q.id];
  if (!c || c.length === 0) fail(`Question "${q.id}" (${q.status}) has no routing candidates`);
}

// Smart reference suggestions: department-ish topic tags should be sane.
for (const s of REFERENCE_SUGGESTIONS) {
  if (s.score < 0 || s.score > 1) fail(`Suggestion "${s.id}": score ${s.score} out of range`);
  if (s.arabic.trim().length === 0) fail(`Suggestion "${s.id}": empty arabic`);
  if (s.matchedTerms.length === 0) fail(`Suggestion "${s.id}": no matchedTerms`);
}

// Community.
for (const d of DISCUSSIONS) {
  checkDeptList(`Discussion "${d.id}".departmentIds`, d.departmentIds);
  checkTopics(`Discussion "${d.id}".topicIds`, d.topicIds);
  if (!userIds.has(d.authorId)) warn(`Discussion "${d.id}": authorId "${d.authorId}" is not a known user`);
  const actual = DISCUSSION_REPLIES.filter((r) => r.discussionId === d.id).length;
  if (actual !== d.replyCount) {
    fail(`Discussion "${d.id}": replyCount=${d.replyCount} but ${actual} replies exist`);
  }
}
for (const r of DISCUSSION_REPLIES) {
  if (!discussionIds.has(r.discussionId)) {
    fail(`Reply "${r.id}": unknown discussionId "${r.discussionId}"`);
  }
}

// Hadith.
for (const h of HADITHS) {
  if (!collectionSlugs.has(h.collectionSlug)) {
    fail(`Hadith "${h.id}": unknown collectionSlug "${h.collectionSlug}"`);
  }
  checkDeptList(`Hadith "${h.id}".topicIds`, h.topicIds);
  if (h.arabic.trim().length === 0) fail(`Hadith "${h.id}": empty arabic`);
  if (h.translationBn.trim().length === 0) fail(`Hadith "${h.id}": empty Bangla translation`);
  const books = HADITH_BOOKS.filter((b) => b.collectionSlug === h.collectionSlug);
  if (books.length > 0 && !books.some((b) => b.number === h.bookNumber)) {
    fail(`Hadith "${h.id}": bookNumber ${h.bookNumber} not in collection "${h.collectionSlug}"`);
  }
}
for (const b of HADITH_BOOKS) {
  if (!collectionSlugs.has(b.collectionSlug)) {
    fail(`HadithBook "${b.id}": unknown collectionSlug "${b.collectionSlug}"`);
  }
}

// Qur'an.
for (const a of QURAN_AYAHS) {
  const surah = QURAN_SURAHS.find((s) => s.number === a.surah);
  if (!surah) fail(`Ayah "${a.ref}": surah ${a.surah} missing from QURAN_SURAHS`);
  else {
    if (!surah.hasText) fail(`Ayah "${a.ref}" exists but surah ${a.surah} has hasText=false`);
    if (a.number > surah.ayahCount) {
      fail(`Ayah "${a.ref}": number ${a.number} exceeds ayahCount ${surah.ayahCount}`);
    }
  }
  if (a.arabic.trim().length === 0) fail(`Ayah "${a.ref}": empty arabic`);
  if (a.translationBn.trim().length === 0) fail(`Ayah "${a.ref}": empty Bangla translation`);
  if (!a.transliterationBn || a.transliterationBn.trim().length === 0) {
    warn(`Ayah "${a.ref}": no Bangla transliteration`);
  }
  if (a.ref !== `${a.surah}:${a.number}`) fail(`Ayah id "${a.ref}" inconsistent with ${a.surah}:${a.number}`);
}
const withText = QURAN_SURAHS.filter((s) => s.hasText);
for (const s of withText) {
  if (!QURAN_AYAHS.some((a) => a.surah === s.number)) {
    fail(`Surah ${s.number} has hasText=true but no ayahs`);
  }
}
if (withText.length === 0) fail("No surah has hasText=true — the Quran reader would be empty");
if (withText.length < 3) warn(`Only ${withText.length} surahs have full text`);

// Hadith ids used by daily rotation, feed and bookmarks.
for (const id of DAILY_HADITH_IDS) {
  if (!hadithIds.has(id)) fail(`DAILY_HADITH_IDS: "${id}" is not a known hadith id`);
}
for (const ref of DAILY_AYAH_REFS) {
  if (!ayahRefs.has(ref)) warn(`DAILY_AYAH_REFS: "${ref}" has no ayah record (fallback needed)`);
}

// Duas. Every dua has to hang off a category the page can group it under, and the
// lines the cards read as text have to exist in both locales — a missing Bangla
// meaning would render as an empty paragraph rather than fail loudly.
const duaIds = new Set(DUAS.map((d) => d.id));
if (duaIds.size !== DUAS.length) fail("DUAS: duplicate dua ids");
if (duaSlugs.size !== DUAS.length) fail("DUAS: duplicate dua slugs");
if (new Set(DUA_CATEGORIES.map((c) => c.id)).size !== DUA_CATEGORIES.length) {
  fail("DUA_CATEGORIES: duplicate category ids");
}
for (const c of DUA_CATEGORIES) {
  if (!DUAS.some((d) => d.categorySlug === c.slug)) {
    warn(`DuaCategory "${c.slug}" has no duas, so it renders as an empty filter`);
  }
}
for (const d of DUAS) {
  if (!duaCategorySlugs.has(d.categorySlug)) {
    fail(`Dua "${d.id}": unknown categorySlug "${d.categorySlug}"`);
  }
  if (!d.arabic.trim()) fail(`Dua "${d.id}": empty arabic`);
  if (!d.transliterationBn.trim()) fail(`Dua "${d.id}": empty transliterationBn`);
  for (const field of ["title", "meaning", "reference", "occasion"] as const) {
    if (!d[field].bn.trim()) fail(`Dua "${d.id}": ${field}.bn is empty`);
    if (!d[field].en.trim()) fail(`Dua "${d.id}": ${field}.en is empty`);
  }
  if (!d.tags.length) fail(`Dua "${d.id}": no tags, so it is unreachable from search`);
}
if (DUA_CATEGORIES.some((c) => !c.description.bn.trim() || !c.description.en.trim())) {
  fail("DUA_CATEGORIES: a category is missing its description in one locale");
}

/* ------------------------------------------------------------------- hrefs */

function checkHref(label: string, href: string) {
  const [pathPart, query] = href.split("?");
  // A fragment names a row *inside* the page — `/duas#anxiety-and-sorrow` — so it
  // is the fragment, not the path, that has to resolve to something real.
  const [path, fragment] = pathPart.split("#");
  const segs = path.split("/").filter(Boolean);
  if (segs.length === 0) return;
  const [root, a, , c] = segs;
  switch (root) {
    case "quran": {
      if (a && !surahNumbers.has(Number(a))) fail(`${label}: href "${href}" -> unknown surah ${a}`);
      break;
    }
    case "hadith": {
      if (a && !collectionSlugs.has(a)) fail(`${label}: href "${href}" -> unknown collection "${a}"`);
      if (c && !hadithIds.has(c)) fail(`${label}: href "${href}" -> unknown hadith id "${c}"`);
      break;
    }
    case "articles":
      if (a && !ARTICLES.some((x) => x.slug === a || x.id === a)) fail(`${label}: href "${href}" -> no article "${a}"`);
      break;
    case "fatwas":
      if (a && !FATWAS.some((x) => x.slug === a || x.id === a)) fail(`${label}: href "${href}" -> no fatwa "${a}"`);
      break;
    case "questions":
      if (a && a !== "ask" && !QUESTIONS.some((x) => x.slug === a || x.id === a)) {
        fail(`${label}: href "${href}" -> no question "${a}"`);
      }
      break;
    case "discussions":
      if (a && !DISCUSSIONS.some((x) => x.slug === a || x.id === a)) fail(`${label}: href "${href}" -> no discussion "${a}"`);
      break;
    case "scholars":
      if (a && !SCHOLARS.some((x) => x.slug === a || x.id === a)) fail(`${label}: href "${href}" -> no scholar "${a}"`);
      break;
    case "journey":
    case "journeys":
      if (a && !JOURNEYS.some((x) => x.slug === a || x.id === a)) fail(`${label}: href "${href}" -> no journey "${a}"`);
      break;
    case "library":
    case "profile":
    case "settings":
    case "topics":
    case "departments":
    case "daily":
    case "notifications":
    case "discussions":
    case "duas":
      break;
    default:
      warn(`${label}: href "${href}" uses unmapped root "${root}"`);
  }
  if (fragment && root === "duas" && !duaSlugs.has(fragment) && !duaCategorySlugs.has(fragment)) {
    fail(`${label}: href "${href}" -> no dua or category "${fragment}"`);
  }
  if (query && query.includes("ayah=")) {
    const [, ayah] = query.split("ayah=");
    if (a && !ayahRefs.has(`${a}:${ayah}`)) {
      warn(`${label}: href "${href}" -> no ayah record for ${a}:${ayah}`);
    }
  }
}

for (const b of BOOKMARKS) {
  checkHref(`Bookmark "${b.id}"`, b.href);
  if (b.collectionId && !bookmarkCollectionIds.has(b.collectionId)) {
    fail(`Bookmark "${b.id}": unknown collectionId "${b.collectionId}"`);
  }
}
for (const c of BOOKMARK_COLLECTIONS) {
  const actual = BOOKMARKS.filter((b) => b.collectionId === c.id).length;
  if (actual !== c.count) {
    fail(`BookmarkCollection "${c.id}": count=${c.count} but ${actual} bookmarks reference it`);
  }
}
for (const p of READING_PROGRESS) checkHref(`ReadingProgress "${p.id}"`, p.href);
for (const n of NOTIFICATIONS) checkHref(`Notification "${n.id}"`, n.href);

// Feed items must resolve.
for (const item of FEED) {
  switch (item.kind) {
    case "article":
      if (!item.articleId || !articleIds.has(item.articleId)) fail(`Feed "${item.id}": bad articleId "${item.articleId}"`);
      break;
    case "fatwa":
      if (!item.fatwaId || !fatwaIds.has(item.fatwaId)) fail(`Feed "${item.id}": bad fatwaId "${item.fatwaId}"`);
      break;
    case "question":
      if (!item.questionId || !questionIds.has(item.questionId)) fail(`Feed "${item.id}": bad questionId "${item.questionId}"`);
      break;
    case "discussion":
      if (!item.discussionId || !discussionIds.has(item.discussionId)) fail(`Feed "${item.id}": bad discussionId "${item.discussionId}"`);
      break;
    case "journey":
      if (!item.journeyId || !journeyIds.has(item.journeyId)) fail(`Feed "${item.id}": bad journeyId "${item.journeyId}"`);
      break;
    case "daily-hadith":
      if (!item.hadithId || !hadithIds.has(item.hadithId)) fail(`Feed "${item.id}": bad hadithId "${item.hadithId}"`);
      break;
    case "daily-ayah":
      if (!item.ayahRef || !ayahRefs.has(item.ayahRef)) warn(`Feed "${item.id}": ayahRef "${item.ayahRef}" has no record`);
      break;
    case "answer":
      if (!item.scholarId || !scholarIds.has(item.scholarId)) fail(`Feed "${item.id}": bad scholarId "${item.scholarId}"`);
      if (item.questionId && !questionIds.has(item.questionId)) fail(`Feed "${item.id}": bad questionId "${item.questionId}"`);
      break;
  }
}

// Journeys.
for (const j of JOURNEYS) {
  if (j.days.length !== j.totalDays) {
    fail(`Journey "${j.id}": days.length=${j.days.length} but totalDays=${j.totalDays}`);
  }
  if (j.completedDays > j.totalDays) fail(`Journey "${j.id}": completedDays exceeds totalDays`);
  for (const d of j.days) checkHref(`Journey "${j.id}" day ${d.day}`, d.href);
}

/* ---------------------------------------------------------------- reporting */

const counts = {
  departments: DEPARTMENTS.length,
  topics: TOPICS.length,
  scholars: SCHOLARS.length,
  surahs: QURAN_SURAHS.length,
  surahsWithText: withText.length,
  ayahs: QURAN_AYAHS.length,
  hadithCollections: HADITH_COLLECTIONS.length,
  hadithBooks: HADITH_BOOKS.length,
  hadiths: HADITHS.length,
  articles: ARTICLES.length,
  fatwas: FATWAS.length,
  questions: QUESTIONS.length,
  answers: ANSWERS.length,
  routingMaps: Object.keys(ROUTING_CANDIDATES).length,
  suggestions: REFERENCE_SUGGESTIONS.length,
  discussions: DISCUSSIONS.length,
  replies: DISCUSSION_REPLIES.length,
  bookmarks: BOOKMARKS.length,
  duas: DUAS.length,
  duaCategories: DUA_CATEGORIES.length,
  journeys: JOURNEYS.length,
  feed: FEED.length,
  notifications: NOTIFICATIONS.length,
  biographies: SCHOLAR_BIOGRAPHIES.length,
};

console.log("Dataset counts:", counts);
console.log(`\nDepartments referenced but not defined: ${[...deptSlugs].length} known\n`);

if (warnings.length) {
  console.log(`--- ${warnings.length} WARNINGS ---`);
  for (const w of [...new Set(warnings)].slice(0, 60)) console.log("  ⚠ " + w);
  if (new Set(warnings).size > 60) console.log(`  … and ${new Set(warnings).size - 60} more`);
}

if (errors.length) {
  console.log(`\n--- ${errors.length} ERRORS ---`);
  for (const e of [...new Set(errors)]) console.log("  ✖ " + e);
  process.exit(1);
}

console.log("\n✓ All referential integrity checks passed.");
