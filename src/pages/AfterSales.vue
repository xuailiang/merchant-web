<template>
  <div>
    <div class="page-title">售后/退款中心</div>

    <a-card class="card-section">
      <a-tabs v-model:active-key="activeTab" @change="onTabChange">
        <a-tab-pane v-for="tab in tabOptions" :key="tab.key" :tab="`${tab.label} (${tab.count})`" />
      </a-tabs>

      <a-form layout="inline" class="filter-bar">
        <a-form-item label="关键词">
          <a-input v-model:value="filters.keyword" placeholder="售后单号/订单号/客户" allow-clear />
        </a-form-item>
        <a-form-item label="售后类型">
          <a-select v-model:value="filters.type" :options="typeOptions" allow-clear placeholder="全部" :get-popup-container="getPopupContainer" />
        </a-form-item>
        <a-form-item label="状态">
          <a-select v-model:value="filters.status" :options="statusOptions" allow-clear placeholder="全部" :get-popup-container="getPopupContainer" />
        </a-form-item>
        <a-form-item label="申请时间">
          <a-range-picker v-model:value="rangeValue" :get-popup-container="getPopupContainer" />
        </a-form-item>
        <a-space>
          <a-button type="primary">查询</a-button>
          <a-button @click="resetFilters">重置</a-button>
          <a-button v-if="hasPermission('after_sales:view')">导出</a-button>
          <ColumnSetting :columns="allColumns" v-model="visibleKeys" @reset="reset" />
        </a-space>
      </a-form>
    </a-card>

    <a-card>
      <a-table
        :columns="columns"
        :data-source="filteredCases"
        :pagination="{ pageSize: 8 }"
        :scroll="{ x: 1400 }"
        :loading="tableLoading"
        :locale="{ emptyText: h(TableEmpty, { description: '暂无售后数据' }) }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="getAfterSalesStatusMeta(record.status).color">{{ getAfterSalesStatusMeta(record.status).label }}</a-tag>
          </template>
          <template v-else-if="column.key === 'type'">
            <a-tag color="blue">{{ record.type }}</a-tag>
          </template>
          <template v-else-if="column.key === 'amount'">
            <div class="amount-cell">¥{{ record.refundAmount }}</div>
            <div class="amount-sub">应退 ¥{{ record.payAmount }}</div>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <template v-for="action in getAfterSalesActions(record)" :key="action.key">
                <a-button
                  v-if="isActionAllowed(action)"
                  type="link"
                  @click="action.key === 'view' ? openDetail(record) : null"
                >
                  {{ action.label }}
                </a-button>
              </template>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <a-drawer v-model:open="detailOpen" width="960" title="退货单详情" :destroy-on-close="true">
      <template v-if="currentDetail">
        <div class="detail-header">
          <div class="detail-title">
            <div class="detail-no">售后编号：{{ currentDetail.afterSaleNo }}</div>
            <div class="detail-meta">申请时间：{{ currentDetail.applyTime }}</div>
          </div>
          <a-tag color="green">{{ currentDetail.stateLabel }}</a-tag>
        </div>

        <a-card class="detail-card">
          <a-steps :current="currentDetail.stepIndex" size="small" class="detail-steps">
            <a-step v-for="step in currentDetail.steps" :key="step.title" :title="step.title" :description="step.time" />
          </a-steps>
        </a-card>

        <a-row :gutter="16" class="detail-grid">
          <a-col :xs="24" :lg="8">
            <a-card title="退款信息" class="detail-card">
              <div class="detail-row"><span>售后类型</span><span>{{ currentDetail.type }}</span></div>
              <div class="detail-row"><span>退款原因</span><span>{{ currentDetail.reason }}</span></div>
              <div class="detail-row"><span>退款金额</span><span class="highlight">¥{{ currentDetail.refundAmount }}</span></div>
              <div class="detail-row"><span>其中运费</span><span>¥{{ currentDetail.freight }}</span></div>
            </a-card>
          </a-col>
          <a-col :xs="24" :lg="8">
            <a-card title="支付信息" class="detail-card">
              <div class="detail-row"><span>订单编号</span><span class="link">{{ currentDetail.orderId }}</span></div>
              <div class="detail-row"><span>支付时间</span><span>{{ currentDetail.payTime }}</span></div>
              <div class="detail-row"><span>优惠金额</span><span>¥{{ currentDetail.discount }}</span></div>
              <div class="detail-row"><span>积分抵扣</span><span>¥{{ currentDetail.pointDiscount }}</span></div>
              <div class="detail-row"><span>运费金额</span><span>¥{{ currentDetail.freight }}</span></div>
              <div class="detail-row"><span>支付金额</span><span class="highlight">¥{{ currentDetail.payAmount }}</span></div>
            </a-card>
          </a-col>
          <a-col :xs="24" :lg="8">
            <a-card title="买家信息" class="detail-card">
              <div class="detail-row"><span>买家昵称</span><span>{{ currentDetail.buyer }}</span></div>
              <div class="detail-row"><span>下单号码</span><span>{{ currentDetail.phone }}</span></div>
              <div class="detail-row"><span>收货地址</span><span>{{ currentDetail.address }}</span></div>
            </a-card>
          </a-col>
        </a-row>

        <a-card class="detail-card" title="商品明细">
          <a-table :columns="productColumns" :data-source="currentDetail.items" :pagination="false" size="small">
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'product'">
                <div class="product-cell">
                  <img :src="record.image" alt="商品" />
                  <div>
                    <div class="product-title">{{ record.name }}</div>
                    <div class="product-meta">{{ record.spec }}</div>
                  </div>
                </div>
              </template>
            </template>
          </a-table>
        </a-card>
      </template>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue'
import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import { usePersistedFilters } from '../utils/usePersistedFilters'
import { hasPermission } from '../utils/permissions'
import {
  afterSalesActionConfig,
  afterSalesStatusActions,
  afterSalesStatusConfig,
  type ActionDef,
} from '../utils/statusConfig'
import { fetchAfterSales } from '../api/endpoints'
import { message } from 'ant-design-vue'
import ColumnSetting from '../components/ColumnSetting.vue'
import TableEmpty from '../components/TableEmpty.vue'
import { useColumnConfig } from '../utils/columnConfig'

dayjs.extend(isBetween)

const cases = [
  {
    key: 'a1',
    id: 'AS20260204001',
    orderId: 'DD2026020417142',
    customer: '周女士',
    type: '仅退款',
    status: '待审核',
    refundAmount: 60,
    payAmount: 60,
    reason: '未收到货',
    phone: '13567546709',
    applyTime: '2026-02-04 10:12',
    detail: {
      afterSaleNo: 'TK20250701142014983016',
      applyTime: '2025-07-01 14:20:14',
      stateLabel: '退款申请',
      stepIndex: 1,
      steps: [
        { title: '买家申请', time: '2025-07-01 14:20:14' },
        { title: '商户审核', time: '2025-07-01 14:20:46' },
        { title: '退款完成', time: '2025-07-01 14:21:03' },
      ],
      type: '退款',
      reason: '拍错/多拍/不想买了',
      refundAmount: 12,
      freight: 2,
      orderId: 'DD20250701141632983011',
      payTime: '2025-07-01 14:17:05',
      discount: 0,
      pointDiscount: 0,
      payAmount: 12,
      buyer: '一卡通用户',
      phone: '13567546709',
      address: '山东省济南市历下区新泺大街888号',
      items: [
        {
          key: 'i1',
          name: '猫爬架四层大型豪华猫玩具',
          spec: '200 / 红色 / 22 / 大型',
          refund: 10,
          qty: 1,
          image: 'https://picsum.photos/seed/after1/80/80',
        },
      ],
    },
  },
  {
    key: 'a2',
    id: 'AS20260203008',
    orderId: 'DD2026020310021',
    customer: '宋先生',
    type: '退货退款',
    status: '处理中',
    refundAmount: 256,
    payAmount: 256,
    reason: '质量问题',
    phone: '13900001234',
    applyTime: '2026-02-03 14:22',
    detail: {
      afterSaleNo: 'TK202602031422001',
      applyTime: '2026-02-03 14:22:00',
      stateLabel: '处理中',
      stepIndex: 1,
      steps: [
        { title: '买家申请', time: '2026-02-03 14:22:00' },
        { title: '商户审核', time: '处理中' },
        { title: '退款完成', time: '-' },
      ],
      type: '退货退款',
      reason: '质量问题',
      refundAmount: 256,
      freight: 0,
      orderId: 'DD2026020310021',
      payTime: '2026-02-03 10:25:00',
      discount: 0,
      pointDiscount: 0,
      payAmount: 256,
      buyer: '宋先生',
      phone: '13900001234',
      address: '上海市浦东新区银城路 88 号',
      items: [
        {
          key: 'i1',
          name: '猫爬架四层大型豪华猫玩具',
          spec: '200 / 红色 / 22 / 大型',
          refund: 256,
          qty: 1,
          image: 'https://picsum.photos/seed/after2/80/80',
        },
      ],
    },
  },
  {
    key: 'a3',
    id: 'AS20260201002',
    orderId: 'DD2026020115203',
    customer: '林女士',
    type: '换货',
    status: '已退款',
    refundAmount: 128,
    payAmount: 128,
    reason: '颜色不符',
    phone: '18822334455',
    applyTime: '2026-02-01 18:40',
    detail: {
      afterSaleNo: 'TK202602011840002',
      applyTime: '2026-02-01 18:40:00',
      stateLabel: '已退款',
      stepIndex: 2,
      steps: [
        { title: '买家申请', time: '2026-02-01 18:40:00' },
        { title: '商户审核', time: '2026-02-01 18:50:10' },
        { title: '退款完成', time: '2026-02-01 19:05:00' },
      ],
      type: '换货',
      reason: '颜色不符',
      refundAmount: 128,
      freight: 0,
      orderId: 'DD2026020115203',
      payTime: '2026-02-01 15:08:00',
      discount: 0,
      pointDiscount: 0,
      payAmount: 128,
      buyer: '林女士',
      phone: '18822334455',
      address: '北京市朝阳区来广营 22 号',
      items: [
        {
          key: 'i1',
          name: '智能手环 Pro',
          spec: '黑色 / NFC',
          refund: 128,
          qty: 1,
          image: 'https://picsum.photos/seed/after3/80/80',
        },
      ],
    },
  },
  {
    key: 'a4',
    id: 'AS20260130003',
    orderId: 'DD2026013010102',
    customer: '赵女士',
    type: '仅退款',
    status: '已拒绝',
    refundAmount: 0,
    payAmount: 299,
    reason: '超出售后期限',
    phone: '13766668888',
    applyTime: '2026-01-30 09:18',
    detail: {
      afterSaleNo: 'TK202601300918003',
      applyTime: '2026-01-30 09:18:00',
      stateLabel: '已拒绝',
      stepIndex: 0,
      steps: [
        { title: '买家申请', time: '2026-01-30 09:18:00' },
        { title: '商户审核', time: '已拒绝' },
        { title: '退款完成', time: '-' },
      ],
      type: '仅退款',
      reason: '超出售后期限',
      refundAmount: 0,
      freight: 0,
      orderId: 'DD2026013010102',
      payTime: '2026-01-30 09:20:00',
      discount: 0,
      pointDiscount: 0,
      payAmount: 299,
      buyer: '赵女士',
      phone: '13766668888',
      address: '杭州市西湖区文三路 98 号',
      items: [
        {
          key: 'i1',
          name: '运动耳机',
          spec: '蓝色 / 防水',
          refund: 0,
          qty: 1,
          image: 'https://picsum.photos/seed/after4/80/80',
        },
      ],
    },
  },
]

const USE_REMOTE = false

onMounted(async () => {
  if (!USE_REMOTE) return
  try {
    const res = await fetchAfterSales({
      keyword: filters.keyword,
      type: filters.type,
      status: filters.status,
      startDate: filters.dateRange[0],
      endDate: filters.dateRange[1],
    })
    cases.splice(0, cases.length, ...res.list)
  } catch (error) {
    message.error('售后列表加载失败，请检查接口配置')
  }
})

const allColumns = [
  { title: '售后单号', dataIndex: 'id', key: 'id', width: 160 },
  { title: '订单编号', dataIndex: 'orderId', key: 'orderId', width: 160 },
  { title: '客户', dataIndex: 'customer', key: 'customer', width: 100 },
  { title: '联系电话', dataIndex: 'phone', key: 'phone', width: 120 },
  { title: '售后类型', dataIndex: 'type', key: 'type', width: 120 },
  { title: '退款金额', key: 'amount', width: 140 },
  { title: '原因', dataIndex: 'reason', key: 'reason', width: 180 },
  { title: '申请时间', dataIndex: 'applyTime', key: 'applyTime', width: 160 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 120 },
  { title: '操作', key: 'action', fixed: 'right', width: 140 },
]

const { visibleKeys, filteredColumns: columns, reset } = useColumnConfig('columns:after-sales', allColumns)
const tableLoading = ref(false)

const productColumns = [
  { title: '商品', key: 'product' },
  { title: '售后金额', dataIndex: 'refund', key: 'refund', width: 120 },
  { title: '售后数量', dataIndex: 'qty', key: 'qty', width: 120 },
]

const filters = usePersistedFilters('filters:after-sales', {
  keyword: '',
  type: '',
  status: '',
  dateRange: [] as string[],
  activeTab: 'all',
})

const typeOptions = [
  { label: '仅退款', value: '仅退款' },
  { label: '退货退款', value: '退货退款' },
  { label: '换货', value: '换货' },
]

const statusOptions = [
  { label: '待审核', value: '待审核' },
  { label: '处理中', value: '处理中' },
  { label: '已退款', value: '已退款' },
  { label: '已拒绝', value: '已拒绝' },
]

const activeTab = computed({
  get: () => filters.activeTab,
  set: (value) => {
    filters.activeTab = value
  },
})

const tabOptions = computed(() => [
  { key: 'all', label: '全部', count: cases.length },
  { key: '待审核', label: '待审核', count: cases.filter((item) => item.status === '待审核').length },
  { key: '处理中', label: '处理中', count: cases.filter((item) => item.status === '处理中').length },
  { key: '已退款', label: '已退款', count: cases.filter((item) => item.status === '已退款').length },
  { key: '已拒绝', label: '已拒绝', count: cases.filter((item) => item.status === '已拒绝').length },
])

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

const filteredCases = computed(() => {
  const keyword = filters.keyword.trim()
  return cases.filter((item) => {
    const matchKeyword =
      !keyword ||
      item.id.includes(keyword) ||
      item.orderId.includes(keyword) ||
      item.customer.includes(keyword)
    const matchType = !filters.type || item.type === filters.type
    const matchStatus = !filters.status || item.status === filters.status
    const matchTab = filters.activeTab === 'all' || item.status === filters.activeTab
    const matchDate =
      filters.dateRange.length === 0 ||
      dayjs(item.applyTime).isBetween(filters.dateRange[0], filters.dateRange[1], 'day', '[]')
    return matchKeyword && matchType && matchStatus && matchTab && matchDate
  })
})

const detailOpen = ref(false)
const currentDetail = ref<typeof cases[0]['detail'] | null>(null)

const openDetail = (record: typeof cases[0]) => {
  currentDetail.value = record.detail
  detailOpen.value = true
}

const resetFilters = () => {
  filters.keyword = ''
  filters.type = ''
  filters.status = ''
  filters.dateRange = []
  filters.activeTab = 'all'
}

const onTabChange = () => {
  filters.status = ''
}

const getAfterSalesStatusMeta = (status: string) =>
  afterSalesStatusConfig[status] ?? { label: status, color: 'default' }

const isActionAllowed = (action: ActionDef) => !action.permission || hasPermission(action.permission)

const getAfterSalesActions = (record: { status: string }) => {
  const keys = afterSalesStatusActions[record.status] ?? ['view']
  return keys.map((key) => afterSalesActionConfig[key]).filter(Boolean).filter(isActionAllowed)
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

.amount-cell {
  font-weight: 600;
  color: #ef4444;
}

.amount-sub {
  color: var(--text-secondary);
  font-size: 12px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.detail-title {
  display: grid;
  gap: 4px;
  font-weight: 600;
}

.detail-no {
  font-size: 14px;
}

.detail-meta {
  font-size: 12px;
  color: var(--text-secondary);
}

.detail-card {
  margin-bottom: 16px;
}

.detail-steps :deep(.ant-steps-item-description) {
  font-size: 12px;
}

.detail-grid {
  margin-bottom: 8px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  color: var(--text-secondary);
}

.detail-row span:last-child {
  color: var(--text-primary);
  font-weight: 500;
  text-align: right;
}

.detail-row .highlight {
  color: #ef4444;
}

.detail-row .link {
  color: #2563eb;
}

.product-cell {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.product-cell img {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  object-fit: cover;
}

.product-title {
  font-weight: 600;
}

.product-meta {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 2px;
}

.log-title {
  font-size: 12px;
  color: var(--text-primary);
}

.log-meta {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 4px;
}
</style>
