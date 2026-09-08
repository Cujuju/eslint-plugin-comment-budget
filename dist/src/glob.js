/**
 * Enough glob to express an ignore list: `**` spans segments, `*` and `?` stay
 * inside one. Paths are repo-relative and posix, so this never sees a drive.
 */
const REGEXP_SPECIAL = /[.*+?^${}()|[\]\\]/g;
function segmentToSource(segment) {
    let source = '';
    for (const character of segment) {
        if (character === '*')
            source += '[^/]*';
        else if (character === '?')
            source += '[^/]';
        else
            source += character.replace(REGEXP_SPECIAL, '\\$&');
    }
    return source;
}
export function globToRegExp(glob) {
    const segments = glob.split('/');
    let source = '^';
    segments.forEach((segment, index) => {
        const last = index === segments.length - 1;
        if (segment === '**') {
            source += last ? '.*' : '(?:[^/]+/)*';
            return;
        }
        source += segmentToSource(segment);
        if (!last)
            source += '/';
    });
    return new RegExp(`${source}$`);
}
/**
 * A directory can be skipped whole when a pattern covers everything under it,
 * so `release/**` prunes `release` before the walk descends into it.
 */
export function directoryPrefixOf(glob) {
    return glob.endsWith('/**') ? glob.slice(0, -'/**'.length) : undefined;
}
export function matcherFor(globs) {
    const full = globs.map(globToRegExp);
    const directories = globs
        .map(directoryPrefixOf)
        .filter((prefix) => prefix !== undefined)
        .map(globToRegExp);
    return {
        matches: (path) => full.some((pattern) => pattern.test(path)),
        prunes: (path) => directories.some((pattern) => pattern.test(path)),
    };
}
