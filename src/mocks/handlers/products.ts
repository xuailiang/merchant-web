import dayjs from 'dayjs'
import { http, HttpResponse } from 'msw'
import type { ProductItem } from '../../api/endpoints'

type PagedResult<T> = {
  total: number
  list: T[]
}

const ok = <T>(data: T) =>
  HttpResponse.json({
    code: 0,
    message: 'ok',
    data,
  })

const withPagination = <T>(list: T[], page = 1, pageSize = 10): PagedResult<T> => {
  const safePage = Math.max(1, page)
  const safeSize = Math.max(1, pageSize)
  const start = (safePage - 1) * safeSize
  return {
    total: list.length,
    list: list.slice(start, start + safeSize),
  }
}

const products: ProductItem[] = [
  {
    key: 'p1',
    name: '星曜Pro 智能手机 256G',
    category: '数码/手机',
    price: 3499,
    cost: 2899,
    stock: 58,
    sales: 326,
    status: '上架中',
    listedAt: '2026-01-22',
    updatedAt: '2026-02-01 12:01:12',
    code: '10242601000224',
    brand: '星曜',
    image: 'https://picsum.photos/id/1062/100/100',
    channel: '积分商城',
    shop: '星辰旗舰店',
  },
  {
    key: 'p2',
    name: 'Aurora 无线降噪耳机',
    category: '数码/耳机',
    price: 899,
    cost: 560,
    stock: 32,
    sales: 214,
    status: '库存紧张',
    listedAt: '2026-02-01',
    updatedAt: '2026-02-02 09:44:21',
    code: '10382601000223',
    brand: 'Aurora',
    image: 'https://picsum.photos/id/180/100/100',
    channel: '商城',
    shop: 'Aurora官方店',
  },
  {
    key: 'p3',
    name: 'Nebula 游戏键盘 RGB',
    category: '数码/外设',
    price: 499,
    cost: 260,
    stock: 84,
    sales: 158,
    status: '上架中',
    listedAt: '2026-01-08',
    updatedAt: '2026-01-30 10:05:41',
    code: '11012601000201',
    brand: 'Nebula',
    image: 'https://picsum.photos/id/1040/100/100',
    channel: '商城',
    shop: 'Nebula外设店',
  },
]

export const productHandlers = [
  http.get('*/products', ({ request }) => {
    const url = new URL(request.url)
    const name = (url.searchParams.get('name') || '').trim()
    const code = (url.searchParams.get('code') || '').trim()
    const category = (url.searchParams.get('category') || '').trim()
    const brand = (url.searchParams.get('brand') || '').trim()
    const statuses = url.searchParams.getAll('statuses')
    const priceMin = Number(url.searchParams.get('priceMin') || '')
    const priceMax = Number(url.searchParams.get('priceMax') || '')
    const stockMin = Number(url.searchParams.get('stockMin') || '')
    const stockMax = Number(url.searchParams.get('stockMax') || '')
    const startDate = url.searchParams.get('startDate')
    const endDate = url.searchParams.get('endDate')
    const page = Number(url.searchParams.get('page') || 1)
    const pageSize = Number(url.searchParams.get('pageSize') || 10)

    const filtered = products.filter((item) => {
      const matchName = !name || item.name.includes(name)
      const matchCode = !code || item.code.includes(code)
      const matchCategory = !category || item.category === category
      const matchBrand = !brand || item.brand.includes(brand)
      const matchStatus = statuses.length === 0 || statuses.includes(item.status)
      const matchPriceMin = Number.isNaN(priceMin) || item.price >= priceMin
      const matchPriceMax = Number.isNaN(priceMax) || item.price <= priceMax
      const matchStockMin = Number.isNaN(stockMin) || item.stock >= stockMin
      const matchStockMax = Number.isNaN(stockMax) || item.stock <= stockMax
      const matchDate =
        !startDate ||
        !endDate ||
        ((dayjs(item.listedAt).isAfter(startDate, 'day') ||
          dayjs(item.listedAt).isSame(startDate, 'day')) &&
          (dayjs(item.listedAt).isBefore(endDate, 'day') ||
            dayjs(item.listedAt).isSame(endDate, 'day')))
      return (
        matchName &&
        matchCode &&
        matchCategory &&
        matchBrand &&
        matchStatus &&
        matchPriceMin &&
        matchPriceMax &&
        matchStockMin &&
        matchStockMax &&
        matchDate
      )
    })

    return ok(withPagination(filtered, page, pageSize))
  }),
]
