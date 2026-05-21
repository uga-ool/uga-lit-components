# How to commit (beginner-friendly)

A **commit** saves a snapshot of your changes on **your branch** with a short note about what you did.

## One-time setup (after clone)

Run once per clone so Git loads [`.github/COMMIT_TEMPLATE`](../../.github/COMMIT_TEMPLATE) and validates messages:

```bash
./scripts/setup-git-hooks.sh
```

Or in Cursor: command **`setup-git-hooks`**. Pull requests also run the **Validate commit message** GitHub Action.

## In Cursor (recommended)

1. **Save** your files (`Cmd+S` / `Ctrl+S`).
2. Open **Source Control** (branch icon on the left).
3. **Stage** the files you intend to commit (check only files you meant to change).
4. Run the **`pre-commit-review`** command (Command Palette → type `pre-commit-review`). Fix anything flagged, then run again if needed.
5. In the **message** box, use the suggested one-line message (or write your own)—**one imperative line**, not the template comment lines. Example:
   - `Add uga-banner Lit component and demo`
6. Click **Commit** (hooks reject empty or vague messages if setup script was run).
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

[`.github/COMMIT_TEMPLATE`](../../.github/COMMIT_TEMPLATE) defines the format: **one short subject line** (10–72 characters), then delete all `#` comment lines before you finish. Terminal `git commit` opens the template when hooks are enabled.

Dry-run validation:

```bash
.github/scripts/validate-commit-message.sh --range origin/main..HEAD
```

## Before every commit

- [ ] Staged files only in folders from [where-to-edit.md](where-to-edit.md)
- [ ] No `.env` or passwords in the commit
- [ ] Ran **`pre-commit-review`** (includes `npm run build` for component changes)
- [ ] Ran **`setup-git-hooks.sh`** once on this clone (if not already)
- [ ] Commit subject is one clear line (not template comments)

You can also ask Cursor to follow the **lit-before-commit** skill or run **lit-build-bundle** if you only need a build check.

## Need help?

Ask your team lead or use Cursor **Ask** mode: “What should I commit for my Lit component change?”
