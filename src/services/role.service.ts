import { ApiService } from './base-api.service'
import { API_ENDPOINTS } from '@/config/api.config'

export interface Role {
  roleId: string
  roleName: string
  roleDescription: string
  status: string
}

export interface RoleListResponse {
  success: boolean
  message: string
  totalRecord: number
  data: Role[]
}

class RoleService extends ApiService {
  public async getRoles(): Promise<Role[]> {
    try {
      // Make sure we have a token before making the request
      const token = localStorage.getItem('access_token')
      if (!token) {
        throw new Error('No access token available')
      }

      const response = await this.api.get<RoleListResponse>(`${API_ENDPOINTS.base}/roles`)

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch roles')
      }

      return response.data.data
    } catch (error) {
      console.error('Failed to fetch roles:', error)
      throw error // Let the component handle the error
    }
  }
}

export const roleService = new RoleService()
