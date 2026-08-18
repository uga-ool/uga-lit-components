# Claude Code handoff — uga-lit-components

Use this when opening **Claude Code** (or a new Claude Code chat) on this repo. Claude also auto-loads root [`CLAUDE.md`](../CLAUDE.md).

**FERPA note:** No student names, UGA IDs, or grade data in this handoff.

---

## Handoff Summary

**Goal:** Continue development and maintenance of the UGA eLC Lit component library (`uga-lit-components`): components under `src/components/`, demos under `demo/`, single bundle `dist/js/uga-components.js`.

**Repos / paths:**

| Item | Path / URL |
|------|------------|
| Local clone | `/Users/todd/local_dev/uga-lit-components` |
| GitHub | https://github.com/uga-ool/uga-lit-components |
| Org | https://github.com/orgs/uga-ool/repositories |
| Related React apps | `/Users/todd/local_dev/UGA-Brightspace-React-Apps` |
| Claude skills hub | sibling `uga-online-claude` |
| Team docs hub | sibling `uga-online-cursor-docs` |

**Audience:** AI developer (upstream Lit library work).

**Files touched recently (merged via PR #38):**

- `src/components/uga-toc.ts` — optional `headings` attribute (default `h2,h3`)
- `src/components/uga-image.ts` — opt-in `shadow` (`base` / `deep` / `tinted` + color variants)
- Demos/docs: `demo/toc.html`, `demo/image.html`, `demo/index-all-in-one.html`, `demo/QUICK_START.md`, `README.md`, `CHANGELOG.md`, `src/README.md`

**Decisions already made:**

- TOC defaults remain **h2 and h3**; authors opt into other levels via `headings="h2,h3,h4"` (also accepts bare `2,3`).
- Image `shadow` is opt-in; `hover-shadow` takes precedence when both would apply.
- Light DOM only; axios stays bundled; do not change `vite.config.ts` unless the task is about the bundle shape.
- This repo is **canonical upstream** — edit only when the user explicitly targets Lit library changes.

**Open questions:**

- After PR #38 merge: pull/sync local `main` (or delete the feature branch) before new work.
- Whether to deploy an updated `uga-components.js` to eLC Public Files after merge (ops / lead).

**eLC test context:** N/A for local demos. Production script path: `/shared/ugaonline/js/uga-components.js`. Use sandbox OU only if testing Valence-backed components.

**Out of scope:**

- Editing `UGA-Brightspace-React-Template` or agent-framework for Lit feature work
- Committing secrets / `kaltura-secrets.ts`
- Shadow DOM migration

**Suggested next skill / command:**

- New component: follow `.cursor/skills/add-lit-component` or patterns in `.github/copilot-instructions.md`
- Before PR: `uga-online-pr-and-code-review` (Claude) or `lit-before-commit` (Cursor)
- Quiz JSON: `uga-quiz-author`

**References:**

- [`CLAUDE.md`](../CLAUDE.md)
- [`.github/copilot-instructions.md`](../.github/copilot-instructions.md)
- [`src/README.md`](../src/README.md)
- [`docs/README.md`](README.md)
- [`WORKSPACE-HANDOFF.md`](../WORKSPACE-HANDOFF.md)
- [`demo/QUICK_START.md`](../demo/QUICK_START.md)
- PR: https://github.com/uga-ool/uga-lit-components/pull/38 (merged)

---

## First chat paste (Claude Code)

Copy everything below the line into a new Claude Code session with this repo as the working directory.

---

I am on the UGA Online team working in **uga-lit-components** (canonical Lit library for eLC). Read `CLAUDE.md` and `.github/copilot-instructions.md` before editing.

**My role:** AI developer

**First task:** [one sentence — e.g. sync main after PR #38, add a component, fix a demo]

Guardrails (FERPA, secrets, design system, eLC terminology) apply. This upstream repo is editable only because I am explicitly targeting Lit library work.

Prefer:

- Light DOM (`createRenderRoot() { return this; }`)
- New components as `src/components/uga-<name>.ts` + `demo/<name>.html`
- `npm run build` before committing; update `CHANGELOG.md` for user-facing behavior
- `uga-online-pr-and-code-review` before opening a PR
- `uga-online-handoff` when switching role or repo

Recent context: PR #38 merged — `uga-toc` `headings` attribute and `uga-image` `shadow` attribute. Confirm branch is based on current `main` before new commits.

Catalog: `uga-online-cursor-docs/docs/cursor/claude-code-catalog.md`
