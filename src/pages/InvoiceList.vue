<template>
  <div>
    <div class="page-title">发票管理</div>
    <a-card class="card-section">
      <a-form layout="inline" class="filter-bar">
        <a-form-item label="发票单号">
          <a-input v-model:value="filters.invoiceNo" placeholder="请输入发票单号" allow-clear />
        </a-form-item>
        <a-form-item label="发票月份">
          <a-date-picker v-model:value="filters.month" picker="month" :get-popup-container="getPopupContainer" />
        </a-form-item>
        <a-form-item label="发票状态">
          <a-select v-model:value="filters.status" :options="statusOptions" placeholder="全部" style="min-width: 120px" />
        </a-form-item>
        <a-space>
          <a-button type="primary">查询</a-button>
          <a-button @click="resetFilters">重置</a-button>
        </a-space>
      </a-form>
    </a-card>

    <a-card>
      <a-table :columns="columns" :data-source="rows" :pagination="{ pageSize: 10 }" :scroll="{ x: 1500 }">
        <template #bodyCell="{ column }">
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button type="link" @click="openDetail()">查看结算明细</a-button>
              <a-button type="link">上传发票</a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <a-modal v-model:open="detailOpen" width="1100px" title="结算明细" :footer="null">
      <div class="detail-actions">
        <a-button type="primary">导出</a-button>
      </div>
      <a-table :columns="detailColumns" :data-source="detailRows" :pagination="{ pageSize: 8 }" :scroll="{ x: 1400 }" />
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const statusOptions = [
  { label: '全部', value: '' },
  { label: '待开票', value: '待开票' },
  { label: '已开票', value: '已开票' },
]

const columns = [
  { title: '发票单号', dataIndex: 'id', key: 'id', width: 160 },
  { title: '开票单位', dataIndex: 'company', key: 'company', width: 180 },
  { title: '店铺名称', dataIndex: 'store', key: 'store', width: 140 },
  { title: '发票月份', dataIndex: 'month', key: 'month', width: 120 },
  { title: '结算周期', dataIndex: 'period', key: 'period', width: 160 },
  { title: '应结算金额（元）', dataIndex: 'payable', key: 'payable', width: 140 },
  { title: '调账金额（元）', dataIndex: 'adjust', key: 'adjust', width: 140 },
  { title: '实际金额（元）', dataIndex: 'actual', key: 'actual', width: 140 },
  { title: '开票金额（元）', dataIndex: 'invoiceAmount', key: 'invoiceAmount', width: 140 },
  { title: '发票状态', dataIndex: 'status', key: 'status', width: 120 },
  { title: '操作', key: 'action', fixed: 'right', width: 160 },
]

const rows = [
  {
    key: 'i1',
    id: 'IO202510280944539953',
    company: '济南新大友蔬菜批发有限公司',
    store: '拼京宝旗舰店',
    month: '2025-10',
    period: '20251020-20251026',
    payable: 241,
    adjust: 0,
    actual: 241,
    invoiceAmount: 245,
    status: '待开票',
  },
  {
    key: 'i2',
    id: 'IO202510280944539954',
    company: '拼京宝旗舰店',
    store: '拼京宝旗舰店',
    month: '2025-10',
    period: '20251020-20251026',
    payable: 109,
    adjust: 0,
    actual: 109,
    invoiceAmount: 109,
    status: '待开票',
  },
]

const detailColumns = [
  { title: '商户名称', dataIndex: 'merchant', key: 'merchant', width: 160 },
  { title: '店铺名称', dataIndex: 'store', key: 'store', width: 160 },
  { title: '订单编号', dataIndex: 'orderId', key: 'orderId', width: 180 },
  { title: '订单总金额（元）', dataIndex: 'orderTotal', key: 'orderTotal', width: 140 },
  { title: '订单退款金额（元）', dataIndex: 'refund', key: 'refund', width: 140 },
  { title: '订单实际结算金额（元）', dataIndex: 'actual', key: 'actual', width: 160 },
  { title: '商品名称', dataIndex: 'product', key: 'product', width: 160 },
  { title: '商品数量', dataIndex: 'qty', key: 'qty', width: 100 },
  { title: '商品金额', dataIndex: 'goodsAmount', key: 'goodsAmount', width: 120 },
  { title: '商品税率', dataIndex: 'taxRate', key: 'taxRate', width: 100 },
  { title: '税收编码', dataIndex: 'taxCode', key: 'taxCode', width: 120 },
]

const detailRows = [
  {
    key: 'r1',
    merchant: '山东京宝淘东有限公司',
    store: '拼京宝旗舰店',
    orderId: 'DD20251020142725994878',
    orderTotal: 152,
    refund: 0,
    actual: 102,
    product: '渴望猫粮 100g',
    qty: 1,
    goodsAmount: 150,
    taxRate: 0.03,
    taxCode: '666666',
  },
]

const filters = ref({
  invoiceNo: '',
  month: null as any,
  status: '',
})

const detailOpen = ref(false)

const openDetail = () => {
  detailOpen.value = true
}

const resetFilters = () => {
  filters.value = { invoiceNo: '', month: null, status: '' }
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

.detail-actions {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 12px;
}
</style>
