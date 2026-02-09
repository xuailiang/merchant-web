import { reactive, watch } from 'vue'

export const usePersistedFilters = <T extends Record<string, any>>(key: string, defaults: T): T => {
  let stored: Partial<T> = {}
  try {
    const raw = localStorage.getItem(key)
    if (raw) {
      stored = JSON.parse(raw) as Partial<T>
    }
  } catch {
    stored = {}
  }

  const state = reactive({ ...defaults, ...stored }) as T

  watch(
    state,
    () => {
      localStorage.setItem(key, JSON.stringify(state))
    },
    { deep: true }
  )

  return state
}
