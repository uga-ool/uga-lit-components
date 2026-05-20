// Global type declarations for eLC embedding

// Production components import axios from 'axios' (bundled in uga-components.js via Vite).

declare global {
  interface Window {
    D2L?: {
      LearnerExperience?: unknown;
    };
  }
}

export {};
