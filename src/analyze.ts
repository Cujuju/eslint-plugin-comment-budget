import { BANNED_PATTERNS } from './patterns.ts'
import { policyFrom, type PolicyInput } from './policy.ts'

export type ViolationKind = 'over-cap' | `banned:${string}`

export type Violation = {
  kind: ViolationKind
  line: number
  column: number
  endLine: number
  endColumn: number
  /** Words in the block; only meaningful for 'over-cap'. */
  words: number
  /** Human label of the banned pattern; empty for 'over-cap'. */
  label: string
}

type Loc = { line: number; column: number }

export type CommentNode = {
  type: 'Line' | 'Block'
  value: string
  loc: { start: Loc; end: Loc }
}

/** Line and Block comments; a linter's "Shebang" (`#!` line) is not prose. */
export const isProseComment = <C extends { type: string }>(comment: C): comment is C & { type: CommentNode['type'] } =>
  comment.type === 'Line' || comment.type === 'Block'

/** The parser hands back the comment body already; only the JSDoc gutter is left. */
function stripMarkers(comment: CommentNode): string {
  if (comment.type === 'Line') return comment.value
  return comment.value
    .split('\n')
    .map((line) => line.replace(/^\s*\*/, ''))
    .join('\n')
}

export function countWords(text: string): number {
  return text.split(/\s+/u).filter((word) => word !== '').length
}

type Block = { comments: CommentNode[]; text: string }

function isOwnLine(comment: CommentNode, lines: string[]): boolean {
  const before = lines[comment.loc.start.line - 1]?.slice(0, comment.loc.start.column) ?? ''
  return before.trim() === ''
}

/**
 * A block is a run of comments alone on consecutive lines. A comment sharing a
 * line with code stands alone, so annotating N fields is not one N-word block.
 */
export function groupBlocks(comments: CommentNode[], lines: string[]): Block[] {
  const blocks: Block[] = []
  let open: CommentNode[] = []

  const flush = (): void => {
    if (open.length === 0) return
    blocks.push({ comments: open, text: open.map(stripMarkers).join('\n') })
    open = []
  }

  for (const comment of comments) {
    if (!isOwnLine(comment, lines)) {
      flush()
      blocks.push({ comments: [comment], text: stripMarkers(comment) })
      continue
    }
    const previous = open.at(-1)
    if (previous !== undefined && previous.loc.end.line + 1 !== comment.loc.start.line) flush()
    open.push(comment)
  }
  flush()
  return blocks
}

function violationAt(kind: ViolationKind, label: string, block: Block, words: number): Violation {
  const first = block.comments[0]!.loc.start
  const last = block.comments.at(-1)!.loc.end
  return {
    kind,
    label,
    words,
    line: first.line,
    column: first.column,
    endLine: last.line,
    endColumn: last.column,
  }
}

export function analyze(source: string, comments: CommentNode[], input?: PolicyInput): Violation[] {
  const policy = policyFrom(input)
  const enabled = BANNED_PATTERNS.filter((pattern) => policy.patterns.includes(pattern.id))
  const blocks = groupBlocks(comments, source.split('\n'))
  const violations: Violation[] = []

  for (const block of blocks) {
    const words = countWords(block.text)
    if (words > policy.wordCap) violations.push(violationAt('over-cap', '', block, words))
    for (const pattern of enabled) {
      if (pattern.test(block.text)) {
        violations.push(violationAt(`banned:${pattern.id}`, pattern.label, block, words))
      }
    }
  }

  return violations
}
