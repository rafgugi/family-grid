import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import ViteYaml from '@modyfi/vite-plugin-yaml';

export default defineConfig({
  plugins: [react(), ViteYaml()],
  build: {
    outDir: 'build',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-gojs': ['gojs'],
          'vendor-ui': ['bootstrap', 'reactstrap'],
          'vendor-utils': [
            'lodash-es',
            'i18next',
            'react-i18next',
            'yaml',
            'browser-image-compression',
          ],
        },
      },
    },
  },
  define: {
    // Inject version from package.json at build time
    'process.env.REACT_APP_VERSION': JSON.stringify(
      process.env.npm_package_version
    ),
    // User-configurable env var (from .env file)
    'process.env.REACT_APP_MAX_PHOTO_KB': JSON.stringify(
      process.env.VITE_MAX_PHOTO_KB || '100'
    ),
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.ts',
    css: true,
  },
});
