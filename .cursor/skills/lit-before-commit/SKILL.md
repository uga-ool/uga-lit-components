---
name: lit-before-commit
description: Pre-commit checklist for uga-lit-components (diff, paths, secrets, build, commit message).
---

# Before you commit (uga-lit-components)

Use when the user runs **`pre-commit-review`** or asks for a pre-commit check.

## 1. Git diff

- Run `git status` and `git diff --cached` (prefer staged changes).
- If nothing staged, use `git diff` and ask the user to stage in Source Control.

## 2. Paths

**Allowed:** `src/components/`, `src/lib/`, `demo/`, `docs/cursor/` (when asked), `CHANGELOG.md`.

**Flag:**

- `vite.config.ts` unless that was the task
- Other `src/components/uga-*.ts` not in scope
- `dist/`, `node_modules/` (generated or vendored)
- `.cursor/debug-*.log`

See [`docs/cursor/where-to-edit.md`](../../docs/cursor/where-to-edit.md).

## 3. Secrets / FERPA

No `.env`, API keys, `Bearer ` tokens, `sk-`, or Kaltura admin secrets in the diff. No student names, UGA IDs, or large caption/transcript blobs in committed files. See [`docs/cursor/secrets.md`](../../docs/cursor/secrets.md).

## 4. Scope

If the diff edits multiple unrelated `uga-*.ts` components or mixes unrelated tasks, suggest **splitting into separate commits**.

## 5. Repo-specific

- New components: file under `src/components/uga-<name>.ts`; demo under `demo/` when applicable
- User-facing changes: note in `CHANGELOG.md` when appropriate

## 6. Build

Run `npm run build` from repo root (skip or note N/A for docs-only changes). Report pass/fail.

## 7. Commit message

One imperative line from the diff (not vague). See [`.github/COMMIT_TEMPLATE`](../../.github/COMMIT_TEMPLATE) and [`docs/cursor/how-to-commit.md`](../../docs/cursor/how-to-commit.md).

## Output

- Pass/fail table for each section above
- Suggested one-line commit message

**Do not** commit or push unless the user explicitly asks.
