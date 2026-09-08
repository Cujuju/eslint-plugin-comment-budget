import { BANNED_PATTERN_IDS } from './patterns.ts'

/**
 * What this repo has decided. It lives in `.comment-budget.json` so the rule
 * and the CLI read one source and cannot drift apart.
 */
export type Policy = {
  wordCap: number
  patterns: string[]
  ignore: string[]
  linted: string[]
}

/** A default, not a law: a repo that wants a different cap says so. */
export const DEFAULT_WORD_CAP = 30

export const DEFAULT_IGNORED = [
  '**/node_modules/**',
  '**/dist/**',
  '**/build/**',
  '**/out/**',
  '**/.*/**',
  '**/*.d.ts',
]

export const DEFAULT_LINTED = ['**/*.ts', '**/*.tsx']

export const DEFAULT_POLICY: Policy = {
  wordCap: DEFAULT_WORD_CAP,
  patterns: [...BANNED_PATTERN_IDS],
  ignore: [...DEFAULT_IGNORED],
  linted: [...DEFAULT_LINTED],
}

export type PolicyInput = Partial<Policy>

export function policyFrom(input: PolicyInput | undefined): Policy {
  return {
    wordCap: input?.wordCap ?? DEFAULT_POLICY.wordCap,
    patterns: input?.patterns ?? DEFAULT_POLICY.patterns,
    ignore: input?.ignore ?? DEFAULT_POLICY.ignore,
    linted: input?.linted ?? DEFAULT_POLICY.linted,
  }
}
