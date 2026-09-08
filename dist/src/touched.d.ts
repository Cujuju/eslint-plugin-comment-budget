/** `undefined` when git cannot answer — no repo, no commits, no git on PATH. */
export declare function isTouched(root: string, key: string, now?: number): boolean | undefined;
export declare function clearTouchedCache(): void;
