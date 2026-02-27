<template>
  <div class="finance-closure-page">
    <div class="page-title">资金闭环</div>

    <a-row :gutter="16" class="kpi-row">
      <a-col :xs="24" :md="12" :xl="6">
        <a-card class="kpi-card">
          <div class="kpi-label">待对账单据</div>
          <div class="kpi-value warning">{{ kpi.pending }}</div>
          <div class="kpi-sub">含订单与售后单</div>
        </a-card>
      </a-col>
      <a-col :xs="24" :md="12" :xl="6">
        <a-card class="kpi-card">
          <div class="kpi-label">差异金额(元)</div>
          <div class="kpi-value danger">{{ kpi.diffAmount }}</div>
          <div class="kpi-sub">需人工复核</div>
        </a-card>
      </a-col>
      <a-col :xs="24" :md="12" :xl="6">
        <a-card class="kpi-card">
          <div class="kpi-label">退款待同步</div>
          <div class="kpi-value">{{ kpi.pendingRefund }}</div>
          <div class="kpi-sub">售后已退款未核销</div>
        </a-card>
      </a-col>
      <a-col :xs="24" :md="12" :xl="6">
        <a-card class="kpi-card">
          <div class="kpi-label">今日已闭环</div>
          <div class="kpi-value success">{{ kpi.closedToday }}</div>
          <div class="kpi-sub">自动 + 人工处理</div>
        </a-card>
      </a-col>
    </a-row>

    <TableWrapper :loading="tableLoading">
      <template #filters>
        <a-form layout="inline" class="filter-bar">
          <a-form-item label="业务单号">
            <a-input
              v-model:value="filters.keyword"
              placeholder="订单号/售后号/结算单号"
              allow-clear
            />
          </a-form-item>
          <a-form-item label="业务类型">
            <a-select
              v-model:value="filters.bizType"
              :options="bizTypeOptions"
              placeholder="全部"
              style="min-width: 140px"
              allow-clear
              :get-popup-container="getPopupContainer"
            />
          </a-form-item>
          <a-form-item label="对账状态">
            <a-select
              v-model:value="filters.status"
              :options="statusOptions"
              placeholder="全部"
              style="min-width: 140px"
              allow-clear
              :get-popup-container="getPopupContainer"
            />
          </a-form-item>
          <a-form-item label="结算日期">
            <a-range-picker v-model:value="rangeValue" :get-popup-container="getPopupContainer" />
          </a-form-item>
          <a-space>
            <a-button type="primary" @click="message.success('筛选条件已应用')">查询</a-button>
            <a-button @click="resetFilters">重置</a-button>
            <a-button @click="runAutoReconcile">发起自动对账</a-button>
            <a-button>导出差异</a-button>
          </a-space>
        </a-form>
      </template>

      <a-table
        :columns="columns"
        :data-source="filteredRows"
        :pagination="tablePagination"
        :scroll="{ x: 1500 }"
        row-key="id"
        :locale="{ emptyText: h(TableEmpty, { description: '暂无待处理对账差异' }) }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'bizType'">
            <a-tag :color="record.bizType === '退款单' ? 'purple' : 'blue'">{{
              record.bizType
            }}</a-tag>
          </template>
          <template v-else-if="column.key === 'diffAmount'">
            <span :class="Number(record.diffAmount) === 0 ? 'amount-zero' : 'amount-diff'">
              {{ Number(record.diffAmount) > 0 ? `+${record.diffAmount}` : record.diffAmount }}
            </span>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="statusColorMap[record.status] ?? 'default'">{{ record.status }}</a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" @click="openDetail(record)">详情</a-button>
              <a-button type="link" @click="retrySync(record.id)">同步重算</a-button>
              <a-button
                type="link"
                :disabled="record.status === '已闭环'"
                @click="markResolved(record.id)"
              >
                标记闭环
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </TableWrapper>

    <a-drawer v-model:open="detailOpen" title="差异详情" width="760" :destroy-on-close="true">
      <template v-if="current">
        <a-descriptions :column="2" bordered size="small">
          <a-descriptions-item label="业务单号">{{ current.bizNo }}</a-descriptions-item>
          <a-descriptions-item label="业务类型">{{ current.bizType }}</a-descriptions-item>
          <a-descriptions-item label="应结金额">¥{{ current.expectedAmount }}</a-descriptions-item>
          <a-descriptions-item label="实结金额">¥{{ current.actualAmount }}</a-descriptions-item>
          <a-descriptions-item label="差异金额">
            <span class="amount-diff">{{ current.diffAmount }}</span>
          </a-descriptions-item>
          <a-descriptions-item label="结算状态">{{ current.settleStatus }}</a-descriptions-item>
          <a-descriptions-item label="责任人">{{ current.owner }}</a-descriptions-item>
          <a-descriptions-item label="最近更新时间">{{ current.updatedAt }}</a-descriptions-item>
        </a-descriptions>

        <a-card title="处理轨迹" size="small" class="detail-card">
          <a-timeline>
            <a-timeline-item v-for="item in current.logs" :key="item.time">
              <div>{{ item.action }}</div>
              <div class="timeline-time">{{ item.time }}</div>
            </a-timeline-item>
          </a-timeline>
        </a-card>
      </template>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, h, ref } from 'vue'
import dayjs from 'dayjs'
import { message } from 'ant-design-vue'
import TableWrapper from '../components/TableWrapper.vue'
import TableEmpty from '../components/TableEmpty.vue'
import { useListPageState } from '../utils/useListPageState'

const kpi = {
  pending: 18,
  diffAmount: '1,286.40',
  pendingRefund: 7,
  closedToday: 26,
}

const bizTypeOptions = [
  { label: '订单单据', value: '订单单据' },
  { label: '退款单', value: '退款单' },
]

const statusOptions = [
  { label: '待对账', value: '待对账' },
  { label: '处理中', value: '处理中' },
  { label: '已闭环', value: '已闭环' },
  { label: '异常冻结', value: '异常冻结' },
]

const { filters, pagination } = useListPageState('list:finance:closure', {
  filters: {
    keyword: '',
    bizType: undefined as string | undefined,
    status: undefined as string | undefined,
    dateRange: [] as string[],
  },
  pagination: { current: 1, pageSize: 10 },
})

const rangeValue = computed({
  get: () => {
    if (filters.dateRange.length !== 2) return null
    return [dayjs(filters.dateRange[0]), dayjs(filters.dateRange[1])]
  },
  set: (value) => {
    if (!value || value.length !== 2) {
      filters.dateRange = []
      return
    }
    filters.dateRange = [value[0].format('YYYY-MM-DD'), value[1].format('YYYY-MM-DD')]
  },
})

const tableLoading = ref(false)

const rows = ref([
  {
    id: 'FCL-001',
    bizType: '订单单据',
    bizNo: 'DD2026022700931',
    expectedAmount: '499.00',
    actualAmount: '489.00',
    diffAmount: '-10.00',
    settleStatus: '未结算',
    status: '待对账',
    owner: '财务-张敏',
    updatedAt: '2026-02-27 10:13:11',
    logs: [
      { action: '系统发现差异，进入待对账池', time: '2026-02-27 09:42:08' },
      { action: '财务专员领取处理', time: '2026-02-27 10:02:15' },
    ],
  },
  {
    id: 'FCL-002',
    bizType: '退款单',
    bizNo: 'TK202602260018',
    expectedAmount: '129.00',
    actualAmount: '129.00',
    diffAmount: '0.00',
    settleStatus: '退款已完成',
    status: '处理中',
    owner: '售后-赵晨',
    updatedAt: '2026-02-27 09:31:00',
    logs: [
      { action: '退款完成，待与结算单同步', time: '2026-02-26 20:21:09' },
      { action: '发起结算同步任务', time: '2026-02-27 09:28:10' },
    ],
  },
  {
    id: 'FCL-003',
    bizType: '订单单据',
    bizNo: 'DD2026022507123',
    expectedAmount: '799.00',
    actualAmount: '799.00',
    diffAmount: '0.00',
    settleStatus: '已结算',
    status: '已闭环',
    owner: '财务-张敏',
    updatedAt: '2026-02-27 08:15:44',
    logs: [
      { action: '自动对账通过', time: '2026-02-27 08:14:23' },
      { action: '自动标记闭环', time: '2026-02-27 08:15:44' },
    ],
  },
  {
    id: 'FCL-004',
    bizType: '退款单',
    bizNo: 'TK202602250103',
    expectedAmount: '219.00',
    actualAmount: '0.00',
    diffAmount: '-219.00',
    settleStatus: '退款处理中',
    status: '异常冻结',
    owner: '风控-王坤',
    updatedAt: '2026-02-27 07:36:20',
    logs: [{ action: '退款金额超风控阈值，冻结处理', time: '2026-02-27 07:36:20' }],
  },
])

const statusColorMap: Record<string, string> = {
  待对账: 'orange',
  处理中: 'blue',
  已闭环: 'green',
  异常冻结: 'red',
}

const columns = [
  { title: '业务类型', dataIndex: 'bizType', key: 'bizType', width: 120 },
  { title: '业务单号', dataIndex: 'bizNo', key: 'bizNo', width: 180 },
  { title: '应结金额(元)', dataIndex: 'expectedAmount', key: 'expectedAmount', width: 140 },
  { title: '实结金额(元)', dataIndex: 'actualAmount', key: 'actualAmount', width: 140 },
  { title: '差异金额(元)', dataIndex: 'diffAmount', key: 'diffAmount', width: 140 },
  { title: '结算状态', dataIndex: 'settleStatus', key: 'settleStatus', width: 120 },
  { title: '对账状态', dataIndex: 'status', key: 'status', width: 120 },
  { title: '责任人', dataIndex: 'owner', key: 'owner', width: 130 },
  { title: '最近更新时间', dataIndex: 'updatedAt', key: 'updatedAt', width: 170 },
  { title: '操作', key: 'action', fixed: 'right', width: 200 },
]

const filteredRows = computed(() => {
  return rows.value.filter((item) => {
    const keyword = filters.keyword?.trim()
    const matchKeyword = !keyword || item.bizNo.includes(keyword)
    const matchBizType = !filters.bizType || item.bizType === filters.bizType
    const matchStatus = !filters.status || item.status === filters.status
    return matchKeyword && matchBizType && matchStatus
  })
})

const tablePagination = computed(() => ({
  current: pagination.current,
  pageSize: pagination.pageSize,
  total: filteredRows.value.length,
  showSizeChanger: true,
  onChange: (page: number, pageSize: number) => {
    pagination.current = page
    pagination.pageSize = pageSize
  },
}))

const detailOpen = ref(false)
const current = ref<(typeof rows.value)[number] | null>(null)

const getPopupContainer = (trigger?: HTMLElement) => trigger?.ownerDocument?.body ?? document.body

const resetFilters = () => {
  filters.keyword = ''
  filters.bizType = undefined
  filters.status = undefined
  filters.dateRange = []
}

const runAutoReconcile = () => {
  message.success('自动对账任务已创建，结果将通过站内信通知')
}

const retrySync = (id: string) => {
  rows.value = rows.value.map((item) => (item.id === id ? { ...item, status: '处理中' } : item))
  message.success('已触发同步重算')
}

const markResolved = (id: string) => {
  rows.value = rows.value.map((item) => (item.id === id ? { ...item, status: '已闭环' } : item))
  message.success('该差异单已标记闭环')
}

const openDetail = (record: (typeof rows.value)[number]) => {
  current.value = record
  detailOpen.value = true
}
</script>

<style scoped>
.finance-closure-page {
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

.kpi-value.success {
  color: var(--success-color);
}

.kpi-sub {
  margin-top: 4px;
  color: var(--text-muted);
  font-size: 12px;
}

.filter-bar {
  margin-bottom: 12px;
  row-gap: 10px;
}

.amount-diff {
  color: var(--danger-color);
  font-weight: 600;
}

.amount-zero {
  color: var(--text-secondary);
}

.detail-card {
  margin-top: 12px;
}

.timeline-time {
  margin-top: 2px;
  color: var(--text-muted);
  font-size: 12px;
}
</style>
