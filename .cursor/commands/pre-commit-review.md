---
description: Review staged changes before commit (paths, secrets, build, message)
---

You are helping the author **before** they commit in **uga-lit-components**.

Follow skill **`lit-before-commit`** and [`docs/cursor/where-to-edit.md`](../../docs/cursor/where-to-edit.md). Per rule **`ool-local-secrets`**.

1. **Git** — Run `git status` and `git diff --cached`. If nothing is staged, run `git diff` and tell the user to stage files in Source Control first.
2. **Paths** — Flag files outside `src/components/`, `src/lib/`, `demo/`, or docs they were asked to edit. Flag `vite.config.ts`, unrelated `uga-*.ts` components, `dist/`, `node_modules/`.
3. **Secrets / FERPA** — Scan the diff for `.env`, `apiKey`, `Bearer `, `sk-`, Kaltura secrets, student names, UGA IDs, or large caption/transcript blobs in committed text.
4. **Noise** — Flag `.cursor/debug-*.log` and unrelated drive-by files.
5. **Scope** — If the diff touches multiple unrelated components or large unrelated areas, suggest **splitting commits**.
6. **Build** — Run `npm run build` from repo root; report pass/fail (or not needed if docs-only).
7. **Commit message** — Propose one imperative line from the actual diff. Reject vague messages (`fix stuff`, `updates`). Match [`.github/COMMIT_TEMPLATE`](../../.github/COMMIT_TEMPLATE).
8. **Output** — Pass/fail table for each check + suggested message. **Do not** commit or push unless the user explicitly asks.
