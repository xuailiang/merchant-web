<template>
  <div>
    <div class="page-title">操作日志</div>

    <a-card class="card-section">
      <a-form layout="inline" class="filter-bar">
        <a-form-item label="操作人">
          <a-input v-model:value="filters.operator" placeholder="输入姓名/账号" allow-clear />
        </a-form-item>
        <a-form-item label="模块">
          <a-select v-model:value="filters.module" :options="moduleOptions" allow-clear placeholder="全部" />
        </a-form-item>
        <a-form-item label="操作类型">
          <a-select v-model:value="filters.action" :options="actionOptions" allow-clear placeholder="全部" />
        </a-form-item>
        <a-form-item label="时间范围">
          <a-range-picker v-model:value="filters.range" />
        </a-form-item>
        <a-space>
          <a-button type="primary">查询</a-button>
          <a-button @click="resetFilters">重置</a-button>
          <a-button type="dashed">导出</a-button>
        </a-space>
      </a-form>

      <a-table :columns="columns" :data-source="filteredLogs" :pagination="{ pageSize: 8 }" :scroll="{ x: 1200 }">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="record.status === '成功' ? 'green' : 'red'">{{ record.status }}</a-tag>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'

const logs = [
  {
    key: 'l1',
    operator: '运营人员',
    module: '商品管理',
    action: '编辑商品',
    detail: '修改商品价格，将售价从25元调整为28元',
    ip: '192.168.1.100',
    time: '2026-02-05 14:30:22',
    status: '成功',
  },
  {
    key: 'l2',
    operator: '系统自动',
    module: '库存管理',
    action: '库存更新',
    detail: '红色/200/大规格库存从99变为100',
    ip: '127.0.0.1',
    time: '2026-02-05 09:12:14',
    status: '成功',
  },
  {
    key: 'l3',
    operator: '管理员',
    module: '订单管理',
    action: '发货',
    detail: '订单 DD2026020417142 发货成功',
    ip: '192.168.1.101',
    time: '2026-02-04 18:02:03',
    status: '成功',
  },
]

const filters = reactive({
  operator: '',
  module: '',
  action: '',
  range: [] as any[],
})

const moduleOptions = [
  { label: '商品管理', value: '商品管理' },
  { label: '订单管理', value: '订单管理' },
  { label: '库存管理', value: '库存管理' },
  { label: '营销中心', value: '营销中心' },
]

const actionOptions = [
  { label: '编辑商品', value: '编辑商品' },
  { label: '发货', value: '发货' },
  { label: '库存更新', value: '库存更新' },
]

const filteredLogs = computed(() => {
  return logs.filter((item) => {
    const operatorMatch = !filters.operator || item.operator.includes(filters.operator)
    const moduleMatch = !filters.module || item.module === filters.module
    const actionMatch = !filters.action || item.action === filters.action
    return operatorMatch && moduleMatch && actionMatch
  })
})

const resetFilters = () => {
  filters.operator = ''
  filters.module = ''
  filters.action = ''
  filters.range = []
}

const columns = [
  { title: '操作人', dataIndex: 'operator', key: 'operator', width: 140 },
  { title: '模块', dataIndex: 'module', key: 'module', width: 140 },
  { title: '操作类型', dataIndex: 'action', key: 'action', width: 140 },
  { title: '操作内容', dataIndex: 'detail', key: 'detail', width: 360 },
  { title: 'IP地址', dataIndex: 'ip', key: 'ip', width: 140 },
  { title: '操作时间', dataIndex: 'time', key: 'time', width: 180 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 120 },
]
</script>

<style scoped>
.card-section {
  margin-bottom: 16px;
}

.filter-bar {
  row-gap: 8px;
  margin-bottom: 12px;
}
</style>
