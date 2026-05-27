import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

/**
 * Custom Vite plugin: compiles Chrome Extension scripts (background + content)
 * as standalone IIFE bundles using esbuild (ships with Vite).
 *
 * Architecture Decision:
 * Chrome content scripts cannot use ES modules, so they must be IIFE.
 * The background service worker could use ESM, but IIFE keeps parity
 * and avoids "type": "module" manifest complexity in Phase 1.
 */
function chromeExtensionScripts(): Plugin {
  return {
    name: 'chrome-extension-scripts',
    apply: 'build',
    async closeBundle() {
      const esbuild = await import('esbuild');

      // Background service worker
      await esbuild.build({
        entryPoints: [resolve(__dirname, 'src/background/index.ts')],
        bundle: true,
        outfile: resolve(__dirname, 'dist/background.js'),
        format: 'iife',
        target: ['chrome100'],
        logLevel: 'info',
      });

      // Content script
      await esbuild.build({
        entryPoints: [resolve(__dirname, 'src/content/index.ts')],
        bundle: true,
        outfile: resolve(__dirname, 'dist/content.js'),
        format: 'iife',
        target: ['chrome100'],
        logLevel: 'info',
      });

      console.log('✅ Chrome extension scripts compiled successfully');
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    chromeExtensionScripts(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'index.html'),
      },
    },
  },
});
