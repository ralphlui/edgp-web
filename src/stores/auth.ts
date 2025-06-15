import { defineStore } from 'pinia'
import { ref } from 'vue'

interface Role {
  roleId: string
  roleName: string
  roleDescription: string
  status: boolean
  createdDate: string
  createdBy: string
  updatedDate: string
  updatedBy: string
}

interface User {
  userID: string
  email: string
  username: string
  role: Role
  verified: boolean
  active: boolean
}

interface AuthResponse {
  success: boolean
  message: string
  totalRecord: number
  data: User
  access_token?: string
  refresh_token?: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const accessToken = ref<string | null>(null)
  const refreshToken = ref<string | null>(null)

  function setAuth(response: AuthResponse) {
    user.value = response.data
    if (response.access_token) {
      accessToken.value = response.access_token
      localStorage.setItem('access_token', response.access_token)
    }
    if (response.refresh_token) {
      refreshToken.value = response.refresh_token
      localStorage.setItem('refresh_token', response.refresh_token)
    }
  }

  function clearAuth() {
    user.value = null
    accessToken.value = null
    refreshToken.value = null
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  }

  // Initialize from localStorage
  const initAuth = () => {
    const savedAccessToken = localStorage.getItem('access_token')
    const savedRefreshToken = localStorage.getItem('refresh_token')
    if (savedAccessToken) accessToken.value = savedAccessToken
    if (savedRefreshToken) refreshToken.value = savedRefreshToken
  }

  return {
    user,
    accessToken,
    refreshToken,
    setAuth,
    clearAuth,
    initAuth,
  }
})
