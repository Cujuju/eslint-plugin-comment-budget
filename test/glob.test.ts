import { describe, expect, it } from 'vitest'
import { matcherFor } from '../src/glob.ts'

describe('ignore globs', () => {
  const matcher = matcherFor([
    '**/dist*/**',
    'release/**',
    '**/node_modules/**',
    'packages/*/coverage/**',
    '**/*.d.ts',
    'packages/server/src/adapters/hanime/oracle/vendor.js',
  ])

  const covered = [
    'packages/client/dist/app.js',
    'packages/client/dist-electron/main.js',
    'release/win-unpacked/app.exe',
    'packages/server/node_modules/x/index.ts',
    'packages/client/coverage/lcov.info',
    'packages/shared/src/types.d.ts',
    'packages/server/src/adapters/hanime/oracle/vendor.js',
  ]
  for (const path of covered) {
    it(`matches ${path}`, () => expect(matcher.matches(path)).toBe(true))
  }

  const spared = ['packages/client/src/app.ts', 'releases/notes.ts', 'packages/client/src/dist.ts']
  for (const path of spared) {
    it(`spares ${path}`, () => expect(matcher.matches(path)).toBe(false))
  }

  const pruned = ['packages/client/dist-electron', 'release', 'packages/client/coverage', 'node_modules']
  for (const path of pruned) {
    it(`prunes ${path} before descending`, () => expect(matcher.prunes(path)).toBe(true))
  }

  it('does not prune a directory the list does not cover', () => {
    expect(matcher.prunes('packages/client/src')).toBe(false)
  })
})
