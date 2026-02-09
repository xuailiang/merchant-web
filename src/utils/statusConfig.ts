export type StatusMeta = {
  label: string
  color: string
}

export type ActionDef<T = any> = {
  key: string
  label: string
  permission?: string
  danger?: boolean
  to?: (record: T) => string
}

export const orderStatusConfig: Record<string, StatusMeta> = {
  待支付: { label: '待支付', color: 'orange' },
  待发货: { label: '待发货', color: 'blue' },
  待收货: { label: '待收货', color: 'geekblue' },
  交易完成: { label: '交易完成', color: 'green' },
  取消: { label: '取消', color: 'default' },
  退款完成: { label: '退款完成', color: 'purple' },
  退款审核中: { label: '退款审核中', color: 'orange' },
  交易关闭: { label: '交易关闭', color: 'default' },
}

export const orderActionConfig: Record<string, ActionDef> = {
  view: { key: 'view', label: '查看', permission: 'orders:view', to: (r) => `/orders/${r.id}` },
  ship: { key: 'ship', label: '发货', permission: 'orders:ship', to: (r) => `/orders/ship/${r.id}` },
  note: { key: 'note', label: '修改备注', permission: 'orders:view' },
  adjust: { key: 'adjust', label: '调整金额', permission: 'orders:view' },
  afterSale: { key: 'afterSale', label: '售后处理', permission: 'orders:view' },
}

export const orderStatusActions: Record<string, string[]> = {
  待支付: ['view', 'note'],
  待发货: ['view', 'ship', 'note', 'adjust'],
  待收货: ['view', 'note'],
  交易完成: ['view', 'afterSale'],
  取消: ['view'],
  退款完成: ['view'],
  退款审核中: ['view', 'afterSale'],
  交易关闭: ['view'],
}

export const productStatusConfig: Record<string, StatusMeta> = {
  上架中: { label: '上架中', color: 'green' },
  库存紧张: { label: '库存紧张', color: 'orange' },
  已下架: { label: '已下架', color: 'default' },
}

export const productActionConfig: Record<string, ActionDef> = {
  view: { key: 'view', label: '查看', permission: 'products:view', to: (r) => `/products/${r.key}` },
  edit: { key: 'edit', label: '编辑', permission: 'products:edit' },
  quickEdit: { key: 'quickEdit', label: '快速编辑', permission: 'products:edit' },
  down: { key: 'down', label: '下架', permission: 'products:delete', danger: true },
  up: { key: 'up', label: '上架', permission: 'products:edit' },
  stock: { key: 'stock', label: '调整库存', permission: 'products:edit' },
  price: { key: 'price', label: '修改价格', permission: 'products:edit' },
  copy: { key: 'copy', label: '复制链接' },
  replenish: { key: 'replenish', label: '补货', permission: 'products:edit' },
}

export const productStatusActions: Record<string, string[]> = {
  上架中: ['view', 'edit', 'down', 'stock', 'price', 'copy'],
  库存紧张: ['view', 'edit', 'replenish', 'stock', 'price', 'copy'],
  已下架: ['view', 'edit', 'up', 'copy'],
}

export const afterSalesStatusConfig: Record<string, StatusMeta> = {
  待审核: { label: '待审核', color: 'orange' },
  处理中: { label: '处理中', color: 'blue' },
  已退款: { label: '已退款', color: 'green' },
  已拒绝: { label: '已拒绝', color: 'red' },
}

export const afterSalesActionConfig: Record<string, ActionDef> = {
  view: { key: 'view', label: '详情', permission: 'after_sales:view' },
  review: { key: 'review', label: '审核', permission: 'after_sales:review' },
}

export const afterSalesStatusActions: Record<string, string[]> = {
  待审核: ['view', 'review'],
  处理中: ['view'],
  已退款: ['view'],
  已拒绝: ['view'],
}

export const settlementStatusConfig: Record<string, StatusMeta> = {
  已结算: { label: '已结算', color: 'green' },
  未结算: { label: '未结算', color: 'orange' },
}

export const settlementActionConfig: Record<string, ActionDef> = {
  view: { key: 'view', label: '查看' },
  export: { key: 'export', label: '导出' },
}

export const settlementStatusActions: Record<string, string[]> = {
  已结算: ['view', 'export'],
  未结算: ['view'],
}
