import { QURAN_AYAHS, QURAN_SURAHS } from "@/lib/data/quran";
import { HADITHS } from "@/lib/data/hadith";
import { REFERENCES } from "@/lib/data/content";
import { REFERENCE_SUGGESTIONS } from "@/lib/data/questions";
import { formatRef, toBnDigits } from "@/lib/bn";
import type { ContentReference, HadithGrade } from "@/lib/types";

/** The dataset's own records, for the details a citation label cannot carry. */
const AYAH_BY_ID: Map<string, (typeof QURAN_AYAHS)[number]> = new Map(
  QURAN_AYAHS.map((ayah) => [`ayah-${ayah.surah}-${ayah.number}`, ayah]),
);
const HADITH_BY_ID: Map<string, (typeof HADITHS)[number]> = new Map(
  HADITHS.map((hadith) => [hadith.id, hadith]),
);

/**
 * The citation index behind the composer's `#` and `@` pickers.
 *
 * The writing assistant already had a *reader* for references: the draft is
 * scanned for keywords and `REFERENCE_SUGGESTIONS` proposes the ayat and ahadith
 * that match the argument being made. That is the right tool for "what should
 * this ruling lean on", and the wrong one for "I know the hadith I want". So the
 * corpus itself is indexed here — every ayah and every hadith in the dataset —
 * and the editor searches it as the scholar types.
 *
 * Two decisions worth keeping: the display strings are built in the app's own
 * citation style (`সূরা আল-বাকারা, আয়াত ২৭৫`, `সহীহ বুখারী, হাদীস ১`) so an
 * inserted reference is written the way every other reference in the product is
 * written, and the haystack carries both the Bangla and the ASCII forms of the
 * reference, because a scholar reaching for 2:255 may type "২:২৫৫" or "2:255".
 */

export interface ReferenceHit {
  kind: "ayah" | "hadith";
  /** Unique and stable: `ayah-2-255`, or the hadith's own id. */
  id: string;
  /** What the draft cites: "2:255" for an ayah, the hadith id for a hadith. */
  ref: string;
  /** How the citation reads in prose: "সূরা আল-বাকারা, আয়াত ২৭৫". */
  refBn: string;
  /** The narrower label used in dense lists: "সূরা আল-বাকারা · আয়াত ২৭৫". */
  contextBn: string;
  arabic: string;
  translationBn: string;
  /** Extra provenance, e.g. the hadith's book. */
  note?: string;
  /** Where the source itself lives in the app, so a citation can be followed. */
  href?: string;
  /** Lower-cased text the query is matched against. */
  haystack: string;
}

function buildIndex(): ReferenceHit[] {
  const surahNames = new Map(QURAN_SURAHS.map((surah) => [surah.number, surah.name.bn]));
  const surahNamesEn = new Map(QURAN_SURAHS.map((surah) => [surah.number, surah.name.en]));

  const ayat: ReferenceHit[] = QURAN_AYAHS.map((ayah) => {
    const nameBn = surahNames.get(ayah.surah) ?? `সূরা ${ayah.surah}`;
    const nameEn = surahNamesEn.get(ayah.surah) ?? `Surah ${ayah.surah}`;
    const numberBn = toBnDigits(ayah.number);
    const refBn = `সূরা ${nameBn}, আয়াত ${numberBn}`;
    return {
      kind: "ayah",
      id: `ayah-${ayah.surah}-${ayah.number}`,
      ref: ayah.ref,
      refBn,
      contextBn: `সূরা ${nameBn} · আয়াত ${numberBn}`,
      href: `/quran/${ayah.surah}#ayah-${ayah.number}`,
      arabic: ayah.arabic,
      translationBn: ayah.translationBn,
      haystack: [
        refBn,
        `${nameBn} ${numberBn}`,
        `${nameEn} ${ayah.number}`,
        formatRef(ayah.ref, "bn"),
        ayah.ref,
        ayah.translationBn,
        ayah.tafsirBn ?? "",
      ]
        .join(" ")
        .toLowerCase(),
    };
  });

  const ahadith: ReferenceHit[] = HADITHS.map((hadith) => {
    const collectionBn = hadith.collectionName.bn;
    const numberBn = toBnDigits(hadith.number);
    // The stored refBn uses ASCII digits ("সহীহ বুখারী 1"); the citation style the
    // rest of the product writes is Bangla, so the index says it that way.
    const refBn = `${collectionBn}, হাদীস ${numberBn}`;
    return {
      kind: "hadith",
      id: hadith.id,
      ref: hadith.id,
      refBn,
      contextBn: `${collectionBn} · হাদীস ${numberBn}`,
      href: `/hadith/${hadith.collectionSlug}/${hadith.id}`,
      arabic: hadith.arabic,
      translationBn: hadith.translationBn,
      note: hadith.bookName.bn,
      haystack: [
        refBn,
        `${collectionBn} ${numberBn}`,
        hadith.refBn,
        hadith.refEn,
        hadith.collectionName.en,
        hadith.bookName.bn,
        hadith.bookName.en,
        hadith.translationBn,
        hadith.lessonBn ?? "",
      ]
        .join(" ")
        .toLowerCase(),
    };
  });

  return [...ayat, ...ahadith];
}

const INDEX = buildIndex();

/**
 * What the index actually holds.
 *
 * The corpus is a curated subset, not the whole Quran and not every collection,
 * so a scholar who searches for an ayah outside it deserves to be told that
 * rather than shown a blank menu.
 */
export const REFERENCE_CORPUS = { ayat: QURAN_AYAHS.length, ahadith: HADITHS.length };

/**
 * References matching what the scholar has typed after `#` or `@`.
 *
 * An empty query returns the corpus heads rather than nothing, because the
 * picker opens the moment the trigger character is typed — a menu that is empty
 * until the reader guesses a word is a menu that teaches nothing. `prefer` only
 * orders the results: `#` leads with ayat and `@` with ahadith, the habit each
 * symbol carries in the wild, while both still search everything so neither
 * trigger is ever a dead end.
 */
export function searchReferences(
  query: string,
  { limit = 6, prefer }: { limit?: number; prefer?: "ayah" | "hadith" } = {},
): ReferenceHit[] {
  const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);

  const ranked = INDEX.map((hit, order) => {
    if (tokens.length === 0) return { hit, score: 0, order };
    let score = 0;
    for (const token of tokens) {
      const at = hit.haystack.indexOf(token);
      if (at < 0) return null;
      // A match near the front of the haystack (the citation itself) beats one
      // buried in the translation, and a citation that *starts* with the query
      // beats both.
      score += Math.max(1, 40 - Math.min(at, 39)) + (hit.refBn.toLowerCase().startsWith(token) ? 60 : 0);
    }
    return { hit, score, order };
  }).filter((row): row is { hit: ReferenceHit; score: number; order: number } => row !== null);

  ranked.sort((a, b) => {
    if (prefer) {
      const aPreferred = a.hit.kind === prefer ? 1 : 0;
      const bPreferred = b.hit.kind === prefer ? 1 : 0;
      if (aPreferred !== bPreferred) return bPreferred - aPreferred;
    }
    if (b.score !== a.score) return b.score - a.score;
    return a.order - b.order;
  });

  return ranked.slice(0, limit).map((row) => row.hit);
}

/** The index's shape, in the field the draft stores its references in. */
export function toContentReference(hit: ReferenceHit): ContentReference {
  return {
    id: hit.id,
    kind: hit.kind,
    ref: hit.ref,
    arabic: hit.arabic,
    translationBn: hit.translationBn,
    refBn: hit.refBn,
    note: hit.note,
  };
}

/* -------------------------------------------------------------------------- */
/* Reading citations back out of prose                                        */
/* -------------------------------------------------------------------------- */

/**
 * A citation as a reader meets it: the text itself, the line that says what it
 * is, and the route to the source in this app.
 *
 * A citation is written in a body as prose — `সূরা আত-তালাক, ২` — and the same
 * reference reads three different ways depending on where it appears ("সূরা
 * আল-বাকারা, আয়াত ২৭৫" in a list, that form with a `·` in a dense row, and the
 * comma-and-number form inside a sentence). Resolving any of those spellings back
 * to the reference is what lets the reader click what they are reading instead of
 * hunting for it in a panel.
 */
export interface CitationDetail extends ContentReference {
  /** The narrower label, e.g. "সূরা আল-বাকারা · আয়াত ২৭৫". */
  contextBn: string;
  /** Where to read the source itself, when the app has a page for it. */
  href?: string;
  /** Bangla pronunciation aid (উচ্চারণ), so the reader can say the ayah. */
  transliterationBn?: string;
  /** The dataset's short tafsir note, when it carries one. */
  tafsirBn?: string;
  /** The lesson a hadith carries, when the dataset states one. */
  lessonBn?: string;
  /** Grading of a hadith — labelled through the shared `grade.*` strings. */
  grade?: HadithGrade;
  /** Provenance rows: the collection, the book, the number, the narrator. */
  facts?: CitationFact[];
}

/** A provenance row on a reference: what it is, in the source's own terms. */
export interface CitationFact {
  kind: "collection" | "book" | "number" | "narrator";
  valueBn: string;
}

/**
 * The rest of what the dataset knows about a reference.
 *
 * A citation in a sentence can carry only its label, so everything else — how the
 * ayah is pronounced, what the tafsir note says, which book a hadith sits in and
 * how it is graded — has to be fetched when the panel opens. Deliberately not
 * folded into `ReferenceHit`: the picker searches thousands of times per draft and
 * this is read once, by the reader.
 */
function extraFor(hit: ReferenceHit): Partial<CitationDetail> {
  if (hit.kind === "ayah") {
    const ayah = AYAH_BY_ID.get(hit.id);
    if (!ayah) return {};
    return { transliterationBn: ayah.transliterationBn, tafsirBn: ayah.tafsirBn };
  }

  const hadith = HADITH_BY_ID.get(hit.id);
  if (!hadith) return {};
  return {
    lessonBn: hadith.lessonBn,
    grade: hadith.grade,
    facts: [
      { kind: "collection", valueBn: hadith.collectionName.bn },
      { kind: "book", valueBn: hadith.bookName.bn },
      { kind: "number", valueBn: toBnDigits(hadith.number) },
      { kind: "narrator", valueBn: hadith.narrator.bn },
    ],
  };
}

/** The index's shape, in the field a reader-facing panel needs. */
export function citationDetail(hit: ReferenceHit): CitationDetail {
  return {
    ...toContentReference(hit),
    contextBn: hit.contextBn,
    href: hit.href,
    ...extraFor(hit),
  };
}

/**
 * An attached citation, completed by whatever the index knows about it.
 *
 * A body stores a reference as a snapshot — label, Arabic, translation, the
 * author's note — because that is all a sentence needs. The panel that opens a
 * citation needs the rest: how the ayah is pronounced, its tafsir note, a
 * hadith's provenance and grading, and the page the source lives on. So the
 * snapshot stays the text — the reader is already looking at it, and a panel that
 * reworded the row it came from would be a second source of truth — while the
 * index supplies everything the snapshot never held.
 *
 * One function, because there is one answer: the same reference opened from an
 * evidence list, from the composer's rail, or from inside a sentence must not
 * show the reader three different amounts of it.
 */
export function citationDetailFor(reference: ContentReference): CitationDetail {
  const known = resolveCitationText(reference.refBn);
  if (!known) return { ...reference, contextBn: reference.refBn.replace(", ", " · ") };

  return {
    ...known,
    ...reference,
    // Anything the snapshot is missing, the index fills in.
    arabic: reference.arabic || known.arabic,
    translationBn: reference.translationBn || known.translationBn,
    note: reference.note ?? known.note,
  };
}

/**
 * One spelling of a citation, normalised so the variants compare equal.
 *
 * Bengali and ASCII digits both appear in authored bodies, and the Arabic comma
 * `،` sits alongside the Latin one, so both are folded before lookup. Digit
 * normalisation matters: "(সহীহ বুখারী, 1403)" and "(সহীহ বুখারী, ১৪০৩)" are the
 * same citation and must not need two keys.
 */
function normaliseLabel(text: string): string {
  return toBnDigits(text).replace(/،/g, ",").replace(/\s+/g, " ").trim();
}

/**
 * How one reference is written, in every spelling the product uses.
 *
 * The full label, the dense label, and the form a sentence uses — the work's name
 * followed straight by the number, with and without "আয়াত"/"হাদীস". The name is
 * also offered without its honorific prefix, because bodies cite "(তিরমিযী,
 * ১১৬২)" where a list says "সুনানে তিরমিযী, হাদীস ১১৬২".
 */
function labelKeys(detail: CitationDetail): string[] {
  const keys = new Set<string>();
  const add = (value: string | undefined) => {
    const key = value ? normaliseLabel(value) : "";
    if (key) keys.add(key);
  };

  add(detail.refBn);
  add(detail.contextBn);

  const [rawName, ...rest] = detail.refBn.split(",");
  const name = rawName?.trim() ?? "";
  // "আয়াত ২৭৫" -> "২৭৫"; a range such as "আয়াত ৫-৬" keeps its hyphen. A work
  // labelled without a number ("বায়হাকী, শুআবুল ঈমান — হাসান") has no such form,
  // and inventing one would only put junk keys in the index.
  const number = rest.join(",").replace(/^\s*(আয়াত|হাদীস)\s*/, "").trim();
  if (!name || !/^[০-৯]+(?:-[০-৯]+)?$/.test(number)) return [...keys];

  // Only the entry's *own* unit: filing an ayah under "হাদীস" would let a
  // mistyped citation point at the wrong kind of source.
  const unit = /,\s*(আয়াত|হাদীস)\s/.exec(detail.refBn)?.[1];
  const shortName = name.replace(/^(সূরা|সুনানে|সহীহ)\s+/, "");
  for (const spelling of [name, shortName]) {
    add(`${spelling}, ${number}`);
    if (unit) add(`${spelling}, ${unit} ${number}`);
  }
  return [...keys];
}

/**
 * Every citation the product knows, keyed by how it reads.
 *
 * The corpus comes first because it carries the full text and the page the source
 * lives on; the shared pools follow, so a body quoting a citation the picker has
 * never seen still resolves to the reference the evidence list shows. First key
 * wins, which is why the order matters.
 */
function buildLabelIndex(): Map<string, CitationDetail> {
  const index = new Map<string, CitationDetail>();
  const add = (detail: CitationDetail) => {
    for (const key of labelKeys(detail)) if (!index.has(key)) index.set(key, detail);
  };

  for (const hit of INDEX) add(citationDetail(hit));
  for (const reference of REFERENCES) {
    add({ ...reference, contextBn: reference.refBn.replace(", ", " · ") });
  }
  for (const suggestion of REFERENCE_SUGGESTIONS) {
    add({
      id: suggestion.id,
      kind: suggestion.kind,
      ref: suggestion.refBn,
      arabic: suggestion.arabic,
      translationBn: suggestion.translationBn,
      refBn: suggestion.refBn,
      contextBn: suggestion.contextBn,
      note: suggestion.reasonBn,
    });
  }
  return index;
}

const LABELS = buildLabelIndex();

/**
 * The reference a display string names, or nothing.
 *
 * A bare string is all a rendered body has: `**সূরা আল-বাকারা, আয়াত ২৭৫**` is
 * markup around a citation, not the citation object the editor started with. This
 * is how that string finds its way back to the text it stands for.
 */
export function resolveCitationText(text: string): CitationDetail | null {
  const bare = text.replace(/^[*\s(\[“"]+/, "").replace(/[*\s)\]”"]+$/, "");
  return LABELS.get(normaliseLabel(bare)) ?? null;
}

/** A run of prose, either plain text or one citation in it. */
export interface CitationSpan {
  text: string;
  detail?: CitationDetail;
}

/**
 * A citation as it appears inside a sentence: a work, a comma, a number.
 *
 * The leading lookbehind keeps the match from starting mid-word, which is what
 * makes the fallback below terminate: every candidate start is a word start. A
 * range is one citation — "সূরা আশ-শারহ, ৫-৬" — so the number keeps its hyphen.
 */
const CITATION = /(?<![\u0980-\u09FF])([\u0980-\u09FF][\u0980-\u09FF\s-]{1,40}?)\s*,\s*(আয়াত|হাদীস)?\s*([০-৯0-9]+(?:-[০-৯0-9]+)?)/g;

/**
 * The reference named by a comma-separated candidate, shrinking from the left.
 *
 * The pattern cannot know where a work's name begins — "আল্লাহ বলেন সূরা
 * আল-বাকারা, ২৭৫" is one lazy run — so the longest suffix that names a real
 * reference wins, and the shorter prefixes are discarded. Nothing is guessed: a
 * candidate that names nothing is left as the prose it was.
 */
function detailInWords(name: string, unit: string | undefined, digits: string): { name: string; detail: CitationDetail } | null {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const number = toBnDigits(digits);
  for (let at = 0; at < words.length; at += 1) {
    const candidate = words.slice(at).join(" ");
    const key = normaliseLabel(unit ? `${candidate}, ${unit} ${number}` : `${candidate}, ${number}`);
    const detail = LABELS.get(key);
    if (detail) return { name: candidate, detail };
  }
  return null;
}

/**
 * Split prose into plain runs and the citations among them.
 *
 * This is what puts the evidence where the reader is: a body citing "(সূরা
 * আত-তালাক, ২)" gets a highlighted, clickable reference in the sentence itself,
 * rather than a footnote number pointing at a list further down the page.
 */
export function splitCitations(text: string): CitationSpan[] {
  const spans: CitationSpan[] = [];
  let cursor = 0;
  CITATION.lastIndex = 0;

  for (let match = CITATION.exec(text); match; match = CITATION.exec(text)) {
    const found = detailInWords(match[1], match[2], match[3]);
    if (!found) {
      // Not a citation after all: move on one character, so a later citation in
      // the same line is still found.
      CITATION.lastIndex = match.index + 1;
      continue;
    }

    const start = match.index + match[1].length - found.name.length;
    if (start > cursor) spans.push({ text: text.slice(cursor, start) });
    spans.push({ text: text.slice(start, match.index + match[0].length), detail: found.detail });
    cursor = match.index + match[0].length;
    CITATION.lastIndex = cursor;
  }

  if (cursor < text.length) spans.push({ text: text.slice(cursor) });
  return spans;
}
