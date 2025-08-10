import { ApiService } from './base-api.service'
import axios, { type AxiosInstance, type AxiosError, type AxiosResponse } from 'axios'
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

export interface OrganizationDetailResponse {
  success: boolean
  message: string
  totalRecord: number
  data: Organization
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

        console.debug('[Organization Service] Request interceptor - before processing:', {
          url: config.url,
          method: config.method,
          hasToken: !!token,
          tokenLength: token?.length,
          tokenPreview: token ? `${token.substring(0, 20)}...` : 'no token',
          incomingHeaders: { ...config.headers },
        })

        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        } else {
          console.warn('[Organization Service] No access token found in localStorage')
          console.debug('[Organization Service] localStorage contents:', {
            keys: Object.keys(localStorage),
            accessToken: localStorage.getItem('access_token'),
            refreshToken: !!localStorage.getItem('refresh_token'),
          })
        }

        console.debug('[Organization Service] Request interceptor - after processing:', {
          url: config.url,
          method: config.method,
          finalHeaders: { ...config.headers },
          hasAuthorization: !!config.headers.Authorization,
          hasXOrgId: !!config.headers['X-Org-Id'],
        })

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
      const response = await this.orgApi.get<SectorListResponse>(
        `${API_ENDPOINTS.sectors.list}?noPagination=true`,
      )

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

  public async getOrganizationDetails(organizationId: string): Promise<Organization> {
    try {
      console.debug('[Organization Service] Fetching organization details:', {
        organizationId,
        endpoint: API_ENDPOINTS.organizations.detail,
        fullUrl: this.orgApi.defaults.baseURL + API_ENDPOINTS.organizations.detail,
        hasToken: !!localStorage.getItem('access_token'),
      })

      // First try with query parameter to avoid CORS issues
      let response: AxiosResponse<OrganizationDetailResponse>
      try {
        console.debug('[Organization Service] Trying query parameter approach...')
        response = await this.orgApi.get<OrganizationDetailResponse>(
          `${API_ENDPOINTS.organizations.detail}?orgId=${organizationId}`,
        )
      } catch (queryError: unknown) {
        console.debug(
          '[Organization Service] Query parameter failed, trying header approach...',
          queryError instanceof Error ? queryError.message : 'Unknown error',
        )

        // Fallback to header approach if query parameter doesn't work
        response = await this.orgApi.get<OrganizationDetailResponse>(
          API_ENDPOINTS.organizations.detail,
          {
            headers: {
              'X-Org-Id': organizationId,
            },
          },
        )
      }

      if (!response.data.success) {
        console.error('[Organization Service] API returned error:', {
          message: response.data.message,
          status: response.status,
          headers: response.headers,
        })
        throw new Error(response.data.message || 'Failed to fetch organization details')
      }

      return response.data.data
    } catch (error) {
      const axiosError = error as AxiosError
      console.error('[Organization Service] Failed to fetch organization details:', {
        error: axiosError.message,
        status: axiosError.response?.status,
        data: axiosError.response?.data,
        config: {
          url: axiosError.config?.url,
          method: axiosError.config?.method,
          headers: axiosError.config?.headers,
          baseURL: axiosError.config?.baseURL,
          fullUrl:
            axiosError.config?.baseURL && axiosError.config?.url
              ? axiosError.config.baseURL + axiosError.config.url
              : 'Unknown URL',
        },
        isNetworkError: axiosError.code === 'NETWORK_ERROR' || !axiosError.response,
        possibleCauses:
          axiosError.code === 'NETWORK_ERROR' || !axiosError.response
            ? [
                'Backend server at http://localhost:8082 is not running',
                'CORS policy blocking the request',
                'Network connectivity issues',
                'Firewall blocking the connection',
              ]
            : ['API endpoint error', 'Authentication issues', 'Server error'],
      })
      throw error
    }
  }
}

export const organizationService = new OrganizationService()
