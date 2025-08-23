import axios from 'axios'
import type { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios'
import { API_ENDPOINTS } from '@/config/api.config'

interface CustomInternalAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

export class ApiService {
  protected api: AxiosInstance

  constructor() {
    this.api = axios.create({
      baseURL: API_ENDPOINTS.base,
      timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token')
        console.log('API Request:', {
          url: config.url,
          method: config.method,
          headers: config.headers,
          hasToken: !!token,
        })
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        } else {
          console.warn('No access token found in localStorage')
        }
        return config
      },
      (error) => {
        console.error('API Request Error:', error)
        return Promise.reject(error)
      },
    )

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => {
        console.log('API Response Success:', {
          url: response.config.url,
          status: response.status,
          data: response.data,
        })
        return response
      },
      async (error: AxiosError) => {
        console.error('API Response Error:', {
          url: error.config?.url,
          status: error.response?.status,
          message: error.message,
          response: error.response?.data,
        })
        const originalRequest = error.config as CustomInternalAxiosRequestConfig

        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
          originalRequest._retry = true
          try {
            const refreshToken = localStorage.getItem('refresh_token')
            console.log('Attempting to refresh token...', { hasRefreshToken: !!refreshToken })

            if (!refreshToken) {
              throw new Error('No refresh token available')
            }

            const response = await this.api.post(API_ENDPOINTS.auth.refresh, {
              token: refreshToken,
            })
            console.log('Token refresh response:', response.data)

            const { access_token } = response.data

            if (!access_token) {
              throw new Error('No access token received from refresh endpoint')
            }

            localStorage.setItem('access_token', access_token)
            this.api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
            originalRequest.headers.Authorization = `Bearer ${access_token}`

            return this.api(originalRequest)
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError)
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            window.location.href = '/'
            return Promise.reject(refreshError)
          }
        }
        return Promise.reject(error)
      },
    )
  }

  protected async get<T, P = Record<string, unknown>>(
    url: string,
    config?: { params?: P; headers?: Record<string, string> },
  ): Promise<AxiosResponse<T>> {
    return this.api.get<T>(url, config)
  }

  protected async post<T, D = Record<string, unknown>>(
    url: string,
    data?: D,
    config?: { headers?: Record<string, string> },
  ): Promise<AxiosResponse<T>> {
    return this.api.post<T>(url, data, config)
  }

  protected async put<T, D = Record<string, unknown>>(
    url: string,
    data?: D,
    config?: { headers?: Record<string, string> },
  ): Promise<AxiosResponse<T>> {
    return this.api.put<T>(url, data, config)
  }

  protected async delete<T>(
    url: string,
    config?: { headers?: Record<string, string> },
  ): Promise<AxiosResponse<T>> {
    return this.api.delete<T>(url, config)
  }

  protected async patch<T, D = Record<string, unknown>>(
    url: string,
    data?: D,
    config?: { headers?: Record<string, string> },
  ): Promise<AxiosResponse<T>> {
    return this.api.patch<T>(url, data, config)
  }
}

export default ApiService
