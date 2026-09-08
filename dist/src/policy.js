import { BANNED_PATTERN_IDS } from "./patterns.js";
import { DEFAULT_REDIRECT } from "./redirect.js";
/** A default, not a law: a repo that wants a different cap says so. */
export const DEFAULT_WORD_CAP = 30;
export const DEFAULT_IGNORED = [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/out/**',
    '**/.*/**',
    '**/.*',
    '**/*.d.ts',
];
export const DEFAULT_LINTED = ['**/*.ts', '**/*.tsx'];
export const DEFAULT_POLICY = {
    wordCap: DEFAULT_WORD_CAP,
    redirect: DEFAULT_REDIRECT,
    patterns: [...BANNED_PATTERN_IDS],
    ignore: [...DEFAULT_IGNORED],
    linted: [...DEFAULT_LINTED],
};
export function policyFrom(input) {
    return {
        wordCap: input?.wordCap ?? DEFAULT_POLICY.wordCap,
        redirect: input?.redirect ?? DEFAULT_POLICY.redirect,
        patterns: input?.patterns ?? DEFAULT_POLICY.patterns,
        ignore: input?.ignore ?? DEFAULT_POLICY.ignore,
        linted: input?.linted ?? DEFAULT_POLICY.linted,
    };
}
