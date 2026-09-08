import { execFileSync } from 'node:child_process'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { beforeEach, describe, expect, it } from 'vitest'
import { clearTouchedCache, isTouched } from '../src/touched.ts'

function git(root: string, ...args: string[]): void {
  execFileSync('git', ['-C', root, ...args], { stdio: 'ignore' })
}

function repoWithOneCommit(): string {
  const root = mkdtempSync(join(tmpdir(), 'touched-'))
  git(root, 'init', '-q', '-b', 'main')
  git(root, 'config', 'user.email', 'test@example.com')
  git(root, 'config', 'user.name', 'Test')
  writeFileSync(join(root, 'a.ts'), 'export const a = 1\n')
  writeFileSync(join(root, 'b.ts'), 'export const b = 2\n')
  git(root, 'add', 'a.ts', 'b.ts')
  git(root, 'commit', '-q', '-m', 'first')
  return root
}

describe('touched files', () => {
  beforeEach(() => clearTouchedCache())

  it('says no on a clean tree', () => {
    expect(isTouched(repoWithOneCommit(), 'a.ts')).toBe(false)
  })

  it('sees an unstaged edit', () => {
    const root = repoWithOneCommit()
    writeFileSync(join(root, 'a.ts'), 'export const a = 2\n')
    expect(isTouched(root, 'a.ts')).toBe(true)
    expect(isTouched(root, 'b.ts')).toBe(false)
  })

  it('sees a staged edit', () => {
    const root = repoWithOneCommit()
    writeFileSync(join(root, 'a.ts'), 'export const a = 3\n')
    git(root, 'add', 'a.ts')
    expect(isTouched(root, 'a.ts')).toBe(true)
  })

  it('sees a file git has never seen', () => {
    const root = repoWithOneCommit()
    writeFileSync(join(root, 'c.ts'), 'export const c = 3\n')
    expect(isTouched(root, 'c.ts')).toBe(true)
  })

  it('answers undefined outside a repo', () => {
    expect(isTouched(mkdtempSync(join(tmpdir(), 'norepo-')), 'a.ts')).toBeUndefined()
  })

  it('falls back to a whole-tree query once the singles stop being cheap', () => {
    const root = repoWithOneCommit()
    writeFileSync(join(root, 'a.ts'), 'export const a = 9\n')
    for (let i = 0; i < 30; i += 1) isTouched(root, `probe${i}.ts`)
    expect(isTouched(root, 'a.ts')).toBe(true)
    expect(isTouched(root, 'b.ts')).toBe(false)
  })
})
