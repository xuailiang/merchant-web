<template>
  <div class="after-sales-page">
    <div class="page-title">售后/退款中心</div>

    <a-row :gutter="16" class="kpi-row">
      <a-col :xs="24" :md="12" :xl="6">
        <a-card class="kpi-card">
          <div class="kpi-label">待审核</div>
          <div class="kpi-value warning">{{ kpi.pendingReview }}</div>
        </a-card>
      </a-col>
      <a-col :xs="24" :md="12" :xl="6">
        <a-card class="kpi-card">
          <div class="kpi-label">待入库</div>
          <div class="kpi-value">{{ kpi.pendingInbound }}</div>
        </a-card>
      </a-col>
      <a-col :xs="24" :md="12" :xl="6">
        <a-card class="kpi-card">
          <div class="kpi-label">结算待同步</div>
          <div class="kpi-value">{{ kpi.pendingSettlement }}</div>
        </a-card>
      </a-col>
      <a-col :xs="24" :md="12" :xl="6">
        <a-card class="kpi-card">
          <div class="kpi-label">异常工单</div>
          <div class="kpi-value danger">{{ kpi.abnormal }}</div>
        </a-card>
      </a-col>
    </a-row>

    <TableWrapper :loading="tableLoading">
      <template #filters>
        <a-tabs v-model:active-key="activeTab" @change="onTabChange">
          <a-tab-pane
            v-for="tab in tabOptions"
            :key="tab.key"
            :tab="`${tab.label} (${tab.count})`"
          />
        </a-tabs>

        <a-form layout="inline" class="filter-bar">
          <a-form-item label="关键词">
            <a-input
              v-model:value="filters.keyword"
              placeholder="售后单号/订单号/客户"
              allow-clear
            />
          </a-form-item>
          <a-form-item label="售后类型">
            <a-select
              v-model:value="filters.type"
              :options="typeOptions"
              allow-clear
              placeholder="全部"
              :get-popup-container="getPopupContainer"
            />
          </a-form-item>
          <a-form-item label="状态">
            <a-select
              v-model:value="filters.status"
              :options="statusOptions"
              allow-clear
              placeholder="全部"
              :get-popup-container="getPopupContainer"
            />
          </a-form-item>
          <a-form-item label="申请时间">
            <a-range-picker v-model:value="rangeValue" :get-popup-container="getPopupContainer" />
          </a-form-item>
          <a-space>
            <a-button type="primary">查询</a-button>
            <a-button @click="resetFilters">重置</a-button>
            <a-button v-if="hasPermission('after_sales:view')">导出</a-button>
            <ColumnSetting :columns="allColumns" v-model="visibleKeys" @reset="resetColumns" />
          </a-space>
        </a-form>
      </template>

      <a-table
        :columns="columns"
        :data-source="filteredCases"
        :pagination="tablePagination"
        :scroll="{ x: 1680 }"
        :locale="{ emptyText: h(TableEmpty, { description: '暂无售后数据' }) }"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="statusColorMap[record.status] ?? 'default'">{{ record.status }}</a-tag>
          </template>
          <template v-else-if="column.key === 'type'">
            <a-tag color="blue">{{ record.type }}</a-tag>
          </template>
          <template v-else-if="column.key === 'amount'">
            <div class="amount-main">¥{{ record.refundAmount }}</div>
            <div class="amount-sub">支付 ¥{{ record.payAmount }}</div>
          </template>
          <template v-else-if="column.key === 'inbound'">
            <a-tag
              :color="
                record.inboundStatus === '已入库'
                  ? 'green'
                  : record.inboundStatus === '待入库'
                    ? 'orange'
                    : 'default'
              "
            >
              {{ record.inboundStatus }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'settlement'">
            <a-tag
              :color="
                record.settlementStatus === '已同步'
                  ? 'green'
                  : record.settlementStatus === '同步异常'
                    ? 'red'
                    : 'orange'
              "
            >
              {{ record.settlementStatus }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'workOrder'">
            <span v-if="record.workOrderNo" class="link-text" @click="openWorkOrder(record)">
              {{ record.workOrderNo }}
            </span>
            <span v-else class="muted">未创建</span>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" @click="openDetail(record)">详情</a-button>
              <a-button
                v-if="record.status === '待审核'"
                type="link"
                :disabled="!hasPermission('after_sales:review')"
                @click="openReview(record)"
              >
                审核
              </a-button>
              <a-button
                v-if="record.inboundStatus === '待入库'"
                type="link"
                :disabled="!hasPermission('after_sales:review')"
                @click="confirmInbound(record)"
              >
                入库确认
              </a-button>
              <a-dropdown v-if="hasPermission('after_sales:review')">
                <a class="action-more" @click.prevent>更多</a>
                <template #overlay>
                  <a-menu>
                    <a-menu-item @click="syncSettlement(record)">同步结算</a-menu-item>
                    <a-menu-item @click="createWorkOrder(record)">创建异常工单</a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
            </a-space>
          </template>
        </template>
      </a-table>
    </TableWrapper>

    <a-drawer v-model:open="detailOpen" width="980" title="售后详情" :destroy-on-close="true">
      <template v-if="currentCase">
        <div class="detail-head">
          <div>
            <div class="detail-no">售后单号：{{ currentCase.id }}</div>
            <div class="detail-meta">申请时间：{{ currentCase.applyTime }}</div>
          </div>
          <a-tag :color="statusColorMap[currentCase.status] ?? 'default'">{{
            currentCase.status
          }}</a-tag>
        </div>

        <a-row :gutter="16">
          <a-col :xs="24" :md="8">
            <a-card title="退款信息" size="small" class="detail-card">
              <div class="detail-row">
                <span>售后类型</span><span>{{ currentCase.type }}</span>
              </div>
              <div class="detail-row">
                <span>退款原因</span><span>{{ currentCase.reason }}</span>
              </div>
              <div class="detail-row">
                <span>退款金额</span><span class="highlight">¥{{ currentCase.refundAmount }}</span>
              </div>
              <div class="detail-row">
                <span>订单金额</span><span>¥{{ currentCase.payAmount }}</span>
              </div>
            </a-card>
          </a-col>
          <a-col :xs="24" :md="8">
            <a-card title="订单/结算联动" size="small" class="detail-card">
              <div class="detail-row">
                <span>原订单号</span><span class="link-text">{{ currentCase.orderId }}</span>
              </div>
              <div class="detail-row">
                <span>结算状态</span><span>{{ currentCase.settlementStatus }}</span>
              </div>
              <div class="detail-row">
                <span>结算单号</span><span>{{ currentCase.settlementNo || '-' }}</span>
              </div>
              <div class="detail-row">
                <span>最近同步</span><span>{{ currentCase.settlementSyncTime || '-' }}</span>
              </div>
            </a-card>
          </a-col>
          <a-col :xs="24" :md="8">
            <a-card title="买家信息" size="small" class="detail-card">
              <div class="detail-row">
                <span>买家</span><span>{{ currentCase.customer }}</span>
              </div>
              <div class="detail-row">
                <span>手机号</span><span>{{ currentCase.phone }}</span>
              </div>
              <div class="detail-row">
                <span>退货入库</span><span>{{ currentCase.inboundStatus }}</span>
              </div>
              <div class="detail-row">
                <span>仓库</span><span>{{ currentCase.inboundWarehouse || '-' }}</span>
              </div>
            </a-card>
          </a-col>
        </a-row>

        <a-card title="商品明细" size="small" class="detail-card">
          <a-table
            :columns="productColumns"
            :data-source="currentCase.items"
            :pagination="false"
            size="small"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'product'">
                <div class="product-cell">
                  <img :src="record.image" alt="商品" />
                  <div>
                    <div class="product-name">{{ record.name }}</div>
                    <div class="muted">{{ record.spec }}</div>
                  </div>
                </div>
              </template>
            </template>
          </a-table>
        </a-card>

        <a-card title="处理轨迹" size="small" class="detail-card">
          <a-timeline>
            <a-timeline-item v-for="(log, idx) in currentCase.logs" :key="idx">
              <div>{{ log.action }}</div>
              <div class="muted">{{ log.time }}</div>
            </a-timeline-item>
          </a-timeline>
        </a-card>
      </template>
    </a-drawer>

    <a-modal v-model:open="reviewOpen" title="售后审核" @ok="submitReview" ok-text="提交审核">
      <a-form layout="vertical">
        <a-form-item label="审核结果">
          <a-radio-group v-model:value="reviewForm.result">
            <a-radio value="approve">通过</a-radio>
            <a-radio value="reject">驳回</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="审核备注">
          <a-textarea v-model:value="reviewForm.remark" :rows="3" placeholder="请输入审核备注" />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal
      v-model:open="workOrderOpen"
      title="创建异常工单"
      @ok="submitWorkOrder"
      ok-text="创建工单"
    >
      <a-form layout="vertical">
        <a-form-item label="工单类型">
          <a-select v-model:value="workOrderForm.type" :options="workOrderTypeOptions" />
        </a-form-item>
        <a-form-item label="优先级">
          <a-select v-model:value="workOrderForm.priority" :options="workOrderPriorityOptions" />
        </a-form-item>
        <a-form-item label="问题描述">
          <a-textarea v-model:value="workOrderForm.remark" :rows="3" placeholder="请输入问题描述" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, h, onMounted, ref, watch } from 'vue'
import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import { message } from 'ant-design-vue'
import ColumnSetting from '../components/ColumnSetting.vue'
import TableEmpty from '../components/TableEmpty.vue'
import TableWrapper from '../components/TableWrapper.vue'
import { useColumnConfig } from '../utils/columnConfig'
import { useListPageState } from '../utils/useListPageState'
import { hasPermission } from '../utils/permissions'

dayjs.extend(isBetween)

type CaseItem = {
  id: string
  name: string
  spec: string
  refund: number
  qty: number
  image: string
}

type CaseLog = { time: string; action: string }

type AfterSaleCase = {
  id: string
  orderId: string
  customer: string
  phone: string
  type: string
  status: string
  refundAmount: number
  payAmount: number
  reason: string
  applyTime: string
  inboundStatus: '无需入库' | '待入库' | '已入库'
  inboundWarehouse?: string
  settlementStatus: '待同步' | '已同步' | '同步异常'
  settlementNo?: string
  settlementSyncTime?: string
  workOrderNo?: string
  items: CaseItem[]
  logs: CaseLog[]
}

const tableLoading = ref(false)
const scrollContainerRef = ref<HTMLElement | null>(null)

const cases = ref<AfterSaleCase[]>([
  {
    id: 'AS20260204001',
    orderId: 'DD2026020417142',
    customer: '周女士',
    phone: '13567546709',
    type: '仅退款',
    status: '待审核',
    refundAmount: 60,
    payAmount: 60,
    reason: '未收到货',
    applyTime: '2026-02-04 10:12',
    inboundStatus: '无需入库',
    settlementStatus: '待同步',
    items: [
      {
        id: 'i1',
        name: '猫爬架四层大型豪华猫玩具',
        spec: '200 / 红色 / 大',
        refund: 60,
        qty: 1,
        image: 'https://picsum.photos/seed/as1/80/80',
      },
    ],
    logs: [{ time: '2026-02-04 10:12', action: '买家提交仅退款申请' }],
  },
  {
    id: 'AS20260203008',
    orderId: 'DD2026020310021',
    customer: '宋先生',
    phone: '13900001234',
    type: '退货退款',
    status: '处理中',
    refundAmount: 256,
    payAmount: 256,
    reason: '质量问题',
    applyTime: '2026-02-03 14:22',
    inboundStatus: '待入库',
    inboundWarehouse: '济南二仓',
    settlementStatus: '待同步',
    settlementNo: 'ST2026020301',
    settlementSyncTime: '2026-02-03 14:30',
    items: [
      {
        id: 'i1',
        name: '猫爬架四层大型豪华猫玩具',
        spec: '200 / 红色 / 大',
        refund: 256,
        qty: 1,
        image: 'https://picsum.photos/seed/as2/80/80',
      },
    ],
    logs: [
      { time: '2026-02-03 14:22', action: '买家提交退货退款' },
      { time: '2026-02-03 14:25', action: '商户审核通过，等待退货入库' },
    ],
  },
  {
    id: 'AS20260201002',
    orderId: 'DD2026020115203',
    customer: '林女士',
    phone: '18822334455',
    type: '退货退款',
    status: '已退款',
    refundAmount: 128,
    payAmount: 128,
    reason: '颜色不符',
    applyTime: '2026-02-01 18:40',
    inboundStatus: '已入库',
    inboundWarehouse: '济南一仓',
    settlementStatus: '已同步',
    settlementNo: 'ST2026020108',
    settlementSyncTime: '2026-02-01 19:10',
    workOrderNo: 'WO20260201001',
    items: [
      {
        id: 'i1',
        name: '智能手环 Pro',
        spec: '黑色 / NFC',
        refund: 128,
        qty: 1,
        image: 'https://picsum.photos/seed/as3/80/80',
      },
    ],
    logs: [
      { time: '2026-02-01 18:40', action: '买家提交退货退款' },
      { time: '2026-02-01 18:50', action: '商户审核通过' },
      { time: '2026-02-01 19:02', action: '仓库完成入库' },
      { time: '2026-02-01 19:05', action: '退款完成' },
    ],
  },
  {
    id: 'AS20260130003',
    orderId: 'DD2026013010102',
    customer: '赵女士',
    phone: '13766668888',
    type: '仅退款',
    status: '已拒绝',
    refundAmount: 0,
    payAmount: 299,
    reason: '超出售后期限',
    applyTime: '2026-01-30 09:18',
    inboundStatus: '无需入库',
    settlementStatus: '同步异常',
    settlementNo: 'ST2026013002',
    settlementSyncTime: '2026-01-30 09:30',
    workOrderNo: 'WO20260130009',
    items: [
      {
        id: 'i1',
        name: '运动耳机',
        spec: '蓝色 / 防水',
        refund: 0,
        qty: 1,
        image: 'https://picsum.photos/seed/as4/80/80',
      },
    ],
    logs: [
      { time: '2026-01-30 09:18', action: '买家提交仅退款' },
      { time: '2026-01-30 09:25', action: '审核拒绝：超出售后期限' },
    ],
  },
])

const allColumns = [
  { title: '售后单号', dataIndex: 'id', key: 'id', width: 160 },
  { title: '订单编号', dataIndex: 'orderId', key: 'orderId', width: 170 },
  { title: '客户', dataIndex: 'customer', key: 'customer', width: 100 },
  { title: '联系电话', dataIndex: 'phone', key: 'phone', width: 120 },
  { title: '售后类型', dataIndex: 'type', key: 'type', width: 120 },
  { title: '金额', key: 'amount', width: 140 },
  { title: '退货入库', key: 'inbound', width: 120 },
  { title: '结算联动', key: 'settlement', width: 120 },
  { title: '异常工单', key: 'workOrder', width: 140 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 120 },
  { title: '申请时间', dataIndex: 'applyTime', key: 'applyTime', width: 160 },
  { title: '操作', key: 'action', fixed: 'right', width: 230 },
]

const productColumns = [
  { title: '商品', key: 'product' },
  { title: '退款金额', dataIndex: 'refund', key: 'refund', width: 120 },
  { title: '数量', dataIndex: 'qty', key: 'qty', width: 90 },
]

const {
  visibleKeys,
  filteredColumns: columns,
  reset: resetColumns,
} = useColumnConfig('columns:after-sales', allColumns)

const { filters, pagination, bindScrollContainer } = useListPageState('list:after-sales', {
  filters: {
    keyword: '',
    type: '',
    status: '',
    dateRange: [] as string[],
    activeTab: 'all',
  },
  pagination: { current: 1, pageSize: 8 },
})

const typeOptions = [
  { label: '仅退款', value: '仅退款' },
  { label: '退货退款', value: '退货退款' },
]

const statusOptions = [
  { label: '待审核', value: '待审核' },
  { label: '处理中', value: '处理中' },
  { label: '已退款', value: '已退款' },
  { label: '已拒绝', value: '已拒绝' },
]

const statusColorMap: Record<string, string> = {
  待审核: 'orange',
  处理中: 'blue',
  已退款: 'green',
  已拒绝: 'red',
}

const tabOptions = computed(() => [
  { key: 'all', label: '全部', count: cases.value.length },
  {
    key: '待审核',
    label: '待审核',
    count: cases.value.filter((item) => item.status === '待审核').length,
  },
  {
    key: '处理中',
    label: '处理中',
    count: cases.value.filter((item) => item.status === '处理中').length,
  },
  {
    key: '待入库',
    label: '待入库',
    count: cases.value.filter((item) => item.inboundStatus === '待入库').length,
  },
  {
    key: '同步异常',
    label: '同步异常',
    count: cases.value.filter((item) => item.settlementStatus === '同步异常').length,
  },
])

const activeTab = computed({
  get: () => filters.activeTab,
  set: (value: string) => {
    filters.activeTab = value
  },
})

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
  return cases.value.filter((item) => {
    const matchKeyword =
      !keyword ||
      item.id.includes(keyword) ||
      item.orderId.includes(keyword) ||
      item.customer.includes(keyword)
    const matchType = !filters.type || item.type === filters.type
    const matchStatus = !filters.status || item.status === filters.status
    const matchTab =
      filters.activeTab === 'all' ||
      item.status === filters.activeTab ||
      item.inboundStatus === filters.activeTab ||
      item.settlementStatus === filters.activeTab
    const matchDate =
      filters.dateRange.length === 0 ||
      dayjs(item.applyTime).isBetween(filters.dateRange[0], filters.dateRange[1], 'day', '[]')
    return matchKeyword && matchType && matchStatus && matchTab && matchDate
  })
})

const tablePagination = computed(() => ({
  current: pagination.current,
  pageSize: pagination.pageSize,
  total: filteredCases.value.length,
  showSizeChanger: true,
  pageSizeOptions: ['8', '20', '50'],
  onChange: (page: number, pageSize: number) => {
    pagination.current = page
    pagination.pageSize = pageSize
  },
}))

watch(
  () => filteredCases.value.length,
  (total) => {
    const max = Math.max(1, Math.ceil(total / pagination.pageSize))
    if (pagination.current > max) pagination.current = max
  },
  { immediate: true }
)

const kpi = computed(() => ({
  pendingReview: cases.value.filter((item) => item.status === '待审核').length,
  pendingInbound: cases.value.filter((item) => item.inboundStatus === '待入库').length,
  pendingSettlement: cases.value.filter((item) => item.settlementStatus === '待同步').length,
  abnormal: cases.value.filter((item) => item.settlementStatus === '同步异常' || !!item.workOrderNo)
    .length,
}))

const detailOpen = ref(false)
const currentCase = ref<AfterSaleCase | null>(null)

const reviewOpen = ref(false)
const currentReviewId = ref<string>('')
const reviewForm = ref({ result: 'approve', remark: '' })

const workOrderOpen = ref(false)
const currentWorkOrderId = ref<string>('')
const workOrderForm = ref({
  type: '结算同步异常',
  priority: '中',
  remark: '',
})

const workOrderTypeOptions = [
  { label: '结算同步异常', value: '结算同步异常' },
  { label: '入库不一致', value: '入库不一致' },
  { label: '退款金额差异', value: '退款金额差异' },
]

const workOrderPriorityOptions = [
  { label: '高', value: '高' },
  { label: '中', value: '中' },
  { label: '低', value: '低' },
]

const openDetail = (record: AfterSaleCase) => {
  currentCase.value = record
  detailOpen.value = true
}

const openReview = (record: AfterSaleCase) => {
  currentReviewId.value = record.id
  reviewForm.value = { result: 'approve', remark: '' }
  reviewOpen.value = true
}

const submitReview = () => {
  const target = cases.value.find((item) => item.id === currentReviewId.value)
  if (!target) return
  if (reviewForm.value.result === 'approve') {
    target.status = '处理中'
    target.logs.unshift({
      time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      action: `审核通过：${reviewForm.value.remark || '通过售后申请'}`,
    })
  } else {
    target.status = '已拒绝'
    target.logs.unshift({
      time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      action: `审核拒绝：${reviewForm.value.remark || '无'}`,
    })
  }
  reviewOpen.value = false
  message.success('审核结果已提交')
}

const confirmInbound = (record: AfterSaleCase) => {
  record.inboundStatus = '已入库'
  record.logs.unshift({
    time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    action: `仓库【${record.inboundWarehouse || '默认仓'}】完成入库`,
  })
  message.success('已确认退货入库')
}

const syncSettlement = (record: AfterSaleCase) => {
  record.settlementStatus = '已同步'
  record.settlementSyncTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
  record.logs.unshift({
    time: record.settlementSyncTime,
    action: '已同步结算系统',
  })
  message.success('已触发结算同步')
}

const createWorkOrder = (record: AfterSaleCase) => {
  currentWorkOrderId.value = record.id
  workOrderForm.value = {
    type: '结算同步异常',
    priority: '中',
    remark: '',
  }
  workOrderOpen.value = true
}

const submitWorkOrder = () => {
  const target = cases.value.find((item) => item.id === currentWorkOrderId.value)
  if (!target) return
  target.workOrderNo = `WO${dayjs().format('YYYYMMDDHHmmss')}`
  target.logs.unshift({
    time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    action: `创建异常工单【${target.workOrderNo}】，类型：${workOrderForm.value.type}`,
  })
  workOrderOpen.value = false
  message.success('异常工单已创建')
}

const openWorkOrder = (record: AfterSaleCase) => {
  message.info(`工单 ${record.workOrderNo}（演示）`)
}

const resetFilters = () => {
  filters.keyword = ''
  filters.type = ''
  filters.status = ''
  filters.dateRange = []
  filters.activeTab = 'all'
  pagination.current = 1
}

const onTabChange = () => {
  filters.status = ''
  pagination.current = 1
}

const getPopupContainer = (trigger: HTMLElement) => trigger?.parentNode || document.body

onMounted(() => {
  scrollContainerRef.value = document.querySelector('.layout-content') as HTMLElement | null
  bindScrollContainer(scrollContainerRef)
})
</script>

<style scoped>
.after-sales-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.kpi-row {
  margin-bottom: 4px;
}

.kpi-card {
  border-radius: 12px;
}

.kpi-label {
  color: var(--text-secondary);
  font-size: 12px;
}

.kpi-value {
  margin-top: 6px;
  font-size: 26px;
  font-weight: 700;
  color: var(--text-primary);
}

.kpi-value.warning {
  color: var(--warning-color);
}

.kpi-value.danger {
  color: var(--danger-color);
}

.filter-bar {
  row-gap: 8px;
}

.amount-main {
  color: var(--danger-color);
  font-weight: 700;
}

.amount-sub {
  color: var(--text-secondary);
  font-size: 12px;
}

.action-more {
  color: #1f6feb;
}

.link-text {
  color: #2563eb;
  cursor: pointer;
}

.muted {
  color: var(--text-secondary);
  font-size: 12px;
}

.detail-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.detail-no {
  font-weight: 700;
  color: var(--text-primary);
}

.detail-meta {
  color: var(--text-secondary);
  font-size: 12px;
  margin-top: 4px;
}

.detail-card {
  margin-bottom: 12px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 6px 0;
  border-bottom: 1px dashed var(--border-color);
  color: var(--text-secondary);
}

.detail-row:last-child {
  border-bottom: 0;
}

.detail-row span:last-child {
  color: var(--text-primary);
  text-align: right;
}

.detail-row .highlight {
  color: var(--danger-color);
  font-weight: 700;
}

.product-cell {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.product-cell img {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  object-fit: cover;
}

.product-name {
  font-weight: 600;
  color: var(--text-primary);
}
</style>
