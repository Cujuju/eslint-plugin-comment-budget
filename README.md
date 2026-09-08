# eslint-plugin-comment-budget

A comment block gets 30 words. Decision-record prose — dates, attributions,
what the code used to be, the figures that settled it — belongs in a decision
record or a commit message, not beside the code.

Long comments go stale silently. The code moves, the prose doesn't, and the
next reader trusts it anyway.

## Install

Not on npm. Consume it straight from GitHub:

```sh
pnpm add -D github:Cujuju/eslint-plugin-comment-budget#v1.1.0
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
forgiven.

**Buy once, cry once.** The forgiveness is only for files nobody touches. Wire
`comment-budget-check` into anything that knows a file was edited, and it
enforces the cap in full, ignoring the exemption list:

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
mapfile -t staged < <(git diff --cached --name-only --diff-filter=ACMR -- '*.ts' '*.tsx')
status=0
for path in "${staged[@]}"; do
  [ -f "$path" ] || continue
  node_modules/.bin/comment-budget-check "$path" || status=1
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
        "hooks": [{ "type": "command", "command": "node_modules/.bin/comment-budget-check", "timeout": 15 }]
      }
    ]
  }
}
```

## What it flags

| | |
|---|---|
| over-cap | a comment block over 30 words |
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

| | |
|---|---|
| `COMMENT_BUDGET_REDIRECT` | where the prose should go, named in every message. Defaults to "the commit message or a decision record". |

The word cap is 30 and is not configurable, on purpose: a cap you can raise is
a cap you will raise.

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
