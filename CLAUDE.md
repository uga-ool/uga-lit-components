# CLAUDE.md — uga-lit-components

Canonical **Lit 3** web components for **UGA eLC** (D2L Brightspace). Ship one ES module for course-file embedding.

This is an **upstream / canonical** `uga-ool` repo. Edit only when the user explicitly wants changes here (otherwise prefer consuming the published bundle from a work repo or course HTML).

## Commands

```bash
npm install
npm run dev      # Vite; demos under demo/
npm run build    # dist/js/uga-components.js
npm run preview
./scripts/setup-git-hooks.sh   # once per clone (commit template)
```

Optional: `npm run test:kaltura`, `npm run quiz:csv-to-json` — see [`scripts/README.md`](scripts/README.md).

## Architecture (do not break)

| Rule | Detail |
|------|--------|
| Single bundle | Entry `src/all.ts` → `dist/js/uga-components.js` via Vite `inlineDynamicImports: true`. Avoid chunk-splitting unless intentionally changing `vite.config.ts`. |
| Auto-register | New `src/components/uga-*.ts` is picked up by `import.meta.glob` in `src/all.ts`. Do not edit `all.ts` for normal new components. |
| Light DOM | Every component: `createRenderRoot() { return this; }`. No Shadow DOM unless consumers are coordinated. |
| Axios | Bundled. Use `import axios from 'axios'` via `src/lib/api/d2l-client.ts` patterns. Do not externalize or add a second HTTP client. |
| Types | Valence shapes in `src/types/d2l.ts`. |
| Data files | Prefer `loadData()` from `src/lib/data/data-loader.ts` over raw `axios.get` for JSON. |

**eLC deploy path:** Manage Files → Public Files, typically `/shared/ugaonline/js/uga-components.js`.

## Where to edit

| Task | Path |
|------|------|
| New / change component | `src/components/uga-<name>.ts` |
| Demo | `demo/<name>.html`; link from `demo/index-all-in-one.html` |
| API helpers | `src/lib/api/`, `src/lib/data/` |
| Agent source map | `src/README.md` |
| Release notes | `CHANGELOG.md` (Unreleased) |

**Leave alone unless the task requires it:** `vite.config.ts`, unrelated `uga-*.ts` components, `dist/`, secrets.

## Design system / demos

Host pages load UGA Online Design System: Google Fonts (Merriweather, Merriweather Sans, Oswald), `base.css`, `scripts.js` — [installation](https://design.online.uga.edu/getting-started/installation/). Prefer versioned CDN URLs in production.

- Demo hub: `demo/index-all-in-one.html` (no root `index.html`)
- Start: [`demo/QUICK_START.md`](demo/QUICK_START.md), [`demo/setup.html`](demo/setup.html)
- Accordion: host `<html class="js">` for expand/collapse icons

## Secrets / FERPA

- Never commit `.env`, API keys, OAuth/Kaltura admin secrets, or LLM keys.
- `kaltura-secrets.ts` is gitignored; use `kaltura-secrets.example.ts`.
- No student names, UGA IDs, or identifiable grades in prompts, commits, or PR text.

## Skills / related tooling

Team Claude skills live in sibling **`uga-online-claude`** (catalog: `uga-online-cursor-docs/docs/cursor/claude-code-catalog.md`).

| Need | Prefer |
|------|--------|
| `uga-quiz` JSON / dropbox notes | `uga-quiz-author` |
| PR checklist | `uga-online-pr-and-code-review` |
| Role / repo handoff | `uga-online-handoff` |
| Intent markup → HTML + Lit (ID work) | `elc-intent-html` |

In-repo Cursor skills (same ideas): `.cursor/skills/` — `add-lit-component`, `lit-before-commit`, `elc-valence-api`, `kaltura-api`.

## Read first

1. [`.github/copilot-instructions.md`](.github/copilot-instructions.md) — patterns and examples  
2. [`src/README.md`](src/README.md) — component + API map  
3. [`docs/README.md`](docs/README.md) — documentation index  
4. [`WORKSPACE-HANDOFF.md`](WORKSPACE-HANDOFF.md) — multi-repo paths  
5. [`docs/CLAUDE_CODE_HANDOFF.md`](docs/CLAUDE_CODE_HANDOFF.md) — pasteable session handoff + recent work  

Feature docs: `docs/QUIZ_JSON_FORMAT.md`, `docs/QUIZ_DROPBOX_SETUP.md`, `docs/COURSE_CALENDAR_FORMAT.md`, `docs/ELC_GOOGLE_SYNC_WIDGET.md`.

## Git / PRs

- Small PRs; imperative one-line commit subjects (see `.github/COMMIT_TEMPLATE`).
- Run `npm run build` before committing component changes.
- Update `CHANGELOG.md` under Unreleased for instructor-facing behavior.
- Org: https://github.com/orgs/uga-ool/repositories
