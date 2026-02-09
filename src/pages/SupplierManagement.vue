<template>
  <div>
    <div class="page-title">供货商管理</div>

    <a-card class="card-section">
      <a-form layout="inline" class="filter-bar">
        <a-form-item label="供货商">
          <a-input v-model:value="filters.keyword" placeholder="名称/联系人/编号" allow-clear />
        </a-form-item>
        <a-form-item label="合作状态">
          <a-select v-model:value="filters.status" :options="statusOptions" allow-clear placeholder="全部" :get-popup-container="getPopupContainer" />
        </a-form-item>
        <a-form-item label="结算方式">
          <a-select v-model:value="filters.settle" :options="settleOptions" allow-clear placeholder="全部" :get-popup-container="getPopupContainer" />
        </a-form-item>
        <a-space>
          <a-button type="primary">查询</a-button>
          <a-button @click="resetFilters">重置</a-button>
          <a-button>新增供货商</a-button>
        </a-space>
      </a-form>
    </a-card>

    <a-card>
      <a-table :columns="columns" :data-source="filteredSuppliers" :pagination="{ pageSize: 8 }" :scroll="{ x: 1200 }">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="record.status === '合作中' ? 'green' : 'default'">{{ record.status }}</a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link">查看</a-button>
              <a-button type="link">编辑</a-button>
              <a-button type="link">停用</a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'

const suppliers = [
  { key: 's1', code: 'SUP-1001', name: '济南新大友蔬菜批发有限公司', contact: '张三', phone: '13500001111', settle: '月结', status: '合作中' },
  { key: 's2', code: 'SUP-1002', name: '济南三胖子牛羊肉有限公司', contact: '李四', phone: '13800002222', settle: '周结', status: '合作中' },
  { key: 's3', code: 'SUP-1003', name: '山东猫咪用品供应商', contact: '王五', phone: '18600003333', settle: '现结', status: '暂停' },
]

const columns = [
  { title: '供货商编号', dataIndex: 'code', key: 'code', width: 140 },
  { title: '供货商名称', dataIndex: 'name', key: 'name', width: 220 },
  { title: '联系人', dataIndex: 'contact', key: 'contact', width: 100 },
  { title: '联系电话', dataIndex: 'phone', key: 'phone', width: 140 },
  { title: '结算方式', dataIndex: 'settle', key: 'settle', width: 120 },
  { title: '合作状态', dataIndex: 'status', key: 'status', width: 120 },
  { title: '操作', key: 'action', fixed: 'right', width: 160 },
]

const filters = reactive({ keyword: '', status: '', settle: '' })

const statusOptions = [
  { label: '合作中', value: '合作中' },
  { label: '暂停', value: '暂停' },
]

const settleOptions = [
  { label: '周结', value: '周结' },
  { label: '月结', value: '月结' },
  { label: '现结', value: '现结' },
]

const filteredSuppliers = computed(() => {
  const keyword = filters.keyword.trim()
  return suppliers.filter((item) => {
    const matchKeyword = !keyword || item.name.includes(keyword) || item.contact.includes(keyword) || item.code.includes(keyword)
    const matchStatus = !filters.status || item.status === filters.status
    const matchSettle = !filters.settle || item.settle === filters.settle
    return matchKeyword && matchStatus && matchSettle
  })
})

const resetFilters = () => {
  filters.keyword = ''
  filters.status = ''
  filters.settle = ''
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
