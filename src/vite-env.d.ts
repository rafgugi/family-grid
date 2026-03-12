/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_VERSION: string;
  readonly VITE_NAME: string;
  readonly VITE_REPO: string;
  readonly VITE_MAX_PHOTO_KB: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
