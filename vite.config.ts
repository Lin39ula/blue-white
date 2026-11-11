import { defineConfig } from 'vite';
import { cpSync, mkdirSync } from 'node:fs';
import { resolve, relative } from 'node:path';

export default defineConfig({
  // Cloudflare Pages uses the site root. GitHub Pages overrides this in its workflow.
  base: process.env.VITE_BASE || '/',
  // Publish only web-ready media editions.
  plugins: [{
    name: 'publish-web-media',
    config: (_, { command }) => command === 'build' ? { publicDir: false } : {},
    writeBundle() {
      const source = resolve('public');
      mkdirSync(resolve('dist'), { recursive: true });
      cpSync(source, resolve('dist'), {
        recursive: true,
        filter: path => !/^videos\/[^/]+\.mp4$/i.test(relative(source, path).replaceAll('\\', '/')),
      });
    },
  }],
  build: {
    target: 'chrome129',
    outDir: 'dist',
    emptyOutDir: true,
  },
});
