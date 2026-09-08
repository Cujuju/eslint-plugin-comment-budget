#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { analyze } from '../src/analyze.ts'
import type { Budget } from '../src/baseline.ts'
import { commentsOf } from '../src/comments.ts'
import { policyFrom } from '../src/policy.ts'
import { BUDGET_FILE, findLintedFiles } from '../src/targets.ts'

/**
 * Rewrites the exemption list: every file that does not yet meet the cap. The
 * repo's policy in the same file is read and written back untouched.
 */
const root = process.cwd()
const path = join(root, BUDGET_FILE)
const existing: Budget = existsSync(path) ? (JSON.parse(readFileSync(path, 'utf8')) as Budget) : { exempt: [] }
const policy = policyFrom(existing)

const exempt: string[] = []
for (const file of findLintedFiles(root, policy)) {
  const source = readFileSync(join(root, file), 'utf8')
  if (analyze(source, commentsOf(source, file), policy).length > 0) exempt.push(file)
}

writeFileSync(path, `${JSON.stringify({ ...existing, exempt }, null, 2)}\n`)
process.stdout.write(`${BUDGET_FILE}: ${exempt.length} files exempt, cap ${policy.wordCap}\n`)
