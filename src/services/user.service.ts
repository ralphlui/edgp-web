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

export interface InviteUserRequest {
  email: string
  role: string
  organizationId: string
}

export interface InviteUserResponse {
  success: boolean
  message: string
  totalRecord: number
  data: {
    email: string
    roleName: string
    status: string
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

  public async inviteUser(request: InviteUserRequest): Promise<InviteUserResponse> {
    try {
      console.debug('UserService: Inviting user:', request)
      const response = await this.api.post<InviteUserResponse>('/users/invite', request)
      console.debug('UserService: Successfully invited user:', response.data)
      return response.data
    } catch (error) {
      console.error('UserService: Failed to invite user:', error)
      throw error
    }
  }
}

export const userService = new UserService()
