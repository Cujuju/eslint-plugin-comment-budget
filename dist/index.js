import { commentBudget } from "./src/rules/comment-budget.js";
export { IGNORED_GLOBS, LINTED_GLOBS } from "./src/targets.js";
export const rules = { 'comment-budget': commentBudget };
export const plugin = { meta: { name: 'eslint-plugin-comment-budget', version: '1.1.0' }, rules };
export default plugin;
