import { defineConfig } from 'vite';
import { globSync } from 'glob';
import path from 'node:path';

// Create a build entry for each component under src/js
const entries = Object.fromEntries(
  globSync('src/js/*.js').map((p) => [path.basename(p, '.js'), path.resolve(p)])
);

export default defineConfig({
  base: './', // ensures relative URLs work in Brightspace
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2020',
    sourcemap: true,
    rollupOptions: {
      input: entries,
      output: {
        entryFileNames: 'js/[name].js',
        chunkFileNames: 'js/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
});
