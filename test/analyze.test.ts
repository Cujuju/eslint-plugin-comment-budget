import { describe, expect, it } from 'vitest'
import { parseForESLint } from '@typescript-eslint/parser'
import { analyze, COMMENT_WORD_CAP, type CommentNode, type Violation } from '../src/analyze.ts'

function run(source: string): Violation[] {
  const { ast } = parseForESLint(source, { comment: true, loc: true, range: true })
  return analyze(source, (ast.comments ?? []) as unknown as CommentNode[])
}

function kinds(source: string): string[] {
  return run(source).map((violation) => violation.kind)
}

const words = (count: number): string => Array.from({ length: count }, (_, index) => `w${index}`).join(' ')

describe('word cap', () => {
  it('passes a block exactly at the cap', () => {
    expect(kinds(`// ${words(COMMENT_WORD_CAP)}\nexport const a = 1\n`)).toEqual([])
  })

  it('fails a block one word over the cap', () => {
    expect(kinds(`// ${words(COMMENT_WORD_CAP + 1)}\nexport const a = 1\n`)).toEqual(['over-cap'])
  })

  it('reports the word count it counted', () => {
    const [violation] = run(`// ${words(40)}\nexport const a = 1\n`)
    expect(violation?.words).toBe(40)
  })

  it('joins comments on consecutive lines into one block', () => {
    const source = `// ${words(20)}\n// ${words(20)}\nexport const a = 1\n`
    expect(kinds(source)).toEqual(['over-cap'])
  })

  it('splits blocks separated by a blank line', () => {
    const source = `// ${words(20)}\n\n// ${words(20)}\nexport const a = 1\n`
    expect(kinds(source)).toEqual([])
  })

  it('splits blocks separated by code', () => {
    const source = `// ${words(20)}\nexport const a = 1\n// ${words(20)}\nexport const b = 2\n`
    expect(kinds(source)).toEqual([])
  })

  it('keeps a trailing comment out of the block above it', () => {
    const source = `// ${words(20)}\nexport const a = 1 // ${words(20)}\n`
    expect(kinds(source)).toEqual([])
  })

  it('counts a JSDoc block without its gutter asterisks', () => {
    const source = `/**\n * ${words(15)}\n * ${words(14)}\n */\nexport const a = 1\n`
    expect(run(source)).toEqual([])
  })

  it('ignores comment-shaped text inside a string', () => {
    expect(kinds(`export const a = '// ${words(40)}'\n`)).toEqual([])
  })
})

describe('banned decision-record prose', () => {
  const cases: [string, string][] = [
    ['iso-date', '// Pinned at 4 until 2019-03-14, when the parser began tracking columns.'],
    ['owner', '// The banner reads badly on mobile (owner, 2019-04-02: "make it one line").'],
    ['history', '// The queue used to be a linked list, one node per pending request.'],
    ['history', '// Rejected: a fixed timeout needs a number the protocol never supplies.'],
    ['measurement', '// EIGHT, measured rather than assumed, on a warm cache.'],
    ['was-now', '// The retry budget was 30 seconds and is now 5, after batching the calls.'],
    ['digit-row', '// 800 600 450 337 253'],
  ]

  for (const [id, comment] of cases) {
    it(`flags ${id}`, () => {
      expect(kinds(`${comment}\nexport const a = 1\n`)).toContain(`banned:${id}`)
    })
  }

  const allowed: [string, string][] = [
    ['an owner field', '// One entry per (owner, key), evicted by age rather than by size.'],
    ['used in order to', '// The scanner is only used to find the end of the current token.'],
    ['a rejected input', '// How far past the limit a payload may run before it is rejected.'],
    ['measuring as a verb', '// Live handle count, which the pool ceiling is measured against.'],
    ['a quoted term', '// The whole "already closed" test, here rather than in the caller.'],
  ]

  for (const [what, comment] of allowed) {
    it(`allows ${what}`, () => {
      expect(kinds(`${comment}\nexport const a = 1\n`)).toEqual([])
    })
  }
})


