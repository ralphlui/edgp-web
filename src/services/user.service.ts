import { ApiService } from './base-api.service'
import { API_ENDPOINTS } from '@/config/api.config'

export interface UserListResponse {
  success: boolean
  message: string
  totalRecord: number
  data: {
    active: number
    deleted: number
    pending: number
    users: Array<{
      id: string
      username: string
      email: string
      role: string
      status: string
      lastLogin: string | null
      contributions: number
    }>
  }
}

class UserService extends ApiService {
  public async getUsers(page: number = 0, size: number = 5): Promise<UserListResponse> {
    console.log('UserService: Fetching users with params:', { page, size })
    try {
      const response = await this.api.get<UserListResponse>(
        `${API_ENDPOINTS.users.list}?page=${page}&size=${size}`,
      )
      console.log('UserService: Successfully fetched users:', response.data)
      return response.data
    } catch (error) {
      console.error('UserService: Failed to fetch users:', error)
      throw error
    }
  }
}

export const userService = new UserService()
