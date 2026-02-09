<template>
  <div>
    <div class="page-title">待办任务</div>

    <a-row :gutter="16" class="card-section">
      <a-col :xs="24" :lg="6">
        <a-card class="stat-card">
          <div class="stat-title">待办总数</div>
          <div class="stat-value">{{ tasks.length }}</div>
          <div class="stat-meta">紧急 {{ urgentCount }}</div>
        </a-card>
      </a-col>
      <a-col :xs="24" :lg="6">
        <a-card class="stat-card">
          <div class="stat-title">今日到期</div>
          <div class="stat-value">{{ dueToday }}</div>
          <div class="stat-meta">超时 {{ overdueCount }}</div>
        </a-card>
      </a-col>
      <a-col :xs="24" :lg="6">
        <a-card class="stat-card">
          <div class="stat-title">分配给我</div>
          <div class="stat-value">{{ tasks.filter((t) => t.owner === '我').length }}</div>
          <div class="stat-meta">今日新增 {{ newToday }}</div>
        </a-card>
      </a-col>
      <a-col :xs="24" :lg="6">
        <a-card class="stat-card">
          <div class="stat-title">已完成</div>
          <div class="stat-value">{{ tasks.filter((t) => t.status === '已完成').length }}</div>
          <div class="stat-meta">完成率 {{ completionRate }}%</div>
        </a-card>
      </a-col>
    </a-row>

    <a-card class="card-section">
      <a-form layout="inline" class="filter-bar">
        <a-form-item label="任务类型">
          <a-select v-model:value="filters.type" :options="typeOptions" allow-clear placeholder="全部" />
        </a-form-item>
        <a-form-item label="优先级">
          <a-select v-model:value="filters.priority" :options="priorityOptions" allow-clear placeholder="全部" />
        </a-form-item>
        <a-form-item label="状态">
          <a-select v-model:value="filters.status" :options="statusOptions" allow-clear placeholder="全部" />
        </a-form-item>
        <a-form-item label="关键词">
          <a-input v-model:value="filters.keyword" placeholder="任务/订单/商品" allow-clear />
        </a-form-item>
        <a-space>
          <a-button type="primary">查询</a-button>
          <a-button @click="resetFilters">重置</a-button>
        </a-space>
      </a-form>

      <a-table :columns="columns" :data-source="filteredTasks" :pagination="{ pageSize: 6 }" :scroll="{ x: 1200 }">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'priority'">
            <a-tag :color="record.priority === '紧急' ? 'red' : record.priority === '高' ? 'orange' : 'blue'">{{ record.priority }}</a-tag>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="record.status === '待处理' ? 'red' : record.status === '处理中' ? 'orange' : 'green'">{{ record.status }}</a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link">处理</a-button>
              <a-button type="link">转交</a-button>
              <a-button type="link">完成</a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'

type TaskItem = {
  key: string
  type: string
  title: string
  priority: string
  status: string
  owner: string
  deadline: string
}

const tasks: TaskItem[] = [
  { key: 't1', type: '订单', title: '订单 DD2026020417142 待发货', priority: '紧急', status: '待处理', owner: '我', deadline: '今日 16:00' },
  { key: 't2', type: '售后', title: '售后单 AS20260204001 待审核', priority: '高', status: '处理中', owner: '我', deadline: '今日 18:00' },
  { key: 't3', type: '库存', title: '补货单 SPU000905 待确认', priority: '中', status: '待处理', owner: '运营专员', deadline: '明日 12:00' },
  { key: 't4', type: '营销', title: '活动页素材审核', priority: '低', status: '已完成', owner: '设计师', deadline: '昨日' },
]

const filters = reactive({ type: '', priority: '', status: '', keyword: '' })

const typeOptions = [
  { label: '订单', value: '订单' },
  { label: '售后', value: '售后' },
  { label: '库存', value: '库存' },
  { label: '营销', value: '营销' },
]

const priorityOptions = [
  { label: '紧急', value: '紧急' },
  { label: '高', value: '高' },
  { label: '中', value: '中' },
  { label: '低', value: '低' },
]

const statusOptions = [
  { label: '待处理', value: '待处理' },
  { label: '处理中', value: '处理中' },
  { label: '已完成', value: '已完成' },
]

const filteredTasks = computed(() => {
  return tasks.filter((item) => {
    const typeMatch = !filters.type || item.type === filters.type
    const priorityMatch = !filters.priority || item.priority === filters.priority
    const statusMatch = !filters.status || item.status === filters.status
    const keywordMatch = !filters.keyword || item.title.includes(filters.keyword)
    return typeMatch && priorityMatch && statusMatch && keywordMatch
  })
})

const resetFilters = () => {
  filters.type = ''
  filters.priority = ''
  filters.status = ''
  filters.keyword = ''
}

const urgentCount = tasks.filter((t) => t.priority === '紧急').length
const dueToday = tasks.filter((t) => t.deadline.includes('今日')).length
const overdueCount = 1
const newToday = 2
const completionRate = Math.round((tasks.filter((t) => t.status === '已完成').length / tasks.length) * 100)

const columns = [
  { title: '任务类型', dataIndex: 'type', key: 'type', width: 120 },
  { title: '任务标题', dataIndex: 'title', key: 'title', width: 320 },
  { title: '优先级', dataIndex: 'priority', key: 'priority', width: 120 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 120 },
  { title: '负责人', dataIndex: 'owner', key: 'owner', width: 120 },
  { title: '截止时间', dataIndex: 'deadline', key: 'deadline', width: 160 },
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
