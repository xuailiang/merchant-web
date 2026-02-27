import { request } from './client'

export type PagedResult<T> = {
  total: number
  list: T[]
}

export type ProductItem = {
  key: string
  name: string
  category: string
  price: number
  cost: number
  stock: number
  sales: number
  status: string
  listedAt: string
  updatedAt: string
  code: string
  brand: string
  image: string
  channel: string
  shop: string
}

export type ProductDetailDto = ProductItem & {
  subtitle: string
  spu: string
  supplier: string
  origin: string
  keywords: string
  status: '上架中' | '已下架'
  tagList: string[]
  rating: number
  refundRate: number
  detail: string
  medias: Array<{
    id: string
    type: 'image' | 'video'
    name: string
    url: string
    cover?: string
    duration?: string
    isMain?: boolean
  }>
}

export type ProductSkuDto = {
  id: string
  combo: string
  image: string
  barcode: string
  customCode: string
  price: number
  originalPrice: number
  cost: number
  stock: number
}

export type ProductOperationLogDto = {
  id: string
  user: string
  action: string
  time: string
  detail: string
  category: '价格' | '库存' | '素材' | '上架'
}

export type OrderItem = {
  id: string
  status: string
  orderTime: string
  payTime: string
  orderCode: string
  quantity: number
  unitPrice: string
  paidAmount: string
  payMethod: string
  receiver: string
  phone: string
  note: string
  settlement: string
  items: Array<{
    name: string
    spec: string
    spu: string
    image: string
    price: string
    qty: number
  }>
}

export type AfterSalesItem = {
  id: string
  orderId: string
  customer: string
  type: string
  status: string
  refundAmount: number
  payAmount: number
  reason: string
  phone: string
  applyTime: string
}

export type SettlementPayment = {
  key: string
  index: number
  supplier: string
  amount: string
  accountName: string
  account: string
  bankNo: string
  bankName: string
  merchant: string
  settleDate: string
  dept: string
  merchantType: string
  status: string
}

export type SettlementDetail = {
  key: string
  index: number
  direction: string
  amount: string
  skuName: string
  spuName: string
  quantity: number
  price: string
  cost: string
  discount: string
  deduct: string
  taxRate: string
  taxCode: string
  orderId: string
  settleDate: string
  orderDate: string
  payDate: string
  supplier: string
  merchant: string
  status: string
}

export type WebhookDto = {
  id: string
  name: string
  url: string
  events: string[]
  enabled: boolean
  timeoutSec: number
  retryLimit: number
  successRate: number
  lastPushAt?: string
}

export type ApiKeyDto = {
  id: string
  appName: string
  keyPrefix: string
  scopes: string[]
  status: string
  ipWhitelist: string
  expireAt: string
  createdAt: string
  lastUsedAt?: string
}

export type IntegrationDto = {
  id: string
  name: string
  category: 'ERP' | 'WMS'
  status: string
  syncMode: 'push' | 'pull'
  endpoint: string
  appKey: string
  warehouseMapping: string
  successRate: number
  lastSyncAt?: string
}

export const fetchProducts = (params: {
  name?: string
  code?: string
  category?: string
  brand?: string
  statuses?: string[]
  priceMin?: number | null
  priceMax?: number | null
  stockMin?: number | null
  stockMax?: number | null
  startDate?: string
  endDate?: string
  page?: number
  pageSize?: number
}) => {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    if (Array.isArray(value)) {
      value.forEach((v) => query.append(key, String(v)))
      return
    }
    query.set(key, String(value))
  })
  return request<PagedResult<ProductItem>>(`/products?${query.toString()}`)
}

export const fetchProductDetail = (id: string) => request<ProductDetailDto>(`/products/${id}`)

export const fetchProductSkuList = (
  id: string,
  params?: {
    page?: number
    pageSize?: number
    keyword?: string
    mode?: 'all' | 'lowStock' | 'lowProfit'
  }
) => {
  const query = new URLSearchParams()
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    query.set(key, String(value))
  })
  return request<PagedResult<ProductSkuDto>>(`/products/${id}/skus?${query.toString()}`)
}

export const fetchProductOperationLogs = (
  id: string,
  params?: { category?: string; page?: number; pageSize?: number }
) => {
  const query = new URLSearchParams()
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    query.set(key, String(value))
  })
  return request<PagedResult<ProductOperationLogDto>>(`/products/${id}/logs?${query.toString()}`)
}

export const fetchOrders = (params: {
  orderId?: string
  statuses?: string[]
  orderCode?: string
  productName?: string
  phone?: string
  orderStart?: string
  orderEnd?: string
  payStart?: string
  payEnd?: string
  page?: number
  pageSize?: number
}) => {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    if (Array.isArray(value)) {
      value.forEach((v) => query.append(key, String(v)))
      return
    }
    query.set(key, String(value))
  })
  return request<PagedResult<OrderItem>>(`/orders?${query.toString()}`)
}

export const fetchAfterSales = (params: {
  keyword?: string
  type?: string
  status?: string
  startDate?: string
  endDate?: string
  page?: number
  pageSize?: number
}) => {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    query.set(key, String(value))
  })
  return request<PagedResult<AfterSalesItem>>(`/after-sales?${query.toString()}`)
}

export const fetchSettlementPayments = (params: {
  supplier?: string
  status?: string
  startDate?: string
  endDate?: string
  summary?: boolean
  page?: number
  pageSize?: number
}) => {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    query.set(key, String(value))
  })
  return request<PagedResult<SettlementPayment>>(`/settlements/payments?${query.toString()}`)
}

export const fetchSettlementDetails = (params: {
  supplier?: string
  status?: string
  startDate?: string
  endDate?: string
  page?: number
  pageSize?: number
}) => {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    query.set(key, String(value))
  })
  return request<PagedResult<SettlementDetail>>(`/settlements/details?${query.toString()}`)
}

export const fetchWebhooks = (params?: {
  keyword?: string
  enabled?: boolean
  page?: number
  pageSize?: number
}) => {
  const query = new URLSearchParams()
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    query.set(key, String(value))
  })
  return request<PagedResult<WebhookDto>>(`/open-platform/webhooks?${query.toString()}`)
}

export const createWebhook = (payload: Omit<WebhookDto, 'id' | 'successRate' | 'lastPushAt'>) =>
  request<{ id: string }>('/open-platform/webhooks', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const fetchApiKeys = (params?: {
  keyword?: string
  status?: string
  page?: number
  pageSize?: number
}) => {
  const query = new URLSearchParams()
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    query.set(key, String(value))
  })
  return request<PagedResult<ApiKeyDto>>(`/open-platform/api-keys?${query.toString()}`)
}

export const createApiKey = (payload: {
  appName: string
  scopes: string[]
  ipWhitelist?: string
  expireAt?: string
}) =>
  request<{ id: string; keyPrefix: string; secret: string }>('/open-platform/api-keys', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const fetchIntegrations = (params?: {
  category?: string
  status?: string
  page?: number
  pageSize?: number
}) => {
  const query = new URLSearchParams()
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    query.set(key, String(value))
  })
  return request<PagedResult<IntegrationDto>>(`/open-platform/integrations?${query.toString()}`)
}

export const updateIntegration = (id: string, payload: Partial<IntegrationDto>) =>
  request<IntegrationDto>(`/open-platform/integrations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })

export const triggerIntegrationSync = (id: string) =>
  request<{ taskId: string }>(`/open-platform/integrations/${id}/sync`, { method: 'POST' })
