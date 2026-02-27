import {
  addMessageRecord,
  getMessageCenterStore,
  markMessagesRead,
  removeMessageRecords,
  retryMessages,
  sortMessages,
  updateMessageCenterStore,
} from './messageCenter'
import type { MessageRecord } from '../types/message-center'

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

const CHECKED_KEY = 'inbox-checked-map'

const readCheckedMap = (): Record<string, boolean> => {
  const raw = localStorage.getItem(CHECKED_KEY)
  if (!raw) return {}
  try {
    return JSON.parse(raw) as Record<string, boolean>
  } catch {
    return {}
  }
}

const writeCheckedMap = (map: Record<string, boolean>) => {
  localStorage.setItem(CHECKED_KEY, JSON.stringify(map))
}

const toInboxItem = (record: MessageRecord, checkedMap: Record<string, boolean>): InboxItem => ({
  id: record.id,
  title: record.title,
  desc: record.content,
  time: record.sentAt || record.createdAt,
  type: record.type,
  unread: record.status !== 'read',
  priority: record.priority,
  route: record.route,
  checked: !!checkedMap[record.id],
})

export const getInboxMessages = (): InboxItem[] => {
  const checkedMap = readCheckedMap()
  const records = sortMessages(getMessageCenterStore().records)
  return records.map((record) => toInboxItem(record, checkedMap))
}

const syncCheckedMap = (items: InboxItem[]) => {
  const nextMap: Record<string, boolean> = {}
  items.forEach((item) => {
    if (item.checked) nextMap[item.id] = true
  })
  writeCheckedMap(nextMap)
}

export const setInboxMessages = (messages: InboxItem[]) => {
  const before = getInboxMessages()
  const beforeIds = new Set(before.map((item) => item.id))
  const afterIds = new Set(messages.map((item) => item.id))
  const removedIds = [...beforeIds].filter((id) => !afterIds.has(id))
  if (removedIds.length > 0) removeMessageRecords(removedIds)

  const markedReadIds = messages.filter((item) => !item.unread).map((item) => item.id)
  if (markedReadIds.length > 0) markMessagesRead(markedReadIds)

  syncCheckedMap(messages)
  window.dispatchEvent(new CustomEvent('inbox-update'))
}

export const updateInboxMessages = (updater: (items: InboxItem[]) => InboxItem[]) => {
  const next = updater(getInboxMessages())
  setInboxMessages(next)
}

export const addInboxMessage = (item: InboxItem) => {
  addMessageRecord({
    id: item.id,
    title: item.title,
    content: item.desc,
    type: item.type,
    priority: item.priority,
    route: item.route,
    status: item.unread ? 'success' : 'read',
  })
}

export const retryInboxMessages = (ids: string[]) => {
  retryMessages(ids)
}

export const clearInboxChecked = () => {
  writeCheckedMap({})
  updateMessageCenterStore((store) => ({ ...store }))
}
