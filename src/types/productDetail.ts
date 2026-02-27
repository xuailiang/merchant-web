export type SectionKey = 'overview' | 'basic' | 'media' | 'sku' | 'desc' | 'logistics' | 'logs'

export type ProductMediaItem = {
  id: string
  type: 'image' | 'video'
  name: string
  url: string
  cover?: string
  duration?: string
  isMain?: boolean
}

export type ProductSkuItem = {
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

export type ProductOperationLog = {
  id: string
  user: string
  action: string
  time: string
  detail: string
  category: '价格' | '库存' | '素材' | '上架'
}

export type ProductDetailViewModel = {
  id: string
  name: string
  subtitle: string
  brand: string
  category: string
  spu: string
  supplier: string
  origin: string
  createdAt: string
  updatedAt: string
  keywords: string
  status: '上架中' | '已下架'
  tagList: string[]
  stock: number
  monthSales: number
  rating: number
  refundRate: number
  detail: string
  cover: string
  media: ProductMediaItem[]
  skus: ProductSkuItem[]
  logistics: {
    shipping: string
    tax: string
    exchange: string
    publish: string
    services: string[]
  }
  logs: ProductOperationLog[]
}
