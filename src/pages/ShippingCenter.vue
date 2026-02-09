<template>
  <div>
    <div class="page-title">发货管理中心</div>

    <a-row :gutter="16" class="card-section">
      <a-col :xs="24" :lg="6">
        <a-card>
          <a-statistic title="待发货" value="128" />
          <a-tag color="blue">今日 +32</a-tag>
        </a-card>
      </a-col>
      <a-col :xs="24" :lg="6">
        <a-card>
          <a-statistic title="已发货" value="1,240" />
          <a-tag color="green">本周 +8%</a-tag>
        </a-card>
      </a-col>
      <a-col :xs="24" :lg="6">
        <a-card>
          <a-statistic title="异常件" value="6" />
          <a-tag color="red">需处理</a-tag>
        </a-card>
      </a-col>
      <a-col :xs="24" :lg="6">
        <a-card>
          <a-statistic title="面单打印" value="312" />
          <a-tag color="purple">今日</a-tag>
        </a-card>
      </a-col>
    </a-row>

    <a-card class="card-section">
      <a-form layout="inline" class="filter-bar">
        <a-form-item label="订单号">
          <a-input v-model:value="filters.orderId" placeholder="订单号/运单号" allow-clear />
        </a-form-item>
        <a-form-item label="状态">
          <a-select v-model:value="filters.status" :options="statusOptions" allow-clear placeholder="全部" :get-popup-container="getPopupContainer" />
        </a-form-item>
        <a-form-item label="物流公司">
          <a-select v-model:value="filters.carrier" :options="carrierOptions" allow-clear placeholder="全部" :get-popup-container="getPopupContainer" />
        </a-form-item>
        <a-form-item label="下单时间">
          <a-range-picker v-model:value="rangeValue" :get-popup-container="getPopupContainer" />
        </a-form-item>
        <a-space>
          <a-button type="primary">查询</a-button>
          <a-button @click="resetFilters">重置</a-button>
        </a-space>
      </a-form>

      <div class="batch-bar">
        <a-space>
          <a-button v-if="hasPermission('shipping:batch')" type="primary" ghost @click="openBatchShip">批量发货</a-button>
          <a-button v-if="hasPermission('shipping:import')" @click="openImport">批量导入</a-button>
          <a-button v-if="hasPermission('shipping:print')" @click="openPrint">面单打印</a-button>
        </a-space>
        <a-button v-if="hasPermission('shipping:export')">导出</a-button>
      </div>
    </a-card>

    <a-card>
      <a-table
        row-selection="multiple"
        :columns="columns"
        :data-source="filteredOrders"
        :pagination="{ pageSize: 8 }"
        :scroll="{ x: 1500 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="statusColor(record.status)">{{ record.status }}</a-tag>
          </template>
          <template v-else-if="column.key === 'tracking'">
            <div>{{ record.tracking }}</div>
            <a-button v-if="hasPermission('shipping:trace')" type="link" @click="openTrace(record)">查看轨迹</a-button>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button v-if="hasPermission('shipping:batch')" type="link">发货</a-button>
              <a-button v-if="hasPermission('shipping:print')" type="link">打印面单</a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <a-modal v-model:open="batchShipOpen" title="批量发货" width="640px" :footer="null">
      <a-alert message="请先选择需要发货的订单，再填写统一物流信息。" type="info" show-icon />
      <a-form layout="vertical" class="modal-form">
        <a-form-item label="物流公司">
          <a-select v-model:value="batchForm.carrier" :options="carrierOptions" :get-popup-container="getPopupContainer" />
        </a-form-item>
        <a-form-item label="统一运单号前缀">
          <a-input v-model:value="batchForm.prefix" placeholder="例如 SF2026" />
        </a-form-item>
        <a-form-item label="发货备注">
          <a-textarea v-model:value="batchForm.note" :rows="3" />
        </a-form-item>
        <a-space>
          <a-button type="primary">确认批量发货</a-button>
          <a-button @click="batchShipOpen = false">取消</a-button>
        </a-space>
      </a-form>
    </a-modal>

    <a-modal v-model:open="importOpen" title="批量导入" width="520px" :footer="null">
      <a-upload :before-upload="preventUpload" :file-list="[]">
        <a-button>上传文件</a-button>
      </a-upload>
      <div class="import-tip">支持 xlsx/xls 格式，下载模板后填写运单号并导入。</div>
      <a-space>
        <a-button type="primary">开始导入</a-button>
        <a-button @click="importOpen = false">关闭</a-button>
      </a-space>
    </a-modal>

    <a-modal v-model:open="printOpen" title="面单打印" width="520px" :footer="null">
      <a-list :data-source="printList" bordered>
        <template #renderItem="{ item }">
          <a-list-item>
            <a-list-item-meta :title="item.orderId" :description="item.carrier" />
            <a-button type="link">打印</a-button>
          </a-list-item>
        </template>
      </a-list>
      <div class="import-tip">勾选订单后可批量生成面单。</div>
    </a-modal>

    <a-drawer v-model:open="traceOpen" title="物流轨迹" width="480">
      <template v-if="currentTrace">
        <div class="trace-header">
          <div>{{ currentTrace.carrier }}</div>
          <div>{{ currentTrace.tracking }}</div>
        </div>
        <a-timeline>
          <a-timeline-item v-for="(log, index) in currentTrace.logs" :key="index">
            <div class="log-title">{{ log.action }}</div>
            <div class="log-meta">{{ log.time }}</div>
          </a-timeline-item>
        </a-timeline>
      </template>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import { hasPermission } from '../utils/permissions'

const statusOptions = [
  { label: '待发货', value: '待发货' },
  { label: '已发货', value: '已发货' },
  { label: '已签收', value: '已签收' },
  { label: '异常件', value: '异常件' },
]

const carrierOptions = [
  { label: '顺丰速运', value: '顺丰速运' },
  { label: '京东物流', value: '京东物流' },
  { label: '中通快递', value: '中通快递' },
  { label: '圆通速递', value: '圆通速递' },
]

const orders = [
  {
    key: 'o1',
    orderId: 'DD2026020417142',
    customer: '周女士',
    status: '待发货',
    carrier: '顺丰速运',
    tracking: 'SF1234567890',
    amount: '¥60',
    time: '2026-02-04 10:12',
    logs: [
      { time: '2026-02-04 12:00', action: '包裹已揽收' },
      { time: '2026-02-05 08:20', action: '到达济南转运中心' },
    ],
  },
  {
    key: 'o2',
    orderId: 'DD2026020310021',
    customer: '宋先生',
    status: '已发货',
    carrier: '京东物流',
    tracking: 'JD99887766',
    amount: '¥256',
    time: '2026-02-03 10:25',
    logs: [
      { time: '2026-02-03 12:00', action: '包裹已揽收' },
      { time: '2026-02-04 09:00', action: '派送中' },
    ],
  },
]

const columns = [
  { title: '订单号', dataIndex: 'orderId', key: 'orderId', width: 160 },
  { title: '客户', dataIndex: 'customer', key: 'customer', width: 120 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 120 },
  { title: '物流公司', dataIndex: 'carrier', key: 'carrier', width: 140 },
  { title: '运单号', key: 'tracking', width: 180 },
  { title: '订单金额', dataIndex: 'amount', key: 'amount', width: 120 },
  { title: '下单时间', dataIndex: 'time', key: 'time', width: 160 },
  { title: '操作', key: 'action', fixed: 'right', width: 160 },
]

dayjs.extend(isBetween)

const filters = reactive({
  orderId: '',
  status: '',
  carrier: '',
  dateRange: [] as string[],
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

const filteredOrders = computed(() => {
  const keyword = filters.orderId.trim()
  return orders.filter((item) => {
    const matchKeyword = !keyword || item.orderId.includes(keyword) || item.tracking.includes(keyword)
    const matchStatus = !filters.status || item.status === filters.status
    const matchCarrier = !filters.carrier || item.carrier === filters.carrier
    const matchDate =
      filters.dateRange.length === 0 ||
      dayjs(item.time).isBetween(filters.dateRange[0], filters.dateRange[1], 'day', '[]')
    return matchKeyword && matchStatus && matchCarrier && matchDate
  })
})

const statusColor = (status: string) => {
  if (status === '待发货') return 'orange'
  if (status === '已发货') return 'blue'
  if (status === '已签收') return 'green'
  return 'red'
}

const batchShipOpen = ref(false)
const importOpen = ref(false)
const printOpen = ref(false)
const traceOpen = ref(false)
const currentTrace = ref<typeof orders[0] | null>(null)

const batchForm = reactive({
  carrier: '顺丰速运',
  prefix: '',
  note: '',
})

const printList = [
  { orderId: 'DD2026020417142', carrier: '顺丰速运' },
  { orderId: 'DD2026020310021', carrier: '京东物流' },
]

const openBatchShip = () => {
  batchShipOpen.value = true
}

const openImport = () => {
  importOpen.value = true
}

const openPrint = () => {
  printOpen.value = true
}

const openTrace = (record: typeof orders[0]) => {
  currentTrace.value = record
  traceOpen.value = true
}

const resetFilters = () => {
  filters.orderId = ''
  filters.status = ''
  filters.carrier = ''
  filters.dateRange = []
}

const preventUpload = () => false

const getPopupContainer = (trigger: HTMLElement) => trigger?.parentNode || document.body
</script>

<style scoped>
.card-section {
  margin-bottom: 16px;
}

.filter-bar {
  row-gap: 8px;
}

.batch-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}

.modal-form {
  margin-top: 12px;
}

.import-tip {
  margin: 12px 0;
  color: var(--text-secondary);
}

.trace-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-weight: 600;
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
