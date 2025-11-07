# UGA Brightspace Lit Components

This repository contains a collection of reusable **Lit web components** designed for use within the **University of Georgia’s Brightspace (D2L)** learning environment.

The project has been modernized to use **Vite** for development and builds, and to bundle all components into a **single optimized JavaScript file** (`uga-all.js`) that can be easily uploaded to Brightspace Public Files.

---

## 🚀 Key Features

- **Single bundle deployment:**  
  One ES module (`uga-all.js`) registers all custom elements.
  
- **Modern tooling:**  
  Uses [Vite](https://vitejs.dev/) for fast builds and optimized output.

- **Reusable architecture:**  
  Shared logic is centralized in `/src/utils/` and `/src/services/` for cleaner, DRY code.

- **Lit 3.3+ framework:**  
  All components built on the latest stable version of [Lit](https://lit.dev/).

- **Brightspace-ready:**  
  Designed for easy integration via Public Files with `<script type="module">`.

---

## 🧱 Project Structure

