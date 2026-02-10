import { computed, ref, watch } from 'vue'

export type ColumnConfig = {
  key: string
  title: string
}

const readStorage = (key: string, fallback: string[]) => {
  const raw = localStorage.getItem(key)
  if (!raw) return fallback
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed.filter((item) => typeof item === 'string')
    return fallback
  } catch {
    return fallback
  }
}

export const useColumnConfig = <T extends { key: string }>(
  storageKey: string,
  columns: T[]
) => {
  const defaultKeys = columns.map((col) => col.key)
  const visibleKeys = ref<string[]>(readStorage(storageKey, defaultKeys))

  watch(
    visibleKeys,
    (value) => {
      localStorage.setItem(storageKey, JSON.stringify(value))
    },
    { deep: true }
  )

  const filteredColumns = computed(() =>
    columns.filter((col) => visibleKeys.value.includes(col.key))
  )

  const reset = () => {
    visibleKeys.value = [...defaultKeys]
  }

  return {
    visibleKeys,
    filteredColumns,
    reset,
  }
}
