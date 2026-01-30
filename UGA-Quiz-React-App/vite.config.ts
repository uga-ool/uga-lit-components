import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Vite config for UGA Quiz React App (D2L/eLC).
 * Uses relative base path so the app works when embedded in eLC/Brightspace.
 */
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    sourcemap: true,
    target: 'es2020',
  },
  server: {
    port: 5174,
    open: true,
  },
});
