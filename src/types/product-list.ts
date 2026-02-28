import type { PermissionKey } from '../utils/permissions'

export type ProductStatus = '上架中' | '库存紧张' | '待审核' | '已下架'

export type ProductWarningLevel = 'normal' | 'medium' | 'high'

export type ProductListItem = {
  key: string
  name: string
  category: string
  price: number
  cost: number
  stock: number
  sales: number
  status: ProductStatus | string
  listedAt: string
  updatedAt: string
  code: string
  brand: string
  image: string
  channel: string
  shop: string
  auditStatus?: '待审核' | '审核通过' | '审核驳回'
  warningLevel?: ProductWarningLevel
  mediaCompleteness?: number
  updatedBy?: string
}

export type ProductDraftItem = {
  id: string
  title: string
  updatedAt: string
  image?: string
  price?: number | null
  stock?: number | null
}

export type ProductFilterModel = {
  name: string
  code: string
  category: string
  brand: string
  statuses: string[]
  dateRange: string[]
  priceMin: number | null
  priceMax: number | null
  stockMin: number | null
  stockMax: number | null
  profitMin: number | null
  profitMax: number | null
  warningOnly: boolean
  channel: string
  shop: string
}

export type ProductSummaryStats = {
  onSale: number
  warning: number
  pendingReview: number
  drafts: number
  updatedToday: number
}

export type ProductViewPreset = {
  id: string
  name: string
  filters: ProductFilterModel
  updatedAt: string
}

export type ProductActionDef = {
  key: string
  label: string
  permission?: PermissionKey
  danger?: boolean
  to?: (record: ProductListItem) => string
}
