<template>
  <div>
    <div class="page-title">发票管理明细</div>
    <a-card class="card-section">
      <a-button type="primary">导出</a-button>
    </a-card>
    <a-card>
      <a-table :columns="columns" :data-source="rows" :pagination="{ pageSize: 10 }" :scroll="{ x: 1500 }" />
    </a-card>
  </div>
</template>

<script setup lang="ts">
const columns = [
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

const rows = [
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
</script>

<style scoped>
.card-section {
  margin-bottom: 16px;
}
</style>
