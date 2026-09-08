import { dirname, relative, sep } from 'node:path'
import type { Rule } from 'eslint'
import { analyze, type CommentNode, type Violation } from './analyze.ts'
import { budgetFor, type Budget } from './baseline.ts'
import { policyFrom, type Policy } from './policy.ts'

/** Tests inject a budget and a root; a real run walks up for `.comment-budget.json`. */
export type RuleOptions = { budget?: Budget; root?: string }

export const OPTIONS_SCHEMA = [
  {
    type: 'object',
    properties: { budget: { type: 'object' }, root: { type: 'string' } },
    additionalProperties: false,
  },
]

type Resolved = { budget: Budget; root: string; policy: Policy }

export function resolve(context: Rule.RuleContext): Resolved {
  const options = (context.options[0] as RuleOptions | undefined) ?? {}
  const found = budgetFor(dirname(context.filename))
  const budget = options.budget ?? found.budget
  return { budget, root: options.root ?? found.root, policy: policyFrom(budget) }
}

export function isExempt(context: Rule.RuleContext, resolved: Resolved): boolean {
  return resolved.budget.exempt.includes(relative(resolved.root, context.filename).split(sep).join('/'))
}

export function violationsOf(context: Rule.RuleContext, resolved: Resolved): Violation[] {
  const source = context.sourceCode
  return analyze(source.getText(), source.getAllComments() as unknown as CommentNode[], resolved.policy)
}
