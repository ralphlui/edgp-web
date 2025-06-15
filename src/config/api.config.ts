interface ApiEndpoints {
  base: string
  orgBase: string
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
  organizations: {
    list: string
    create: string
    update: string
    delete: string
  }
  sectors: {
    list: string
  }
}

export const API_ENDPOINTS: ApiEndpoints = {
  base: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api/admin',
  orgBase: import.meta.env.VITE_ORGANIZATION_API_URL || 'http://localhost:8082/api',
  auth: {
    login: '/users/login',
    logout: '/users/logout',
    refresh: '/users/refreshToken',
    resetPassword: '/users/resetPassword',
  },
  users: {
    list: '/users',
    create: '/users',
    update: '/users',
    delete: '/users',
  },
  organizations: {
    list: '/orgs',
    create: '/orgs',
    update: '/orgs',
    delete: '/orgs',
  },
  sectors: {
    list: '/sectors',
  },
}
