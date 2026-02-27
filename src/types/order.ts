export type OrderRiskLevel = 'normal' | 'warning' | 'danger'

export type OrderSlaStatus = 'safe' | 'warning' | 'expired'

export type OrderViewPreset = 'default' | 'fulfillment' | 'afterSale'

export type OrderRiskFlag = {
  label: string
  level: OrderRiskLevel
}

export type OrderPackage = {
  id: string
  carrier: string
  tracking: string
  status: '待揽收' | '运输中' | '派送中' | '已签收' | '异常'
  updatedAt: string
}

export type OrderSummaryCard = {
  key: string
  title: string
  value: string
  subtitle: string
  tone: OrderRiskLevel
}
