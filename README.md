# eslint-plugin-comment-budget

A comment block gets 30 words. Decision-record prose — dates, attributions,
what the code used to be, the figures that settled it — belongs in a decision
record or a commit message, not beside the code.

Long comments go stale silently. The code moves, the prose doesn't, and the
next reader trusts it anyway.

## Install

Not on npm. Consume it straight from GitHub:

```sh
pnpm add -D github:Cujuju/eslint-plugin-comment-budget#v2.2.0
```

It builds itself on install (`prepare` runs `tsc`), so nothing is checked in
compiled.

## Use it as an ESLint rule

```js
// eslint.config.mjs
import tseslint from 'typescript-eslint'
import budget from 'eslint-plugin-comment-budget'

export default [
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: { parser: tseslint.parser },
    plugins: { budget },
    rules: { 'budget/comment-budget': 'error' },
  },
]
```

## Adopt it on a tree that has never had it

Seed the exemption list once:

```sh
pnpm exec comment-budget-seed
```

That writes `.comment-budget.json` — every file that does not yet meet the cap.
Check it in. A whole-tree `eslint .` then passes, because those files are
forgiven — **until you touch one.**

The rule asks git which files differ from `HEAD` (staged, unstaged, or
untracked) and withdraws the exemption from those, so the cap turns back on in
your editor the moment you edit a legacy file, not at commit time. Where git
cannot answer — no repo, no commits, no git on PATH — every exemption stands.

**Buy once, cry once.** Wire `comment-budget-check` into your hooks as well —
it enforces the cap in full and consults no exemption list at all, which is what
you want on a commit gate:

```sh
comment-budget-check path/to/file.ts     # exits 2 and explains, or exits 0
```

Clean a file, re-run `comment-budget-seed`, and it drops off the list.

### Pre-commit

```sh
git config core.hooksPath .githooks
```

```bash
# .githooks/pre-commit
# Invoke through `node` rather than node_modules/.bin: pnpm writes a POSIX
# symlink on Linux and a .CMD on Windows, and neither is visible to the other.
mapfile -t staged < <(git diff --cached --name-only --diff-filter=ACMR -- '*.ts' '*.tsx')
status=0
for path in "${staged[@]}"; do
  [ -f "$path" ] || continue
  node node_modules/eslint-plugin-comment-budget/dist/bin/check-file.js "$path" || status=1
done
exit $status
```

### CI

Run `eslint .` *and* `comment-budget-check` over the files the branch changed.
Without the second step, a bypassed pre-commit hides behind the exemption list.

### Claude Code

`comment-budget-check` reads a `PostToolUse` payload on stdin, so it needs no
arguments:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write|MultiEdit",
        "hooks": [{ "type": "command", "command": "node node_modules/eslint-plugin-comment-budget/dist/bin/check-file.js", "timeout": 15 }]
      }
    ]
  }
}
```

## What it flags

| | |
|---|---|
| over-cap | a comment block over the word cap |
| iso-date | `2019-03-14` — a dated record |
| owner | an attributed decision (`owner, 2019-04-02: "…"`) |
| history | `used to be`, `superseded`, `rejected:` |
| measurement | `measured rather than`, `MEASURED:` |
| was-now | `was 30 … now 5` |
| digit-row | a row of three or more figures |

A block is a run of comments alone on consecutive lines, so splitting one long
comment into three short ones does not help. A comment sharing a line with code
stands alone, so annotating N fields is not one N-word block.

The patterns were calibrated against a large real codebase, not guessed. A
`quoted speech` pattern and a bare `measured` were cut for ~90% false positives
— idiomatic quoting of a term, and `measured against` used as a definition
rather than as evidence.

## Configuration

Policy lives in `.comment-budget.json`, beside the exemption list, so the ESLint
rule and the CLI read one source and cannot disagree. Every field is optional.

```json
{
  "wordCap": 30,
  "patterns": ["iso-date", "owner", "history", "measurement", "was-now", "digit-row"],
  "ignore": ["**/node_modules/**", "**/dist/**", "**/vendor/**", "**/.*/**", "**/*.d.ts"],
  "linted": ["**/*.ts", "**/*.tsx"],
  "exempt": ["src/legacy.ts"]
}
```

| | |
|---|---|
| `wordCap` | words allowed in one comment block. Default 30. |
| `patterns` | which banned patterns run. Default: all of them. `[]` disables the lot and leaves only the cap. |
| `ignore` | globs the budget never covers. `**` spans directories, `*` and `?` stay inside one: `**/dist*/**`, `release/**`, `packages/*/coverage/**`, `**/*.d.ts`, or an exact path. A pattern ending `/**` prunes that directory before the walk descends. |
| `linted` | globs the budget covers. Default `["**/*.ts", "**/*.tsx"]`. |
| `exempt` | files that predate adoption. Written by `comment-budget-seed`. |

`comment-budget-seed` rewrites `exempt` and hands the rest of the file back
untouched.

| | |
|---|---|
| `COMMENT_BUDGET_REDIRECT` | where the prose should go, named in every message. Defaults to "the commit message or a decision record". |

A word on `wordCap`: pick one and leave it alone. A cap you renegotiate per
comment is not a cap. But that is advice for your repo to take, not a decision
this package gets to make for you.

## Why comments are extracted twice

The ESLint rule reads comments from ESLint. Everything off-line —
`comment-budget-check`, the seeder — reads them through the TypeScript compiler,
because importing the ESLint parser costs seconds and `tsc` costs milliseconds,
which is the difference between a hook you keep and one you disable.
`test/comments.test.ts` holds the two extractors to the same answer on every
file in the repo.

## Why `dist/` is committed

A git dependency has to be usable the moment it is cloned. pnpm prepares one by
running `npm install` inside it, which is fragile across pnpm/npm versions, and
Node refuses to strip types from anything under `node_modules`, so shipping raw
`.ts` is not an option either. Committing the build is the boring thing that
always works.

Run `npm run build` and commit `dist/` with any source change.
