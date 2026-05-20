# Copilot / AI Agent Instructions for uga-lit-components

Be concise and make edits that follow the repository's existing structure and conventions. This file highlights the project-specific knowledge an AI agent needs to be productive immediately.

## Overview

- This repository produces a single ES module bundle of Lit web components for UGA's Brightspace (D2L).
- Key goal: build `dist/js/uga-components.js` (single file) and deploy to eLC at `/shared/ugaonline/js/uga-components.js` for use via `<script type="module">`.

## Key Files & Entry Points

- `src/components/` — individual Lit element sources (e.g. `uga-accordion.ts`). Components register via decorators/side effects.
- `src/all.ts` — eager imports all components with `import.meta.glob(..., { eager: true })`. Editing this file or adding files under `src/components/` is how new elements get registered in the bundle.
- `vite.config.ts` — build config: single entry `src/all.ts`, `inlineDynamicImports: true`, `outDir: dist`, `sourcemap: true`. Changing bundle shape must be done here.
- `package.json` — scripts: `npm run dev` (vite), `npm run build` (bundle), `npm run preview` (serve build). Use these for development and producing the distributable.

## Build & Debug Basics (Use These Exact Commands)

- Dev server (fast feedback):
  ```bash
  npm run dev
  ```
- Produce single bundle for Brightspace:
  ```bash
  npm run build
  ```
  Output: `dist/js/uga-components.js` (see `vite.config.ts` output naming)
- Quick local preview of production build:
  ```bash
  npm run preview
  ```

## Project Conventions and Gotchas

- **Light DOM:** components call `createRenderRoot() { return this; }` to render in light DOM — do not add shadow DOM unless you update markup consumers.
- **Side-effect registration:** components register themselves on import. `src/all.ts` must import (or include via import.meta.glob) every component file you want registered.
- **No axios bundling:** the D2L runtime provides `axios` globally — library code (e.g. `src/lib/api/d2l-client.ts`) assumes a global `axios` and _does not_ import it. Avoid adding axios to the bundle unless you intentionally change runtime assumptions.
- **D2L runtime globals:** code expects Brightspace globals (e.g., `window.D2L`) and specific URL shapes. When testing locally, mock `axios` and any `window.D2L` usage.
- **Types:** API types live in `src/types/d2l.ts`. Use these for function signatures and to keep API usage consistent.

## Coding Patterns to Follow

### Load Data Pattern

Components that fetch data call `await loadData<T>(type, filename, program)` (see `src/components/uga-accordion.ts`) and then set `this.loaded = true; this.requestUpdate();`:

```typescript
async connectedCallback() {
  super.connectedCallback();
  const data = await loadData<MyDataType>('local', 'data.json');
  this.myData = data;
  this.loaded = true;
  this.requestUpdate();
}
```

### D2L API Helpers

Use `src/lib/api/d2l-client.ts` for any D2L requests (centralizes endpoints and shapes). It uses paths like `/d2l/api/le/${leVersion}/${ou}/...` and helper `getCourse()` from `src/lib/api/d2l-utils.ts`:

```typescript
import { getVersions, getClasslist } from "../lib/api/d2l-client.js";
import { getCourse } from "../lib/api/d2l-utils.js";

const versions = await getVersions();
const ou = getCourse();
const classlist = await getClasslist(ou, versions.le);
```

### Kaltura Video Embedding

Default embed is a **Kaltura iframe** (`embedPlaykitJs?iframeembed=true&entry_id=`) for correct thumbnails. **Playkit JS** loads only when **`topic-id`** is set (D2L topic completion). Default uiConf **53568732**. See `src/components/uga-video.ts`.

**Key points:**

- `needsPlaykitApi()` — true when `getTopicId(topicId)` returns a non-empty id
- Iframe path: no `initKalturaPlayer`, no Playkit script on the page
- Playkit path: `loadKalturaScript` + `KalturaPlayer.setup` + playback listeners for 80%/ended completion
- `playerid` overrides default uiConf (copy from Kaltura MediaSpace embed code)

### Unsafe HTML Pattern

Components sometimes use `unsafeHTML(item.body)` when inserting trusted HTML from content files — preserve this pattern where appropriate but ensure source is trusted:

```typescript
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

render() {
  return html`
    <div>${unsafeHTML(this.trustedHtmlContent)}</div>
  `;
}
```

## How to Add a New Component (Step-by-Step)

### 1. Create the new component file in `src/components/` (example: `uga-banner.ts`)

```typescript
import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("uga-banner")
class UgaBanner extends LitElement {
  @property({ type: String }) message = "";
  @property({ type: String }) variant = "info";

  // Light DOM: always return this
  createRenderRoot() {
    return this;
  }

  render() {
    return html`
      <link
        rel="stylesheet"
        href="https://design.online.uga.edu/css/base.css"
      />
      <div class="uga-banner uga-banner--${this.variant}">
        <p>${this.message}</p>
      </div>
    `;
  }
}
```

### 2. No changes needed to `src/all.ts`

The `import.meta.glob('./components/*.{js,ts}', { eager: true })` automatically picks up any new `.ts` file in `src/components/`.

### 3. Build and verify

```bash
npm run build
# Check that dist/js/uga-components.js exists and includes your component
```

### 4. Use in Brightspace HTML

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Merriweather+Sans:ital,wght@0,300..800;1,300..800&family=Merriweather:ital,wght@0,300;0,400;0,700;0,900;1,300;1,400;1,700;1,900&family=Oswald:wght@200..700&display=swap"
  rel="stylesheet"
/>
<link rel="stylesheet" href="https://design.online.uga.edu/css/base.css" />
<uga-banner message="Welcome to the course!" variant="success"></uga-banner>
<script src="https://design.online.uga.edu/js/scripts.js" defer></script>
<script type="module" src="/shared/ugaonline/js/uga-components.js"></script>
```

## Example: Adding a Component That Fetches D2L Data

```typescript
import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { getUser, getVersions } from "../lib/api/d2l-client.js";
import { getCourse } from "../lib/api/d2l-utils.js";
import type { User } from "../types/d2l.js";

@customElement("uga-user-info")
class UgaUserInfo extends LitElement {
  @property({ type: Object }) user: User | null = null;
  @property({ type: Boolean }) loaded = false;

  createRenderRoot() {
    return this;
  }

  async connectedCallback() {
    super.connectedCallback();
    try {
      const versions = await getVersions();
      this.user = await getUser(versions.lp);
      this.loaded = true;
      this.requestUpdate();
    } catch (error) {
      console.error("Failed to load user data:", error);
    }
  }

  render() {
    if (!this.loaded) {
      return html`<p>Loading...</p>`;
    }
    return html`
      <link
        rel="stylesheet"
        href="https://design.online.uga.edu/css/base.css"
      />
      <div class="uga-user-info">
        <p>Welcome, ${this.user?.FirstName} ${this.user?.LastName}!</p>
      </div>
    `;
  }
}
```

## When Making Changes That Affect Bundle Output

- Use `npm run build` to confirm no errors
- Check that `dist/js/uga-components.js` is a single file (not split chunks)
- Run `npm run preview` to test the bundle locally before uploading to Brightspace
- Use the generated sourcemap (enabled in `vite.config.ts`) to debug in Brightspace dev tools

## Files to Inspect for Most Changes

- `src/all.ts` — registration / entrypoint
- `vite.config.ts` — build output and bundle shape
- `src/components/*.ts` — component implementations (look at `uga-accordion.ts` for common patterns)
- `src/lib/api/*.ts` and `src/lib/data/data-loader.ts` — integration points with Brightspace and local data
- `src/types/d2l.ts` — API shapes used across the codebase

## Edge Cases & Safety Checks for PRs

- Do not introduce network imports that create multiple chunks unless you also update the bundling strategy in `vite.config.ts`.
- If adding dependencies that target Node (e.g., polyfills), ensure they are compatible with ES module in-browser usage; prefer zero-runtime assumptions for Brightspace.
- When changing API clients, preserve the runtime assumption that `axios` is global unless you update all components and the runtime to provide a bundled axios.
- Always use Light DOM (`createRenderRoot() { return this; }`) in components—do not use Shadow DOM unless you have a very specific reason and update all consumers.
- Remove all `console.log()` debug statements before pushing to production.
- Ensure all ARIA attributes are properly defined (no undefined bindings).

## Common Issues & Solutions

| Issue                              | Solution                                                                                                     |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Component not showing up in bundle | Verify file is in `src/components/` with `.ts` extension and is imported correctly                           |
| Styles not applying                | Ensure `createRenderRoot() { return this; }` is defined, `base.css` is linked in the component if using UGA classes, and the host page loads Google Fonts plus `scripts.js` for interactive DS patterns |
| Kaltura video not displaying       | Check `uiconfid` is correct and script loads successfully; verify `containerId` matches target div           |
| D2L API 404 errors                 | Verify URL path matches expected `/d2l/api/le/${version}/${ou}/...` pattern                                  |
| `axios` not available              | Ensure you're running in Brightspace environment where axios is globally provided                            |

---

If anything here is unclear or you'd like more detail (example PRs, tests to add, or CI hooks), let me know which section to expand and I will iterate.
