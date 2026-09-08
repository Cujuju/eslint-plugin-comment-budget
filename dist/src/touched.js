import { execFileSync } from 'node:child_process';
/**
 * Files that differ from the last commit, staged or not, plus files git has
 * never seen. Touching a file is what withdraws its exemption.
 */
const GIT_TIMEOUT_MS = 5_000;
/** An editor keeps one lint process alive for hours, so the answer must go stale. */
const CACHE_MS = 2_000;
const cache = new Map();
function git(root, args) {
    return execFileSync('git', ['-C', root, ...args], {
        encoding: 'utf8',
        timeout: GIT_TIMEOUT_MS,
        stdio: ['ignore', 'pipe', 'ignore'],
        maxBuffer: 32 * 1024 * 1024,
    });
}
function read(root) {
    try {
        const changed = git(root, ['diff', '--name-only', 'HEAD']);
        const untracked = git(root, ['ls-files', '--others', '--exclude-standard']);
        return new Set(`${changed}\n${untracked}`
            .split('\n')
            .map((line) => line.trim())
            .filter((line) => line !== ''));
    }
    catch {
        return undefined;
    }
}
/** `undefined` when git cannot answer — no repo, no commits, no git. */
export function touchedFiles(root, now = Date.now()) {
    const cached = cache.get(root);
    if (cached !== undefined && now - cached.at < CACHE_MS)
        return cached.touched;
    const touched = read(root);
    cache.set(root, { at: now, touched });
    return touched;
}
export function clearTouchedCache() {
    cache.clear();
}
