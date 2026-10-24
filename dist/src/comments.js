import { parseSync } from 'oxc-parser';
/**
 * Off-line callers read comments from here. oxc-parser is the parser oxlint
 * runs, so these are the comments the rule sees. `test/comments.test.ts` holds both to one answer.
 */
export function commentsOf(source, path) {
    // oxc spans are UTF-16 offsets, as ESTree columns are.
    const lineStarts = [0];
    for (let i = source.indexOf('\n'); i !== -1; i = source.indexOf('\n', i + 1))
        lineStarts.push(i + 1);
    const at = (offset) => {
        let low = 0;
        let high = lineStarts.length - 1;
        while (low < high) {
            const mid = (low + high + 1) >> 1;
            if (lineStarts[mid] <= offset)
                low = mid;
            else
                high = mid - 1;
        }
        return { line: low + 1, column: offset - lineStarts[low] };
    };
    return parseSync(path, source).comments.map((comment) => ({
        type: comment.type,
        value: comment.value,
        loc: { start: at(comment.start), end: at(comment.end) },
    }));
}
