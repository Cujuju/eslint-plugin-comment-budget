#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path'
import { analyze } from '../src/analyze.ts'
import { budgetFor } from '../src/baseline.ts'
import { commentsOf } from '../src/comments.ts'
import { policyFrom } from '../src/policy.ts'
import { REDIRECT } from '../src/redirect.ts'
import { isLintedPath } from '../src/targets.ts'

/**
 * One file, no eslint startup and no exemption list: whoever touches a file
 * brings it to the cap. Prints nothing when the file is clean.
 */
function report(path: string): string[] {
  const absolute = isAbsolute(path) ? path : resolve(process.cwd(), path)
  const found = budgetFor(dirname(absolute))
  const policy = policyFrom(found.budget)
  const key = relative(found.root, absolute).split(sep).join('/')
  if (!isLintedPath(key.startsWith('..') ? absolute.split(sep).pop()! : key, policy)) return []

  const source = readFileSync(absolute, 'utf8')
  return analyze(source, commentsOf(source, absolute), policy).map((violation) =>
    violation.kind === 'over-cap'
      ? `${path}:${violation.line} — ${violation.words} words, cap is ${policy.wordCap}.`
      : `${path}:${violation.line} — carries ${violation.label}.`,
  )
}

/** A PostToolUse hook hands the edited path on stdin; a shell hands it on argv. */
function pathFromStdin(): string | undefined {
  let raw: string
  try {
    raw = readFileSync(0, 'utf8')
  } catch {
    return undefined
  }
  if (raw.trim() === '') return undefined
  const payload = JSON.parse(raw) as { tool_input?: { file_path?: string } }
  return payload.tool_input?.file_path
}

const path = process.argv[2] ?? pathFromStdin()
if (path === undefined) process.exit(0)

let lines: string[] = []
try {
  lines = report(path)
} catch {
  process.exit(0)
}

if (lines.length > 0) {
  process.stderr.write(
    `Comment budget — put the reasoning in ${REDIRECT}, not in the source:\n${lines.map((line) => `  ${line}`).join('\n')}\n`,
  )
  process.exit(2)
}
