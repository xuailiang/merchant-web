<template>
  <div>
    <div class="page-title">优惠券管理</div>
    <a-row :gutter="16" class="card-section">
      <a-col :xs="24" :sm="12" :lg="6">
        <a-card>
          <a-statistic title="有效优惠券" value="14,200" />
          <a-tag color="green">本周 +6%</a-tag>
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="12" :lg="6">
        <a-card>
          <a-statistic title="待发放" value="2,400" />
          <a-tag color="blue">明日发放</a-tag>
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="12" :lg="6">
        <a-card>
          <a-statistic title="已核销" value="6,240" />
          <a-tag color="orange">核销率 42%</a-tag>
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="12" :lg="6">
        <a-card>
          <a-statistic title="即将到期" value="680" />
          <a-tag color="red">7天内到期</a-tag>
        </a-card>
      </a-col>
    </a-row>

    <a-card class="card-section">
      <a-form layout="inline" class="filter-bar">
        <a-form-item label="券名称">
          <a-input v-model:value="filters.keyword" placeholder="请输入券名称" allow-clear />
        </a-form-item>
        <a-form-item label="券类型">
          <a-select v-model:value="filters.type" :options="typeOptions" allow-clear placeholder="请选择" />
        </a-form-item>
        <a-form-item label="状态">
          <a-select v-model:value="filters.status" :options="statusOptions" allow-clear placeholder="请选择" />
        </a-form-item>
        <a-space>
          <a-button type="primary">查询</a-button>
          <a-button @click="resetFilters">重置</a-button>
          <a-button type="primary" ghost @click="goCreate">创建优惠券</a-button>
        </a-space>
      </a-form>
    </a-card>

    <a-card>
      <a-table :columns="columns" :data-source="filteredCoupons" :pagination="{ pageSize: 6 }">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="record.status === '发放中' ? 'green' : 'default'">{{ record.status }}</a-tag>
          </template>
          <template v-else-if="column.key === 'usage'">
            <div class="product-meta">已领取：{{ record.claimed }}</div>
            <div class="product-meta">已核销：{{ record.used }}</div>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link">详情</a-button>
              <a-button type="link">发放</a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useRouter } from 'vue-router'

const columns = [
  { title: '券名称', dataIndex: 'name', key: 'name' },
  { title: '类型', dataIndex: 'type', key: 'type' },
  { title: '面额', dataIndex: 'value', key: 'value' },
  { title: '发放量', dataIndex: 'count', key: 'count' },
  { title: '使用情况', key: 'usage' },
  { title: '状态', dataIndex: 'status', key: 'status' },
  { title: '操作', key: 'action' },
]

const coupons = [
  { key: 'c1', name: '新人券', type: '满减券', value: '¥30', count: '3,600 张', status: '发放中', claimed: '2,800', used: '1,240' },
  { key: 'c2', name: '满 500 减 50', type: '满减券', value: '¥50', count: '8,200 张', status: '发放中', claimed: '6,200', used: '3,880' },
  { key: 'c3', name: '满 200 减 20', type: '满减券', value: '¥20', count: '12,400 张', status: '已结束', claimed: '12,200', used: '6,240' },
  { key: 'c4', name: '会员专享券', type: '折扣券', value: '9折', count: '2,400 张', status: '待发放', claimed: '0', used: '0' },
]

const filters = reactive({ keyword: '', type: '', status: '' })
const typeOptions = [
  { label: '满减券', value: '满减券' },
  { label: '折扣券', value: '折扣券' },
]
const statusOptions = [
  { label: '发放中', value: '发放中' },
  { label: '待发放', value: '待发放' },
  { label: '已结束', value: '已结束' },
]

const filteredCoupons = computed(() => {
  return coupons.filter((item) => {
    const matchKeyword = !filters.keyword || item.name.includes(filters.keyword)
    const matchType = !filters.type || item.type === filters.type
    const matchStatus = !filters.status || item.status === filters.status
    return matchKeyword && matchType && matchStatus
  })
})

const resetFilters = () => {
  filters.keyword = ''
  filters.type = ''
  filters.status = ''
}

const router = useRouter()
const goCreate = () => {
  router.push('/marketing/coupons/create')
}
</script>

<style scoped>
.filter-bar {
  row-gap: 8px;
}
</style>
