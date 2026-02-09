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
