<template>
  <div>
    <div class="page-title">财务中心</div>
    <a-row :gutter="16" class="card-section">
      <a-col :xs="24" :sm="12" :lg="8">
        <a-card>
          <a-statistic title="本月结算" value="¥428,200" />
          <a-tag color="green">已完成 78%</a-tag>
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="12" :lg="8">
        <a-card>
          <a-statistic title="待结算金额" value="¥86,400" />
          <a-tag color="orange">3 笔待处理</a-tag>
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="12" :lg="8">
        <a-card>
          <a-statistic title="退款支出" value="¥9,240" />
          <a-tag color="red">较上月 -6%</a-tag>
        </a-card>
      </a-col>
    </a-row>

    <a-card title="账单记录">
      <a-form layout="inline" class="filter-bar">
        <a-form-item label="关键词">
          <a-input v-model:value="filters.keyword" placeholder="账单号/备注" allow-clear />
        </a-form-item>
        <a-form-item label="类型">
          <a-select
            v-model:value="filters.types"
            :options="typeOptions"
            mode="multiple"
            allow-clear
            placeholder="全部"
            style="min-width: 160px"
          />
        </a-form-item>
        <a-form-item label="日期范围">
          <a-range-picker v-model:value="rangeValue" />
        </a-form-item>
        <a-button @click="resetFilters">重置</a-button>
      </a-form>
      <template v-if="isMobile">
        <a-list :data-source="pagedBills">
          <template #renderItem="{ item }">
            <a-list-item>
              <a-card class="mobile-card">
                <div class="mobile-row">
                  <span class="mobile-label">账单号</span>
                  <span>{{ item.id }}</span>
                </div>
                <div class="mobile-row">
                  <span class="mobile-label">类型</span>
                  <a-tag :color="item.type === '结算' ? 'green' : 'red'">{{ item.type }}</a-tag>
                </div>
                <div class="mobile-row">
                  <span class="mobile-label">金额</span>
                  <span>{{ item.amount }}</span>
                </div>
                <div class="mobile-row">
                  <span class="mobile-label">日期</span>
                  <span>{{ item.date }}</span>
                </div>
                <div class="mobile-row">
                  <span class="mobile-label">备注</span>
                  <span>{{ item.note }}</span>
                </div>
              </a-card>
            </a-list-item>
          </template>
        </a-list>
        <div class="mobile-pagination">
          <a-pagination
            v-model:current="pagination.current"
            :page-size="pagination.pageSize"
            :total="filteredBills.length"
            size="small"
          />
        </div>
      </template>
      <a-table
        v-else
        :columns="columns"
        :data-source="filteredBills"
        :pagination="{ pageSize: 6 }"
        :scroll="{ x: 900 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'type'">
            <a-tag :color="record.type === '结算' ? 'green' : 'red'">{{ record.type }}</a-tag>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import { useIsMobile } from '../utils/useIsMobile'
import { usePersistedFilters } from '../utils/usePersistedFilters'

const isMobile = useIsMobile()
dayjs.extend(isBetween)
const columns = [
  { title: '账单号', dataIndex: 'id', key: 'id' },
  { title: '类型', dataIndex: 'type', key: 'type' },
  { title: '金额', dataIndex: 'amount', key: 'amount' },
  { title: '日期', dataIndex: 'date', key: 'date' },
  { title: '备注', dataIndex: 'note', key: 'note' },
]

const bills = [
  {
    key: 'b1',
    id: 'B-20260201-0031',
    type: '结算',
    amount: '¥68,200',
    date: '2026-02-01',
    note: '春节大促结算',
  },
  {
    key: 'b2',
    id: 'B-20260129-0027',
    type: '结算',
    amount: '¥92,800',
    date: '2026-01-29',
    note: '月末结算',
  },
  {
    key: 'b3',
    id: 'B-20260127-0022',
    type: '退款',
    amount: '¥3,600',
    date: '2026-01-27',
    note: '售后退款',
  },
  {
    key: 'b4',
    id: 'B-20260125-0019',
    type: '结算',
    amount: '¥74,300',
    date: '2026-01-25',
    note: '周结算',
  },
  {
    key: 'b5',
    id: 'B-20260122-0013',
    type: '退款',
    amount: '¥2,120',
    date: '2026-01-22',
    note: '质量问题退款',
  },
]

const filters = usePersistedFilters('filters:finance', {
  keyword: '',
  types: [] as string[],
  dateRange: [] as string[],
})

const typeOptions = [
  { label: '结算', value: '结算' },
  { label: '退款', value: '退款' },
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
    filters.dateRange = [
      value[0].format('YYYY-MM-DD'),
      value[1].format('YYYY-MM-DD'),
    ]
  },
})

const filteredBills = computed(() => {
  const keyword = filters.keyword.trim()
  return bills.filter((item) => {
    const matchKeyword = !keyword || item.id.includes(keyword) || item.note.includes(keyword)
    const matchType = filters.types.length === 0 || filters.types.includes(item.type)
    const matchDate =
      filters.dateRange.length === 0 ||
      dayjs(item.date).isBetween(
        filters.dateRange[0],
        filters.dateRange[1],
        'day',
        '[]'
      )
    return matchKeyword && matchType && matchDate
  })
})

const pagination = usePersistedFilters('pagination:finance', { current: 1, pageSize: 4 })

const pagedBills = computed(() => {
  const start = (pagination.current - 1) * pagination.pageSize
  return filteredBills.value.slice(start, start + pagination.pageSize)
})

const resetFilters = () => {
  filters.keyword = ''
  filters.types = []
  filters.dateRange = []
  pagination.current = 1
}
</script>

<style scoped>
.filter-bar {
  margin-bottom: 16px;
  row-gap: 8px;
}

.mobile-card {
  margin-bottom: 12px;
}

.mobile-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  color: var(--text-primary);
}

.mobile-label {
  color: var(--text-secondary);
}

.mobile-pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}
</style>
