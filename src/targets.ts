import { readdirSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { policyFrom, type Policy, type PolicyInput } from './policy.ts'

export const BUDGET_FILE = '.comment-budget.json'

const DIRECTORY_GLOB = /^\*\*\/([^*/]+)\/\*\*$/
const EXTENSION_GLOB = /^\*\*\/\*(\.[A-Za-z0-9.]+)$/
const DOT_DIRECTORY_GLOB = '**/.*/**'

/** The seeder walks directories; the globs a consumer's eslint config uses are the same list. */
export function skippedDirectoriesOf(policy: Policy): { names: Set<string>; dotDirectories: boolean } {
  const names = new Set<string>()
  for (const glob of policy.ignore) {
    const match = DIRECTORY_GLOB.exec(glob)
    if (match !== null) names.add(match[1]!)
  }
  return { names, dotDirectories: policy.ignore.includes(DOT_DIRECTORY_GLOB) }
}

export function lintedExtensionsOf(policy: Policy): string[] {
  return policy.linted.flatMap((glob) => {
    const match = EXTENSION_GLOB.exec(glob)
    return match === null ? [] : [match[1]!]
  })
}

/** Extensions the ignore list excludes outright, such as generated declarations. */
function excludedSuffixesOf(policy: Policy): string[] {
  return policy.ignore.flatMap((glob) => {
    const match = EXTENSION_GLOB.exec(glob)
    return match === null ? [] : [match[1]!]
  })
}

export function isLintedFile(name: string, input?: PolicyInput): boolean {
  const policy = policyFrom(input)
  if (excludedSuffixesOf(policy).some((suffix) => name.endsWith(suffix))) return false
  return lintedExtensionsOf(policy).some((extension) => name.endsWith(extension))
}

/** Repo-relative posix paths of every file the budget covers, in a stable order. */
export function findLintedFiles(root: string, input?: PolicyInput): string[] {
  const policy = policyFrom(input)
  const skipped = skippedDirectoriesOf(policy)
  const found: string[] = []

  const walk = (directory: string): void => {
    const entries = readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))
    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (skipped.names.has(entry.name)) continue
        if (skipped.dotDirectories && entry.name.startsWith('.')) continue
        walk(join(directory, entry.name))
      } else if (entry.isFile() && isLintedFile(entry.name, policy)) {
        found.push(relative(root, join(directory, entry.name)).split(sep).join('/'))
      }
    }
  }

  walk(root)
  return found
}
