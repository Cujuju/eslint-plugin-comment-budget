export declare function globToRegExp(glob: string): RegExp;
/**
 * A directory can be skipped whole when a pattern covers everything under it,
 * so `release/**` prunes `release` before the walk descends into it.
 */
export declare function directoryPrefixOf(glob: string): string | undefined;
export type Matcher = {
    matches: (path: string) => boolean;
    prunes: (path: string) => boolean;
};
export declare function matcherFor(globs: string[]): Matcher;
