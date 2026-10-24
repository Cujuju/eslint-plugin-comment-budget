import { dirname, relative, sep } from 'node:path'
import type { Context } from '@oxlint/plugins'
import { analyze, isProseComment, type CommentNode, type Violation } from './analyze.ts'
import { budgetFor, type Budget } from './baseline.ts'
import { policyFrom, type Policy } from './policy.ts'
import { isTouched } from './touched.ts'

/** Tests inject these; a real run walks up for the budget and asks git. */
export type RuleOptions = { budget?: Budget; root?: string; touched?: string[] }

export const OPTIONS_SCHEMA = [
  {
    type: 'object',
    properties: {
      budget: { type: 'object' },
      root: { type: 'string' },
      touched: { type: 'array', items: { type: 'string' } },
    },
    additionalProperties: false,
  },
]

type Resolved = { budget: Budget; root: string; policy: Policy; key: string; touched?: string[] }

export function resolve(context: Context): Resolved {
  const options = (context.options[0] as RuleOptions | undefined) ?? {}
  const found = budgetFor(dirname(context.filename))
  const budget = options.budget ?? found.budget
  const root = options.root ?? found.root
  return {
    budget,
    root,
    policy: policyFrom(budget),
    key: relative(root, context.filename).split(sep).join('/'),
    touched: options.touched,
  }
}

/**
 * An exemption lasts until you touch the file: editing withdraws it, so the
 * cap applies in the editor, not at commit. If git cannot answer, it stands.
 */
export function isExempt(resolved: Resolved): boolean {
  if (!resolved.budget.exempt.includes(resolved.key)) return false
  const touched =
    resolved.touched === undefined ? isTouched(resolved.root, resolved.key) : resolved.touched.includes(resolved.key)
  return touched !== true
}

export function violationsOf(context: Context, resolved: Resolved): Violation[] {
  const source = context.sourceCode
  return analyze(source.getText(), source.getAllComments().filter(isProseComment) as unknown as CommentNode[], resolved.policy)
}
