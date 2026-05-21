---
description: Add a new uga-* Lit component, register in bundle, and add a demo page
---

You are helping add a **new Lit web component** to **uga-lit-components**.

Follow rules in `.cursor/rules/uga-lit-where-to-edit.mdc` and `uga-lit-components.mdc`.

1. Ask for the component name if missing (kebab-case, `uga-` prefix in file name).
2. Create `src/components/uga-<name>.ts` using light DOM (`createRenderRoot() { return this; }`), matching patterns from `uga-accordion.ts` or `uga-callout.ts`.
3. Ensure `src/all.ts` includes the new file via `import.meta.glob`.
4. Add `demo/<name>.html` and link it from `index.html` (and `index-all-in-one.html` if other demos are listed there).
5. Do **not** change `vite.config.ts` unless required.
6. Remind the user to run `npm run build` and update `CHANGELOG.md` if shipping a release.

Keep the diff minimal. Do not commit unless the user asks.
