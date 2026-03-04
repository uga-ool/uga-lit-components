import { defineConfig } from 'vite';
import path from 'node:path';

export default defineConfig({
  base: './',            // relative URLs work in Brightspace
  server: {
    proxy: {
      '/api/video-analytics': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',      // only one output folder now
    emptyOutDir: true,
    target: 'es2020',
    sourcemap: true,     // helpful when debugging in Brightspace
    rollupOptions: {
      input: { 'uga-components': path.resolve('src/all.ts') },
      output: {
        entryFileNames: 'js/[name].js',
        // ensure ONE file: no code-splitting, no extra vendor chunk
        inlineDynamicImports: true,
        manualChunks: undefined
      }
    }
  }
});
