<template>
  <div>
    <div class="page-title">商品审核</div>

    <TableWrapper>
      <template #filters>
        <a-form layout="inline" class="filter-bar">
          <a-form-item label="关键词">
            <a-input v-model:value="filters.keyword" placeholder="商品名称/编码/提交人" allow-clear />
          </a-form-item>
          <a-form-item label="审核状态">
            <a-select v-model:value="filters.status" :options="statusOptions" allow-clear placeholder="全部" style="min-width: 140px" />
          </a-form-item>
          <a-form-item label="类目">
            <a-select v-model:value="filters.category" :options="categoryOptions" allow-clear placeholder="全部" style="min-width: 160px" />
          </a-form-item>
          <a-form-item label="提交时间">
            <a-range-picker v-model:value="rangeValue" />
          </a-form-item>
          <a-space>
            <a-button type="primary">查询</a-button>
            <a-button @click="resetFilters">重置</a-button>
          </a-space>
        </a-form>
      </template>

      <a-table :columns="columns" :data-source="filteredList" :pagination="{ pageSize: 8 }" :scroll="{ x: 1200 }">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'product'">
            <div class="product-cell">
              <img :src="record.image" alt="商品" />
              <div>
                <div class="product-title">{{ record.name }}</div>
                <div class="product-meta">商品编码：{{ record.code }}</div>
                <div class="product-meta">类目：{{ record.category }}</div>
              </div>
            </div>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="statusMap[record.status]?.color ?? 'default'">{{ record.status }}</a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link">查看</a-button>
              <a-button v-if="record.status === '待审核' && hasPermission('products:review')" type="link" @click="approve(record)">通过</a-button>
              <a-button v-if="record.status === '待审核' && hasPermission('products:review')" type="link" danger @click="reject(record)">驳回</a-button>
              <a-button v-if="record.status === '待审核' && hasPermission('products:review')" type="link" @click="backToEdit(record)">退回修改</a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </TableWrapper>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import dayjs from 'dayjs'
import TableWrapper from '../components/TableWrapper.vue'
import { hasPermission } from '../utils/permissions'
import { message } from 'ant-design-vue'

const columns = [
  { title: '商品信息', key: 'product', width: 320 },
  { title: '提交人', dataIndex: 'submitter', key: 'submitter', width: 140 },
  { title: '店铺', dataIndex: 'shop', key: 'shop', width: 140 },
  { title: '提交时间', dataIndex: 'submitAt', key: 'submitAt', width: 160 },
  { title: '审核状态', dataIndex: 'status', key: 'status', width: 120 },
  { title: '审核意见', dataIndex: 'remark', key: 'remark', width: 220 },
  { title: '操作', key: 'action', fixed: 'right', width: 200 },
]

const list = ref([
  {
    key: 'r1',
    name: '星曜Pro 智能手机 256G',
    code: '10242601000224',
    category: '数码/手机',
    image: 'https://picsum.photos/id/1062/80/80',
    submitter: '王婧',
    shop: '星辰旗舰店',
    submitAt: '2026-02-03 10:12',
    status: '待审核',
    remark: '-',
  },
  {
    key: 'r2',
    name: 'Aurora 无线降噪耳机',
    code: '10382601000223',
    category: '数码/耳机',
    image: 'https://picsum.photos/id/180/80/80',
    submitter: '运营专员',
    shop: 'Aurora官方店',
    submitAt: '2026-02-02 16:32',
    status: '已通过',
    remark: '信息完整',
  },
  {
    key: 'r3',
    name: 'Nebula 游戏键盘 RGB',
    code: '11012601000201',
    category: '数码/外设',
    image: 'https://picsum.photos/id/1040/80/80',
    submitter: '林娜',
    shop: 'Nebula外设店',
    submitAt: '2026-02-01 09:20',
    status: '已拒绝',
    remark: '缺少资质文件',
  },
  {
    key: 'r4',
    name: 'Mira 平板电脑 11 英寸',
    code: '11452601000287',
    category: '数码/平板',
    image: 'https://picsum.photos/id/1011/80/80',
    submitter: '赵清',
    shop: 'Mira数码店',
    submitAt: '2026-02-01 11:08',
    status: '需修改',
    remark: '图片需补充细节',
  },
])

const statusMap: Record<string, { color: string }> = {
  待审核: { color: 'orange' },
  已通过: { color: 'green' },
  已拒绝: { color: 'red' },
  需修改: { color: 'gold' },
}

const filters = ref({
  keyword: '',
  status: '',
  category: '',
  dateRange: [] as string[],
})

const statusOptions = [
  { label: '待审核', value: '待审核' },
  { label: '已通过', value: '已通过' },
  { label: '已拒绝', value: '已拒绝' },
  { label: '需修改', value: '需修改' },
]

const categoryOptions = [
  { label: '数码/手机', value: '数码/手机' },
  { label: '数码/耳机', value: '数码/耳机' },
  { label: '数码/外设', value: '数码/外设' },
  { label: '数码/平板', value: '数码/平板' },
]

const rangeValue = computed({
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

const filteredList = computed(() => {
  return list.value.filter((item) => {
    const matchKeyword =
      !filters.value.keyword ||
      item.name.includes(filters.value.keyword) ||
      item.code.includes(filters.value.keyword) ||
      item.submitter.includes(filters.value.keyword)
    const matchStatus = !filters.value.status || item.status === filters.value.status
    const matchCategory = !filters.value.category || item.category === filters.value.category
    const matchDate =
      filters.value.dateRange.length === 0 ||
      dayjs(item.submitAt).isBetween(filters.value.dateRange[0], filters.value.dateRange[1], 'day', '[]')
    return matchKeyword && matchStatus && matchCategory && matchDate
  })
})

const resetFilters = () => {
  filters.value.keyword = ''
  filters.value.status = ''
  filters.value.category = ''
  filters.value.dateRange = []
}

const approve = (record: typeof list.value[number]) => {
  record.status = '已通过'
  record.remark = '审核通过'
  message.success('审核已通过')
}

const reject = (record: typeof list.value[number]) => {
  record.status = '已拒绝'
  record.remark = '资料不完整'
  message.error('审核已驳回')
}

const backToEdit = (record: typeof list.value[number]) => {
  record.status = '需修改'
  record.remark = '请补充商品图与资质'
  message.warning('已退回修改')
}
</script>

<style scoped>
.filter-bar {
  row-gap: 8px;
}

.product-cell {
  display: flex;
  gap: 12px;
  align-items: center;
}

.product-cell img {
  width: 52px;
  height: 52px;
  border-radius: 10px;
  object-fit: cover;
}

.product-title {
  font-weight: 600;
}

.product-meta {
  font-size: 12px;
  color: var(--text-secondary);
}
</style>
