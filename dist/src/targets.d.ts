import { type PolicyInput } from './policy.ts';
export declare const BUDGET_FILE = ".comment-budget.json";
/** True when the budget covers this repo-relative path. */
export declare function isLintedPath(path: string, input?: PolicyInput): boolean;
/**
 * The CLI is handed one file and may be anywhere below the repo, so it matches
 * on the name alone when a relative path is not available.
 */
export declare function isLintedFile(name: string, input?: PolicyInput): boolean;
/** Repo-relative posix paths of every file the budget covers, in a stable order. */
export declare function findLintedFiles(root: string, input?: PolicyInput): string[];
