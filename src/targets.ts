import { readdirSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { matcherFor } from './glob.ts'
import { policyFrom, type PolicyInput } from './policy.ts'

export const BUDGET_FILE = '.comment-budget.json'

function posix(path: string): string {
  return path.split(sep).join('/')
}

/** True when the budget covers this repo-relative path. */
export function isLintedPath(path: string, input?: PolicyInput): boolean {
  const policy = policyFrom(input)
  const key = posix(path)
  if (matcherFor(policy.ignore).matches(key)) return false
  return matcherFor(policy.linted).matches(key)
}

/**
 * The CLI is handed one file and may be anywhere below the repo, so it matches
 * on the name alone when a relative path is not available.
 */
export function isLintedFile(name: string, input?: PolicyInput): boolean {
  return isLintedPath(name, input)
}

/** Repo-relative posix paths of every file the budget covers, in a stable order. */
export function findLintedFiles(root: string, input?: PolicyInput): string[] {
  const policy = policyFrom(input)
  const ignore = matcherFor(policy.ignore)
  const linted = matcherFor(policy.linted)
  const found: string[] = []

  const walk = (directory: string): void => {
    const entries = readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))
    for (const entry of entries) {
      const key = posix(relative(root, join(directory, entry.name)))
      if (entry.isDirectory()) {
        if (ignore.prunes(key) || ignore.matches(key)) continue
        walk(join(directory, entry.name))
      } else if (entry.isFile() && linted.matches(key) && !ignore.matches(key)) {
        found.push(key)
      }
    }
  }

  walk(root)
  return found
}
