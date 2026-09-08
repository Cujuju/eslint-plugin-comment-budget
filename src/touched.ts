import { execFileSync } from 'node:child_process'

/**
 * Whether git sees a file as changed since the last commit — modified, staged
 * or never tracked. Touching a file is what withdraws its exemption.
 */
const GIT_TIMEOUT_MS = 10_000

/**
 * Asking about one file costs a stat; asking about the tree costs a full walk,
 * which on a network or drive-mounted checkout is seconds. An editor asks about
 * a handful of files and should pay the former. `eslint .` asks about hundreds
 * and should pay the latter once. Switch over when the singles stop being cheaper.
 */
const SINGLE_PATH_BUDGET = 25

/** The bulk answer is for one whole-tree run, where nothing changes underneath it. */
const BULK_CACHE_MS = 30_000

type State = { singles: number; bulk?: { at: number; touched: Set<string> | undefined } }
const states = new Map<string, State>()

function git(root: string, args: string[]): string {
  return execFileSync('git', ['-C', root, ...args], {
    encoding: 'utf8',
    timeout: GIT_TIMEOUT_MS,
    stdio: ['ignore', 'pipe', 'ignore'],
    maxBuffer: 64 * 1024 * 1024,
  })
}

function bulkRead(root: string): Set<string> | undefined {
  try {
    const changed = git(root, ['diff', '--name-only', 'HEAD'])
    const untracked = git(root, ['ls-files', '--others', '--exclude-standard'])
    return new Set(
      `${changed}\n${untracked}`
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line !== ''),
    )
  } catch {
    return undefined
  }
}

/** One path: `--porcelain` reports a modification and an untracked file alike. */
function singleRead(root: string, key: string): boolean | undefined {
  try {
    return git(root, ['status', '--porcelain', '--untracked-files=all', '--', key]).trim() !== ''
  } catch {
    return undefined
  }
}

function stateFor(root: string): State {
  const existing = states.get(root)
  if (existing !== undefined) return existing
  const created: State = { singles: 0 }
  states.set(root, created)
  return created
}

/** `undefined` when git cannot answer — no repo, no commits, no git on PATH. */
export function isTouched(root: string, key: string, now = Date.now()): boolean | undefined {
  const state = stateFor(root)

  if (state.bulk !== undefined && now - state.bulk.at < BULK_CACHE_MS) {
    return state.bulk.touched === undefined ? undefined : state.bulk.touched.has(key)
  }

  if (state.singles < SINGLE_PATH_BUDGET) {
    state.singles += 1
    return singleRead(root, key)
  }

  const touched = bulkRead(root)
  state.bulk = { at: now, touched }
  return touched === undefined ? undefined : touched.has(key)
}

export function clearTouchedCache(): void {
  states.clear()
}
