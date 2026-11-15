/*
 * Admin roles and what each may do. Checked on the server for every admin
 * request (lib/api/handler.ts and the price service); the UI only hides
 * controls a role cannot use.
 *
 *  admin     — everything, including managing admin users
 *  editor    — prices (enter, correct, publish), catalogue, markets, articles, audit log
 *  collector — field data entry only: enter and edit DRAFT prices for a month
 */

export const ROLES = ['admin', 'editor', 'collector'] as const
export type Role = (typeof ROLES)[number]

export const ROLE_LABELS: Record<Role, string> = {
  admin: 'Admin',
  editor: 'Editor',
  collector: 'Field collector',
}

export type Permission =
  | 'prices:enter'
  | 'prices:correctPublished'
  | 'prices:publish'
  | 'prices:delete'
  | 'catalog:write'
  | 'audit:view'
  | 'users:manage'

const MATRIX: Record<Role, readonly Permission[]> = {
  admin: [
    'prices:enter',
    'prices:correctPublished',
    'prices:publish',
    'prices:delete',
    'catalog:write',
    'audit:view',
    'users:manage',
  ],
  editor: [
    'prices:enter',
    'prices:correctPublished',
    'prices:publish',
    'prices:delete',
    'catalog:write',
    'audit:view',
  ],
  collector: ['prices:enter'],
}

export function isRole(value: unknown): value is Role {
  return typeof value === 'string' && (ROLES as readonly string[]).includes(value)
}

export function can(role: Role | undefined | null, permission: Permission): boolean {
  return Boolean(role && MATRIX[role]?.includes(permission))
}
