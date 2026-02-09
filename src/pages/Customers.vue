<template>
  <div>
    <div class="page-title">客户管理</div>
    <a-card>
      <a-form layout="inline" class="filter-bar">
        <a-form-item label="关键词">
          <a-input v-model:value="filters.keyword" placeholder="客户/商品" allow-clear />
        </a-form-item>
        <a-form-item label="等级">
          <a-select
            v-model:value="filters.levels"
            :options="levelOptions"
            mode="multiple"
            allow-clear
            placeholder="全部"
            style="min-width: 160px"
          />
        </a-form-item>
        <a-form-item label="最近购买">
          <a-range-picker v-model:value="rangeValue" />
        </a-form-item>
        <a-button @click="resetFilters">重置</a-button>
      </a-form>
      <template v-if="isMobile">
        <a-list :data-source="pagedCustomers" item-layout="vertical">
          <template #renderItem="{ item }">
            <a-list-item>
              <a-card class="mobile-card">
                <div class="mobile-row">
                  <span class="mobile-label">客户</span>
                  <span>{{ item.name }}</span>
                </div>
                <div class="mobile-row">
                  <span class="mobile-label">会员等级</span>
                  <a-tag :color="item.level === 'VIP' ? 'gold' : 'blue'">{{ item.level }}</a-tag>
                </div>
                <div class="mobile-row">
                  <span class="mobile-label">最近购买</span>
                  <span>{{ item.recent }}</span>
                </div>
                <div class="mobile-row">
                  <span class="mobile-label">累计消费</span>
                  <span>{{ item.spend }}</span>
                </div>
                <div class="mobile-actions">
                  <RouterLink :to="`/customers/${item.key}`">详情</RouterLink>
                  <a-button type="link">关怀</a-button>
                </div>
              </a-card>
            </a-list-item>
          </template>
        </a-list>
        <div class="mobile-pagination">
          <a-pagination
            v-model:current="pagination.current"
            :page-size="pagination.pageSize"
            :total="filteredCustomers.length"
            size="small"
          />
        </div>
      </template>
      <a-table
        v-else
        :columns="columns"
        :data-source="filteredCustomers"
        :pagination="{ pageSize: 6 }"
        :scroll="{ x: 800 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'level'">
            <a-tag :color="record.level === 'VIP' ? 'gold' : 'blue'">{{ record.level }}</a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <RouterLink :to="`/customers/${record.key}`">详情</RouterLink>
              <a-button type="link">关怀</a-button>
            </a-space>
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
import { RouterLink } from 'vue-router'
import { useIsMobile } from '../utils/useIsMobile'
import { usePersistedFilters } from '../utils/usePersistedFilters'

const isMobile = useIsMobile()
dayjs.extend(isBetween)
const columns = [
  { title: '客户', dataIndex: 'name', key: 'name' },
  { title: '会员等级', dataIndex: 'level', key: 'level' },
  { title: '最近购买', dataIndex: 'recent', key: 'recent' },
  { title: '累计消费', dataIndex: 'spend', key: 'spend' },
  { title: '操作', key: 'action' },
]

const customers = [
  {
    key: 'c1',
    name: '周女士',
    level: 'VIP',
    recent: '星曜Pro 智能手机 256G',
    spend: '¥18,600',
    recentDate: '2026-02-03',
  },
  {
    key: 'c2',
    name: '宋先生',
    level: '普通',
    recent: 'Aurora 无线降噪耳机',
    spend: '¥6,980',
    recentDate: '2026-02-01',
  },
  {
    key: 'c3',
    name: '林女士',
    level: 'VIP',
    recent: 'Lume 智能手表 S3',
    spend: '¥12,400',
    recentDate: '2026-01-28',
  },
  {
    key: 'c4',
    name: '许先生',
    level: '普通',
    recent: 'Pulse 便携音箱',
    spend: '¥3,260',
    recentDate: '2026-01-26',
  },
  {
    key: 'c5',
    name: '赵女士',
    level: '普通',
    recent: 'Nebula 游戏键盘 RGB',
    spend: '¥4,980',
    recentDate: '2026-01-22',
  },
]

const filters = usePersistedFilters('filters:customers', {
  keyword: '',
  levels: [] as string[],
  dateRange: [] as string[],
})

const levelOptions = [
  { label: 'VIP', value: 'VIP' },
  { label: '普通', value: '普通' },
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

const filteredCustomers = computed(() => {
  const keyword = filters.keyword.trim()
  return customers.filter((item) => {
    const matchKeyword =
      !keyword || item.name.includes(keyword) || item.recent.includes(keyword)
    const matchLevel =
      filters.levels.length === 0 || filters.levels.includes(item.level)
    const matchDate =
      filters.dateRange.length === 0 ||
      dayjs(item.recentDate).isBetween(
        filters.dateRange[0],
        filters.dateRange[1],
        'day',
        '[]'
      )
    return matchKeyword && matchLevel && matchDate
  })
})

const pagination = usePersistedFilters('pagination:customers', { current: 1, pageSize: 4 })

const pagedCustomers = computed(() => {
  const start = (pagination.current - 1) * pagination.pageSize
  return filteredCustomers.value.slice(start, start + pagination.pageSize)
})

const resetFilters = () => {
  filters.keyword = ''
  filters.levels = []
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

.mobile-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.mobile-pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}
</style>
