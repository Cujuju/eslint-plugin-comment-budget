import { commentBudget } from "./src/rules/comment-budget.js";
export { BANNED_PATTERN_IDS } from "./src/patterns.js";
export { globToRegExp, matcherFor } from "./src/glob.js";
export { DEFAULT_IGNORED, DEFAULT_LINTED, DEFAULT_WORD_CAP } from "./src/policy.js";
export const rules = { 'comment-budget': commentBudget };
export const plugin = { meta: { name: 'eslint-plugin-comment-budget', version: '2.1.0' }, rules };
export default plugin;
