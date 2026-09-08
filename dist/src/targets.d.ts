export declare const BUDGET_FILE = ".comment-budget.json";
/** eslint `ignores` equivalents of SKIPPED_DIRECTORIES, plus generated declarations. */
export declare const IGNORED_GLOBS: string[];
export declare const LINTED_GLOBS: string[];
export declare function isLintedFile(name: string): boolean;
/** Repo-relative posix paths of every file the budget covers, in a stable order. */
export declare function findLintedFiles(root: string): string[];
