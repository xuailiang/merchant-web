import {
  nextTick,
  onActivated,
  onDeactivated,
  onMounted,
  onUnmounted,
  reactive,
  ref,
  type Ref,
  watch,
} from 'vue'
import { onBeforeRouteLeave } from 'vue-router'

type PaginationState = {
  current: number
  pageSize: number
}

type UseListPageStateDefaults<F extends Record<string, unknown>, P extends PaginationState> = {
  filters: F
  pagination: P
}

const readJson = <T>(storage: Storage, key: string, fallback: T): T => {
  try {
    const raw = storage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

const writeJson = (storage: Storage, key: string, value: unknown) => {
  try {
    storage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore storage errors
  }
}

export const useListPageState = <
  F extends Record<string, unknown>,
  P extends PaginationState = PaginationState,
>(
  pageKey: string,
  defaults: UseListPageStateDefaults<F, P>
) => {
  const filtersStorageKey = `${pageKey}:filters`
  const paginationStorageKey = `${pageKey}:pagination`
  const scrollStorageKey = `${pageKey}:scrollTop`

  const filters = reactive({
    ...defaults.filters,
    ...readJson<Partial<F>>(localStorage, filtersStorageKey, {}),
  }) as F

  const pagination = reactive({
    ...defaults.pagination,
    ...readJson<Partial<P>>(localStorage, paginationStorageKey, {}),
  }) as P

  if (!Number.isFinite(pagination.current) || pagination.current < 1) {
    pagination.current = defaults.pagination.current
  }
  if (!Number.isFinite(pagination.pageSize) || pagination.pageSize < 1) {
    pagination.pageSize = defaults.pagination.pageSize
  }

  watch(
    filters,
    () => {
      writeJson(localStorage, filtersStorageKey, filters)
    },
    { deep: true }
  )

  watch(
    pagination,
    () => {
      writeJson(localStorage, paginationStorageKey, pagination)
    },
    { deep: true }
  )

  const scrollContainerRef = ref<HTMLElement | null>(null)
  const stopHandles: Array<() => void> = []

  const getScrollContainer = () => scrollContainerRef.value

  const readScrollTop = () => {
    const container = getScrollContainer()
    if (container) return container.scrollTop
    return window.scrollY || document.documentElement.scrollTop || 0
  }

  const writeScrollTop = (top: number) => {
    const container = getScrollContainer()
    if (container) {
      container.scrollTop = top
      return
    }
    window.scrollTo({ top })
  }

  const saveScroll = () => {
    const scrollTop = readScrollTop()
    sessionStorage.setItem(scrollStorageKey, String(scrollTop))
  }

  const restoreScroll = async () => {
    const raw = sessionStorage.getItem(scrollStorageKey)
    if (!raw) return
    const scrollTop = Number(raw)
    if (!Number.isFinite(scrollTop)) return
    await nextTick()
    requestAnimationFrame(() => writeScrollTop(scrollTop))
  }

  const bindScrollContainer = (elRef: Ref<HTMLElement | null>) => {
    const stop = watch(
      elRef,
      (el) => {
        scrollContainerRef.value = el
        if (el) void restoreScroll()
      },
      { immediate: true }
    )
    stopHandles.push(stop)
  }

  onMounted(() => {
    void restoreScroll()
  })

  onActivated(() => {
    void restoreScroll()
  })

  onDeactivated(() => {
    saveScroll()
  })

  onBeforeRouteLeave(() => {
    saveScroll()
  })

  onUnmounted(() => {
    saveScroll()
    stopHandles.forEach((stop) => stop())
  })

  return {
    filters,
    pagination,
    saveScroll,
    restoreScroll,
    bindScrollContainer,
  }
}
