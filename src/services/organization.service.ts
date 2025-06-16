import { ApiService } from './base-api.service'
import axios, { type AxiosInstance, type AxiosError } from 'axios'
import { API_ENDPOINTS } from '@/config/api.config'

interface Sector {
  sectorID: string
  sectorName: string
  sectorCode: string
  description: string | null
  createdBy: string
  lastUpdatedBy: string
  remark: string | null
  active: boolean
}

export interface Organization {
  organizationId: string
  organizationName: string
  address: string
  contactNumber: string
  uniqueEntityNumber: string
  streetAddress: string
  city: string
  postalCode: string
  country: string
  websiteURL: string
  organizationSize: number
  sector: Sector
  primaryContactName: string
  primaryContactPosition: string
  primaryContactEmail: string | null
  primaryContactNumber: string
  remark: string | null
  active: boolean
}

export interface OrganizationListResponse {
  success: boolean
  message: string
  totalRecord: number
  data: Organization[]
}

interface SectorListResponse {
  success: boolean
  message: string
  data: Sector[]
}

interface CreateOrganizationRequest {
  organizationName: string
  primaryContactName: string
  primaryContactEmail: string
  primaryContactNumber: string
  uniqueEntityNumber: string
  sector: {
    sectorId: string
  }
  address: string
  contactNumber: string
  streetAddress: string
  city: string
  postalCode: string
  country: string
  websiteURL: string
  organizationSize: number
  primaryContactPosition: string
}

interface CreateOrganizationResponse {
  success: boolean
  message: string
  totalRecord: number
  data: Organization
}

class OrganizationService extends ApiService {
  private orgApi: AxiosInstance

  constructor() {
    super()
    // Create a separate instance for organization API endpoints
    this.orgApi = axios.create({
      baseURL: API_ENDPOINTS.orgBase,
      timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    })

    // Reuse the auth interceptor logic
    this.orgApi.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token')
        console.debug('[Organization Service] Request interceptor:', {
          url: config.url,
          hasToken: !!token,
          tokenLength: token?.length,
          tokenPreview: token ? `${token.substring(0, 20)}...` : 'no token',
          headers: {
            current: config.headers,
            contentType: config.headers['Content-Type'],
            accept: config.headers['Accept'],
          },
        })

        if (token) {
          config.headers.Authorization = `Bearer ${token}`
          console.debug('[Organization Service] Authorization header set:', {
            header: `Bearer ${token.substring(0, 20)}...`,
            length: token.length,
          })
        } else {
          console.warn('[Organization Service] No access token found in localStorage')
          console.debug('[Organization Service] localStorage contents:', {
            keys: Object.keys(localStorage),
            accessToken: localStorage.getItem('access_token'),
            refreshToken: !!localStorage.getItem('refresh_token'),
          })
        }
        return config
      },
      (error) => {
        console.error('[Organization Service] Request interceptor error:', error)
        return Promise.reject(error)
      },
    )
  }

  public async getOrganizations(page: number = 1, size: number = 1000): Promise<Organization[]> {
    try {
      // Debug log before making the request
      console.debug('[Organization Service] Preparing to fetch organizations:', {
        url: API_ENDPOINTS.orgBase + API_ENDPOINTS.organizations.list,
        token: {
          exists: !!localStorage.getItem('access_token'),
          preview: localStorage.getItem('access_token')?.substring(0, 20) + '...',
        },
      })

      const response = await this.orgApi.get<OrganizationListResponse>(
        `${API_ENDPOINTS.organizations.list}?page=${page}&size=${size}`,
      )

      if (!response.data.success) {
        console.error('[Organization Service] API returned error:', {
          message: response.data.message,
          status: response.status,
          headers: response.headers,
        })
        throw new Error(response.data.message || 'Failed to fetch organizations')
      }

      return response.data.data
    } catch (error) {
      const axiosError = error as AxiosError
      console.error('[Organization Service] Failed to fetch organizations:', {
        error: axiosError.message,
        status: axiosError.response?.status,
        data: axiosError.response?.data,
        config: {
          url: axiosError.config?.url,
          headers: axiosError.config?.headers,
          baseURL: axiosError.config?.baseURL,
        },
      })
      throw error
    }
  }

  public async getSectors(): Promise<Sector[]> {
    try {
      console.debug('[Organization Service] Fetching sectors')
      const response = await this.orgApi.get<SectorListResponse>(API_ENDPOINTS.sectors.list)

      if (!response.data.success) {
        console.error('[Organization Service] API returned error:', {
          message: response.data.message,
          status: response.status,
          headers: response.headers,
        })
        throw new Error(response.data.message || 'Failed to fetch sectors')
      }

      return response.data.data
    } catch (error) {
      const axiosError = error as AxiosError
      console.error('[Organization Service] Failed to fetch sectors:', {
        error: axiosError.message,
        status: axiosError.response?.status,
        data: axiosError.response?.data,
        config: {
          url: axiosError.config?.url,
          headers: axiosError.config?.headers,
          baseURL: axiosError.config?.baseURL,
        },
      })
      throw error
    }
  }

  public async createOrganization(request: CreateOrganizationRequest): Promise<Organization> {
    try {
      console.debug('[Organization Service] Creating organization:', request)
      const response = await this.orgApi.post<CreateOrganizationResponse>(
        API_ENDPOINTS.organizations.create,
        request,
      )

      if (!response.data.success) {
        console.error('[Organization Service] API returned error:', {
          message: response.data.message,
          status: response.status,
          headers: response.headers,
        })
        throw new Error(response.data.message || 'Failed to create organization')
      }

      return response.data.data
    } catch (error) {
      const axiosError = error as AxiosError
      console.error('[Organization Service] Failed to create organization:', {
        error: axiosError.message,
        status: axiosError.response?.status,
        data: axiosError.response?.data,
        config: {
          url: axiosError.config?.url,
          headers: axiosError.config?.headers,
          baseURL: axiosError.config?.baseURL,
        },
      })
      throw error
    }
  }
}

export const organizationService = new OrganizationService()
