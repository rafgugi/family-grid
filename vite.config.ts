import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import ViteYaml from '@modyfi/vite-plugin-yaml';
import EnvironmentPlugin from 'vite-plugin-environment';

export default defineConfig({
  plugins: [
    react(),
    ViteYaml(),
    EnvironmentPlugin({
      VITE_VERSION: null,
      VITE_NAME: null,
      VITE_REPO: null,
      VITE_MAX_PHOTO_KB: '100',
    }),
  ],
  base: '/family-grid/',
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor code from app code for better caching
          'vendor-react': ['react', 'react-dom', 'react-i18next', 'i18next'],
          'vendor-bootstrap': ['bootstrap', 'reactstrap'],
          'vendor-gojs': ['gojs'],
          'vendor-utils': [
            'lodash-es',
            'file-saver',
            'yaml',
            'browser-image-compression',
            'react-easy-crop',
          ],
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    css: true,
  },
});
