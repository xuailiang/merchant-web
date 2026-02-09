<template>
  <div>
    <div class="page-title">下载中心</div>

    <TableWrapper>
      <template #filters>
        <a-form layout="inline" class="filter-bar">
          <a-form-item label="模块">
            <a-select v-model:value="filters.module" :options="moduleOptions" allow-clear placeholder="全部" style="min-width: 140px" />
          </a-form-item>
          <a-form-item label="状态">
            <a-select v-model:value="filters.status" :options="statusOptions" allow-clear placeholder="全部" style="min-width: 140px" />
          </a-form-item>
          <a-form-item label="关键词">
            <a-input v-model:value="filters.keyword" placeholder="任务名称/ID" allow-clear />
          </a-form-item>
          <a-space>
            <a-button type="primary">查询</a-button>
            <a-button @click="resetFilters">重置</a-button>
          </a-space>
        </a-form>
      </template>

      <a-table
        :columns="columns"
        :data-source="filteredTasks"
        :pagination="{ pageSize: 8 }"
        :row-class-name="rowClassName"
        row-key="id"
        :custom-row="(record) => ({ 'data-export-id': record.id })"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="statusColor(record.status)">{{ statusLabel(record.status) }}</a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button v-if="record.status === 'done'" type="link" @click="download(record)">下载</a-button>
              <a-button v-if="record.status === 'expired'" type="link" @click="regenerate(record)">重新生成</a-button>
              <a-button v-if="record.status === 'failed'" type="link" @click="regenerate(record)">重新生成</a-button>
              <a-button type="link" danger @click="remove(record)">删除</a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </TableWrapper>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import TableWrapper from '../components/TableWrapper.vue'
import { getExportTasks, normalizeExportStatus, removeExportTask, createExportTask, type ExportTask } from '../utils/exports'
import { message } from 'ant-design-vue'

const router = useRouter()
const route = useRoute()
const highlightId = ref<string | null>(null)

const tasks = ref<ExportTask[]>([])

const loadTasks = () => {
  tasks.value = getExportTasks().map((task) => normalizeExportStatus(task))
}

onMounted(() => {
  loadTasks()
  if (route.query.highlight) {
    highlightId.value = String(route.query.highlight)
    nextTick(() => focusRow())
  }
  window.addEventListener('exports-update', loadTasks)
})

watch(
  () => route.query.highlight,
  (val) => {
    highlightId.value = val ? String(val) : null
    nextTick(() => focusRow())
  }
)

const focusRow = () => {
  if (!highlightId.value) return
  const el = document.querySelector(`[data-export-id="${highlightId.value}"]`)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

const columns = [
  { title: '任务名称', dataIndex: 'title', key: 'title', width: 220 },
  { title: '任务ID', dataIndex: 'id', key: 'id', width: 180 },
  { title: '模块', dataIndex: 'module', key: 'module', width: 120 },
  { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 160 },
  { title: '更新时间', dataIndex: 'updatedAt', key: 'updatedAt', width: 160 },
  { title: '过期时间', dataIndex: 'expireAt', key: 'expireAt', width: 160 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 120 },
  { title: '操作', key: 'action', fixed: 'right', width: 160 },
]

const moduleOptions = [
  { label: '订单', value: 'orders' },
  { label: '商品', value: 'products' },
  { label: '售后', value: 'after-sales' },
  { label: '结算', value: 'settlements' },
]

const statusOptions = [
  { label: '排队中', value: 'queued' },
  { label: '生成中', value: 'processing' },
  { label: '已完成', value: 'done' },
  { label: '失败', value: 'failed' },
  { label: '已过期', value: 'expired' },
]

const filters = ref({
  module: '',
  status: '',
  keyword: '',
})

const filteredTasks = computed(() => {
  return tasks.value.filter((task) => {
    const matchModule = !filters.value.module || task.module === filters.value.module
    const matchStatus = !filters.value.status || task.status === filters.value.status
    const matchKeyword =
      !filters.value.keyword || task.title.includes(filters.value.keyword) || task.id.includes(filters.value.keyword)
    return matchModule && matchStatus && matchKeyword
  })
})

const statusColor = (status: ExportTask['status']) => {
  if (status === 'done') return 'green'
  if (status === 'processing') return 'blue'
  if (status === 'queued') return 'orange'
  if (status === 'failed') return 'red'
  if (status === 'expired') return 'default'
  return 'default'
}

const statusLabel = (status: ExportTask['status']) => {
  if (status === 'queued') return '排队中'
  if (status === 'processing') return '生成中'
  if (status === 'done') return '已完成'
  if (status === 'failed') return '失败'
  if (status === 'expired') return '已过期'
  return status
}

const rowClassName = (record: ExportTask) => {
  return record.id === highlightId.value ? 'export-highlight' : ''
}

const download = (record: ExportTask) => {
  if (!record.fileUrl) {
    message.warning('下载链接无效')
    return
  }
  window.open(record.fileUrl, '_blank')
}

const regenerate = (record: ExportTask) => {
  createExportTask({
    module: record.module,
    title: record.title,
    params: record.params,
    fields: record.fields,
  })
  loadTasks()
  message.success('已重新加入导出队列')
}

const remove = (record: ExportTask) => {
  removeExportTask(record.id)
  loadTasks()
  if (record.id === highlightId.value) {
    highlightId.value = null
    router.replace('/exports')
  }
  message.success('已删除记录')
}

const resetFilters = () => {
  filters.value.module = ''
  filters.value.status = ''
  filters.value.keyword = ''
}
</script>

<style scoped>
.filter-bar {
  row-gap: 8px;
}

.export-highlight {
  background: rgba(59, 130, 246, 0.12) !important;
}
</style>
