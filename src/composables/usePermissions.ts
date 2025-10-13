import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  parseScope,
  canManage,
  canView,
  hasResourceAccess,
  type Permission,
  type Resource,
} from '@/utils/permissions'

/**
 * Composable for handling user permissions in Vue components
 */
export function usePermissions() {
  const authStore = useAuthStore()

  // Get user's scope
  const userScope = computed(() => authStore.user?.scope || '')

  // Get parsed permissions
  const permissions = computed(() => parseScope(userScope.value))

  // Check if user has a specific permission
  const can = (permission: Permission) => {
    return computed(() => hasPermission(userScope.value, permission))
  }

  // Check if user has any of the specified permissions
  const canAny = (permissions: Permission[]) => {
    return computed(() => hasAnyPermission(userScope.value, permissions))
  }

  // Check if user has all specified permissions
  const canAll = (permissions: Permission[]) => {
    return computed(() => hasAllPermissions(userScope.value, permissions))
  }

  // Check if user can manage a specific resource
  const canManageResource = (resource: Resource) => {
    return computed(() => canManage(userScope.value, resource))
  }

  // Check if user can view a specific resource (view or manage)
  const canViewResource = (resource: Resource) => {
    return computed(() => canView(userScope.value, resource))
  }

  // Check if user has any access to a resource
  const hasAccess = (resource: Resource) => {
    return computed(() => hasResourceAccess(userScope.value, resource))
  }

  return {
    userScope,
    permissions,
    can,
    canAny,
    canAll,
    canManageResource,
    canViewResource,
    hasAccess,
  }
}
