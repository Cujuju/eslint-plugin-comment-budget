import { commentBudget } from './src/rules/comment-budget.ts'

export { BANNED_PATTERN_IDS } from './src/patterns.ts'
export { globToRegExp, matcherFor } from './src/glob.ts'
export { touchedFiles } from './src/touched.ts'
export { DEFAULT_IGNORED, DEFAULT_LINTED, DEFAULT_WORD_CAP, type Policy } from './src/policy.ts'

export const rules = { 'comment-budget': commentBudget }

export const plugin = { meta: { name: 'eslint-plugin-comment-budget', version: '2.2.0' }, rules }

export default plugin
