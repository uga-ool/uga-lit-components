/// <reference types="vite/client" />

// Eagerly import all components so their side effects (customElements registration)
// run once. Vite replaces this at build time with concrete imports.
import.meta.glob('./components/*.{js,ts}', { eager: true });

// Optional: quick sanity flag for debugging in the console
export const UGAComponentsLoaded = true;
