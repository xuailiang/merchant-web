export const overviewStats = [
  { title: '今日成交额', value: '¥128,560', trend: 12.4, note: '较昨日提升' },
  { title: '订单数', value: '1,284', trend: -4.1, note: '较昨日下降' },
  { title: '访客数', value: '18,902', trend: 8.6, note: '较昨日提升' },
  { title: '转化率', value: '3.8%', trend: 0.6, note: '较昨日提升' },
  { title: '退款金额', value: '¥4,320', trend: -1.2, note: '较昨日下降' },
  { title: '客单价', value: '¥248', trend: 2.3, note: '较昨日提升' },
]

export const salesProgress = [
  { label: '本周目标达成', percent: 72 },
  { label: '本月目标达成', percent: 54 },
]

export const orderStatus = [
  { label: '待付款', value: 86, color: 'orange' },
  { label: '待发货', value: 142, color: 'blue' },
  { label: '配送中', value: 68, color: 'purple' },
  { label: '已完成', value: 912, color: 'green' },
]

export const hotProducts = [
  {
    key: 'p1',
    name: '星曜Pro 智能手机 256G',
    category: '数码/手机',
    sales: 368,
    revenue: '¥268,000',
  },
  {
    key: 'p2',
    name: 'Aurora 无线降噪耳机',
    category: '数码/耳机',
    sales: 244,
    revenue: '¥98,600',
  },
  {
    key: 'p3',
    name: 'Lume 智能手表 S3',
    category: '数码/穿戴',
    sales: 198,
    revenue: '¥76,300',
  },
  {
    key: 'p4',
    name: 'Nebula 游戏键盘 RGB',
    category: '数码/外设',
    sales: 176,
    revenue: '¥48,900',
  },
]

export const latestOrders = [
  {
    id: 'O-20260203-8812',
    customer: '周女士',
    amount: '¥1,268',
    status: '待发货',
  },
  {
    id: 'O-20260203-8803',
    customer: '宋先生',
    amount: '¥698',
    status: '配送中',
  },
  {
    id: 'O-20260203-8791',
    customer: '林女士',
    amount: '¥4,260',
    status: '已完成',
  },
  {
    id: 'O-20260203-8772',
    customer: '许先生',
    amount: '¥2,480',
    status: '待付款',
  },
]

export const alerts = [
  '库存不足提醒：Aurora 无线降噪耳机仅剩 32 件。',
  '物流预警：华东区域延迟订单 14 单。',
  '营销提醒：明日 10:00 上新直播排期确认。',
]
