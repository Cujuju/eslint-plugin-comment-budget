import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, parse } from 'node:path';
import { BUDGET_FILE } from "./targets.js";
export const EMPTY_BUDGET = { exempt: [] };
const cache = new Map();
/** The budget sits at the repo root; a linter may be pointed anywhere below it. */
export function findBudgetFile(from) {
    let directory = from;
    for (;;) {
        const candidate = join(directory, BUDGET_FILE);
        if (existsSync(candidate))
            return candidate;
        const parent = dirname(directory);
        if (parent === directory || directory === parse(directory).root)
            return undefined;
        directory = parent;
    }
}
export function budgetAt(path) {
    const mtimeMs = statSync(path).mtimeMs;
    const cached = cache.get(path);
    if (cached !== undefined && cached.mtimeMs === mtimeMs)
        return cached.budget;
    const budget = JSON.parse(readFileSync(path, 'utf8'));
    cache.set(path, { mtimeMs, budget });
    return budget;
}
export function budgetFor(from) {
    const path = findBudgetFile(from);
    if (path === undefined)
        return { budget: EMPTY_BUDGET, root: from };
    return { budget: budgetAt(path), root: dirname(path) };
}
