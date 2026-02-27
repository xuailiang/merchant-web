import dayjs from 'dayjs'
import type {
  MessageBatchAction,
  MessageCenterStats,
  MessageDeliveryStatus,
  MessageGroup,
  MessageGroupKey,
  MessageRecord,
  MessageTemplate,
  MessageType,
  MessageViewFilter,
  SubscriptionRule,
} from '../types/message-center'

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
      hitEstimate24h: 18,
      lastTriggeredAt: '2026-02-27 13:10:00',
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
      hitEstimate24h: 7,
      lastTriggeredAt: '2026-02-27 12:31:00',
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
      hitEstimate24h: 3,
      lastTriggeredAt: '2026-02-27 11:50:00',
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
  window.dispatchEvent(new CustomEvent('inbox-update'))
}

const cloneStore = (store: MessageStore): MessageStore =>
  JSON.parse(JSON.stringify(store)) as MessageStore

const sanitizeStore = (store: MessageStore): MessageStore => ({
  templates: Array.isArray(store.templates) ? store.templates : [],
  rules: Array.isArray(store.rules) ? store.rules : [],
  records: Array.isArray(store.records) ? store.records : [],
})

const readStore = (): MessageStore => {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_STORE))
    return cloneStore(DEFAULT_STORE)
  }
  try {
    return sanitizeStore(JSON.parse(raw) as MessageStore)
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
  writeStore(sanitizeStore(next))
}

export const getMessageCenterStats = (
  records: MessageRecord[] = getMessageCenterStore().records
): MessageCenterStats => {
  const total = records.length
  const read = records.filter((item) => item.status === 'read').length
  const failed = records.filter((item) => item.status === 'failed').length
  const unread = total - read
  const highPriority = records.filter((item) => item.priority === '高').length
  const readRate = total ? Math.round((read / total) * 100) : 0
  return { total, read, unread, failed, highPriority, readRate }
}

const priorityWeight: Record<MessageRecord['priority'], number> = {
  高: 3,
  中: 2,
  低: 1,
}

const statusWeight: Record<MessageDeliveryStatus, number> = {
  failed: 3,
  queued: 2,
  sending: 2,
  success: 1,
  read: 0,
}

export const sortMessages = (records: MessageRecord[]): MessageRecord[] =>
  [...records].sort((a, b) => {
    const priorityDiff = priorityWeight[b.priority] - priorityWeight[a.priority]
    if (priorityDiff !== 0) return priorityDiff
    const statusDiff = statusWeight[b.status] - statusWeight[a.status]
    if (statusDiff !== 0) return statusDiff
    return dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf()
  })

export const filterMessages = (
  records: MessageRecord[],
  filter: MessageViewFilter
): MessageRecord[] => {
  const keyword = filter.keyword.trim()
  return records.filter((item) => {
    const matchKeyword =
      !keyword ||
      item.title.includes(keyword) ||
      item.content.includes(keyword) ||
      item.bizNo?.includes(keyword)
    const matchType = !filter.type || item.type === filter.type
    const matchStatus = !filter.status || item.status === filter.status
    const matchPriority = !filter.priority || item.priority === filter.priority
    const matchUnread = !filter.onlyUnread || item.status !== 'read'
    const matchBizNo = !filter.bizNo || item.bizNo?.includes(filter.bizNo)
    const matchDate =
      !filter.dateRange ||
      filter.dateRange.length !== 2 ||
      (() => {
        const target = dayjs(item.createdAt)
        const start = dayjs(filter.dateRange?.[0])
        const end = dayjs(filter.dateRange?.[1])
        return (
          (target.isAfter(start, 'day') || target.isSame(start, 'day')) &&
          (target.isBefore(end, 'day') || target.isSame(end, 'day'))
        )
      })()
    return (
      matchKeyword &&
      matchType &&
      matchStatus &&
      matchPriority &&
      matchUnread &&
      matchBizNo &&
      matchDate
    )
  })
}

export const groupMessages = (records: MessageRecord[]): MessageGroup[] => {
  const pending = records.filter((item) => item.status === 'failed' || item.status !== 'read')
  const recentRead = records
    .filter((item) => item.status === 'read')
    .sort(
      (a, b) => dayjs(b.readAt || b.createdAt).valueOf() - dayjs(a.readAt || a.createdAt).valueOf()
    )
  const broadcast = records.filter((item) => item.type === '系统' && item.priority !== '高')

  return [
    { key: 'pending', label: '待处理', items: sortMessages(pending) },
    { key: 'recentRead', label: '最近已读', items: recentRead.slice(0, 20) },
    { key: 'broadcast', label: '系统广播', items: sortMessages(broadcast) },
  ]
}

export const getMessageGroupByKey = (records: MessageRecord[], key: MessageGroupKey) =>
  groupMessages(records).find((group) => group.key === key)?.items ?? []

const formatNow = () => new Date().toISOString().slice(0, 19).replace('T', ' ')

export const markMessageRead = (messageId: string) => {
  updateMessageCenterStore((store) => ({
    ...store,
    records: store.records.map((record) => {
      if (record.id !== messageId || record.status === 'read') return record
      return { ...record, status: 'read', readAt: formatNow() }
    }),
  }))
}

export const markMessagesRead = (ids: string[]) => {
  const set = new Set(ids)
  updateMessageCenterStore((store) => ({
    ...store,
    records: store.records.map((record) => {
      if (!set.has(record.id) || record.status === 'read') return record
      return { ...record, status: 'read', readAt: formatNow() }
    }),
  }))
}

export const retryMessage = (messageId: string) => {
  retryMessages([messageId])
}

export const retryMessages = (ids: string[]) => {
  const set = new Set(ids)
  updateMessageCenterStore((store) => {
    const now = formatNow()
    return {
      ...store,
      records: store.records.map((record) => {
        if (!set.has(record.id)) return record
        if (record.status !== 'failed') return record
        if (record.retryCount >= record.maxRetry) return record
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

export const removeMessageRecords = (ids: string[]) => {
  const set = new Set(ids)
  updateMessageCenterStore((store) => ({
    ...store,
    records: store.records.filter((record) => !set.has(record.id)),
  }))
}

export const handleBatchAction = (action: MessageBatchAction, ids: string[]) => {
  if (action === 'markRead') {
    markMessagesRead(ids)
    return
  }
  if (action === 'retry') {
    retryMessages(ids)
    return
  }
  removeMessageRecords(ids)
}

export const upsertMessageRecord = (record: MessageRecord) => {
  updateMessageCenterStore((store) => {
    const exists = store.records.some((item) => item.id === record.id)
    if (!exists) return { ...store, records: [record, ...store.records] }
    return {
      ...store,
      records: store.records.map((item) => (item.id === record.id ? record : item)),
    }
  })
}

export const addMessageRecord = (payload: {
  id?: string
  title: string
  content: string
  type: MessageType
  priority?: MessageRecord['priority']
  recipient?: string
  route?: string
  bizNo?: string
  status?: MessageDeliveryStatus
  maxRetry?: number
}) => {
  const now = formatNow()
  const record: MessageRecord = {
    id: payload.id ?? `msg-${Date.now()}`,
    title: payload.title,
    content: payload.content,
    type: payload.type,
    priority: payload.priority ?? '中',
    recipient: payload.recipient ?? '运营专员',
    route: payload.route,
    bizNo: payload.bizNo,
    status: payload.status ?? 'success',
    retryCount: 0,
    maxRetry: payload.maxRetry ?? 2,
    createdAt: now,
    sentAt: now,
  }
  upsertMessageRecord(record)
  return record
}
