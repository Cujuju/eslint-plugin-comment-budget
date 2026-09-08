import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { RuleTester } from 'eslint'
import { parser } from 'typescript-eslint'
import { describe, expect, it } from 'vitest'
import { findBudgetFile } from '../src/baseline.ts'
import { commentBudget } from '../src/rules/comment-budget.ts'

const tester = new RuleTester({ languageOptions: { parser } })

const LONG = `// ${Array.from({ length: 40 }, (_, index) => `w${index}`).join(' ')}`
const DATED = '// Pinned at 4 until 2019-03-14, when the parser began tracking columns.'
const CODE = 'export const a = 1'

const budget = (exempt: string[], touched: string[] = []) => ({ budget: { exempt }, root: '/repo', touched })

describe('comment-budget', () => {
  it('reports an over-cap block and a banned pattern', () => {
    tester.run('comment-budget', commentBudget, {
      valid: [{ code: `// short and true\n${CODE}\n`, filename: '/repo/src/a.ts', options: [budget([])] }],
      invalid: [
        {
          code: `${LONG}\n${CODE}\n`,
          filename: '/repo/src/a.ts',
          options: [budget([])],
          errors: [{ messageId: 'overCap' }],
        },
        {
          code: `${DATED}\n${CODE}\n`,
          filename: '/repo/src/a.ts',
          options: [budget([])],
          errors: [{ messageId: 'banned' }],
        },
      ],
    })
  })

  it('says nothing about a file on the exemption list', () => {
    tester.run('comment-budget', commentBudget, {
      valid: [
        { code: `${LONG}\n${DATED}\n${CODE}\n`, filename: '/repo/src/legacy.ts', options: [budget(['src/legacy.ts'])] },
      ],
      invalid: [],
    })
  })

  it('withdraws the exemption once the file is touched', () => {
    tester.run('comment-budget', commentBudget, {
      valid: [
        {
          code: `${LONG}\n${CODE}\n`,
          filename: '/repo/src/legacy.ts',
          options: [budget(['src/legacy.ts'], [])],
        },
      ],
      invalid: [
        {
          code: `${LONG}\n${CODE}\n`,
          filename: '/repo/src/legacy.ts',
          options: [budget(['src/legacy.ts'], ['src/legacy.ts'])],
          errors: [{ messageId: 'overCap' }],
        },
      ],
    })
  })

  it('exempts by exact path, not by name', () => {
    tester.run('comment-budget', commentBudget, {
      valid: [],
      invalid: [
        {
          code: `${LONG}\n${CODE}\n`,
          filename: '/repo/other/legacy.ts',
          options: [budget(['src/legacy.ts'])],
          errors: [{ messageId: 'overCap' }],
        },
      ],
    })
  })

  it('reports every violation in a touched file, not just the first', () => {
    tester.run('comment-budget', commentBudget, {
      valid: [],
      invalid: [
        {
          code: `${LONG}\n${CODE}\n\n${DATED}\n${CODE}\n`,
          filename: '/repo/src/a.ts',
          options: [budget([])],
          errors: [{ messageId: 'overCap' }, { messageId: 'banned' }],
        },
      ],
    })
  })
})

describe('budget discovery', () => {
  it('walks up to the repo root from a nested directory', () => {
    const root = mkdtempSync(join(tmpdir(), 'comment-budget-'))
    const budget = join(root, '.comment-budget.json')
    writeFileSync(budget, '{"exempt":[]}')
    const nested = join(root, 'src', 'rules')
    mkdirSync(nested, { recursive: true })
    expect(findBudgetFile(nested)).toBe(budget)
  })

  it('returns nothing above any repo', () => {
    expect(findBudgetFile('/')).toBeUndefined()
  })
})
