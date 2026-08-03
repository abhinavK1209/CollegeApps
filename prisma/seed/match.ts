/**
 * Name matching between the curated college catalog and College Scorecard.
 *
 * Kept separate from the import script so it can be tested without the script's
 * top-level `main()` running on import.
 */

/**
 * Folds a school name to a comparison key.
 *
 * Institution-type words are deliberately preserved — they are the whole
 * difference between "Boston College" and "Boston University", or between
 * "University of Georgia" and "Georgia Institute of Technology". An earlier
 * version stripped them and collapsed those pairs onto one key, which meant
 * one school could be enriched with another's admit rate and score ranges.
 *
 * Only case, punctuation, "&", the standalone "the", and the "-Main Campus"
 * suffix that IPEDS appends (and real college names never carry) are folded.
 */
export function normalize(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\bthe\b/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/ main campus$/, "");
}

/**
 * Shortest normalized alias allowed to decide a match. "The U" normalizes to
 * "u" and belongs to both Miami and Utah; such nicknames stay searchable in the
 * catalog but must never pick which Scorecard row a college gets.
 */
export const MIN_ALIAS_LENGTH = 3;

/** The keys a college may be matched on, most trustworthy first. */
export function matchKeys(name: string, aliases: readonly string[]): string[] {
  return [
    normalize(name),
    ...aliases.map(normalize).filter((alias) => alias.length >= MIN_ALIAS_LENGTH),
  ];
}
