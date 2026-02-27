export type MessageType = '交易' | '系统' | '营销' | '审批'
export type DeliveryStatus = 'queued' | 'sending' | 'success' | 'failed' | 'read'

export type MessageTemplate = {
  id: string
  name: string
  type: MessageType
  titleTemplate: string
  contentTemplate: string
  enabled: boolean
  maxRetry: number
  createdAt: string
}

export type SubscriptionRule = {
  id: string
  name: string
  eventCode: string
  type: MessageType
  targetRole: 'admin' | 'operator' | 'finance' | 'all'
  enabled: boolean
  throttleMinutes: number
  createdAt: string
}

export type MessageRecord = {
  id: string
  type: MessageType
  priority: '高' | '中' | '低'
  title: string
  content: string
  status: DeliveryStatus
  retryCount: number
  maxRetry: number
  lastError?: string
  recipient: string
  route?: string
  templateId?: string
  bizNo?: string
  createdAt: string
  sentAt?: string
  readAt?: string
}

type MessageStore = {
  templates: MessageTemplate[]
  rules: SubscriptionRule[]
  records: MessageRecord[]
}

const STORAGE_KEY = 'message-center-store'

const DEFAULT_STORE: MessageStore = {
  templates: [
    {
      id: 'tpl-order-ship',
      name: '订单发货提醒',
      type: '交易',
      titleTemplate: '订单待发货提醒',
      contentTemplate: '订单 ${orderNo} 已付款，请在 ${deadline} 前发货',
      enabled: true,
      maxRetry: 3,
      createdAt: '2026-02-27 09:20:00',
    },
    {
      id: 'tpl-export-done',
      name: '导出完成提醒',
      type: '系统',
      titleTemplate: '导出任务已完成',
      contentTemplate: '任务 ${taskId} 已生成完成，下载链接 24 小时内有效',
      enabled: true,
      maxRetry: 2,
      createdAt: '2026-02-27 09:22:00',
    },
    {
      id: 'tpl-coupon-alert',
      name: '优惠券库存告警',
      type: '营销',
      titleTemplate: '券库存不足提醒',
      contentTemplate: '优惠券 ${couponName} 剩余 ${left} 张，请及时补充',
      enabled: true,
      maxRetry: 2,
      createdAt: '2026-02-27 09:25:00',
    },
  ],
  rules: [
    {
      id: 'rule-1',
      name: '待发货超时告警',
      eventCode: 'order.pending_ship_timeout',
      type: '交易',
      targetRole: 'operator',
      enabled: true,
      throttleMinutes: 30,
      createdAt: '2026-02-27 09:30:00',
    },
    {
      id: 'rule-2',
      name: '导出任务失败通知',
      eventCode: 'export.failed',
      type: '系统',
      targetRole: 'admin',
      enabled: true,
      throttleMinutes: 5,
      createdAt: '2026-02-27 09:32:00',
    },
    {
      id: 'rule-3',
      name: '活动 ROI 低于阈值提醒',
      eventCode: 'marketing.roi_low',
      type: '营销',
      targetRole: 'operator',
      enabled: true,
      throttleMinutes: 60,
      createdAt: '2026-02-27 09:33:00',
    },
  ],
  records: [
    {
      id: 'msg-1001',
      type: '交易',
      priority: '高',
      title: '订单待发货提醒',
      content: '订单 DD202602270001 超过 2 小时未发货',
      status: 'success',
      retryCount: 0,
      maxRetry: 3,
      recipient: '运营专员',
      route: '/orders?status=待发货',
      templateId: 'tpl-order-ship',
      bizNo: 'DD202602270001',
      createdAt: '2026-02-27 10:12:21',
      sentAt: '2026-02-27 10:12:23',
    },
    {
      id: 'msg-1002',
      type: '系统',
      priority: '中',
      title: '导出任务失败',
      content: '任务 exp_102 生成失败，原因：文件服务超时',
      status: 'failed',
      retryCount: 1,
      maxRetry: 2,
      lastError: '对象存储上传超时',
      recipient: '管理员',
      route: '/exports?highlight=exp_102',
      templateId: 'tpl-export-done',
      bizNo: 'exp_102',
      createdAt: '2026-02-27 10:01:10',
      sentAt: '2026-02-27 10:01:11',
    },
    {
      id: 'msg-1003',
      type: '营销',
      priority: '低',
      title: '活动 ROI 低于阈值',
      content: '活动「春季焕新」近 24 小时 ROI 仅 1.2，请关注投放策略',
      status: 'read',
      retryCount: 0,
      maxRetry: 2,
      recipient: '运营专员',
      route: '/marketing/attribution',
      bizNo: 'CAMP-2026-SPRING',
      createdAt: '2026-02-27 08:31:10',
      sentAt: '2026-02-27 08:31:11',
      readAt: '2026-02-27 08:42:01',
    },
  ],
}

const notify = () => {
  window.dispatchEvent(new CustomEvent('message-center-update'))
}

const cloneStore = (store: MessageStore): MessageStore =>
  JSON.parse(JSON.stringify(store)) as MessageStore

const readStore = (): MessageStore => {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_STORE))
    return cloneStore(DEFAULT_STORE)
  }
  try {
    const parsed = JSON.parse(raw) as MessageStore
    return {
      templates: Array.isArray(parsed.templates) ? parsed.templates : [],
      rules: Array.isArray(parsed.rules) ? parsed.rules : [],
      records: Array.isArray(parsed.records) ? parsed.records : [],
    }
  } catch {
    return cloneStore(DEFAULT_STORE)
  }
}

const writeStore = (store: MessageStore) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  notify()
}

export const getMessageCenterStore = (): MessageStore => readStore()

export const updateMessageCenterStore = (updater: (store: MessageStore) => MessageStore) => {
  const next = updater(readStore())
  writeStore(next)
}

export const retryMessage = (messageId: string) => {
  updateMessageCenterStore((store) => {
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ')
    return {
      ...store,
      records: store.records.map((record) => {
        if (record.id !== messageId) return record
        const nextRetry = record.retryCount + 1
        const canSucceed = nextRetry <= record.maxRetry
        return {
          ...record,
          retryCount: nextRetry,
          status: canSucceed ? 'success' : 'failed',
          sentAt: now,
          lastError: canSucceed ? undefined : '重试次数已达上限',
        }
      }),
    }
  })
}

export const markMessageRead = (messageId: string) => {
  updateMessageCenterStore((store) => {
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ')
    return {
      ...store,
      records: store.records.map((record) => {
        if (record.id !== messageId) return record
        if (record.status === 'read') return record
        return {
          ...record,
          status: 'read',
          readAt: now,
        }
      }),
    }
  })
}
