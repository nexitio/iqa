import { QURAN_AYAHS, QURAN_SURAHS } from "@/lib/data/quran";
import { HADITHS } from "@/lib/data/hadith";
import { formatRef, toBnDigits } from "@/lib/bn";
import type { ContentReference } from "@/lib/types";

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
