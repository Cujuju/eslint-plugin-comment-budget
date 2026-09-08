export { BANNED_PATTERN_IDS } from './src/patterns.ts';
export { globToRegExp, matcherFor } from './src/glob.ts';
export { DEFAULT_IGNORED, DEFAULT_LINTED, DEFAULT_WORD_CAP, type Policy } from './src/policy.ts';
export declare const rules: {
    'comment-budget': import("eslint").Rule.RuleModule;
};
export declare const plugin: {
    meta: {
        name: string;
        version: string;
    };
    rules: {
        'comment-budget': import("eslint").Rule.RuleModule;
    };
};
export default plugin;
