# Cursor AI in uga-lit-components

This repo includes **Cursor** rules, commands, and skills so the AI follows UGA Lit conventions. You do **not** need a separate docs repo open in the same window.

## Quick start (5 steps)

1. **Clone** this repo from GitHub (`uga-ool/uga-lit-components`) to your computer.
2. **Open in Cursor:** **File → Open Folder…** → select the `uga-lit-components` folder.
3. **Install and run:** `npm install`, then `npm run dev` to preview demos.
4. **Add work** in the right places — see [where-to-edit.md](where-to-edit.md).
5. **Commit** with a short message — see [how-to-commit.md](how-to-commit.md).

## What is in `.cursor/`?

| Folder | Purpose |
|--------|---------|
| `.cursor/rules/` | Policies (secrets, where to edit, Lit patterns) — applied automatically |
| `.cursor/commands/` | Palette commands such as **`pre-commit-review`**, `lit-new-component`, `lit-build-bundle` |
| `.cursor/skills/` | Playbooks (`add-lit-component`, `lit-before-commit`, `elc-valence-api`, `kaltura-api`) |

## Commit template

Git uses [`.github/COMMIT_TEMPLATE`](../.github/COMMIT_TEMPLATE) to suggest a message format. Optional local setup:

```bash
git config commit.template "$(git rev-parse --show-toplevel)/.github/COMMIT_TEMPLATE"
```

## More

- [Where to edit](where-to-edit.md)
- [How to commit](how-to-commit.md) (includes suggested cadence: commit, push, PR)
- [Secrets and FERPA](secrets.md)
- [API references (D2L, Kaltura)](api-references.md)
- Team doc hub (optional): [uga-online-cursor-docs](https://github.com/uga-ool/uga-online-cursor-docs)
