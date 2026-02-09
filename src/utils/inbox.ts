export type InboxType = '交易' | '系统' | '营销' | '审批'

export type InboxItem = {
  id: string
  title: string
  desc: string
  time: string
  type: InboxType
  unread: boolean
  priority: '高' | '中' | '低'
  route?: string
  checked?: boolean
}

const STORAGE_KEY = 'inbox-messages'

const DEFAULT_MESSAGES: InboxItem[] = [
  {
    id: 'm1',
    title: '订单待发货提醒',
    desc: '有 12 笔订单待处理',
    time: '10:15',
    type: '交易',
    unread: true,
    priority: '高',
    route: '/orders?status=待发货',
  },
  {
    id: 'm2',
    title: '库存预警',
    desc: '3 个商品库存不足',
    time: '09:42',
    type: '系统',
    unread: true,
    priority: '中',
    route: '/products',
  },
  {
    id: 'm3',
    title: '营销活动即将开始',
    desc: '情人节礼盒专区明日上线',
    time: '昨日',
    type: '营销',
    unread: false,
    priority: '低',
    route: '/marketing',
  },
  {
    id: 'm4',
    title: '商户资质待审核',
    desc: '新增品牌授权待确认',
    time: '昨日',
    type: '审批',
    unread: true,
    priority: '高',
    route: '/products/brands',
  },
]

const notify = () => {
  window.dispatchEvent(new CustomEvent('inbox-update'))
}

export const getInboxMessages = (): InboxItem[] => {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_MESSAGES))
    return [...DEFAULT_MESSAGES]
  }
  try {
    return JSON.parse(raw) as InboxItem[]
  } catch {
    return [...DEFAULT_MESSAGES]
  }
}

export const setInboxMessages = (messages: InboxItem[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
  notify()
}

export const updateInboxMessages = (updater: (items: InboxItem[]) => InboxItem[]) => {
  const next = updater(getInboxMessages())
  setInboxMessages(next)
}

export const addInboxMessage = (item: InboxItem) => {
  updateInboxMessages((items) => [item, ...items])
}
