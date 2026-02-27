import { getRole, type UserRole } from './auth'

export type PermissionKey =
  | 'dashboard:view'
  | 'products:view'
  | 'products:create'
  | 'products:edit'
  | 'products:delete'
  | 'products:batch'
  | 'products:export'
  | 'products:review'
  | 'inventory:view'
  | 'inventory:lock'
  | 'inventory:stocktake'
  | 'inventory:replenish'
  | 'inventory:transfer'
  | 'inventory:cost'
  | 'brands:view'
  | 'brands:create'
  | 'brands:edit'
  | 'brands:disable'
  | 'orders:view'
  | 'orders:export'
  | 'orders:ship'
  | 'after_sales:view'
  | 'after_sales:review'
  | 'shipping:center'
  | 'shipping:batch'
  | 'shipping:import'
  | 'shipping:print'
  | 'shipping:export'
  | 'shipping:trace'
  | 'supply:view'
  | 'customers:view'
  | 'membership:view'
  | 'marketing:view'
  | 'marketing:attribution'
  | 'decor:view'
  | 'finance:view'
  | 'finance:closure'
  | 'settings:view'
  | 'settings:permissions'
  | 'assets:view'
  | 'open_platform:view'
  | 'open_platform:webhook'
  | 'open_platform:apikey'
  | 'open_platform:integration'
  | 'ops:view'
  | 'ops:messages'
  | 'ops:alerts'
  | 'ops:tasks'
  | 'ops:logs'
  | 'exports:view'

export const PERMISSION_GROUPS: Array<{ group: string; keys: PermissionKey[] }> = [
  { group: '概览', keys: ['dashboard:view'] },
  {
    group: '商品管理',
    keys: [
      'products:view',
      'products:create',
      'products:edit',
      'products:delete',
      'products:batch',
      'products:export',
      'products:review',
      'inventory:view',
      'inventory:lock',
      'inventory:stocktake',
      'inventory:replenish',
      'inventory:transfer',
      'inventory:cost',
      'brands:view',
      'brands:create',
      'brands:edit',
      'brands:disable',
    ],
  },
  {
    group: '订单管理',
    keys: ['orders:view', 'orders:export', 'orders:ship', 'after_sales:view', 'after_sales:review'],
  },
  {
    group: '发货中心',
    keys: [
      'shipping:center',
      'shipping:batch',
      'shipping:import',
      'shipping:print',
      'shipping:export',
      'shipping:trace',
    ],
  },
  { group: '供货管理', keys: ['supply:view'] },
  { group: '客户管理', keys: ['customers:view', 'membership:view'] },
  { group: '营销中心', keys: ['marketing:view', 'marketing:attribution'] },
  { group: '店铺装修', keys: ['decor:view'] },
  { group: '财务中心', keys: ['finance:view', 'finance:closure'] },
  {
    group: '运营中心',
    keys: ['ops:view', 'ops:messages', 'ops:alerts', 'ops:tasks', 'ops:logs', 'exports:view'],
  },
  { group: '系统设置', keys: ['settings:view', 'settings:permissions', 'assets:view'] },
  {
    group: '开放平台',
    keys: [
      'open_platform:view',
      'open_platform:webhook',
      'open_platform:apikey',
      'open_platform:integration',
    ],
  },
]

export type PermissionMatrix = Record<UserRole, PermissionKey[]>

const DEFAULT_MATRIX: PermissionMatrix = {
  admin: PERMISSION_GROUPS.flatMap((g) => g.keys),
  operator: [
    'dashboard:view',
    'products:view',
    'products:create',
    'products:edit',
    'products:batch',
    'products:export',
    'products:review',
    'inventory:view',
    'inventory:lock',
    'inventory:stocktake',
    'inventory:replenish',
    'inventory:transfer',
    'inventory:cost',
    'brands:view',
    'brands:create',
    'brands:edit',
    'brands:disable',
    'orders:view',
    'orders:export',
    'orders:ship',
    'after_sales:view',
    'after_sales:review',
    'shipping:center',
    'shipping:batch',
    'shipping:import',
    'shipping:print',
    'shipping:export',
    'shipping:trace',
    'supply:view',
    'customers:view',
    'membership:view',
    'marketing:view',
    'marketing:attribution',
    'decor:view',
    'assets:view',
    'open_platform:view',
    'open_platform:webhook',
    'open_platform:apikey',
    'open_platform:integration',
    'ops:view',
    'ops:messages',
    'ops:alerts',
    'ops:tasks',
    'ops:logs',
    'exports:view',
  ],
  finance: ['dashboard:view', 'finance:view', 'finance:closure'],
}

const STORAGE_KEY = 'permission-matrix'

export const getPermissionMatrix = (): PermissionMatrix => {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return DEFAULT_MATRIX
  try {
    return JSON.parse(raw) as PermissionMatrix
  } catch {
    return DEFAULT_MATRIX
  }
}

export const setPermissionMatrix = (matrix: PermissionMatrix) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(matrix))
}

export const getRolePermissions = (role: UserRole): PermissionKey[] => {
  const matrix = getPermissionMatrix()
  return matrix[role] ?? []
}

export const hasPermission = (key: PermissionKey): boolean => {
  const role = getRole() ?? 'operator'
  if (role === 'admin') return true
  return getRolePermissions(role).includes(key)
}
