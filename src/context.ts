import { dirname, relative, sep } from 'node:path'
import type { Rule } from 'eslint'
import { analyze, type CommentNode, type Violation } from './analyze.ts'
import { budgetFor, type Budget } from './baseline.ts'
import { policyFrom, type Policy } from './policy.ts'
import { touchedFiles } from './touched.ts'

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

type Resolved = { budget: Budget; root: string; policy: Policy; key: string; touched: Set<string> | undefined }

export function resolve(context: Rule.RuleContext): Resolved {
  const options = (context.options[0] as RuleOptions | undefined) ?? {}
  const found = budgetFor(dirname(context.filename))
  const budget = options.budget ?? found.budget
  const root = options.root ?? found.root
  return {
    budget,
    root,
    policy: policyFrom(budget),
    key: relative(root, context.filename).split(sep).join('/'),
    touched: options.touched === undefined ? touchedFiles(root) : new Set(options.touched),
  }
}

/**
 * An exemption is forgiveness until you touch the file. Editing one withdraws
 * it, so the cap applies in the editor rather than at commit time. When git
 * cannot answer, the exemption stands.
 */
export function isExempt(resolved: Resolved): boolean {
  if (!resolved.budget.exempt.includes(resolved.key)) return false
  return resolved.touched === undefined ? true : !resolved.touched.has(resolved.key)
}

export function violationsOf(context: Rule.RuleContext, resolved: Resolved): Violation[] {
  const source = context.sourceCode
  return analyze(source.getText(), source.getAllComments() as unknown as CommentNode[], resolved.policy)
}
