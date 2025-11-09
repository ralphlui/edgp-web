/**
 * Utility functions for handling user permissions based on scope
 */

export type Permission =
  | 'manage:org'
  | 'view:org'
  | 'manage:sector'
  | 'view:sector'
  | 'manage:mdm'
  | 'view:mdm'
  | 'manage:policy'
  | 'view:policy'

/**
 * Parse scope string into individual permissions
 * @param scope - Space-separated string of permissions (e.g., "manage:org manage:sector")
 * @returns Array of permissions
 */
export function parseScope(scope: string): Permission[] {
  if (!scope || typeof scope !== 'string') {
    return []
  }
  return scope.split(' ').filter(Boolean) as Permission[]
}

/**
 * Check if user has a specific permission
 * @param userScope - User's scope string
 * @param permission - Permission to check for
 * @returns True if user has the permission
 */
export function hasPermission(userScope: string, permission: Permission): boolean {
  const permissions = parseScope(userScope)
  return permissions.includes(permission)
}

/**
 * Check if user has any of the specified permissions
 * @param userScope - User's scope string
 * @param permissions - Array of permissions to check for
 * @returns True if user has at least one of the permissions
 */
export function hasAnyPermission(userScope: string, permissions: Permission[]): boolean {
  const userPermissions = parseScope(userScope)
  return permissions.some((permission) => userPermissions.includes(permission))
}

/**
 * Check if user has all specified permissions
 * @param userScope - User's scope string
 * @param permissions - Array of permissions to check for
 * @returns True if user has all the permissions
 */
export function hasAllPermissions(userScope: string, permissions: Permission[]): boolean {
  const userPermissions = parseScope(userScope)
  return permissions.every((permission) => userPermissions.includes(permission))
}

/**
 * Resource types available in the system
 */
export type Resource = 'org' | 'sector' | 'mdm' | 'policy'

/**
 * Permission actions available for resources
 */
export type Action = 'manage' | 'view'

/**
 * Check if user can manage a specific resource
 * @param userScope - User's scope string
 * @param resource - Resource to check for manage permission
 * @returns True if user has manage permission for the resource
 */
export function canManage(userScope: string, resource: Resource): boolean {
  return hasPermission(userScope, `manage:${resource}` as Permission)
}

/**
 * Check if user can view a specific resource (either view or manage permission)
 * @param userScope - User's scope string
 * @param resource - Resource to check for view permission
 * @returns True if user has view or manage permission for the resource
 */
export function canView(userScope: string, resource: Resource): boolean {
  return (
    hasPermission(userScope, `view:${resource}` as Permission) ||
    hasPermission(userScope, `manage:${resource}` as Permission)
  )
}

/**
 * Check if user has any access to a resource (view or manage)
 * @param userScope - User's scope string
 * @param resource - Resource to check access for
 * @returns True if user has any access to the resource
 */
export function hasResourceAccess(userScope: string, resource: Resource): boolean {
  return canView(userScope, resource)
}

/**
 * Get user-friendly permission names
 */
export const PERMISSION_NAMES: Record<Permission, string> = {
  'manage:org': 'Organization Management',
  'view:org': 'Organization View',
  'manage:sector': 'Sector Management',
  'view:sector': 'Sector View',
  'manage:mdm': 'Master Data Management',
  'view:mdm': 'Master Data View',
  'manage:policy': 'Policy Management',
  'view:policy': 'Policy View',
}
