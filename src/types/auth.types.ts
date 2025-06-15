export interface Role {
  roleId: string
  roleName: string
  roleDescription: string
  status: boolean
  createdDate: string
  createdBy: string
  updatedDate: string
  updatedBy: string
}

export interface User {
  userID: string
  email: string
  username: string
  role: Role
  verified: boolean
  active: boolean
}

export interface AuthResponse {
  success: boolean
  message: string
  totalRecord: number
  data: User
  authenticated?: boolean
  access_token?: string
  refresh_token?: string
}

export interface ResetPasswordRequest {
  email: string
  password: string
}

export interface ResetPasswordResponse {
  success: boolean
  message: string
  totalRecord: number
  data: User
}
