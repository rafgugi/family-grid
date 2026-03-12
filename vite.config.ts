import { defineConfig } from 'vite';
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
  },
});
