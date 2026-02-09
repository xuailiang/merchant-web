<template>
  <div>
    <div class="page-title">异常提醒</div>

    <a-row :gutter="16" class="card-section">
      <a-col :xs="24" :lg="6">
        <a-card class="stat-card">
          <div class="stat-title">待处理异常</div>
          <div class="stat-value">{{ alerts.filter((a) => a.status === '未处理').length }}</div>
          <div class="stat-meta">高风险 {{ alerts.filter((a) => a.level === '高').length }}</div>
        </a-card>
      </a-col>
      <a-col :xs="24" :lg="6">
        <a-card class="stat-card">
          <div class="stat-title">库存异常</div>
          <div class="stat-value">{{ alerts.filter((a) => a.type === '库存').length }}</div>
          <div class="stat-meta">待补货 {{ lowStockCount }}</div>
        </a-card>
      </a-col>
      <a-col :xs="24" :lg="6">
        <a-card class="stat-card">
          <div class="stat-title">发货超时</div>
          <div class="stat-value">{{ alerts.filter((a) => a.type === '发货').length }}</div>
          <div class="stat-meta">超48小时 {{ lateShipCount }}</div>
        </a-card>
      </a-col>
      <a-col :xs="24" :lg="6">
        <a-card class="stat-card">
          <div class="stat-title">售后超时</div>
          <div class="stat-value">{{ alerts.filter((a) => a.type === '售后').length }}</div>
          <div class="stat-meta">待审核 {{ pendingReview }}</div>
        </a-card>
      </a-col>
    </a-row>

    <a-card class="card-section">
      <a-form layout="inline" class="filter-bar">
        <a-form-item label="异常类型">
          <a-select v-model:value="filters.type" :options="typeOptions" allow-clear placeholder="全部" />
        </a-form-item>
        <a-form-item label="风险等级">
          <a-select v-model:value="filters.level" :options="levelOptions" allow-clear placeholder="全部" />
        </a-form-item>
        <a-form-item label="状态">
          <a-select v-model:value="filters.status" :options="statusOptions" allow-clear placeholder="全部" />
        </a-form-item>
        <a-form-item label="关键词">
          <a-input v-model:value="filters.keyword" placeholder="订单/商品/客户" allow-clear />
        </a-form-item>
        <a-space>
          <a-button type="primary">查询</a-button>
          <a-button @click="resetFilters">重置</a-button>
        </a-space>
      </a-form>

      <a-table :columns="columns" :data-source="filteredAlerts" :pagination="{ pageSize: 6 }" :scroll="{ x: 1200 }">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'level'">
            <a-tag :color="record.level === '高' ? 'red' : record.level === '中' ? 'orange' : 'blue'">{{ record.level }}</a-tag>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="record.status === '未处理' ? 'red' : 'green'">{{ record.status }}</a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link">查看</a-button>
              <a-button type="link">立即处理</a-button>
              <a-button type="link">标记已处理</a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'

type AlertItem = {
  key: string
  type: string
  level: string
  title: string
  detail: string
  status: string
  createdAt: string
}

const alerts: AlertItem[] = [
  { key: 'a1', type: '库存', level: '高', title: '库存低于阈值', detail: 'Aurora 无线耳机 库存仅剩 12', status: '未处理', createdAt: '2026-02-05 09:12' },
  { key: 'a2', type: '发货', level: '中', title: '发货超时', detail: '订单 DD2026020417142 超过48小时未发货', status: '未处理', createdAt: '2026-02-05 08:32' },
  { key: 'a3', type: '售后', level: '高', title: '售后审核超时', detail: '售后单 AS20260204001 等待审核超时', status: '未处理', createdAt: '2026-02-05 07:22' },
  { key: 'a4', type: '订单', level: '低', title: '高退款率商品', detail: '商品「猫爬架」退款率 12%', status: '已处理', createdAt: '2026-02-04 18:20' },
]

const filters = reactive({ type: '', level: '', status: '', keyword: '' })

const typeOptions = [
  { label: '库存', value: '库存' },
  { label: '发货', value: '发货' },
  { label: '售后', value: '售后' },
  { label: '订单', value: '订单' },
]

const levelOptions = [
  { label: '高', value: '高' },
  { label: '中', value: '中' },
  { label: '低', value: '低' },
]

const statusOptions = [
  { label: '未处理', value: '未处理' },
  { label: '已处理', value: '已处理' },
]

const filteredAlerts = computed(() => {
  return alerts.filter((item) => {
    const typeMatch = !filters.type || item.type === filters.type
    const levelMatch = !filters.level || item.level === filters.level
    const statusMatch = !filters.status || item.status === filters.status
    const keywordMatch = !filters.keyword || item.title.includes(filters.keyword) || item.detail.includes(filters.keyword)
    return typeMatch && levelMatch && statusMatch && keywordMatch
  })
})

const resetFilters = () => {
  filters.type = ''
  filters.level = ''
  filters.status = ''
  filters.keyword = ''
}

const lowStockCount = alerts.filter((a) => a.type === '库存' && a.status === '未处理').length
const lateShipCount = alerts.filter((a) => a.type === '发货' && a.status === '未处理').length
const pendingReview = alerts.filter((a) => a.type === '售后' && a.status === '未处理').length

const columns = [
  { title: '异常类型', dataIndex: 'type', key: 'type', width: 120 },
  { title: '风险等级', dataIndex: 'level', key: 'level', width: 120 },
  { title: '异常描述', dataIndex: 'title', key: 'title', width: 220 },
  { title: '详情', dataIndex: 'detail', key: 'detail', width: 320 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 120 },
  { title: '发生时间', dataIndex: 'createdAt', key: 'createdAt', width: 160 },
  { title: '操作', key: 'action', width: 180, fixed: 'right' },
]
</script>

<style scoped>
.card-section {
  margin-bottom: 16px;
}

.stat-card {
  background: #f8fafc;
  border: 1px solid var(--border-color);
}

.stat-title {
  color: var(--text-secondary);
  font-size: 12px;
}

.stat-value {
  font-size: 22px;
  font-weight: 700;
  margin: 6px 0 4px;
}

.stat-meta {
  color: var(--text-secondary);
  font-size: 12px;
}

.filter-bar {
  row-gap: 8px;
}
</style>
