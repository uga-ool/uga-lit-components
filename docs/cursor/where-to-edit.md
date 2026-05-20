# Where to edit (uga-lit-components)

Use this table before you commit. The goal is to **add** your component without breaking the shared library layout.

## Do — add your work here

| Task | Folder or file |
|------|----------------|
| New Lit component | `src/components/uga-<name>.ts` |
| Register in bundle | `src/all.ts` (via glob — new files under `src/components/` are usually auto-included) |
| Demo page | `demo/<name>.html` |
| Link demo from gallery | `index.html`, `demo/index-all-in-one.html` |
| Shared API helpers | `src/lib/api/`, `src/lib/data/` (only if your component needs it) |
| Types | `src/types/d2l.ts` (extend carefully) |
| Source map for agents | `src/README.md` — components and API layout |

## Do not — leave unless your task says so

| Area | Why |
|------|-----|
| `vite.config.ts` | Controls single-file bundle; wrong changes break all components |
| Other `src/components/uga-*.ts` you are not assigned | Avoid accidental edits in Agent mode |
| `dist/` | Generated — rebuild with `npm run build` |
| `.env` or real API keys | **Never commit** — see [secrets.md](secrets.md) |

## Example commit messages

- `Add uga-banner Lit component and demo`
- `Fix instructor card layout in demo page`
