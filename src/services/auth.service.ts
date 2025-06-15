import axios from 'axios'
import ApiService from './base-api.service'
import { API_ENDPOINTS } from '@/config/api.config'
import type { AuthResponse } from '@/types/auth.types'

class AuthService extends ApiService {
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await this.post<AuthResponse>(API_ENDPOINTS.auth.login, {
        email,
        password,
      })

      const { data, headers } = response
      console.log('Login response:', data)
      console.log('Response headers:', headers)

      // Handle cookies if present
      const cookies = document.cookie.split(';').reduce(
        (acc, cookie) => {
          const [key, value] = cookie.trim().split('=')
          acc[key] = value
          return acc
        },
        {} as Record<string, string>,
      )

      const accessToken = cookies['access_token'] || cookies['accessToken'] || cookies['jwt']
      const refreshToken = cookies['refresh_token'] || cookies['refreshToken']

      if (accessToken) localStorage.setItem('access_token', accessToken)
      if (refreshToken) localStorage.setItem('refresh_token', refreshToken)

      return {
        ...data,
        authenticated: true,
        access_token: accessToken,
        refresh_token: refreshToken,
      }
    } catch (error) {
      this.handleError(error)
      throw error
    }
  }

  async logout(): Promise<void> {
    try {
      const response = await this.post(API_ENDPOINTS.auth.logout)
      console.log('Logout response:', {
        status: response.status,
        data: response.data,
        headers: response.headers,
      })
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
    } catch (error) {
      this.handleError(error)
      throw error
    }
  }

  private handleError(error: unknown): void {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ERR_NETWORK') {
        throw new Error('Unable to connect to server. Please check if the backend is running.')
      }

      if (error.response?.status === 401) {
        throw new Error(error.response.data?.message || 'Invalid credentials')
      }

      if (error.response?.status === 403) {
        throw new Error('CORS error: Backend server rejected the request')
      }

      console.error('API error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers,
      })
    }
  }
}

export const authService = new AuthService()
export default authService
