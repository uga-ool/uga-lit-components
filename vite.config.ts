import { defineConfig } from 'vite';
import path from 'node:path';

export default defineConfig({
  base: './',            // relative URLs work in Brightspace
  build: {
    outDir: 'dist',      // only one output folder now
    emptyOutDir: true,
    target: 'es2020',
    sourcemap: true,     // helpful when debugging in Brightspace
    rollupOptions: {
      input: { 'uga-components': path.resolve('src/all.js') },
      output: {
        entryFileNames: 'js/[name].js',
        // ensure ONE file: no code-splitting, no extra vendor chunk
        inlineDynamicImports: true,
        manualChunks: undefined
      }
    }
  }
});
