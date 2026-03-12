import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import ViteYaml from '@modyfi/vite-plugin-yaml';

export default defineConfig({
  plugins: [react(), ViteYaml()],
  build: {
    outDir: 'build',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-gojs': ['gojs'],
          'vendor-ui': ['bootstrap', 'reactstrap', 'bootstrap-icons'],
          'vendor-utils': ['lodash-es', 'i18next', 'react-i18next'],
        },
      },
    },
  },
  define: {
    'process.env.REACT_APP_VERSION': JSON.stringify(
      process.env.npm_package_version
    ),
    'process.env.REACT_APP_NAME': JSON.stringify(process.env.npm_package_name),
    'process.env.REACT_APP_REPO': JSON.stringify(
      process.env.npm_package_repository
    ),
    'process.env.REACT_APP_MAX_PHOTO_KB': JSON.stringify(
      process.env.VITE_MAX_PHOTO_KB || '100'
    ),
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.ts',
  },
});
