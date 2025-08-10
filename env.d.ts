/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ADMIN_API_URL: string
  readonly VITE_ORGANIZATION_API_URL: string
  readonly VITE_POLICY_API_URL: string
  readonly VITE_RULES_API_URL: string
  readonly VITE_API_TIMEOUT: string
  readonly VITE_ENABLE_AUTH: string
  readonly VITE_ENABLE_USER_MANAGEMENT: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
