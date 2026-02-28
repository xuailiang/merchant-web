import { onBeforeUnmount, ref, watch, type Ref } from 'vue'
import dayjs from 'dayjs'
import type { DraftPayloadV2 } from '../types/create-product'

type AutoSaveOptions = {
  draftId: Ref<string | null>
  snapshot: () => string
  createPayload: (id: string) => DraftPayloadV2
  storageKey?: string
  delayMs?: number
}

type DraftRecoverInfo = {
  id: string
  title: string
  updatedAt: string
}

const parseDrafts = (raw: string | null): Array<any> => {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export const useCreateProductAutoSave = (options: AutoSaveOptions) => {
  const storageKey = options.storageKey ?? 'product-drafts'
  const delayMs = options.delayMs ?? 5000
  const syncState = ref<'dirty' | 'saving' | 'synced'>('synced')
  const lastSavedAt = ref('')
  const dirty = ref(false)
  const baseSnapshot = ref(options.snapshot())
  const timer = ref<number | null>(null)

  const clearTimer = () => {
    if (timer.value !== null) {
      window.clearTimeout(timer.value)
      timer.value = null
    }
  }

  const latestDraftInfo = ref<DraftRecoverInfo | null>(null)

  const refreshLatestDraftInfo = () => {
    const drafts = parseDrafts(localStorage.getItem(storageKey))
    const latest = drafts[0]
    if (!latest) {
      latestDraftInfo.value = null
      return
    }
    latestDraftInfo.value = {
      id: String(latest.id ?? ''),
      title: String(latest.title ?? '未命名草稿'),
      updatedAt: String(latest.updatedAt ?? ''),
    }
  }

  const saveNow = () => {
    const id = options.draftId.value ?? `draft-${Date.now()}`
    const payload = options.createPayload(id)
    const drafts = parseDrafts(localStorage.getItem(storageKey))
    const index = drafts.findIndex((item) => item.id === id)
    if (index >= 0) drafts[index] = payload
    else drafts.unshift(payload)
    localStorage.setItem(storageKey, JSON.stringify(drafts))
    options.draftId.value = id
    baseSnapshot.value = options.snapshot()
    syncState.value = 'synced'
    dirty.value = false
    lastSavedAt.value = dayjs().format('HH:mm:ss')
    refreshLatestDraftInfo()
  }

  const scheduleSave = () => {
    clearTimer()
    syncState.value = 'saving'
    timer.value = window.setTimeout(() => {
      saveNow()
      timer.value = null
    }, delayMs)
  }

  watch(
    () => options.snapshot(),
    (value) => {
      if (value === baseSnapshot.value) {
        dirty.value = false
        syncState.value = 'synced'
        clearTimer()
        return
      }
      dirty.value = true
      syncState.value = 'dirty'
      scheduleSave()
    }
  )

  const markSaved = () => {
    baseSnapshot.value = options.snapshot()
    dirty.value = false
    syncState.value = 'synced'
    clearTimer()
  }

  const loadDraftById = (id: string) => {
    const drafts = parseDrafts(localStorage.getItem(storageKey))
    return drafts.find((item) => item.id === id) ?? null
  }

  refreshLatestDraftInfo()

  onBeforeUnmount(() => {
    if (dirty.value) saveNow()
    clearTimer()
  })

  return {
    syncState,
    lastSavedAt,
    dirty,
    markSaved,
    saveNow,
    loadDraftById,
    latestDraftInfo,
    refreshLatestDraftInfo,
  }
}
