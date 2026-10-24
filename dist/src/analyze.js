import { BANNED_PATTERNS } from './patterns.js';
import { policyFrom } from './policy.js';
/** Line and Block comments; a linter's "Shebang" (`#!` line) is not prose. */
export const isProseComment = (comment) => comment.type === 'Line' || comment.type === 'Block';
/** The parser hands back the comment body already; only the JSDoc gutter is left. */
function stripMarkers(comment) {
    if (comment.type === 'Line')
        return comment.value;
    return comment.value
        .split('\n')
        .map((line) => line.replace(/^\s*\*/, ''))
        .join('\n');
}
export function countWords(text) {
    return text.split(/\s+/u).filter((word) => word !== '').length;
}
function isOwnLine(comment, lines) {
    const before = lines[comment.loc.start.line - 1]?.slice(0, comment.loc.start.column) ?? '';
    return before.trim() === '';
}
/**
 * A block is a run of comments alone on consecutive lines. A comment sharing a
 * line with code stands alone, so annotating N fields is not one N-word block.
 */
export function groupBlocks(comments, lines) {
    const blocks = [];
    let open = [];
    const flush = () => {
        if (open.length === 0)
            return;
        blocks.push({ comments: open, text: open.map(stripMarkers).join('\n') });
        open = [];
    };
    for (const comment of comments) {
        if (!isOwnLine(comment, lines)) {
            flush();
            blocks.push({ comments: [comment], text: stripMarkers(comment) });
            continue;
        }
        const previous = open.at(-1);
        if (previous !== undefined && previous.loc.end.line + 1 !== comment.loc.start.line)
            flush();
        open.push(comment);
    }
    flush();
    return blocks;
}
function violationAt(kind, label, block, words) {
    const first = block.comments[0].loc.start;
    const last = block.comments.at(-1).loc.end;
    return {
        kind,
        label,
        words,
        line: first.line,
        column: first.column,
        endLine: last.line,
        endColumn: last.column,
    };
}
export function analyze(source, comments, input) {
    const policy = policyFrom(input);
    const enabled = BANNED_PATTERNS.filter((pattern) => policy.patterns.includes(pattern.id));
    const blocks = groupBlocks(comments, source.split('\n'));
    const violations = [];
    for (const block of blocks) {
        const words = countWords(block.text);
        if (words > policy.wordCap)
            violations.push(violationAt('over-cap', '', block, words));
        for (const pattern of enabled) {
            if (pattern.test(block.text)) {
                violations.push(violationAt(`banned:${pattern.id}`, pattern.label, block, words));
            }
        }
    }
    return violations;
}
