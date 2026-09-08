/** Word cap for one comment block, from code_style.md. */
export declare const COMMENT_WORD_CAP = 30;
export type ViolationKind = 'over-cap' | `banned:${string}`;
export type Violation = {
    kind: ViolationKind;
    line: number;
    column: number;
    endLine: number;
    endColumn: number;
    /** Words in the block; only meaningful for 'over-cap'. */
    words: number;
    /** Human label of the banned pattern; empty for 'over-cap'. */
    label: string;
};
type Loc = {
    line: number;
    column: number;
};
export type CommentNode = {
    type: 'Line' | 'Block';
    value: string;
    loc: {
        start: Loc;
        end: Loc;
    };
};
type BannedPattern = {
    id: string;
    label: string;
    test: (text: string) => boolean;
};
/**
 * Prose that belongs in a decision record, not beside the code: dates, who
 * decided, the shape before this one, and the figures that settled it.
 */
export declare const BANNED_PATTERNS: BannedPattern[];
export declare function countWords(text: string): number;
type Block = {
    comments: CommentNode[];
    text: string;
};
/**
 * A block is a run of comments alone on consecutive lines. A comment sharing a
 * line with code stands alone, so annotating N fields is not one N-word block.
 */
export declare function groupBlocks(comments: CommentNode[], lines: string[]): Block[];
export declare function analyze(source: string, comments: CommentNode[]): Violation[];
export {};
