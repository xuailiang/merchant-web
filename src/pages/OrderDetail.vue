<template>
  <div class="order-detail">
    <div class="page-title">订单详情</div>

    <a-card class="card-section">
      <div class="order-header">订单号：{{ order.id }}</div>
      <a-table :columns="summaryColumns" :data-source="summaryRows" :pagination="false" size="small">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'product'">
            <div class="product-cell">
              <img :src="record.image" alt="商品" />
              <div>
                <div class="product-title">{{ record.name }}</div>
                <div class="product-meta">{{ record.sku }}</div>
              </div>
            </div>
          </template>
        </template>
      </a-table>
      <div class="order-summary">
        <div class="summary-row">
          <span class="summary-label">是否使用平台券</span>
          <span class="summary-value">{{ order.coupon ? '是' : '否' }}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">积分信息</span>
          <span class="summary-value">赠送积分：{{ order.points }}，使用积分：{{ order.usedPoints }}，抵扣额：¥{{ order.pointDiscount }}</span>
        </div>
        <div class="summary-total">
          <span>商品总额 ¥{{ order.goodsTotal }}</span>
          <span>运费 ¥{{ order.freight }}</span>
          <span class="summary-total-amount">订单总额：¥{{ order.orderTotal }}</span>
        </div>
      </div>
    </a-card>

    <a-card class="card-section status-card" title="订单状态">
      <div class="status-track">
        <div
          v-for="(node, index) in statusNodes"
          :key="node"
          class="status-step"
          :class="{ active: index <= currentStatusIndex }"
        >
          <div class="step-dot"></div>
          <div class="step-label">{{ node }}</div>
          <div v-if="index < statusNodes.length - 1" class="step-line"></div>
        </div>
      </div>
      <a-descriptions :column="2" size="small" class="status-desc">
        <a-descriptions-item label="订单编号">{{ order.id }}</a-descriptions-item>
        <a-descriptions-item label="订单状态">{{ order.status }}</a-descriptions-item>
        <a-descriptions-item label="订单总额">¥{{ order.orderTotal }}</a-descriptions-item>
        <a-descriptions-item label="下单时间">{{ order.orderTime }}</a-descriptions-item>
      </a-descriptions>
    </a-card>

    <div class="detail-grid">
      <a-card class="card-section" title="收货人/地址/物流信息">
        <a-descriptions :column="1" size="small">
          <a-descriptions-item label="收货人">{{ order.receiver }}</a-descriptions-item>
          <a-descriptions-item label="联系电话">{{ order.phone }}</a-descriptions-item>
          <a-descriptions-item label="收货地址">{{ order.address }}</a-descriptions-item>
          <a-descriptions-item label="物流公司">{{ order.logistics.carrier }}</a-descriptions-item>
          <a-descriptions-item label="物流单号">{{ order.logistics.tracking }}</a-descriptions-item>
          <a-descriptions-item label="发货时间">{{ order.logistics.shipTime }}</a-descriptions-item>
        </a-descriptions>
      </a-card>

      <a-card class="card-section" title="支付信息">
        <a-descriptions :column="1" size="small">
          <a-descriptions-item label="支付方式">{{ order.payMethod }}</a-descriptions-item>
          <a-descriptions-item label="支付金额">¥{{ order.payAmount }}</a-descriptions-item>
          <a-descriptions-item label="支付时间">{{ order.payTime }}</a-descriptions-item>
          <a-descriptions-item label="支付订单">{{ order.payId }}</a-descriptions-item>
        </a-descriptions>
      </a-card>

      <a-card class="card-section" title="发票信息">
        <a-descriptions :column="1" size="small">
          <a-descriptions-item label="发票类型">{{ order.invoice.type }}</a-descriptions-item>
          <a-descriptions-item label="发票抬头">{{ order.invoice.title }}</a-descriptions-item>
          <a-descriptions-item label="发票内容">{{ order.invoice.content }}</a-descriptions-item>
          <a-descriptions-item label="资源编码">{{ order.invoice.code }}</a-descriptions-item>
          <a-descriptions-item label="税号">{{ order.invoice.taxNo }}</a-descriptions-item>
        </a-descriptions>
      </a-card>

      <a-card class="card-section" title="订单轨迹">
        <a-timeline>
          <a-timeline-item v-for="(log, index) in order.logs" :key="index">
            <div class="log-title">{{ log.action }}</div>
            <div class="log-meta">{{ log.time }}</div>
          </a-timeline-item>
        </a-timeline>
      </a-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const order = {
  id: (route.params.id as string) ?? 'DD20251205170346997142',
  orderTime: '2025-12-05 17:03:46',
  status: '取消',
  goodsTotal: 55,
  freight: 5,
  orderTotal: 60,
  coupon: false,
  points: 0,
  usedPoints: 0,
  pointDiscount: 0,
  payMethod: '暂未获取到支付信息',
  payAmount: 60,
  payTime: '暂未获取到支付信息',
  payId: 'DD20251205170346997142',
  receiver: 'admin',
  phone: '13567546709',
  address: '山东省济南市历下区新泺大街888号',
  logistics: {
    carrier: '顺丰速运',
    tracking: 'SF1234567890',
    shipTime: '2025-12-06 10:12:20',
  },
  payChannel: '线上',
  invoice: {
    type: '/',
    title: '/',
    content: '/',
    code: '/',
    taxNo: '/',
  },
  items: [
    {
      key: 'i1',
      name: '测试1129 颜色 包色 内存 4G 容量规格 128GBx1',
      sku: 'SPU: 1002251200002102 | 10022512000021',
      price: 55,
      paid: 60,
      discount: 0,
      freight: 5,
      status: '取消',
      image: 'https://picsum.photos/seed/detail1/80/80',
    },
  ],
  logs: [
    { time: '2025-12-05 17:03:46', action: '13567546709 于 2025-12-05 17:03:46 提交订单操作 自有订单创建 ====> 操作' },
    { time: '2025-12-05 17:08:46', action: '系统调用于 2025-12-05 17:08:46 提交订单操作 订单查询成功，支付中状态：DD2025120517034699714' },
  ],
}

const summaryColumns = [
  { title: '商品名称', key: 'product' },
  { title: '订单单价', dataIndex: 'price', key: 'price' },
  { title: '实收金额', dataIndex: 'paid', key: 'paid' },
  { title: '手工折扣金额', dataIndex: 'discount', key: 'discount' },
  { title: '运费金额', dataIndex: 'freight', key: 'freight' },
  { title: '订单状态', dataIndex: 'status', key: 'status' },
]

const summaryRows = order.items

const statusNodes = ['待支付', '待发货', '待收货', '交易完成', '取消', '退款完成', '交易关闭']
const currentStatusIndex = computed(() => {
  const index = statusNodes.indexOf(order.status)
  return index === -1 ? 1 : index
})
</script>

<style scoped>
.order-detail {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card-section {
  margin-bottom: 16px;
}

.order-header {
  font-weight: 600;
  margin-bottom: 12px;
}

.order-summary {
  margin-top: 12px;
  display: grid;
  gap: 10px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 10px;
  border: 1px solid var(--border-color);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: var(--text-secondary);
}

.summary-label {
  font-size: 12px;
}

.summary-value {
  color: var(--text-primary);
  font-weight: 500;
}

.summary-total {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-weight: 600;
  color: var(--text-primary);
}

.summary-total-amount {
  color: #ef4444;
}

.status-card :deep(.ant-card-body) {
  padding-top: 8px;
}

.status-track {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 8px;
  margin-bottom: 16px;
}

.status-step {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  color: var(--text-secondary);
}

.step-dot {
  width: 12px;
  height: 12px;
  border-radius: 999px;
  background: #e2e8f0;
  border: 2px solid #e2e8f0;
  z-index: 1;
}

.step-label {
  font-size: 12px;
  text-align: center;
}

.step-line {
  position: absolute;
  top: 6px;
  left: 50%;
  width: 100%;
  height: 2px;
  background: #e2e8f0;
  z-index: 0;
}

.status-step.active {
  color: #1d4ed8;
}

.status-step.active .step-dot {
  background: #3b82f6;
  border-color: #3b82f6;
}

.status-step.active ~ .status-step .step-dot {
  background: #e2e8f0;
  border-color: #e2e8f0;
}

.status-step.active ~ .status-step .step-line {
  background: #e2e8f0;
}

.status-step.active .step-line {
  background: #3b82f6;
}

.status-desc {
  background: #f8fafc;
  padding: 12px;
  border-radius: 10px;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
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

@media (max-width: 1200px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }

  .status-track {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
