import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  base: './',
  build: {
    target: 'es2024',
    lib: {
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      name: 'TimeAxis',
      formats: ['es'],
    },
  },
  esbuild: {
    target: 'es2024',
  },
});
