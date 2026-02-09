import { addInboxMessage } from './inbox'

export type ExportStatus = 'queued' | 'processing' | 'done' | 'failed' | 'expired'

export type ExportTask = {
  id: string
  module: 'orders' | 'products' | 'after-sales' | 'settlements' | 'other'
  title: string
  status: ExportStatus
  createdAt: string
  updatedAt: string
  expireAt: string
  fileUrl?: string
  error?: string
  params?: Record<string, any>
  fields?: string[]
}

const STORAGE_KEY = 'export-tasks'
const EXPIRE_HOURS = 24

const nowString = () => new Date().toISOString().slice(0, 19).replace('T', ' ')

const withExpire = () => {
  const date = new Date()
  date.setHours(date.getHours() + EXPIRE_HOURS)
  return date.toISOString().slice(0, 19).replace('T', ' ')
}

const notifyDone = (task: ExportTask) => {
  addInboxMessage({
    id: `exp-msg-${task.id}`,
    title: `${task.title}导出完成`,
    desc: '导出已完成，点击下载',
    time: '刚刚',
    type: '系统',
    unread: true,
    priority: '中',
    route: `/exports?highlight=${task.id}`,
  })
}

const notifyFailed = (task: ExportTask) => {
  addInboxMessage({
    id: `exp-msg-${task.id}-fail`,
    title: `${task.title}导出失败`,
    desc: task.error || '请稍后重试',
    time: '刚刚',
    type: '系统',
    unread: true,
    priority: '高',
    route: `/exports?highlight=${task.id}`,
  })
}

export const getExportTasks = (): ExportTask[] => {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw) as ExportTask[]
  } catch {
    return []
  }
}

export const setExportTasks = (tasks: ExportTask[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  window.dispatchEvent(new CustomEvent('exports-update'))
}

export const createExportTask = (payload: {
  module: ExportTask['module']
  title: string
  params?: Record<string, any>
  fields?: string[]
}) => {
  const task: ExportTask = {
    id: `exp_${Date.now()}`,
    module: payload.module,
    title: payload.title,
    status: 'queued',
    createdAt: nowString(),
    updatedAt: nowString(),
    expireAt: withExpire(),
    params: payload.params,
    fields: payload.fields,
  }
  const tasks = getExportTasks()
  setExportTasks([task, ...tasks])

  setTimeout(() => {
    updateExportTask(task.id, { status: 'processing' })
  }, 800)

  setTimeout(() => {
    const success = true
    if (success) {
      updateExportTask(task.id, {
        status: 'done',
        fileUrl: `/mock/exports/${task.id}.xlsx`,
      })
      notifyDone({ ...task, status: 'done' })
    } else {
      updateExportTask(task.id, {
        status: 'failed',
        error: '生成失败，请稍后再试',
      })
      notifyFailed({ ...task, status: 'failed' })
    }
  }, 2600)

  return task
}

export const updateExportTask = (id: string, patch: Partial<ExportTask>) => {
  const tasks = getExportTasks()
  const next = tasks.map((item) =>
    item.id === id ? { ...item, ...patch, updatedAt: nowString() } : item
  )
  setExportTasks(next)
}

export const removeExportTask = (id: string) => {
  const tasks = getExportTasks().filter((item) => item.id !== id)
  setExportTasks(tasks)
}

export const normalizeExportStatus = (task: ExportTask): ExportTask => {
  if (task.status === 'done') {
    const expireTime = new Date(task.expireAt).getTime()
    if (Number.isFinite(expireTime) && Date.now() > expireTime) {
      return { ...task, status: 'expired' }
    }
  }
  return task
}
