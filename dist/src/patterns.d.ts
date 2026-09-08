export type BannedPattern = {
    id: string;
    label: string;
    test: (text: string) => boolean;
};
/**
 * Prose that belongs in a decision record, not beside the code: dates, who
 * decided, the shape before this one, and the figures that settled it.
 */
export declare const BANNED_PATTERNS: BannedPattern[];
export declare const BANNED_PATTERN_IDS: string[];
