import axios, { type AxiosInstance } from 'axios'
import { API_ENDPOINTS } from '@/config/api.config'

export interface Organization {
  name: string
  id: string
}

export interface Policy {
  name: string
  id: string
}

export interface UploadedFile {
  id: string
  uploaded_by: string
  domain_name: string
  file_status: 'UNPROCESSED' | 'PROCESSING' | 'PROCESSED' | 'FAILED'
  file_name: string
  process_stage: string
  organization: Organization
  uploaded_date: string
  total_rows_count: number
  updated_date: string
  policy: Policy
}

export interface FileListResponse {
  success: boolean
  message: string
  totalRecord: number
  data: UploadedFile[]
}

export interface FileListRequest {
  page?: number
  size?: number
  domainName?: string
  fileStatus?: string
  organizationId?: string
}

class FileManagementService {
  private api: AxiosInstance

  constructor() {
    // Create a separate axios instance for file management API without credentials
    this.api = axios.create({
      baseURL: API_ENDPOINTS.fileManagementBase,
      timeout: 30000,
      withCredentials: false, // Disable credentials to avoid CORS issues
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    })

    // Setup request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        console.log('File Management API Request:', {
          url: config.url,
          method: config.method,
          hasToken: !!token,
        })
        return config
      },
      (error) => {
        console.error('File Management API Request Error:', error)
        return Promise.reject(error)
      },
    )

    // Setup response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => {
        console.log('File Management API Response:', {
          url: response.config.url,
          status: response.status,
          data: response.data,
        })
        return response
      },
      (error) => {
        console.error('File Management API Error:', {
          url: error.config?.url,
          status: error.response?.status,
          message: error.message,
          data: error.response?.data,
        })
        return Promise.reject(error)
      },
    )
  }

  // HTTP method implementations
  private async get<T>(url: string): Promise<{ data: T }> {
    const response = await this.api.get<T>(url)
    return { data: response.data }
  }

  private async post<T>(url: string, data: unknown): Promise<{ data: T }> {
    const response = await this.api.post<T>(url, data)
    return { data: response.data }
  }

  private async delete<T>(url: string): Promise<{ data: T }> {
    const response = await this.api.delete<T>(url)
    return { data: response.data }
  }

  async getUploadedFiles(params: FileListRequest = {}): Promise<FileListResponse> {
    try {
      const queryParams = new URLSearchParams({
        page: (params.page || 0).toString(),
        size: (params.size || 1000).toString(),
      })

      // Add optional filters
      if (params.domainName) {
        queryParams.append('domainName', params.domainName)
      }
      if (params.fileStatus) {
        queryParams.append('fileStatus', params.fileStatus)
      }
      if (params.organizationId) {
        queryParams.append('organizationId', params.organizationId)
      }

      const url = `${API_ENDPOINTS.fileManagement.list}?${queryParams.toString()}`
      console.log('Fetching uploaded files from:', url)

      const response = await this.get<FileListResponse>(url)
      console.log('File management API response:', response.data)
      return response.data
    } catch (error) {
      console.error('Error fetching uploaded files:', error)
      throw error
    }
  }

  async deleteFile(fileId: string): Promise<{ success: boolean; message: string }> {
    try {
      console.log('Deleting file with ID:', fileId)
      const response = await this.delete<{ success: boolean; message: string }>(
        `${API_ENDPOINTS.fileManagement.delete}/${fileId}`,
      )
      console.log('Delete file response:', response.data)
      return response.data
    } catch (error) {
      console.error('Error deleting file:', error)
      throw error
    }
  }

  async retryFileProcessing(fileId: string): Promise<{ success: boolean; message: string }> {
    try {
      console.log('Retrying file processing for ID:', fileId)
      const response = await this.post<{ success: boolean; message: string }>(
        `${API_ENDPOINTS.fileManagement.retry}/${fileId}/retry`,
        {},
      )
      console.log('Retry file processing response:', response.data)
      return response.data
    } catch (error) {
      console.error('Error retrying file processing:', error)
      throw error
    }
  }
}

export const fileManagementService = new FileManagementService()
