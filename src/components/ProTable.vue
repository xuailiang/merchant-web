<template>
  <TableWrapper :title="title" :subtitle="subtitle">
    <template #header-extra v-if="$slots['header-extra']">
      <slot name="header-extra" />
    </template>
    
    <template #filters v-if="$slots.filters">
      <slot name="filters" :query="query" :reload="reload" :reset="reset" />
    </template>

    <template #actions v-if="$slots.actions || showColumnSetting">
      <div class="pro-table-actions" style="display: flex; justify-content: space-between; width: 100%; gap: 16px;">
        <div class="actions-left">
          <slot name="actions" />
        </div>
        <div class="actions-right" style="display: flex; gap: 8px;">
          <slot name="actions-right" />
          <ColumnSetting 
            v-if="showColumnSetting" 
            :columns="columns" 
            v-model="visibleKeys" 
            @reset="resetColumns" 
          />
        </div>
      </div>
    </template>

    <template #default>
      <slot name="mobile" :data="currentDataSource" :pagination="currentPagination" v-if="isMobile" />
      <a-table
        v-else
        :columns="displayColumns"
        :data-source="currentDataSource"
        :pagination="currentPagination"
        :loading="loading"
        :row-key="rowKey"
        @change="handleTableChange"
        v-bind="$attrs"
      >
        <template v-for="(_, name) in $slots" #[name]="slotProps">
          <slot :name="name" v-bind="slotProps || {}" />
        </template>
      </a-table>
    </template>
    
    <template #footer v-if="$slots.footer">
      <slot name="footer" />
    </template>
  </TableWrapper>
</template>

<script setup lang="ts" generic="T extends object">
import { ref, computed, watch, onMounted } from 'vue'
import TableWrapper from './TableWrapper.vue'
import ColumnSetting from './ColumnSetting.vue'
import { useIsMobile } from '../utils/useIsMobile'

const props = withDefaults(defineProps<{
  title?: string
  subtitle?: string
  columns: any[]
  dataSource?: T[]
  request?: (params: any) => Promise<{ list: T[]; total: number }>
  rowKey?: string | ((record: T) => string)
  showColumnSetting?: boolean
  defaultQuery?: Record<string, any>
  pageSize?: number
  pagination?: any | false
}>(), {
  rowKey: 'id',
  showColumnSetting: true,
  defaultQuery: () => ({}),
  pageSize: 10,
  dataSource: undefined
})

const emit = defineEmits<{
  (e: 'update:query', value: any): void
  (e: 'load', data: T[]): void
  (e: 'change', pag: any, filters: any, sorter: any): void
}>()

const isMobile = useIsMobile()
const loading = ref(false)
const innerDataSource = ref<T[]>([])
const query = ref({ ...props.defaultQuery })

const innerPagination = ref({
  current: 1,
  pageSize: props.pageSize,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => `共 ${total} 条`
})

const currentDataSource = computed(() => {
  return props.dataSource !== undefined ? props.dataSource : innerDataSource.value as T[]
})

const currentPagination = computed(() => {
  if (props.pagination === false) return false
  if (props.pagination) return props.pagination
  return props.dataSource ? false : innerPagination.value
})

const reload = async (resetPage = false) => {
  if (!props.request) return
  if (resetPage) {
    innerPagination.value.current = 1
  }
  loading.value = true
  try {
    const res = await props.request({
      ...query.value,
      page: innerPagination.value.current,
      pageSize: innerPagination.value.pageSize
    })
    innerDataSource.value = res.list
    innerPagination.value.total = res.total
    emit('load', res.list)
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const reset = () => {
  query.value = { ...props.defaultQuery }
  reload(true)
}

const handleTableChange = (pag: any, filters: any, sorter: any) => {
  if (!props.dataSource) {
    innerPagination.value.current = pag.current
    innerPagination.value.pageSize = pag.pageSize
    reload()
  }
  emit('change', pag, filters, sorter)
}

const visibleKeys = ref<string[]>([])
const defaultKeys = props.columns.map(c => c.key || c.dataIndex).filter(Boolean)

watch(() => props.columns, (cols) => {
  if (visibleKeys.value.length === 0 && cols) {
    visibleKeys.value = cols.map((c: any) => c.key || c.dataIndex).filter(Boolean)
  }
}, { immediate: true })

const resetColumns = () => {
  visibleKeys.value = [...defaultKeys]
}

const displayColumns = computed(() => {
  return props.columns.filter(col => {
    const key = col.key || col.dataIndex
    if (!key) return true // always show if no key
    return visibleKeys.value.includes(key)
  })
})

defineExpose({
  reload,
  reset,
  query
})

onMounted(() => {
  if (props.request) {
    reload()
  }
})
</script>
