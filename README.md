# UGA eLC Lit Components

This repository contains a collection of reusable **Lit web components** designed for use within the **University of Georgia's eLC** learning environment.

The project has been modernized to use **Vite** for development and builds, and to bundle all components into a **single optimized JavaScript file** (`uga-components.js`) that can be easily uploaded to eLC Public Files.

---

## 📋 Recent Updates (January 2026)

### What's New in v3.0

- **🎨 eLC Rebranding Complete**: All references updated from "D2L (Brightspace)" to "eLC" (eLearning Commons)
- **📁 Dual Index Structure**: `index.html` and `index-all-in-one.html` for flexible demo navigation
- **📦 Google Drive Integration**: Example JSON files available via Google Drive links with consistent formatting
- **🔗 TOC Auto-ID Generation**: Headings without IDs are automatically linkable
- **📚 Enhanced Documentation**: Updated QUICK_START.md with clear file structure explanations
- **🎬 Kaltura Video Enhancement**: Logo hiding, improved player lifecycle, eliminated scrollbar issues
- **📂 Accordion Refactored**: Direct axios pattern, better error handling, TypeScript improvements
- **🗂️ TOC Filtering**: Now scans h2/h3 only for cleaner navigation
- **🐛 TypeScript Fixes**: Resolved type mismatches in assignment and duedate components

👉 **See [CHANGELOG.md](./CHANGELOG.md) for complete details**

---

## �🚀 Key Features

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
│   ├── ...                       # (14 individual component pages)
│   ├── QUICK_START.md            # Quick start guide for demo system
│   └── *.json                    # Sample data files (also on Google Drive)
├── src/
│   ├── all.ts                    # Entry point: eagerly imports all components
│   ├── components/               # Individual Lit web components
│   │   ├── uga-accordion.ts      # (refactored with direct axios pattern)
│   │   ├── uga-assignment.ts
│   │   ├── uga-video.ts          # (enhanced Kaltura integration)
│   │   └── ...
│   ├── lib/
│   │   ├── api/                  # D2L/Brightspace API helpers
│   │   │   ├── d2l-client.ts     # Centralized API methods
│   │   │   └── d2l-utils.ts      # Helper utilities (getCourse, transformDate, etc.)
│   │   └── data/
│   │       └── data-loader.ts    # Loads JSON data from local or program-specific paths
│   └── types/
│       ├── d2l.ts                # TypeScript types for D2L API responses
│       └── global.d.ts           # Global type declarations
├── dist/
│   └── js/
│       └── uga-components.js     # Single bundled output file
├── .github/
│   └── copilot-instructions.md   # AI agent development guidelines
├── CHANGELOG.md                  # Version history and updates
├── vite.config.ts                # Vite build configuration
├── package.json
└── tsconfig.json
```

---

## 🎨 Styling Convention: Light DOM

All components use **Light DOM** rendering (`createRenderRoot() { return this; }`) for seamless integration inside eLC content pages. This means:

- Component styles either:
  1. Link to the shared UGA design system: `<link rel="stylesheet" href="https://design.online.uga.edu/css/base.css" />`
  2. Inject scoped `<style>` tags targeting the component's tag name (e.g., `uga-return-to-top { ... }`)
- **Global class names are preferred** over Shadow DOM encapsulation. Use utility and component classes from the UGA design system (`cmp-button`, `util-pad-all-md`, etc.).

- When adding a new component:
  - Always include `createRenderRoot() { return this; }` in the class.
  - Link to `base.css` if you use UGA design system classes.
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
   npm run dev
   # Open http://localhost:5173/demo/index-all-in-one.html
   ```

3. **Explore individual components:**
   - View comprehensive demo at `demo/index-all-in-one.html`
   - Each component has its own dedicated demo page (14 individual pages)
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

The repository includes 15 pre-built components:

| Component                 | Purpose                                                                                                                     |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **uga-accordion**         | Collapsible accordion sections with expand/collapse all                                                                     |
| **uga-assignment**        | Display assignments, discussions, quizzes, and content with due dates. Filter by type using the `types` property.             |
| **uga-circles**           | Display data in circular badge format                                                                                       |
| **uga-code**              | Syntax-highlighted code blocks with copy button                                                                             |
| **uga-duedate**           | Display due dates for assignments, discussions, quizzes, and content in a table. Filter by type using the `types` property. |
| **uga-footer**            | Site footer with branding                                                                                                   |
| **uga-instructor-note**   | Instructor-only notes (hidden from students)                                                                                |
| **uga-quiz**              | Standalone embedded HTML quiz (no eLC native quiz association); loads questions from a JSON file (<code>type="local"</code>, <code>filename</code>); optionally submits results to an eLC assignment; supports timers, retries, and immediate feedback. See [docs/QUIZ_JSON_FORMAT.md](docs/QUIZ_JSON_FORMAT.md) for JSON format. |
| **uga-quiz-grade-sync**   | Instructor-only: sync quiz submissions from an assignment to the linked grade item (use with uga-quiz)                    |
| **uga-rating**            | Collect feedback/ratings on content                                                                                         |
| **uga-return-to-top**     | Fixed button to scroll to top                                                                                               |
| **uga-slideshow**         | Image carousel with navigation                                                                                              |
| **uga-tabs**              | Tab navigation interface                                                                                                    |
| **uga-toc**               | Auto-generated table of contents                                                                                            |
| **uga-video**             | Embed Kaltura or YouTube videos with logo control                                                                           |

---

### Note: Module Feedback moved to React

The previous `uga-module-feedback` web component has been removed from this bundle. Module feedback is now implemented using React and maintained separately. If you need the module feedback functionality, use the React-based solution provided by the team and do not reference `uga-module-feedback` in eLC pages.

---

## 🎥 Kaltura Video Integration

The `uga-video` component uses **KalturaPlayer script injection** for full control over player configuration:

**Key Features:**

- ✅ Kaltura logo/watermark completely hidden via UI config
- ✅ No scrollbar issues — uses direct DOM container instead of iframe
- ✅ Full player lifecycle management with cleanup
- ✅ Script caching to avoid multiple loads
- ✅ Proper aspect ratio handling (16:9 default)

**Implementation Pattern:**

```typescript
// Script is loaded once and cached
private loadKalturaScript(): Promise<void> { ... }

// Player initialized with logo disabled
const kalturaPlayer = KalturaPlayer.setup({
  targetId: containerId,
  provider: { partnerId: 1727411, uiConfId: this.uiconfid },
  ui: {
    components: {
      logo: { disabled: true }  // Hides Kaltura branding
    }
  }
});
```

**Usage in eLC:**

```html
<uga-video videoid="1_abc123de" playerid="57494843" includerating="false">
</uga-video>
```

**Multiple Videos:**

```html
<uga-video type="local" filename="videos.json"></uga-video>
```

---

## 🚀 Deploying to eLC

1. **Build the bundle:**

   ```bash
   npm run build
   ```

2. **Upload to eLC Public Files:**

- Navigate to: **eLC → Content → Manage Files → Public Files**
- Upload `dist/js/uga-components.js` to `/shared/PublicFiles/` (or `/shared/ugaonline/dev/js/` for testing)

3. **Add to Content Pages:**

   ```html
   <!-- Your content and components -->
   <uga-accordion type="local" filename="accordion-data.json"></uga-accordion>
   <uga-video videoid="1_abc123de"></uga-video>

   <!-- Load all components -->
   <script type="module" src="/shared/PublicFiles/uga-components.js"></script>
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

3. No changes needed to `src/all.ts` — the glob import automatically includes it
4. Build and test: `npm run build`

### Component Architecture Best Practices

- **Always use Light DOM:** `createRenderRoot() { return this; }`
- **Link base.css if using UGA classes:** `<link rel="stylesheet" href="https://design.online.uga.edu/css/base.css" />`
- **Inject scoped styles:** Use `<style>` tags targeting the component's tag name
- **Centralize API calls:** Use helpers from `src/lib/api/d2l-client.ts`
- **Handle data loading:** Move async logic to `connectedCallback()`, not `render()`
- **Never import axios directly:** It's available globally in Brightspace
- **Use TypeScript types:** Reference types from `src/types/d2l.ts`

---

## 📋 Key Files

| File                              | Purpose                                               |
| --------------------------------- | ----------------------------------------------------- |
| `demo/index-all-in-one.html`      | Comprehensive all-in-one demo showing all components  |
| `demo/setup.html`                 | Comprehensive setup, usage, and troubleshooting guide |
| `demo/[component].html`           | Individual component demo pages (15 total, including quiz.html) |
| `src/all.ts`                      | Entry point; eagerly imports all components           |
| `src/components/*.ts`             | Individual component implementations                  |
| `src/lib/api/d2l-client.ts`       | Centralized D2L API methods                           |
| `src/lib/api/d2l-utils.ts`        | Helper utilities (getCourse, transformDate, etc.)     |
| `src/lib/data/data-loader.ts`     | JSON file loader (local & program-specific)           |
| `src/types/d2l.ts`                | TypeScript types for D2L API responses                |
| `vite.config.ts`                  | Build configuration (single-file bundle)              |
| `.github/copilot-instructions.md` | AI agent instructions for development                 |
| `CHANGELOG.md`                    | Version history and recent updates                    |

---

## 🐛 Troubleshooting

| Problem                           | Solution                                                                                      |
| --------------------------------- | --------------------------------------------------------------------------------------------- |
| Component not appearing in bundle | Ensure it's in `src/components/` with `.ts` extension                                         |
| Styles not applying               | Add `<link rel="stylesheet" href="...base.css" />` if using UGA classes                       |
| **Accordion icons not showing**   | **Add `class="js"` to `<html>` tag: `<html lang="en" class="js">`**                           |
| Kaltura video not showing         | Verify `videoid` is correct; check browser console for script errors                          |
| D2L API 404 errors                | Verify course ID (`ou`) is correct and API version matches                                    |
| `axios` is undefined              | Ensure code runs in eLC environment (axios is globally available)                             |
| TOC showing too many items        | Component now scans h2/h3 only - check if you need h4 headings in navigation                  |
| TOC links not working             | Component now auto-generates IDs for headings without them                                    |
| Data files not loading            | Download example files from Google Drive links in demo pages, then upload to eLC Public Files |

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

### Troubleshooting Common Issues

**Problem:** Accordion icons not showing  
**Solution:** Add `class="js"` to `<html>` tag

**Problem:** TOC showing too many items  
**Solution:** Component now filters to h2/h3 only - this is expected behavior

**Problem:** Video not loading  
**Solution:** Check browser console for errors, verify Kaltura video ID

**Problem:** Demo pages not loading  
**Solution:** Run `npm install` and `npm run dev`, then try again

**Problem:** Multiple video players not initializing  
**Solution:** Ensure you're using the latest build - unique component IDs prevent container conflicts

### More Help

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

For contributions, AI agents should follow the guidelines in `.github/copilot-instructions.md` to ensure consistency with the project's conventions, architecture, and code style.
