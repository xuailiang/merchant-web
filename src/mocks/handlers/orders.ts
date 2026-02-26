import dayjs from 'dayjs'
import { http, HttpResponse } from 'msw'
import type {
  AfterSalesItem,
  OrderItem,
  SettlementDetail,
  SettlementPayment,
} from '../../api/endpoints'

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

const inDateRange = (value: string, start?: string | null, end?: string | null) => {
  if (!start || !end) return true
  const target = dayjs(value)
  const startDate = dayjs(start)
  const endDate = dayjs(end)
  if (!target.isValid()) return false
  if (!startDate.isValid() || !endDate.isValid()) return true
  return (
    (target.isAfter(startDate, 'day') || target.isSame(startDate, 'day')) &&
    (target.isBefore(endDate, 'day') || target.isSame(endDate, 'day'))
  )
}

const orders: OrderItem[] = [
  {
    id: 'DD2026020417142',
    status: '待发货',
    orderTime: '2026-02-04 17:14',
    payTime: '2026-02-04 17:24',
    orderCode: '13567546709',
    quantity: 1,
    unitPrice: '¥7,499',
    paidAmount: '¥7,511',
    payMethod: '微信支付',
    receiver: 'admin',
    phone: '13567546709',
    note: '加急发货',
    settlement: '未结算',
    items: [
      {
        name: 'Apple iPhone 16 Pro 颜色 黄色 内存 4G 容量规格 128GB',
        spec: '颜色：黄色 / 4G / 128GB',
        spu: 'SPU1008601',
        image: 'https://picsum.photos/seed/order2/80/80',
        price: '¥7,499',
        qty: 1,
      },
    ],
  },
  {
    id: 'DD2026020310021',
    status: '待收货',
    orderTime: '2026-02-03 10:21',
    payTime: '2026-02-03 10:25',
    orderCode: '13632223344',
    quantity: 2,
    unitPrice: '¥128',
    paidAmount: '¥256',
    payMethod: '支付宝',
    receiver: '周女士',
    phone: '13632223344',
    note: '送货上门',
    settlement: '已结算',
    items: [
      {
        name: '猫爬架四层大型豪华猫玩具',
        spec: '规格：200 / 红色 / 大',
        spu: 'SPU000905',
        image: 'https://picsum.photos/seed/order3/80/80',
        price: '¥128',
        qty: 1,
      },
      {
        name: '猫咪磨爪玩具',
        spec: '尺寸：小号 / 颜色：原木',
        spu: 'SPU000906',
        image: 'https://picsum.photos/seed/order3b/80/80',
        price: '¥28',
        qty: 1,
      },
    ],
  },
  {
    id: 'DD2026020115203',
    status: '退款中',
    orderTime: '2026-02-01 15:03',
    payTime: '2026-02-01 15:08',
    orderCode: '18677889900',
    quantity: 1,
    unitPrice: '¥2,480',
    paidAmount: '¥2,480',
    payMethod: '微信支付',
    receiver: '许先生',
    phone: '18677889900',
    note: '售后申请中',
    settlement: '未结算',
    items: [
      {
        name: '母婴推车轻便款',
        spec: '灰色 / 轻便折叠',
        spu: 'SPU192200',
        image: 'https://picsum.photos/seed/order5/80/80',
        price: '¥2,480',
        qty: 1,
      },
    ],
  },
]

const afterSales: AfterSalesItem[] = [
  {
    id: 'AS20260204001',
    orderId: 'DD2026020417142',
    customer: '周女士',
    type: '仅退款',
    status: '待审核',
    refundAmount: 60,
    payAmount: 60,
    reason: '未收到货',
    phone: '13567546709',
    applyTime: '2026-02-04 10:12',
  },
  {
    id: 'AS20260203008',
    orderId: 'DD2026020310021',
    customer: '宋先生',
    type: '退货退款',
    status: '处理中',
    refundAmount: 256,
    payAmount: 256,
    reason: '质量问题',
    phone: '13900001234',
    applyTime: '2026-02-03 14:22',
  },
]

const settlementPayments: SettlementPayment[] = [
  {
    key: 'p1',
    index: 1,
    supplier: '济南新大友蔬菜批发有限公司',
    amount: '12400',
    accountName: '张三',
    account: '6222 **** 8899',
    bankNo: '102100099996',
    bankName: '中国工商银行济南分行',
    merchant: '拼京宝旗舰店',
    settleDate: '2026-02-04',
    dept: '华北事业部',
    merchantType: '自营',
    status: '已结算',
  },
]

const settlementDetails: SettlementDetail[] = [
  {
    key: 'd1',
    index: 1,
    direction: '收入',
    amount: '240.00',
    skuName: '猫爬架四层大型豪华猫玩具',
    spuName: '猫咪用品',
    quantity: 1,
    price: '256.00',
    cost: '128.00',
    discount: '0',
    deduct: '8.00',
    taxRate: '3%',
    taxCode: '3010',
    orderId: 'DD2026020310021',
    settleDate: '2026-02-04',
    orderDate: '2026-02-03',
    payDate: '2026-02-03 10:25',
    supplier: '济南三胖子牛羊肉有限公司',
    merchant: '拼京宝旗舰店',
    status: '已结算',
  },
]

export const orderHandlers = [
  http.get('*/orders', ({ request }) => {
    const url = new URL(request.url)
    const orderId = (url.searchParams.get('orderId') || '').trim()
    const orderCode = (url.searchParams.get('orderCode') || '').trim()
    const productName = (url.searchParams.get('productName') || '').trim()
    const phone = (url.searchParams.get('phone') || '').trim()
    const statuses = url.searchParams.getAll('statuses')
    const orderStart = url.searchParams.get('orderStart')
    const orderEnd = url.searchParams.get('orderEnd')
    const payStart = url.searchParams.get('payStart')
    const payEnd = url.searchParams.get('payEnd')
    const page = Number(url.searchParams.get('page') || 1)
    const pageSize = Number(url.searchParams.get('pageSize') || 10)

    const filtered = orders.filter((item) => {
      const matchId = !orderId || item.id.includes(orderId)
      const matchCode = !orderCode || item.orderCode.includes(orderCode)
      const matchProduct =
        !productName || item.items.some((child) => child.name.includes(productName))
      const matchPhone = !phone || item.phone.includes(phone)
      const matchStatus = statuses.length === 0 || statuses.includes(item.status)
      const matchOrderDate = inDateRange(item.orderTime, orderStart, orderEnd)
      const matchPayDate = inDateRange(item.payTime, payStart, payEnd)
      return (
        matchId &&
        matchCode &&
        matchProduct &&
        matchPhone &&
        matchStatus &&
        matchOrderDate &&
        matchPayDate
      )
    })

    return ok(withPagination(filtered, page, pageSize))
  }),

  http.get('*/after-sales', ({ request }) => {
    const url = new URL(request.url)
    const keyword = (url.searchParams.get('keyword') || '').trim()
    const type = (url.searchParams.get('type') || '').trim()
    const status = (url.searchParams.get('status') || '').trim()
    const startDate = url.searchParams.get('startDate')
    const endDate = url.searchParams.get('endDate')
    const page = Number(url.searchParams.get('page') || 1)
    const pageSize = Number(url.searchParams.get('pageSize') || 10)

    const filtered = afterSales.filter((item) => {
      const matchKeyword =
        !keyword ||
        item.id.includes(keyword) ||
        item.orderId.includes(keyword) ||
        item.customer.includes(keyword)
      const matchType = !type || item.type === type
      const matchStatus = !status || item.status === status
      const matchDate = inDateRange(item.applyTime, startDate, endDate)
      return matchKeyword && matchType && matchStatus && matchDate
    })

    return ok(withPagination(filtered, page, pageSize))
  }),

  http.get('*/settlements/payments', ({ request }) => {
    const url = new URL(request.url)
    const supplier = (url.searchParams.get('supplier') || '').trim()
    const status = (url.searchParams.get('status') || '').trim()
    const page = Number(url.searchParams.get('page') || 1)
    const pageSize = Number(url.searchParams.get('pageSize') || 10)

    const filtered = settlementPayments.filter((item) => {
      const matchSupplier = !supplier || item.supplier.includes(supplier)
      const matchStatus = !status || item.status === status
      return matchSupplier && matchStatus
    })
    return ok(withPagination(filtered, page, pageSize))
  }),

  http.get('*/settlements/details', ({ request }) => {
    const url = new URL(request.url)
    const supplier = (url.searchParams.get('supplier') || '').trim()
    const status = (url.searchParams.get('status') || '').trim()
    const page = Number(url.searchParams.get('page') || 1)
    const pageSize = Number(url.searchParams.get('pageSize') || 10)

    const filtered = settlementDetails.filter((item) => {
      const matchSupplier = !supplier || item.supplier.includes(supplier)
      const matchStatus = !status || item.status === status
      return matchSupplier && matchStatus
    })
    return ok(withPagination(filtered, page, pageSize))
  }),
]
