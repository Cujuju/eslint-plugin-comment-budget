import { type PolicyInput } from './policy.ts';
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
export declare function analyze(source: string, comments: CommentNode[], input?: PolicyInput): Violation[];
export {};
