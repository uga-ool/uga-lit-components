// Eagerly import all modules in src/js so their side effects (customElements.define)
// run once. Vite replaces this at build time with concrete imports.
import.meta.glob('./js/*.{js,ts}', { eager: true });

// Optional: quick sanity flag for debugging in the console
export const UGAComponentsLoaded = true;
