/// <reference types="vite/client" />

// Global constants injected at build time
declare const __APP_VERSION__: string;

// Vite env variables
interface ImportMetaEnv {
  readonly VITE_MAX_PHOTO_KB?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
