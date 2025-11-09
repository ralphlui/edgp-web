/// <reference types="vite/client" />

declare interface ImportMetaEnv {
  readonly VITE_ADMIN_API_URL: string
  readonly VITE_ORGANIZATION_API_URL: string
  readonly VITE_ANALYTICS_API_URL: string
  readonly VITE_API_TIMEOUT: string
  readonly VITE_ENABLE_AUTH: string
  readonly VITE_ENABLE_USER_MANAGEMENT: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string
}

// This type augmentation tells TypeScript about env properties
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    readonly $env: ImportMetaEnv
  }
}

export const getEnvVar = (key: keyof ImportMetaEnv, defaultValue: string = ''): string => {
  const value = import.meta.env[key]
  if (!value && !defaultValue) {
    console.warn(`Environment variable ${key} is not defined`)
  }
  return value || defaultValue
}

export const ENV = {
  ADMIN_API_URL: getEnvVar('VITE_ADMIN_API_URL', 'http://localhost:8081/api/admin'),
  ORGANIZATION_API_URL: getEnvVar(
    'VITE_ORGANIZATION_API_URL',
    'http://localhost:8082/api/organization',
  ),
  ANALYTICS_API_URL: getEnvVar('VITE_ANALYTICS_API_URL', 'http://localhost:8091/api/analytics'),
  API_TIMEOUT: Number(getEnvVar('VITE_API_TIMEOUT', '30000')),
  ENABLE_AUTH: getEnvVar('VITE_ENABLE_AUTH', 'true') === 'true',
  ENABLE_USER_MANAGEMENT: getEnvVar('VITE_ENABLE_USER_MANAGEMENT', 'true') === 'true',
  APP_NAME: getEnvVar('VITE_APP_NAME', 'EDGP Admin'),
  APP_VERSION: getEnvVar('VITE_APP_VERSION', '1.0.0'),
} as const
