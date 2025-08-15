interface ApiEndpoints {
  base: string
  orgBase: string
  policyBase: string
  fileManagementBase: string
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
    invite: string
    completeRegistration: string
  }
  organizations: {
    list: string
    create: string
    update: string
    delete: string
    detail: string
  }
  sectors: {
    list: string
  }
  policies: {
    list: string
    create: string
    update: string
    delete: string
    myPolicy: string
  }
  fileManagement: {
    list: string
    delete: string
    retry: string
  }
}

export const API_ENDPOINTS: ApiEndpoints = {
  base: import.meta.env.VITE_ADMIN_API_URL || 'http://localhost:8081/api/admin',
  orgBase: import.meta.env.VITE_ORGANIZATION_API_URL || 'http://localhost:8082/api',
  policyBase: import.meta.env.VITE_POLICY_API_URL || 'http://localhost:8089/api',
  fileManagementBase: import.meta.env.VITE_FILE_MANAGEMENT_API_URL || 'http://localhost:8083',
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
    invite: '/users/invite',
    completeRegistration: '/users/complete-registration',
  },
  organizations: {
    list: '/orgs',
    create: '/orgs',
    update: '/orgs',
    delete: '/orgs',
    detail: '/orgs/my-organization',
  },
  sectors: {
    list: '/orgs/sectors',
  },
  policies: {
    list: '/policy',
    create: '/policy',
    update: '/policy',
    delete: '/policy',
    myPolicy: '/policy/my-policy',
  },
  fileManagement: {
    list: '/api/mdm/data/file',
    delete: '/api/mdm/data/file',
    retry: '/api/mdm/data/file',
  },
}
