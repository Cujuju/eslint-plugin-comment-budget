import type { PolicyInput } from './policy.ts';
export type Budget = PolicyInput & {
    /**
     * Files that predate the rule, repo-relative. A whole-tree run skips them;
     * touching one does not. Cleaning a file means deleting its line here.
     */
    exempt: string[];
};
export declare const EMPTY_BUDGET: Budget;
/** The budget sits at the repo root; a linter may be pointed anywhere below it. */
export declare function findBudgetFile(from: string): string | undefined;
export declare function budgetAt(path: string): Budget;
export declare function budgetFor(from: string): {
    budget: Budget;
    root: string;
};
