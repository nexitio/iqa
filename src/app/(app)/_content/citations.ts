/**
 * Citation resolution.
 *
 * `Article` and `Fatwa` carry only a `referenceCount` — the citations
 * themselves live in the shared `REFERENCES` pool and are quoted inline in the
 * Bangla body text as "(সূরা আল-বাকারা, ২৭৫)" or "(সহীহ বুখারী, ১৪০৩)".
 *
 * Rather than fabricate a linkage, this module recovers the real one: a
 * reference counts as cited when its source name appears in the body and one of
 * the numbers from its own `refBn` appears alongside that mention.
 */

import { REFERENCES } from "@/lib/data/content";
import type { ContentReference } from "@/lib/types";

const BANGLA_NUMBER = /[০-৯]+/g;

/** Characters of lookahead after a source name in which a number may appear. */
const NUMBER_WINDOW = 24;

/** The work a citation belongs to: "সূরা আল-বাকারা, আয়াত ২৭৫" -> "সূরা আল-বাকারা". */
function sourceName(refBn: string): string {
  return refBn.split(/[,،]/)[0]?.trim() ?? "";
}

/** Every Bengali-numeral figure in a citation label, e.g. "হাদীস ১৪০৩" -> ["১৪০৩"]. */
function banglaNumbers(refBn: string): string[] {
  return refBn.match(BANGLA_NUMBER) ?? [];
}

function normalise(body: string | string[]): string {
  return (Array.isArray(body) ? body.join(" ") : body).replace(/\s+/g, " ");
}

/**
 * True when the body cites this reference. Some works carry no number at all
 * (e.g. "বায়হাকী, শুআবুল ঈমান — হাসান"), in which case naming the work suffices.
 */
function isCited(text: string, reference: ContentReference): boolean {
  const name = sourceName(reference.refBn);
  if (!name) return false;

  const numbers = banglaNumbers(reference.refBn);
  let from = 0;

  for (;;) {
    const at = text.indexOf(name, from);
    if (at < 0) return false;
    if (numbers.length === 0) return true;

    const nearby = text.slice(at, at + name.length + NUMBER_WINDOW);
    if (numbers.some((n) => nearby.includes(n))) return true;

    from = at + name.length;
  }
}

/**
 * The citations a body actually relies on, in the pool's order.
 * `max` caps the result when the author's stated `referenceCount` is smaller.
 */
export function citedReferences(body: string | string[], max?: number): ContentReference[] {
  const text = normalise(body);
  const found: ContentReference[] = [];

  for (const reference of REFERENCES) {
    if (isCited(text, reference)) found.push(reference);
  }

  return max && max > 0 ? found.slice(0, max) : found;
}
