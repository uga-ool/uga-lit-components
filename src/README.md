# Source layout (`uga-lit-components`)

Entry: [`all.ts`](all.ts) eagerly loads every `components/uga-*.ts` into one bundle (`dist/js/uga-components.js`). **21** registered components (see table below).

## Components (`components/`)

| Custom element | Data / API | Demo |
|----------------|------------|------|
| `uga-accordion` | JSON via `loadData` (`type`, `filename`, `program`) | `demo/accordion.html` |
| `uga-assignment` | Valence `d2l-client` | `demo/assignment.html` |
| `uga-callout` | `body` attribute and/or slot content | `demo/callout.html` |
| `uga-circles` | JSON `loadData` | `demo/circles.html` |
| `uga-code` | Static / Prism | `demo/code.html` |
| `uga-course-analytics` | `analytics-utils` + Valence | `demo/course-analytics.html` |
| `uga-course-calendar` | JSON/CSV; see [docs/COURSE_CALENDAR_FORMAT.md](../docs/COURSE_CALENDAR_FORMAT.md) | `demo/course-calendar.html` |
| `uga-duedate` | Valence | `demo/duedate.html` |
| `uga-elc-google-sync` | Valence preview; optional Drive upload URL on tag | `demo/elc-google-sync.html` |
| `uga-footer` | JSON `loadData` (`program` / `name` / `filename`) | `demo/footer.html` |
| `uga-image` | `src` path | `demo/image.html` |
| `uga-instructor-card` | Classlist API | `demo/instructor-card.html` |
| `uga-instructor-note` | HTML/JSON `loadData` | `demo/instructor-note.html` |
| `uga-quiz` | JSON/CSV; [docs/QUIZ_JSON_FORMAT.md](../docs/QUIZ_JSON_FORMAT.md) | `demo/quiz.html` |
| `uga-quiz-grade-sync` | Dropbox grades | `demo/quiz.html` (same page as `uga-quiz`) |
| `uga-rating` | Discussions API | `demo/rating.html` |
| `uga-return-to-top` | None | `demo/return-to-top.html` |
| `uga-slideshow` | JSON `loadData` (`local`) | `demo/slideshow.html` |
| `uga-tabs` | JSON `loadData` | `demo/tabs.html` |
| `uga-toc` | DOM scan | `demo/toc.html` |
| `uga-video` | Kaltura embed + optional `loadData` | `demo/video.html` |

Register new components with `@customElement('uga-<name>')` in `uga-<name>.ts` (see `uga-callout.ts`). Avoid manual `customElements.define` unless you have a strong reason.

## Shared libraries

### API (`lib/api/`)

| Module | Use for |
|--------|---------|
| **`d2l-client.ts`** | Main Valence client (classlist, dropbox, grades, discussions, assignments, …) |
| `d2l-client-content.ts` | Content TOC, topics, completions |
| `d2l-client-elc-google-sync.ts` | Template/live preview for `uga-elc-google-sync` |
| `analytics-utils.ts` | `uga-course-analytics` aggregation |
| `d2l-utils.ts` | `getCourse()`, dates, `inBrightspace()` |
| `gradebook-utils.ts` | `uga-quiz-grade-sync` |
| `api-cache.ts` | Cached Valence calls (via `d2l-client`) |
| `kaltura-client.ts` | **Dev script only** (`npm run test:kaltura`) — not imported by components |

**Do not** add production imports from [`archive/`](archive/README.md).

### Data (`lib/data/`)

| Module | Use for |
|--------|---------|
| **`data-loader.ts`** | `loadData(type, filename, program?)` for JSON — **prefer this** over raw `axios.get` in components |
| `csv-parser.ts` | eLC quiz CSV → questions (`uga-quiz`, `npm run quiz:csv-to-json`) |
| `item-type-utils.ts` | Assignment / due-date type filters |

### Utils (`lib/utils/`)

| Module | Use for |
|--------|---------|
| `memoize.ts` | `uga-assignment` filtering |
| `lazy-load.ts` | `uga-assignment` intersection observer |

### Types (`types/`)

| File | Purpose |
|------|---------|
| `d2l.ts` | Valence response shapes |
| `global.d.ts` | `window.D2L`; bundled `axios` typing note |

## Conventions for agents

1. **Light DOM:** `createRenderRoot() { return this; }` on every component.
2. **HTTP:** `import axios from 'axios'` in `d2l-client.ts` or components; axios is **bundled** in `uga-components.js`.
3. **Course JSON:** use `loadData('local' | 'program', filename, program?)` — do not duplicate `/shared/ugaonline/templates/...` URLs.
4. **New Valence calls:** extend `d2l-client.ts` or a focused `d2l-client-*.ts` under `lib/api/` that components import (not `src/archive/`).
5. **Secrets:** never import `kaltura-secrets.ts` from components; Kaltura admin API is dev-script only.

## Related docs

- [docs/README.md](../docs/README.md) — documentation index
- [docs/planning/README.md](../docs/planning/README.md) — backlog (not implementation spec)
- [docs/cursor/where-to-edit.md](../docs/cursor/where-to-edit.md) — commit boundaries
- [.github/copilot-instructions.md](../.github/copilot-instructions.md) — build and patterns
- [server/drive-upload/](../server/drive-upload/) — optional local stub for `uga-elc-google-sync` Drive export (production app: `uga-drive-elc-sync`)
