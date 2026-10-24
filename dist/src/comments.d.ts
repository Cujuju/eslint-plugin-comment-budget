import type { CommentNode } from './analyze.ts';
/**
 * Off-line callers read comments from here. oxc-parser is the parser oxlint
 * runs, so these are the comments the rule sees. `test/comments.test.ts` holds both to one answer.
 */
export declare function commentsOf(source: string, path: string): CommentNode[];
