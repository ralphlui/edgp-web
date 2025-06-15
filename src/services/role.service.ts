import { ApiService } from './base-api.service'

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
      const response = await this.api.get<RoleListResponse>('/roles')

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
