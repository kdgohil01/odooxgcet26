/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_USE_BACKEND?: string;
  readonly VITE_BACKEND_URL?: string;
  readonly DEV: boolean;
  readonly MODE: string;
  readonly PROD: boolean;
  readonly SSR: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

