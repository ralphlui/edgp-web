interface ApiEndpoints {
  base: string
  auth: {
    login: string
    logout: string
    refresh: string
    resetPassword: string
  }
  users: {
    list: string
    create: string
    update: string
    delete: string
  }
  // Add more endpoint groups as needed
}

export const API_ENDPOINTS: ApiEndpoints = {
  base: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api/admin',
  auth: {
    login: '/users/login',
    logout: '/users/logout',
    refresh: '/auth/refresh',
    resetPassword: '/users/resetPassword',
  },
  users: {
    list: '/users',
    create: '/users',
    update: '/users',
    delete: '/users',
  },
}
