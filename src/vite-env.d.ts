/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MEDPLUM_BASE_URL: string
  readonly VITE_MEDPLUM_CLIENT_ID: string
  readonly VITE_MEDPLUM_CLIENT_SECRET: string
  readonly VITE_MEDPLUM_REDIRECT_URI: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}