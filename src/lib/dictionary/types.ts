/**
 * Shapes for the string dictionary.
 *
 * Split out of `dictionary.ts` so that the per-area copy files under
 * `src/lib/dictionary/` can type their exports without importing the whole
 * dictionary into every one of them.
 */

/** Chrome strings are single lines, except a few curated lists (e.g. rules). */
export type LangValue = { bn: string | string[]; en: string | string[] };

export type Dict = Record<string, LangValue>;
