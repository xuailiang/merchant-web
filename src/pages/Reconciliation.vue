<template>
  <div>
    <div class="page-title">对账单</div>

    <a-card class="card-section">
      <a-form layout="inline" class="filter-bar">
        <a-form-item label="对账单号">
          <a-input v-model:value="filters.keyword" placeholder="对账单/供货商" allow-clear />
        </a-form-item>
        <a-form-item label="状态">
          <a-select v-model:value="filters.status" :options="statusOptions" allow-clear placeholder="全部" :get-popup-container="getPopupContainer" />
        </a-form-item>
        <a-form-item label="对账日期">
          <a-range-picker v-model:value="rangeValue" :get-popup-container="getPopupContainer" />
        </a-form-item>
        <a-space>
          <a-button type="primary">查询</a-button>
          <a-button @click="resetFilters">重置</a-button>
          <a-button>生成对账单</a-button>
        </a-space>
      </a-form>
    </a-card>

    <a-card>
      <a-table :columns="columns" :data-source="filteredRows" :pagination="{ pageSize: 8 }" :scroll="{ x: 1200 }">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="record.status === '已确认' ? 'green' : 'orange'">{{ record.status }}</a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link">查看明细</a-button>
              <a-button type="link">确认</a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'

dayjs.extend(isBetween)

const rows = [
  { key: 'r1', id: 'RC-202602-001', supplier: '济南新大友蔬菜批发有限公司', amount: '¥12,400', status: '已确认', date: '2026-02-03' },
  { key: 'r2', id: 'RC-202602-002', supplier: '济南三胖子牛羊肉有限公司', amount: '¥8,200', status: '待确认', date: '2026-02-04' },
]

const columns = [
  { title: '对账单号', dataIndex: 'id', key: 'id', width: 160 },
  { title: '供货商', dataIndex: 'supplier', key: 'supplier', width: 220 },
  { title: '对账金额', dataIndex: 'amount', key: 'amount', width: 120 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 120 },
  { title: '对账日期', dataIndex: 'date', key: 'date', width: 140 },
  { title: '操作', key: 'action', fixed: 'right', width: 160 },
]

const filters = reactive({ keyword: '', status: '', dateRange: [] as string[] })

const statusOptions = [
  { label: '已确认', value: '已确认' },
  { label: '待确认', value: '待确认' },
]

const rangeValue = computed({
  get: () => {
    if (filters.dateRange.length === 2) {
      return [dayjs(filters.dateRange[0]), dayjs(filters.dateRange[1])]
    }
    return null
  },
  set: (value) => {
    if (!value || value.length !== 2) {
      filters.dateRange = []
      return
    }
    filters.dateRange = [value[0].format('YYYY-MM-DD'), value[1].format('YYYY-MM-DD')]
  },
})

const filteredRows = computed(() => {
  const keyword = filters.keyword.trim()
  return rows.filter((item) => {
    const matchKeyword = !keyword || item.id.includes(keyword) || item.supplier.includes(keyword)
    const matchStatus = !filters.status || item.status === filters.status
    const matchDate =
      filters.dateRange.length === 0 ||
      dayjs(item.date).isBetween(filters.dateRange[0], filters.dateRange[1], 'day', '[]')
    return matchKeyword && matchStatus && matchDate
  })
})

const resetFilters = () => {
  filters.keyword = ''
  filters.status = ''
  filters.dateRange = []
}

const getPopupContainer = (trigger: HTMLElement) => trigger?.parentNode || document.body
</script>

<style scoped>
.card-section {
  margin-bottom: 16px;
}

.filter-bar {
  row-gap: 8px;
}
</style>
