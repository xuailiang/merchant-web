<template>
  <div>
    <div class="page-title">结算单</div>
    <a-card class="card-section">
      <a-form layout="inline" class="filter-bar">
        <a-form-item label="结算日期">
          <a-range-picker v-model:value="dateRange" :get-popup-container="getPopupContainer" />
        </a-form-item>
        <a-space>
          <a-button type="primary">查询</a-button>
          <a-button @click="resetFilters">重置</a-button>
        </a-space>
      </a-form>
    </a-card>

    <a-card>
      <a-table :columns="columns" :data-source="rows" :pagination="{ pageSize: 10 }" :scroll="{ x: 1200 }">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <a-space>
              <RouterLink :to="`/finance/settlements/${record.id}`">查看结算明细</RouterLink>
            </a-space>
          </template>
          <template v-else-if="column.key === 'attachments'">
            <a-space>
              <a-button type="link">622762d0...</a-button>
              <a-button type="link">6af5488b...</a-button>
              <a-button type="link">小程序增加...</a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import dayjs from 'dayjs'

const rows = [
  {
    key: 's1',
    id: 'SETTLE-20251020-01',
    settleDate: '2025-10-20',
    period: '20251020-20251026',
    payable: 109,
    adjust: 0,
    actual: 109,
  },
  {
    key: 's2',
    id: 'SETTLE-20251020-02',
    settleDate: '2025-10-20',
    period: '20251020-20251026',
    payable: 241,
    adjust: 0,
    actual: 241,
  },
]

const columns = [
  { title: '结算日', dataIndex: 'settleDate', key: 'settleDate', width: 120 },
  { title: '结算周期', dataIndex: 'period', key: 'period', width: 180 },
  { title: '应付款金额（元）', dataIndex: 'payable', key: 'payable', width: 140 },
  { title: '调账金额（元）', dataIndex: 'adjust', key: 'adjust', width: 140 },
  { title: '实际结算金额（元）', dataIndex: 'actual', key: 'actual', width: 160 },
  { title: '操作', key: 'action', width: 160 },
  { title: '调账单附件', key: 'attachments', width: 220 },
]

const filters = ref({ dateRange: [] as string[] })

const dateRange = computed({
  get: () => {
    if (filters.value.dateRange.length === 2) {
      return [dayjs(filters.value.dateRange[0]), dayjs(filters.value.dateRange[1])]
    }
    return null
  },
  set: (value) => {
    if (!value || value.length !== 2) {
      filters.value.dateRange = []
      return
    }
    filters.value.dateRange = [value[0].format('YYYY-MM-DD'), value[1].format('YYYY-MM-DD')]
  },
})

const resetFilters = () => {
  filters.value.dateRange = []
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
