import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import ViteYaml from '@modyfi/vite-plugin-yaml';

export default defineConfig({
  plugins: [react(), ViteYaml()],
  base: './', // app is served from a subdirectory when deployed on GitHub Pages
  build: {
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
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: './src/setupTests.ts',
    css: true,
  },
});
