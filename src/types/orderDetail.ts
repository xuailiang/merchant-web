export type OrderSectionKey = 'overview' | 'amount' | 'items' | 'logistics' | 'consignee' | 'logs'

export type OrderActionType =
  | '催付'
  | '立即发货'
  | '查看物流'
  | '处理售后'
  | '查看归档'
  | '查看订单'

export type OrderAmountBreakdown = {
  goodsTotal: number
  freight: number
  platformCoupon: number
  storeCoupon: number
  campaignDiscount: number
  shippingCoupon: number
  otherDiscount: number
  pointDiscount: number
  orderTotal: number
  payAmount: number
}

export type OrderPackageTrace = {
  time: string
  desc: string
}

export type OrderPackage = {
  id: string
  carrier: string
  tracking: string
  shipTime: string
  status: string
  items: string[]
  traces: OrderPackageTrace[]
}

export type OrderLineItem = {
  key: string
  packageId: string
  name: string
  sku: string
  price: number
  qty: number
  paid: number
  discount: number
  freight: number
  image: string
}

export type OrderLogCategory = '支付' | '发货' | '售后' | '系统'

export type OrderOperationLog = {
  id: string
  category: OrderLogCategory
  action: string
  time: string
}

export type OrderDetailViewModel = {
  id: string
  status: string
  settlement: string
  coupon: boolean
  orderTime: string
  payId: string
  payMethod: string
  payTime: string
  receiver: string
  phone: string
  address: string
  points: number
  usedPoints: number
  amount: OrderAmountBreakdown
  invoice: {
    type: string
    title: string
    content: string
    taxNo: string
  }
  shippingDeadline: string
  packages: OrderPackage[]
  items: OrderLineItem[]
  logs: OrderOperationLog[]
}
