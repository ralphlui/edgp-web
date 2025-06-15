import axios from 'axios'
import ApiService from './base-api.service'
import { API_ENDPOINTS } from '@/config/api.config'
import type { AuthResponse, ResetPasswordRequest, ResetPasswordResponse } from '@/types/auth.types'
import { useAuthStore } from '@/stores/auth'

class AuthService extends ApiService {
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await this.post<AuthResponse>(API_ENDPOINTS.auth.login, {
        email,
        password,
      })

      const { data, headers } = response
      console.debug('[Auth Service] Login response:', {
        success: data.success,
        hasAccessToken: !!data.access_token,
        hasRefreshToken: !!data.refresh_token,
        headers: headers,
      })

      // Try to get token from response data first
      let accessToken = data.access_token
      let refreshToken = data.refresh_token

      // If not in response data, try cookies
      if (!accessToken || !refreshToken) {
        const cookieMap = document.cookie.split(';').reduce(
          (acc, cookie) => {
            const [key, value] = cookie.trim().split('=')
            acc[key] = value
            return acc
          },
          {} as Record<string, string>,
        )

        console.debug('[Auth Service] Checking cookies:', {
          availableCookies: Object.keys(cookieMap),
          hasAccessTokenCookie: !!(
            cookieMap['access_token'] ||
            cookieMap['accessToken'] ||
            cookieMap['jwt']
          ),
          hasRefreshTokenCookie: !!(cookieMap['refresh_token'] || cookieMap['refreshToken']),
        })

        if (!accessToken) {
          accessToken = cookieMap['access_token'] || cookieMap['accessToken'] || cookieMap['jwt']
        }
        if (!refreshToken) {
          refreshToken = cookieMap['refresh_token'] || cookieMap['refreshToken']
        }
      }

      // Store tokens in both localStorage and Pinia store if available
      if (accessToken) {
        localStorage.setItem('access_token', accessToken)
        console.debug('[Auth Service] Access token stored:', {
          preview: accessToken.substring(0, 20) + '...',
          length: accessToken.length,
          source: data.access_token ? 'response data' : 'cookies',
        })
      } else {
        console.warn('[Auth Service] No access token available from response or cookies')
      }

      if (refreshToken) {
        localStorage.setItem('refresh_token', refreshToken)
        console.debug('[Auth Service] Refresh token stored')
      }

      // Update Pinia store
      const authStore = useAuthStore()
      const authData = {
        ...data,
        access_token: accessToken,
        refresh_token: refreshToken,
      }
      authStore.setAuth(authData)

      return {
        ...authData,
        authenticated: !!accessToken,
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

  async resetPassword(email: string, password: string): Promise<void> {
    try {
      console.log('Reset password request:', {
        endpoint: API_ENDPOINTS.auth.resetPassword,
        email,
        timestamp: new Date().toISOString(),
      })

      const response = await this.patch<ResetPasswordResponse, ResetPasswordRequest>(
        API_ENDPOINTS.auth.resetPassword,
        {
          email,
          password,
        },
      )

      console.log('Reset password response:', {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data,
        success: response.data.success,
        message: response.data.message,
        userDetails: response.data.data
          ? {
              userID: response.data.data.userID,
              email: response.data.data.email,
              username: response.data.data.username,
              role: response.data.data.role.roleName,
              verified: response.data.data.verified,
              active: response.data.data.active,
            }
          : null,
      })

      if (!response.data.success) {
        throw new Error(response.data.message || 'Password reset failed')
      }
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

      throw error
    }

    throw error
  }
}

export const authService = new AuthService()
export default authService
