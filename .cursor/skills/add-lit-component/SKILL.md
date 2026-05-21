---
name: add-lit-component
description: Add a new uga-* Lit component with demo page and bundle registration in uga-lit-components. Use when creating a new custom element or Lit widget for eLC.
---

# Add Lit component (uga-lit-components)

## Before you start

- Work only in **uga-lit-components** (this repo).
- Read [`docs/cursor/where-to-edit.md`](../../docs/cursor/where-to-edit.md).

## Steps

1. **Name** — `uga-<kebab-name>` (file: `src/components/uga-<kebab-name>.ts`).
2. **Scaffold component** — Copy structure from `uga-callout.ts` or `uga-accordion.ts`:
   - `createRenderRoot() { return this; }`
   - `connectedCallback` + `loadData` if fetching JSON
   - D2L calls via `src/lib/api/d2l-client.ts` when needed
3. **Register** — Verify `src/all.ts` glob picks up `src/components/uga-<kebab-name>.ts`.
4. **Demo** — Add `demo/<kebab-name>.html`; link from hub `index.html`.
5. **Build** — `npm run build`; fix errors in new files only.
6. **CHANGELOG** — Add a line under Unreleased if the team ships versioned releases.

## Do not

- Add shadow DOM by default.
- Externalize axios or add a second HTTP client without team discussion (axios is already bundled).
- Commit `.env` or API keys.

## Commands

- Cursor command: `lit-new-component`
- Build: `lit-build-bundle`
