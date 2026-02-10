<template>
  <div>
    <div class="page-title">结算管理</div>

    <a-card class="card-section">
      <a-tabs v-model:active-key="activeTab">
        <a-tab-pane key="payment" tab="打款单" />
        <a-tab-pane key="detail" tab="打款单明细" />
      </a-tabs>

      <a-form v-if="activeTab === 'payment'" layout="inline" class="filter-bar">
        <a-form-item label="供货商名称">
          <a-input v-model:value="paymentFilters.supplier" placeholder="请输入供货商名称" allow-clear />
        </a-form-item>
        <a-form-item label="结算日期">
          <a-range-picker v-model:value="paymentRange" :get-popup-container="getPopupContainer" />
        </a-form-item>
        <a-form-item label="是否结算">
          <a-select v-model:value="paymentFilters.status" :options="settleOptions" placeholder="全部" style="min-width: 120px" />
        </a-form-item>
        <a-form-item label="是否汇总">
          <a-switch v-model:checked="paymentFilters.summary" />
        </a-form-item>
        <a-space>
          <a-button type="primary">查询</a-button>
          <a-button @click="resetPayment">重置</a-button>
          <a-button>导出</a-button>
          <ColumnSetting :columns="paymentAllColumns" v-model="paymentVisible" @reset="resetPaymentColumns" />
        </a-space>
      </a-form>

      <a-form v-else layout="inline" class="filter-bar">
        <a-form-item label="供货商名称">
          <a-input v-model:value="detailFilters.supplier" placeholder="请输入供货商名称" allow-clear />
        </a-form-item>
        <a-form-item label="结算日期">
          <a-range-picker v-model:value="detailRange" :get-popup-container="getPopupContainer" />
        </a-form-item>
        <a-form-item label="是否结算">
          <a-select v-model:value="detailFilters.status" :options="settleOptions" placeholder="全部" style="min-width: 120px" />
        </a-form-item>
        <div class="summary-text">订单金额：<span>0</span> 元</div>
        <a-space>
          <a-button type="primary">查询</a-button>
          <a-button @click="resetDetail">重置</a-button>
          <a-button>导出</a-button>
          <ColumnSetting :columns="detailAllColumns" v-model="detailVisible" @reset="resetDetailColumns" />
        </a-space>
      </a-form>
    </a-card>

    <a-card>
      <a-table
        v-if="activeTab === 'payment'"
        :columns="paymentColumns"
        :data-source="filteredPayments"
        :pagination="{ pageSize: 8 }"
        :scroll="{ x: 1400 }"
        :loading="tableLoading"
        :locale="{ emptyText: h(TableEmpty, { description: '暂无结算数据' }) }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="getSettlementStatusMeta(record.status).color">{{ getSettlementStatusMeta(record.status).label }}</a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <template v-for="action in getSettlementActions(record)" :key="action.key">
                <a-button v-if="isActionAllowed(action)" type="link">{{ action.label }}</a-button>
              </template>
            </a-space>
          </template>
        </template>
      </a-table>

      <a-table
        v-else
        :columns="detailColumns"
        :data-source="filteredDetails"
        :pagination="{ pageSize: 8 }"
        :scroll="{ x: 1800 }"
        :loading="tableLoading"
        :locale="{ emptyText: h(TableEmpty, { description: '暂无明细数据' }) }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="getSettlementStatusMeta(record.status).color">{{ getSettlementStatusMeta(record.status).label }}</a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <template v-for="action in getSettlementActions(record)" :key="action.key">
                <a-button v-if="isActionAllowed(action)" type="link">{{ action.label }}</a-button>
              </template>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue'
import dayjs from 'dayjs'
import {
  settlementActionConfig,
  settlementStatusActions,
  settlementStatusConfig,
  type ActionDef,
} from '../utils/statusConfig'
import { fetchSettlementDetails, fetchSettlementPayments } from '../api/endpoints'
import { message } from 'ant-design-vue'
import ColumnSetting from '../components/ColumnSetting.vue'
import TableEmpty from '../components/TableEmpty.vue'
import { useColumnConfig } from '../utils/columnConfig'

const activeTab = ref('payment')

const settleOptions = [
  { label: '全部', value: '' },
  { label: '已结算', value: '已结算' },
  { label: '未结算', value: '未结算' },
]

const paymentAllColumns = [
  { title: '序号', dataIndex: 'index', key: 'index', width: 70 },
  { title: '供货商名称(收款人名称)', dataIndex: 'supplier', key: 'supplier', width: 200 },
  { title: '打款金额(元)', dataIndex: 'amount', key: 'amount', width: 120 },
  { title: '收款人账户', dataIndex: 'accountName', key: 'accountName', width: 140 },
  { title: '账号', dataIndex: 'account', key: 'account', width: 140 },
  { title: '联行号', dataIndex: 'bankNo', key: 'bankNo', width: 120 },
  { title: '开户行名称', dataIndex: 'bankName', key: 'bankName', width: 160 },
  { title: '商户名称', dataIndex: 'merchant', key: 'merchant', width: 120 },
  { title: '结算日期', dataIndex: 'settleDate', key: 'settleDate', width: 120 },
  { title: '部门名称', dataIndex: 'dept', key: 'dept', width: 120 },
  { title: '商户类型', dataIndex: 'merchantType', key: 'merchantType', width: 120 },
  { title: '结算状态', dataIndex: 'status', key: 'status', width: 120 },
  { title: '操作', key: 'action', fixed: 'right', width: 120 },
]

const detailAllColumns = [
  { title: '序号', dataIndex: 'index', key: 'index', width: 70 },
  { title: '资金方向', dataIndex: 'direction', key: 'direction', width: 120 },
  { title: '打款金额(元)', dataIndex: 'amount', key: 'amount', width: 120 },
  { title: '商品名称(SKU名称)', dataIndex: 'skuName', key: 'skuName', width: 180 },
  { title: '品类名称(SPU名称)', dataIndex: 'spuName', key: 'spuName', width: 180 },
  { title: '商品数量', dataIndex: 'quantity', key: 'quantity', width: 100 },
  { title: '商品售价', dataIndex: 'price', key: 'price', width: 100 },
  { title: '成本价', dataIndex: 'cost', key: 'cost', width: 100 },
  { title: '商品折扣', dataIndex: 'discount', key: 'discount', width: 100 },
  { title: '扣点金额', dataIndex: 'deduct', key: 'deduct', width: 100 },
  { title: '税率', dataIndex: 'taxRate', key: 'taxRate', width: 80 },
  { title: '税码', dataIndex: 'taxCode', key: 'taxCode', width: 100 },
  { title: '原订单号', dataIndex: 'orderId', key: 'orderId', width: 140 },
  { title: '结算日期', dataIndex: 'settleDate', key: 'settleDate', width: 120 },
  { title: '下单日期/退款申请日期', dataIndex: 'orderDate', key: 'orderDate', width: 160 },
  { title: '支付完成时间/退款完成时间', dataIndex: 'payDate', key: 'payDate', width: 180 },
  { title: '供货商名称(收款人名称)', dataIndex: 'supplier', key: 'supplier', width: 200 },
  { title: '商户名称', dataIndex: 'merchant', key: 'merchant', width: 120 },
  { title: '结算状态', dataIndex: 'status', key: 'status', width: 120 },
  { title: '操作', key: 'action', fixed: 'right', width: 120 },
]

const { visibleKeys: paymentVisible, filteredColumns: paymentColumns, reset: resetPaymentColumns } = useColumnConfig(
  'columns:settlements:payment',
  paymentAllColumns
)

const { visibleKeys: detailVisible, filteredColumns: detailColumns, reset: resetDetailColumns } = useColumnConfig(
  'columns:settlements:detail',
  detailAllColumns
)

const tableLoading = ref(false)

const paymentData = [
  {
    key: 'p1',
    index: 1,
    supplier: '济南新大友蔬菜批发有限公司',
    amount: '12,400',
    accountName: '张三',
    account: '6222 **** 8899',
    bankNo: '102100099996',
    bankName: '中国工商银行济南分行',
    merchant: '拼京宝旗舰店',
    settleDate: '2026-02-04',
    dept: '华北事业部',
    merchantType: '自营',
    status: '已结算',
  },
]

const detailData = [
  {
    key: 'd1',
    index: 1,
    direction: '收入',
    amount: '240.00',
    skuName: '猫爬架四层大型豪华猫玩具',
    spuName: '猫咪用品',
    quantity: 1,
    price: '256.00',
    cost: '128.00',
    discount: '0',
    deduct: '8.00',
    taxRate: '3%',
    taxCode: '3010',
    orderId: 'DD2026020310021',
    settleDate: '2026-02-04',
    orderDate: '2026-02-03',
    payDate: '2026-02-03 10:25',
    supplier: '济南三胖子牛羊肉有限公司',
    merchant: '拼京宝旗舰店',
    status: '已结算',
  },
]

const USE_REMOTE = false

onMounted(async () => {
  if (!USE_REMOTE) return
  try {
    const [payments, details] = await Promise.all([
      fetchSettlementPayments({
        supplier: paymentFilters.value.supplier,
        status: paymentFilters.value.status,
        startDate: paymentFilters.value.dateRange[0],
        endDate: paymentFilters.value.dateRange[1],
        summary: paymentFilters.value.summary,
      }),
      fetchSettlementDetails({
        supplier: detailFilters.value.supplier,
        status: detailFilters.value.status,
        startDate: detailFilters.value.dateRange[0],
        endDate: detailFilters.value.dateRange[1],
      }),
    ])
    paymentData.splice(0, paymentData.length, ...payments.list)
    detailData.splice(0, detailData.length, ...details.list)
  } catch (error) {
    message.error('结算数据加载失败，请检查接口配置')
  }
})

const paymentFilters = ref({
  supplier: '',
  status: '',
  summary: false,
  dateRange: [] as string[],
})

const detailFilters = ref({
  supplier: '',
  status: '',
  dateRange: [] as string[],
})

const getSettlementStatusMeta = (status: string) =>
  settlementStatusConfig[status] ?? { label: status, color: 'default' }

const isActionAllowed = (action: ActionDef) => !action.permission

const getSettlementActions = (record: { status: string }) => {
  const keys = settlementStatusActions[record.status] ?? ['view']
  return keys.map((key) => settlementActionConfig[key]).filter(Boolean).filter(isActionAllowed)
}

const paymentRange = computed({
  get: () => {
    if (paymentFilters.value.dateRange.length === 2) {
      return [dayjs(paymentFilters.value.dateRange[0]), dayjs(paymentFilters.value.dateRange[1])]
    }
    return null
  },
  set: (value) => {
    if (!value || value.length !== 2) {
      paymentFilters.value.dateRange = []
      return
    }
    paymentFilters.value.dateRange = [value[0].format('YYYY-MM-DD'), value[1].format('YYYY-MM-DD')]
  },
})

const detailRange = computed({
  get: () => {
    if (detailFilters.value.dateRange.length === 2) {
      return [dayjs(detailFilters.value.dateRange[0]), dayjs(detailFilters.value.dateRange[1])]
    }
    return null
  },
  set: (value) => {
    if (!value || value.length !== 2) {
      detailFilters.value.dateRange = []
      return
    }
    detailFilters.value.dateRange = [value[0].format('YYYY-MM-DD'), value[1].format('YYYY-MM-DD')]
  },
})

const filteredPayments = computed(() => {
  const keyword = paymentFilters.value.supplier.trim()
  return paymentData.filter((item) => {
    const matchSupplier = !keyword || item.supplier.includes(keyword)
    const matchStatus = !paymentFilters.value.status || item.status === paymentFilters.value.status
    return matchSupplier && matchStatus
  })
})

const filteredDetails = computed(() => {
  const keyword = detailFilters.value.supplier.trim()
  return detailData.filter((item) => {
    const matchSupplier = !keyword || item.supplier.includes(keyword)
    const matchStatus = !detailFilters.value.status || item.status === detailFilters.value.status
    return matchSupplier && matchStatus
  })
})

const resetPayment = () => {
  paymentFilters.value = { supplier: '', status: '', summary: false, dateRange: [] }
}

const resetDetail = () => {
  detailFilters.value = { supplier: '', status: '', dateRange: [] }
}

const getPopupContainer = (trigger: HTMLElement) => trigger?.parentNode || document.body
</script>

<style scoped>
.card-section {
  margin-bottom: 16px;
}

.filter-bar {
  margin-bottom: 12px;
  row-gap: 8px;
}

.summary-text {
  margin: 0 16px 8px 0;
  color: var(--text-secondary);
}

.summary-text span {
  color: #16a34a;
  font-weight: 600;
}
</style>
