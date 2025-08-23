import { API_ENDPOINTS } from '@/config/api.config'
import { ApiService } from './base-api.service'

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

class FileManagementService extends ApiService {
  constructor() {
    super()
    // Set the base URL for file management API
    this.api.defaults.baseURL = API_ENDPOINTS.fileManagementBase
    // Disable credentials for file management API to avoid CORS issues
    this.api.defaults.withCredentials = false
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

  async getFileDetails(
    fileId: string,
  ): Promise<{ success: boolean; message: string; data: UploadedFile }> {
    try {
      console.log('Fetching file details for ID:', fileId)
      const response = await this.get<{ success: boolean; message: string; data: UploadedFile }>(
        `${API_ENDPOINTS.fileManagement.list}/${fileId}`,
      )
      console.log('File details response:', response.data)
      return response.data
    } catch (error) {
      console.error('Error fetching file details:', error)
      throw error
    }
  }
}

export const fileManagementService = new FileManagementService()
