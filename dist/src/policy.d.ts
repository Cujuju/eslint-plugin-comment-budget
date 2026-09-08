/**
 * What this repo has decided. It lives in `.comment-budget.json` so the rule
 * and the CLI read one source and cannot drift apart.
 */
export type Policy = {
    wordCap: number;
    patterns: string[];
    ignore: string[];
    linted: string[];
};
/** A default, not a law: a repo that wants a different cap says so. */
export declare const DEFAULT_WORD_CAP = 30;
export declare const DEFAULT_IGNORED: string[];
export declare const DEFAULT_LINTED: string[];
export declare const DEFAULT_POLICY: Policy;
export type PolicyInput = Partial<Policy>;
export declare function policyFrom(input: PolicyInput | undefined): Policy;
