import { type Policy, type PolicyInput } from './policy.ts';
export declare const BUDGET_FILE = ".comment-budget.json";
/** The seeder walks directories; the globs a consumer's eslint config uses are the same list. */
export declare function skippedDirectoriesOf(policy: Policy): {
    names: Set<string>;
    dotDirectories: boolean;
};
export declare function lintedExtensionsOf(policy: Policy): string[];
export declare function isLintedFile(name: string, input?: PolicyInput): boolean;
/** Repo-relative posix paths of every file the budget covers, in a stable order. */
export declare function findLintedFiles(root: string, input?: PolicyInput): string[];
