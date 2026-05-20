# How to commit (beginner-friendly)

A **commit** saves a snapshot of your changes on **your branch** with a short note about what you did.

## In Cursor (recommended)

1. **Save** your files (`Cmd+S` / `Ctrl+S`).
2. Open **Source Control** (branch icon on the left).
3. **Stage** the files you intend to commit (check only files you meant to change).
4. Run the **`pre-commit-review`** command (Command Palette → type `pre-commit-review`). Fix anything flagged, then run again if needed.
5. In the **message** box, use the suggested one-line message (or write your own), for example:
   - `Add uga-banner Lit component and demo`
6. Click **Commit**.
7. Click **Sync** or **Push** to send your branch to GitHub (ask your lead the first time).
8. On GitHub, open a **Pull request** when your work is ready for review. Before the PR, your team may use hub **`ool-pre-pr-check`** in `uga-online-cursor-docs`.

## How often? (team suggestion)

| Activity | Suggested cadence |
|----------|-------------------|
| Local commits | Every 30–90 minutes of meaningful progress (run **pre-commit-review** each time) |
| Push to remote branch | 1–3 times per day |
| Pull request | Every 1–2 days |
| Merge to main | Daily or every few days (follow your lead and reviewers) |

Adjust with your lead if your project differs. Hub detail: `uga-online-cursor-docs` [`docs/cursor/commit-rhythm.md`](https://github.com/uga-ool/uga-online-cursor-docs/blob/main/docs/cursor/commit-rhythm.md).

## Commit message help

This repo includes [`.github/COMMIT_TEMPLATE`](../../.github/COMMIT_TEMPLATE). To use it automatically in Terminal:

```bash
cd /path/to/uga-lit-components
git config commit.template "$(git rev-parse --show-toplevel)/.github/COMMIT_TEMPLATE"
```

Delete the comment lines in the template before you finish your message.

## Before every commit

- [ ] Staged files only in folders from [where-to-edit.md](where-to-edit.md)
- [ ] No `.env` or passwords in the commit
- [ ] Ran **`pre-commit-review`** (includes `npm run build` for component changes)

You can also ask Cursor to follow the **lit-before-commit** skill or run **lit-build-bundle** if you only need a build check.

## Need help?

Ask your team lead or use Cursor **Ask** mode: “What should I commit for my Lit component change?”
