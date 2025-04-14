/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  // Другие переменные окружения...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
