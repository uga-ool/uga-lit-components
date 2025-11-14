# UGA Brightspace Lit Components

This repository contains a collection of reusable **Lit web components** designed for use within the **University of Georgia’s Brightspace (D2L)** learning environment.

The project has been modernized to use **Vite** for development and builds, and to bundle all components into a **single optimized JavaScript file** (`uga-components.js`) that can be easily uploaded to Brightspace Public Files.

---

## 🚀 Key Features

- **Single bundle deployment:**  
  One ES module (`uga-components.js`) registers all custom elements.
- **Modern tooling:**  
  Uses [Vite](https://vitejs.dev/) for fast builds and optimized output.

- **Reusable architecture:**  
  Shared logic is centralized in `/src/lib/api/` (D2L API helpers) and `/src/lib/data/` (data loader) with shared types in `/src/types/`.

- **Lit 3.3+ framework:**  
  All components built on the latest stable version of [Lit](https://lit.dev/).

- **Light DOM by default:**  
  Components render into the light DOM with `createRenderRoot() { return this; }` to work seamlessly inside Brightspace content.

- **Brightspace-ready:**  
  Designed for easy integration via Public Files with `<script type="module">`.

---

## 🧱 Project Structure

```
uga-lit-components/
├── src/
│   ├── all.ts                    # Entry point: eagerly imports all components
│   ├── components/               # Individual Lit web components
│   │   ├── uga-accordion.ts
│   │   ├── uga-assignment.ts
│   │   ├── uga-video.ts
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
├── vite.config.ts                # Vite build configuration
├── package.json
└── tsconfig.json
```

---

## 🎨 Styling Convention: Light DOM

All components use **Light DOM** rendering (`createRenderRoot() { return this; }`) for seamless integration inside Brightspace content pages. This means:

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
