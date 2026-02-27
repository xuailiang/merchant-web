export type MessageType = '交易' | '系统' | '营销' | '审批'
export type MessagePriority = '高' | '中' | '低'
export type MessageDeliveryStatus = 'queued' | 'sending' | 'success' | 'failed' | 'read'
export type MessageBatchAction = 'markRead' | 'retry' | 'archive'

export type MessageViewFilter = {
  keyword: string
  type?: MessageType
  status?: MessageDeliveryStatus
  priority?: MessagePriority
  onlyUnread: boolean
  bizNo?: string
  dateRange?: [string, string] | null
}

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
  hitEstimate24h?: number
  lastTriggeredAt?: string
}

export type MessageRecord = {
  id: string
  type: MessageType
  priority: MessagePriority
  title: string
  content: string
  status: MessageDeliveryStatus
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

export type MessageGroupKey = 'pending' | 'recentRead' | 'broadcast'

export type MessageGroup = {
  key: MessageGroupKey
  label: string
  items: MessageRecord[]
}

export type MessageCenterStats = {
  total: number
  read: number
  unread: number
  failed: number
  highPriority: number
  readRate: number
}

export type MessageDeliveryTimeline = {
  key: string
  title: string
  time: string
  color: 'blue' | 'green' | 'red' | 'gray'
}
