/**
 * Body outline.
 *
 * Mirrors the convention the `Prose` renderer uses to promote a paragraph to a
 * heading, so the table of contents always matches what the reader sees:
 * an explicit `### ` marker, or a short line with no terminal punctuation.
 */

export interface OutlineItem {
  text: string;
  /** Position within the source paragraph array, used as a stable key. */
  index: number;
}

export function extractHeadings(paragraphs: string[]): OutlineItem[] {
  const items: OutlineItem[] = [];

  paragraphs.forEach((raw, index) => {
    const text = raw.trim();
    if (!text) return;

    // Prose treats these as list items / quotes, never headings.
    if (/^[-•*]\s+/.test(text)) return;
    if (/^>\s?/.test(text)) return;

    if (/^#{2,4}\s/.test(text)) {
      items.push({ text: text.replace(/^#{2,4}\s+/, ""), index });
      return;
    }

    const looksLikeHeading =
      text.length <= 68 && !/[।.?!:]$/.test(text) && !text.includes("|");
    if (looksLikeHeading) items.push({ text, index });
  });

  return items;
}
