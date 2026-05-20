# Workspace handoff: UGA eLC Lit components + Brightspace React apps

Use this file in another Cursor workspace (or with another agent) so tooling and humans share the same facts about **what these repositories are**, **how they relate**, and **how to work in them** without rediscovering layout and conventions.

---

## Local paths (this machine)

| Area | Path |
|------|------|
| Lit components (primary) | `/Users/todd/local_dev/uga-lit-components` |
| React apps monorepo | `/Users/todd/local_dev/UGA-Brightspace-React-Apps` |
| `UGA-Quiz-React-App` (if present) | Cursor may list `…/uga-lit-components/UGA-Quiz-React-App` as a workspace folder; **that directory is not present in the Lit repo clone documented here**. Quiz-related work in-repo is the **`uga-quiz`** Lit component and `docs/QUIZ_JSON_FORMAT.md`. A separate React quiz app may live in another path or archive. |

Upstream org context: **https://github.com/orgs/uga-ool/repositories** (UGA Online / OOL).

---

## 1. `uga-lit-components` — UGA eLC Lit components

### Purpose

- **Lit 3** web components for **UGA eLC** (D2L Brightspace), shipped as **one** ES module for course-file / content embedding.
- **Vite 7** + **TypeScript**; components live under `src/components/`, registered via side effects and **`src/all.ts`** (`import.meta.glob` eager load — new `*.ts` files in `src/components/` are picked up without editing `all.ts` per README; confirm against current `src/all.ts` if behavior changes).

### Commands

```bash
cd /Users/todd/local_dev/uga-lit-components
npm install
npm run dev      # Vite dev server (e.g. http://localhost:5173)
npm run build    # produces dist/js/uga-components.js
npm run preview  # preview production build
```

Optional: `npm run test:kaltura` — Kaltura-related script (see `scripts/`).

### Build artifact and eLC deployment

- **Output:** `dist/js/uga-components.js` (single bundle: `vite.config.ts` uses `inlineDynamicImports: true`, entry `src/all.ts`).
- **Typical eLC path:** upload to **Manage Files → Public Files**, often referenced as `/shared/ugaonline/js/uga-components.js` (see repo `README.md`).

### Architecture notes (high signal)

- **Light DOM:** `createRenderRoot() { return this; }` — do not switch to shadow DOM without coordinating all consumers.
- **D2L / Valence:** shared helpers in `src/lib/api/` (`d2l-client.ts`, `d2l-utils.ts`); types in `src/types/d2l.ts`.
- **Axios:** In **eLC**, `axios` is expected **globally** (not necessarily bundled the same way in local dev). `package.json` lists axios for local/scripts; agent guidance in `.github/copilot-instructions.md` says library code may assume global `axios` in Brightspace — read `d2l-client.ts` before changing imports.
- **Design system:** pages should load UGA Online DS per [installation](https://design.online.uga.edu/getting-started/installation/) (fonts, `base.css`, `scripts.js` on host). **`uga-accordion`:** host `<html>` needs **`class="js"`** for expand/collapse icon pseudo-elements (documented in `README.md`).
- **Demos:** `demo/index-all-in-one.html`, per-component pages (e.g. `demo/quiz.html`), `demo/setup.html`. Start with `demo/QUICK_START.md` if present.

### Docs worth linking from issues/PRs

- `README.md` — overview, component table, Kaltura, deploy steps.
- `CHANGELOG.md` — version history.
- `docs/QUIZ_JSON_FORMAT.md` — **`uga-quiz`** JSON schema and attributes.
- `.github/copilot-instructions.md` — **AI/agent** project rules (build commands, light DOM, globals, patterns).

### Secrets / gitignore

- **`kaltura-secrets.ts`** is gitignored; use `kaltura-secrets.example.ts` as a template. **Do not commit** API keys or institutional secrets.

### `templates/` in this repo

- Contains template-related material that may mirror **UGA-Brightspace-React-Template** / OOL patterns; when editing, follow the README in the specific subtree you touch.

---

## 2. `UGA-Brightspace-React-Apps` — course-file React apps (monorepo)

### Purpose

- Collection of **static** **Vite + React + TypeScript** apps intended for **Brightspace Manage Files / course files** (not a generic long-running Node host).
- Each app under `apps/<name>/` is largely self-contained (own `package.json`, `vite.config`, etc.).

### Layout

```
UGA-Brightspace-React-Apps/
├── apps/           # deployed apps (each: npm install / dev / build in that folder)
│   ├── competencies-test
│   ├── competencies-test-SLO-fixed
│   ├── module-feedback
│   ├── msw-competencies
│   ├── peer-assessment-app
│   ├── timeline-js
│   └── topic-descriptions
├── templates/      # scaffolding variants
│   ├── course-level
│   └── global
└── README.md       # minimal; rely on per-app README and OOL template docs
```

### Typical per-app workflow

```bash
cd /Users/todd/local_dev/UGA-Brightspace-React-Apps/apps/<app-name>
npm install
npm run dev
npm run build    # often includes tsc + vite + zip for upload; check that app’s package.json
```

**Environment:** course-file apps usually expect **`VITE_API_BASE_URL`**, **`VITE_LP_VERSION`**, **`VITE_LE_VERSION`** (and any app-specific `VITE_*` documented in the app). Align with your eLC instance and D2L Valence docs. Local `import.meta.env.DEV` often gates mocks vs embedded behavior.

### Relationship to Lit repo

- **`uga-module-feedback`** was **removed** from the Lit bundle; **module feedback** is **React** (`apps/module-feedback`) per `uga-lit-components/README.md`. When migrating or documenting features, avoid referencing the old custom element name in eLC.

---

## 3. Quiz: Lit vs React

| Approach | Where | Notes |
|----------|--------|--------|
| **Lit embedded quiz** | `uga-lit-components` — `uga-quiz`, `uga-quiz-grade-sync`, `docs/QUIZ_JSON_FORMAT.md` | JSON-driven, optional assignment submission; not tied to native eLC quizzes. |
| **React quiz app** | Not in the Lit tree on this disk; may be a separate repo or archived copy | If you need the React app, locate its repository or zip separately and add its path to the other workspace. |

---

## 4. Quick checklist for a new workspace / agent

1. Open the correct repo root(s) above; run `npm install` where you will edit.
2. For Lit work: read `.github/copilot-instructions.md` and confirm `vite.config.ts` bundle shape before changing imports/chunks.
3. For eLC-facing pages: confirm **design system** assets and **`class="js"`** on `<html>` when using accordion (and `scripts.js` for interactive DS patterns).
4. Never commit **`kaltura-secrets.ts`** or other secrets; use CI / `.env.local` patterns per org rules.
5. Prefer **small PRs** and **CHANGELOG** updates when shipping instructor-facing bundles (OOL practice).

---

*Generated for cross-workspace continuity. Update paths if you clone to a different directory.*
