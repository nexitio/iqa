/**
 * Audit the mock dataset's cross-references, then test how much of it resolves.
 *
 * Two different questions, and the second one matters more for the seed:
 *
 * 1. Does an id exist that the row points at? (`audit`)
 * 2. Can the id be normalised onto a real row — by primary key *or* by slug?
 *    The mock data predates the taxonomy, so content was authored against topic
 *    ids that are sometimes the slug ("dowry") and sometimes a topic id
 *    ("topic-riba-banking"), and a few that exist on neither side.
 */

import { ARTICLES, FATWAS, REFERENCES } from "../../src/lib/data/content.ts";
import { DEPARTMENTS, TOPICS } from "../../src/lib/data/departments.ts";
import { DISCUSSIONS } from "../../src/lib/data/community.ts";
import { DUAS, DUA_CATEGORIES } from "../../src/lib/data/duas.ts";
import { HADITHS } from "../../src/lib/data/hadith.ts";
import { QURAN_AYAHS } from "../../src/lib/data/quran.ts";
import { ANSWERS, QUESTIONS } from "../../src/lib/data/questions.ts";
import { CURRENT_USER, USER_PROFILES } from "../../src/lib/data/personal.ts";
import { ADMIN_USERS } from "../../src/lib/data/admin.ts";
import { SCHOLARS } from "../../src/lib/data/scholars.ts";

function report(label: string, used: Iterable<string>, known: Set<string>) {
  const missing = [...new Set([...used].filter((id) => !known.has(id)))].sort();
  console.log(
    `${label}: ${missing.length === 0 ? "ok" : `${missing.length} unresolvable -> ${missing.join(", ")}`}`,
  );
  return missing;
}

const topicKeys = new Set(TOPICS.flatMap((t) => [t.id, t.slug]));
const departmentKeys = new Set(DEPARTMENTS.flatMap((d) => [d.id, d.slug]));
const userIds = new Set([
  CURRENT_USER.id,
  ...USER_PROFILES.map((u) => u.id),
  ...ADMIN_USERS.map((u) => u.id),
  ...SCHOLARS.map((s) => s.id),
]);
const questionIds = new Set(QUESTIONS.map((q) => q.id));
const discussionIds = new Set(DISCUSSIONS.map((d) => d.id));
const ayahRefs = new Set(QURAN_AYAHS.map((a) => a.ref));
const hadithIds = new Set(HADITHS.map((h) => h.id));
const duaCategoryKeys = new Set(DUA_CATEGORIES.flatMap((c) => [c.id, c.slug]));

console.log(`taxonomy: ${TOPICS.length} topics, ${DEPARTMENTS.length} departments`);
console.log(
  `topics keyed by id or slug: ${TOPICS.filter((t) => t.id === t.slug).length} identical, ${TOPICS.length - TOPICS.filter((t) => t.id === t.slug).length} prefixed\n`,
);

console.log("— resolvable links —");
report("article.topicIds (id|slug)", ARTICLES.flatMap((a) => a.topicIds), topicKeys);
report("question.topicIds (id|slug)", QUESTIONS.flatMap((q) => q.topicIds), topicKeys);
report("discussion.topicIds (id|slug)", DISCUSSIONS.flatMap((d) => d.topicIds), topicKeys);
report("hadith.topicIds (id|slug)", HADITHS.flatMap((h) => h.topicIds), topicKeys);
report("article.departmentIds", ARTICLES.flatMap((a) => a.departmentIds), departmentKeys);
report("fatwa.departmentIds", FATWAS.flatMap((f) => f.departmentIds), departmentKeys);
report("question.departmentIds", QUESTIONS.flatMap((q) => q.departmentIds), departmentKeys);
report("discussion.departmentIds", DISCUSSIONS.flatMap((d) => d.departmentIds), departmentKeys);
report("topic.departmentSlugs", TOPICS.flatMap((t) => t.departmentSlugs), departmentKeys);
report("dua.categorySlug", DUAS.map((d) => d.categorySlug), duaCategoryKeys);
report("answer.questionId", ANSWERS.map((a) => a.questionId), questionIds);
report("discussion ids", DISCUSSIONS.map((d) => d.id), discussionIds);
report(
  "every author/mufti/asker",
  [
    ...ARTICLES.map((a) => a.authorId),
    ...FATWAS.map((f) => f.muftiId),
    ...QUESTIONS.map((q) => q.askerId),
    ...ANSWERS.map((a) => a.scholarId),
    ...DISCUSSIONS.map((d) => d.authorId),
  ],
  userIds,
);

console.log("\n— hadith.topicIds against departments —");
report("hadith.topicIds (department id|slug)", HADITHS.flatMap((h) => h.topicIds), departmentKeys);

console.log("\n— citation pool against the local corpus (expected to be partial) —");
report(
  "pool ayah refs",
  REFERENCES.filter((r) => r.kind === "ayah").map((r) => r.ref),
  ayahRefs,
);
report(
  "pool hadith ids",
  REFERENCES.filter((r) => r.kind === "hadith").map((r) => r.ref),
  hadithIds,
);
