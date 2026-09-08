/** `undefined` when git cannot answer — no repo, no commits, no git. */
export declare function touchedFiles(root: string, now?: number): Set<string> | undefined;
export declare function clearTouchedCache(): void;
