export type BannedPattern = { id: string; label: string; test: (text: string) => boolean }

const ISO_DATE = /\b\d{4}-\d{2}-\d{2}\b/
const WAS_NOW = /\bwas\b[^.;]{0,40}?\b\d[\d.,%]*\b[^.;]{0,20}?\bnow\b/i

/**
 * Attribution, not the word: a record can have an `owner` field and a module
 * can have one owner. A decision is dated or quoted.
 */
const OWNER_ATTRIBUTION =
  /\bowner\s*[,:]\s*(?:\d{4}-\d{2}-\d{2}|")|\bthe owner\s+(?:said|asked|wants|wanted|called|decided|rejected|read)\b/i

/** "used to" as history, not as "used in order to"; a rejection, not a rejected input. */
const HISTORY =
  /\b(?:it|this|that|these|they|we|which|who|but|and|;)\s+used\s+to\b|\bused to be\b|\bsuperseded\b|\brejected\s*:|\bwas rejected\b|\brejected in favou?r\b|\bwe rejected\b/i

/** A figure offered as evidence, not the verb: this code measures things for a living. */
const MEASUREMENT = /\bmeasured\s+(?:rather than|on|over|in a live|live)\b|\bMEASURED\s*[:,]/

/** A row of figures: three or more numbers with at most one word among them. */
function isDigitRow(line: string): boolean {
  const stripped = line.replace(/^[\s*/|+-]+/, '').trim()
  if (stripped === '') return false
  const numbers = stripped.match(/\b\d[\d.,%]*\b/g)
  if (numbers === null || numbers.length < 3) return false
  const words = stripped.match(/[A-Za-z]{2,}/g)
  return words === null || words.length <= 1
}

/**
 * Prose that belongs in a decision record, not beside the code: dates, who
 * decided, the shape before this one, and the figures that settled it.
 */
export const BANNED_PATTERNS: BannedPattern[] = [
  { id: 'iso-date', label: 'a dated record', test: (text) => ISO_DATE.test(text) },
  { id: 'owner', label: 'an attributed decision', test: (text) => OWNER_ATTRIBUTION.test(text) },
  { id: 'history', label: 'superseded history', test: (text) => HISTORY.test(text) },
  { id: 'measurement', label: 'a measurement', test: (text) => MEASUREMENT.test(text) },
  { id: 'was-now', label: 'a before/after number', test: (text) => WAS_NOW.test(text) },
  { id: 'digit-row', label: 'a table of figures', test: (text) => text.split('\n').some(isDigitRow) },
]


export const BANNED_PATTERN_IDS = BANNED_PATTERNS.map((pattern) => pattern.id)
