# UGA eLC Lit Components

This repository contains a collection of reusable **Lit web components** designed for use within the **University of Georgia's eLC** learning environment.

The project has been modernized to use **Vite** for development and builds, and to bundle all components into a **single optimized JavaScript file** (`uga-components.js`) that can be easily uploaded to eLC Public Files.

## Cursor AI (team)

Open **this repo folder** in [Cursor](https://cursor.com) to load project rules and commands. Start here: [`docs/README.md`](docs/README.md) (doc index), [`src/README.md`](src/README.md) (components and APIs), and [`docs/cursor/README.md`](docs/cursor/README.md). Backlog only: [`docs/planning/README.md`](docs/planning/README.md). After clone, run [`scripts/setup-git-hooks.sh`](scripts/setup-git-hooks.sh) so commits use [`.github/COMMIT_TEMPLATE`](.github/COMMIT_TEMPLATE).

---

## Recent updates

- **Docs:** Planning backlog consolidated under [`docs/planning/`](docs/planning/); feature docs indexed in [`docs/README.md`](docs/README.md).
- **Bundle:** **axios is bundled** in `uga-components.js` (not a separate Brightspace global).
- **Demos:** Hub at [`demo/index-all-in-one.html`](demo/index-all-in-one.html) — there is no root `index.html`.

See [CHANGELOG.md](./CHANGELOG.md) for full history.

---

## Key features

- **Single bundle deployment:**  
  One ES module (`uga-components.js`) registers all custom elements.
- **Modern tooling:**  
  Uses [Vite](https://vitejs.dev/) for fast builds and optimized output.

- **TypeScript throughout:**  
  All components converted from `.js` to `.ts` for improved maintainability, error prevention, and better tooling support in large-scale, team-based development environments.

- **Enhanced demo system:**  
  Individual demo pages for each component + comprehensive navigation gallery.

- **Reusable architecture:**  
  Shared logic is centralized in `/src/lib/api/` (D2L API helpers) with shared types in `/src/types/`.

- **Lit 3.3+ framework:**  
  All components built on the latest stable version of [Lit](https://lit.dev/).

- **Light DOM by default:**  
  Components render into the light DOM with `createRenderRoot() { return this; }` to work seamlessly inside eLC content.

- **eLC-ready:**  
  Designed for easy integration via eLC Public Files with `<script type="module">`.

---

## 🧱 Project Structure

```
uga-lit-components/
├── demo/                         # Demo pages and sample data
│   ├── index-all-in-one.html     # Comprehensive all-in-one demo page
│   ├── setup.html                # Comprehensive setup & usage guide
│   ├── accordion.html            # Individual component demo pages
│   ├── video.html                # (one for each component)
│   ├── toc.html
│   ├── ...                       # (20 component demo pages; quiz-grade-sync on quiz.html)
│   ├── QUICK_START.md            # Quick start guide for demo system
│   └── *.json                    # Sample data files (also on Google Drive)
├── docs/                         # Feature docs, cursor guides, planning backlog
├── scripts/                      # Git hooks, Kaltura test, quiz CSV → JSON
├── src/
│   ├── all.ts                    # Entry: import.meta.glob loads all components
│   ├── components/               # uga-*.ts (21 components)
│   ├── lib/api/                  # d2l-client.ts, data-loader, etc.
│   └── types/                    # d2l.ts, global.d.ts
├── server/drive-upload/          # Optional local stub for uga-elc-google-sync
├── dist/js/uga-components.js     # Production bundle
├── .github/copilot-instructions.md
├── CHANGELOG.md
├── vite.config.ts
└── package.json
```

---

## 🎨 Styling Convention: Light DOM

All components use **Light DOM** rendering (`createRenderRoot() { return this; }`) for seamless integration inside eLC content pages. This means:

- Component styles either:
  1. On the **host HTML page**, load the full [UGA Online Design System installation](https://design.online.uga.edu/getting-started/installation/): Google Fonts (preconnect + stylesheet), `https://design.online.uga.edu/css/base.css`, and `https://design.online.uga.edu/js/scripts.js` before `</body>`. In component `render()` templates, link only `base.css` (do not inject `scripts.js` per component).
  2. Inject scoped `<style>` tags targeting the component's tag name (e.g., `uga-return-to-top { ... }`)
- **Global class names are preferred** over Shadow DOM encapsulation. Use utility and component classes from the UGA design system (`cmp-button`, `util-pad-all-md`, etc.).

- When adding a new component:
  - Always include `createRenderRoot() { return this; }` in the class.
  - Link to `base.css` in the template if you use UGA design system classes; ensure the embedding page loads Google Fonts and `scripts.js` for interactive patterns (accordions, tabs, etc.).
  - For component-specific styles, inject a `<style>` tag that targets the component's tag name to avoid global CSS pollution.

---

## 🚀 Getting Started

### Quick Start

1. **Clone and install:**

   ```bash
   git clone https://github.com/uga-ool/uga-lit-components.git
   cd uga-lit-components
   npm install
   ```

2. **View demos locally:**

   ```bash
   npm run build
   npm run dev
   # Open http://localhost:5173/demo/index-all-in-one.html
   ```
   Demo pages on localhost load `/dist/js/uga-components.js` (build first). Include Design System `base.css` for shadow/radius utilities.

3. **Explore individual components:**
   - View comprehensive demo at `demo/index-all-in-one.html`
   - Dedicated demo pages for each component (20 HTML files; `uga-quiz-grade-sync` is on `demo/quiz.html` — see `demo/QUICK_START.md`)
   - Access via eLC side navigation for easy browsing
   - Review `demo/setup.html` for deployment instructions

### Development

Start the Vite dev server with hot module replacement (HMR):

```bash
npm run dev
```

This starts a local server at `http://localhost:5173` where you can test components in isolation.

### Building

Create the production bundle:

```bash
npm run build
```

This generates `dist/js/uga-components.js` — the single file to upload to eLC Public Files.

### Preview

Preview the production build locally:

```bash
npm run preview
```

---

## 📦 Components Overview

The repository includes **21** pre-built components (see [`src/README.md`](src/README.md) for the authoritative table):

| Component                | Purpose                                                                                                                                                                                                                                                                                                                           |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **uga-accordion**        | Collapsible accordion sections with expand/collapse all                                                                                                                                                                                                                                                                           |
| **uga-assignment**       | Display assignments, discussions, quizzes, and content with due dates. Filter by type using the `types` property.                                                                                                                                                                                                                 |
| **uga-callout**          | Semantic callout/aside (`note | important | tip | example | warning`) with optional bolded pseudo-label, optional `body` attribute (plain text), or slot content; fixed brand-color pairings from UGA `base.css`.                                                                                                                                                     |
| **uga-circles**          | Display data in circular badge format                                                                                                                                                                                                                                                                                             |
| **uga-code**             | Syntax-highlighted code blocks with copy button                                                                                                                                                                                                                                                                                   |
| **uga-course-calendar**  | Data-driven week-by-week course calendar table from JSON or CSV, with row-type styling, due tags, and optional live eLC due-date sync by assignment folder ID. See [docs/COURSE_CALENDAR_FORMAT.md](docs/COURSE_CALENDAR_FORMAT.md).                                                                                                                                                          |
| **uga-course-analytics** | Course-wide analytics aggregating data from content, assignments, discussions, and quizzes. Shows module-level consumption statistics and comparisons. Instructor-only.                                                                                                                                                           |
| **uga-duedate**          | Display due dates for assignments, discussions, quizzes, and content in a table. Filter by type using the `types` property.                                                                                                                                                                                                       |
| **uga-footer**           | Site footer with branding                                                                                                                                                                                                                                                                                                         |
| **uga-image**            | Image with expandable lightbox, optional caption, zoom/pan, responsive srcset, loading states; opt-in `hover-shadow` (Design System `util-shadow-hover`)                                                                                                                                                                            |
| **uga-instructor-card**  | Displays instructor profile card with photo and name (auto-detects from classlist)                                                                                                                                                                                                                                                |
| **uga-instructor-note**  | Instructor-only notes (hidden from students)                                                                                                                                                                                                                                                                                      |
| **uga-quiz**             | Standalone embedded HTML quiz (no eLC native quiz association); loads questions from a JSON file (<code>type="local"</code>, <code>filename</code>); optionally submits results to an eLC assignment; supports timers, retries, and immediate feedback. See [docs/QUIZ_JSON_FORMAT.md](docs/QUIZ_JSON_FORMAT.md) and [docs/QUIZ_DROPBOX_SETUP.md](docs/QUIZ_DROPBOX_SETUP.md). |
| **uga-quiz-grade-sync**  | Instructor-only: sync quiz submissions from an assignment to the linked grade item (use with uga-quiz)                                                                                                                                                                                                                            |
| **uga-rating**           | Collect feedback/ratings on content                                                                                                                                                                                                                                                                                               |
| **uga-return-to-top**    | Fixed button to scroll to top                                                                                                                                                                                                                                                                                                     |
| **uga-slideshow**        | Image carousel with navigation                                                                                                                                                                                                                                                                                                    |
| **uga-tabs**             | Tab navigation interface                                                                                                                                                                                                                                                                                                          |
| **uga-elc-google-sync** | Admin-only: eLC ⇄ Google Drive sync for course templates (export to Drive, clear template, back-copy live → template). MVP shows read-only content preview; see [docs/ELC_GOOGLE_SYNC_WIDGET.md](docs/ELC_GOOGLE_SYNC_WIDGET.md) |
| **uga-toc**              | Auto-generated table of contents                                                                                                                                                                                                                                                                                                  |
| **uga-video**            | Embed Kaltura or YouTube videos with logo control                                                                                                                                                                                                                                                                                 |

---

### Note: Module Feedback moved to React

The previous `uga-module-feedback` web component has been removed from this bundle. Module feedback is now implemented using React and maintained separately. If you need the module feedback functionality, use the React-based solution provided by the team and do not reference `uga-module-feedback` in eLC pages.

---

## 🎥 Kaltura Video Integration

The `uga-video` component embeds Kaltura via an **iframe** (default), matching the standard MediaSpace embed URL so the correct **thumbnail/poster** displays.

**Default Kaltura player:** uiConf ID **53568732** when `playerid` is omitted. Copy the **uiConf ID** from Kaltura’s embed code into `playerid` if your course uses a different player.

**Embed behavior:**

- **Default (no `topic-id`):** iframe with `embedPlaykitJs?iframeembed=true&entry_id=…` — no Playkit script on the page.
- **With `topic-id`:** Playkit JS player for D2L topic completion (marks complete at **ended** or **≥ 80%** watched).

**Usage in eLC:**

```html
<uga-video videoid="1_icw0df6y" includerating="false"></uga-video>
```

**Multiple Videos:**

```html
<uga-video type="local" filename="videos.json"></uga-video>
```

**D2L topic completion:** Set **`topic-id`** (or rely on topic id parsed from the page URL) when the video should mark the content topic complete:

```html
<uga-video videoid="1_icw0df6y" topic-id="12345"></uga-video>
```

**D2L scope:** Ensure your LTI/app registration includes **`content:completions:write`** for the completion flow.

---

## 🚀 Deploying to eLC

1. **Build the bundle:**

   ```bash
   npm run build
   ```

2. **Upload to eLC Public Files:**

- Navigate to: **eLC → Content → Manage Files → Public Files**
- Upload `dist/js/uga-components.js` to `/shared/ugaonline/js/` for production (instructional designers use this path in eLC)

3. **Add to Content Pages:**

   ```html
   <!-- Your content and components -->
   <uga-accordion type="local" filename="accordion-data.json"></uga-accordion>
   <uga-video videoid="1_icw0df6y"></uga-video>

   <!-- Load all components -->
   <script type="module" src="/shared/ugaonline/js/uga-components.js"></script>
   ```

---

## 🛠️ Development Workflow

### Creating a New Component

1. Create a new file in `src/components/` (e.g., `uga-banner.ts`)
2. Implement the Lit component with Light DOM:

   ```typescript
   import { LitElement, html } from "lit";
   import { customElement, property } from "lit/decorators.js";

   @customElement("uga-banner")
   class UgaBanner extends LitElement {
     @property({ type: String }) message = "";

     createRenderRoot() {
       return this;
     }

     render() {
       return html`<div class="cmp-banner">${this.message}</div>`;
     }
   }
   ```

3. No changes needed to `src/all.ts` — `import.meta.glob` in `all.ts` picks up new `src/components/uga-*.ts` files automatically
4. Build and test: `npm run build`

### Component Architecture Best Practices

- **Always use Light DOM:** `createRenderRoot() { return this; }`
- **Host page:** Google Fonts + `base.css` + `scripts.js` per [installation](https://design.online.uga.edu/getting-started/installation/). **Component template:** `<link rel="stylesheet" href="https://design.online.uga.edu/css/base.css" />` when using UGA classes
- **Inject scoped styles:** Use `<style>` tags targeting the component's tag name
- **Centralize API calls:** Use helpers from `src/lib/api/d2l-client.ts`
- **Handle data loading:** Move async logic to `connectedCallback()`, not `render()`
- **HTTP calls:** Use `import axios from 'axios'` via `src/lib/api/d2l-client.ts` (axios is bundled in `uga-components.js` for course-file deployment)
- **Use TypeScript types:** Reference types from `src/types/d2l.ts`

---

## 📋 Key Files

| File                              | Purpose                                                                                   |
| --------------------------------- | ----------------------------------------------------------------------------------------- |
| `demo/index-all-in-one.html`      | Comprehensive all-in-one demo showing all components                                      |
| `demo/setup.html`                 | Comprehensive setup, usage, and troubleshooting guide                                     |
| `demo/[component].html`           | Component demo pages (20; see `demo/QUICK_START.md`)                                      |
| `src/README.md`                   | Component and API map for developers and agents                                           |
| `docs/planning/README.md`         | Backlog and feature requests (not implementation spec)                                    |
| `src/all.ts`                      | Entry point; glob-imports all components                                                  |
| `src/components/*.ts`             | Individual component implementations                                                      |
| `src/lib/api/d2l-client.ts`       | Centralized D2L API methods                                                               |
| `src/lib/api/d2l-utils.ts`        | Helper utilities (getCourse, transformDate, etc.)                                         |
| `src/lib/data/data-loader.ts`     | JSON file loader (local & program-specific)                                               |
| `src/types/d2l.ts`                | TypeScript types for D2L API responses                                                    |
| `vite.config.ts`                  | Build configuration (single-file bundle)                                                  |
| `.github/copilot-instructions.md` | AI agent instructions for development                                                     |
| `CHANGELOG.md`                    | Version history and recent updates                                                        |

---

## 🐛 Troubleshooting

| Problem                           | Solution                                                                                           |
| --------------------------------- | -------------------------------------------------------------------------------------------------- |
| Component not appearing in bundle | Ensure it's in `src/components/` with `.ts` extension                                              |
| Styles not applying               | Load Google Fonts, `base.css`, and `scripts.js` on the host page; components may link `base.css` only |
| **Accordion icons not showing**   | **Add `class="js"` to `<html>` tag: `<html lang="en" class="js">`**                                |
| **Accordion / tabs not toggling** | Ensure `https://design.online.uga.edu/js/scripts.js` is on the host page (see design system installation) |
| Kaltura video not showing         | Verify `videoid` is correct; check browser console for script errors                               |
| D2L API 404 errors | Verify course ID (`ou`) is correct and API version matches |
| `axios` / Valence errors | Bundle includes axios; load only `uga-components.js` in eLC. Local dev: mock `window.D2L` if APIs fail outside Brightspace |
| TOC showing too many items | Component now scans h2/h3 only - check if you need h4 headings in navigation |
| TOC links not working | Component now auto-generates IDs for headings without them |
| Data files not loading | Download example files from Google Drive links in demo pages, then upload to eLC Public Files |
| uga-image not loading   | Use relative paths (e.g. <code>images/photo.jpg</code> when image is in an images folder next to your HTML) or the full path from eLC Manage Files (right-click file → Copy Path). Avoid root-relative paths (<code>/demo/...</code>) in eLC. |

### Important Notes

#### Accordion CSS Requirement

**Action Required:** Pages using `uga-accordion` must have `class="js"` on the `<html>` element:

```html
<html lang="en" class="js"></html>
```

This enables UGA CSS pseudo-element styles (`.js .cmp-accordion__button::after`) for the expand/collapse icons. Without this class, accordion icons will not display.

**Impact:** All pages with accordion components need this update.

#### Table of Contents Behavior

The `uga-toc` component now scans **h2 and h3 headings only** (changed from h1-h4). This provides cleaner navigation by excluding h4 property tables and other minor headings. The component also auto-generates IDs for headings without them, ensuring all h2/h3 headings are navigable even if they lack manual IDs.

**Action:** No code changes required, but review TOC output to ensure it meets your needs.

### More help

- Review `demo/setup.html` for comprehensive troubleshooting and deployment instructions
- Check individual component demo pages for usage examples
- See `CHANGELOG.md` for complete change history

---

## 🔗 Resources

- [Lit Documentation](https://lit.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [D2L Brightspace](https://www.brightspace.com/)
- [UGA Design System](https://design.online.uga.edu/)

---

## 📄 License

This project is maintained by the University of Georgia Online Learning (UGA OOL) team.

---

## ✨ Contributing

For contributions, AI agents should follow [`.github/copilot-instructions.md`](.github/copilot-instructions.md) and [`src/README.md`](src/README.md). Use [`docs/planning/`](docs/planning/) for backlog only — verify against source before implementing.
