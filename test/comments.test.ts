import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Rule } from '@oxlint/plugins'
import { RuleTester } from 'oxlint/plugins-dev'
import { describe, expect, it } from 'vitest'
import { isProseComment, type CommentNode } from '../src/analyze.ts'
import { commentsOf } from '../src/comments.ts'
import { findLintedFiles } from '../src/targets.ts'

/** Linting the whole tree once through oxlint is the slow half. */
const WHOLE_TREE_TIMEOUT_MS = 120_000

const ROOT = fileURLToPath(new URL('..', import.meta.url))

type Case = { code: string; filename: string }

/** The comments oxlint hands a rule, per case, in case order. */
function viaOxlint(cases: Case[]): CommentNode[][] {
  const seen: CommentNode[][] = []
  const probe: Rule = {
    create: (context) => ({
      'Program:exit'(): void {
        // oxlint reads comments lazily from a buffer it reuses per file: copy them out during the lint.
        seen.push(context.sourceCode.getAllComments().filter(isProseComment).map((comment) => ({
          type: comment.type,
          value: comment.value,
          loc: { start: { ...comment.loc.start }, end: { ...comment.loc.end } },
        })))
      },
    }),
  }
  new RuleTester().run('probe', probe, { valid: cases, invalid: [] })
  return seen
}

const shape = (comments: CommentNode[]): string =>
  comments
    .map((comment) => `${comment.loc.start.line}:${comment.loc.start.column}-${comment.loc.end.line}:${comment.loc.end.column} ${comment.type} ${comment.value}`)
    .join('\n')

describe('comment extraction agrees with what oxlint hands the rule', () => {
  const tricky: [string, string][] = [
    ['a regex holding slashes', 'export const a = /a\\/\\/b/.test("x") // real\n'],
    ['a string holding a marker', 'export const a = "// not a comment" // real\n'],
    ['a template holding a marker', 'export const a = `/* not */ ${1}` /* real */\n'],
    ['a division that is not a regex', 'export const a = 1 / 2 / 3 // real\n'],
    ['a trailing comment after the last token', 'export const a = 1\n// last\n'],
    ['a comment between decorated members', 'export class A {\n  // one\n  b = 1 // two\n}\n'],
    ['astral characters before a comment', 'export const a = "🎉é" // after\n/* two\n lines */\n'],
  ]

  for (const [what, code] of tricky) {
    it(`matches on ${what}`, () => {
      const [linted] = viaOxlint([{ code, filename: join(ROOT, 'probe.ts') }])
      expect(shape(commentsOf(code, 'probe.ts'))).toEqual(shape(linted!))
    })
  }

  it('matches on every file the budget covers', { timeout: WHOLE_TREE_TIMEOUT_MS }, () => {
    const paths = findLintedFiles(ROOT)
    const cases = paths.map((path) => ({ code: readFileSync(join(ROOT, path), 'utf8'), filename: join(ROOT, path) }))
    const linted = viaOxlint(cases)
    expect(linted.length).toBe(cases.length)
    const disagreed = paths.filter((path, i) => shape(commentsOf(cases[i]!.code, path)) !== shape(linted[i]!))
    expect(disagreed).toEqual([])
  })
})
