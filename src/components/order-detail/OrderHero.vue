<template>
  <a-card id="section-overview" class="od-hero od-fade-in" :body-style="{ padding: '16px' }">
    <div class="od-hero-grid">
      <div class="od-hero-left">
        <div class="od-order-id">
          订单号：<span class="mono">{{ order.id }}</span>
        </div>
        <div class="od-meta-row">
          <span>下单时间：{{ order.orderTime }}</span>
          <span>支付单号：{{ order.payId }}</span>
        </div>
        <div class="od-meta-tags">
          <a-tag :color="statusColor">{{ order.status }}</a-tag>
          <a-tag :color="order.settlement === '已结算' ? 'green' : 'orange'">{{
            order.settlement
          }}</a-tag>
          <a-tag v-if="order.coupon" color="blue">平台券</a-tag>
          <a-tag v-for="risk in risks" :key="risk" color="red">{{ risk }}</a-tag>
        </div>
      </div>

      <div class="od-hero-middle">
        <div class="od-current-status">
          <span class="label">当前阶段</span>
          <strong>{{ currentStage }}</strong>
        </div>
        <div class="od-sla">
          <span class="label">履约 SLA</span>
          <span class="value" :class="{ danger: slaDanger }">{{ slaText }}</span>
        </div>
      </div>

      <div class="od-hero-actions">
        <a-space wrap>
          <a-button type="primary" @click="$emit('primaryAction')">{{ primaryAction }}</a-button>
          <a-button @click="$emit('copyOrder')">复制订单号</a-button>
          <a-dropdown>
            <a-button>
              更多操作
              <DownOutlined />
            </a-button>
            <template #overlay>
              <a-menu>
                <a-menu-item @click="$emit('editRemark')">修改备注</a-menu-item>
                <a-menu-item @click="$emit('openAfterSales')">查看售后</a-menu-item>
                <a-menu-item @click="$emit('openLogs')">查看轨迹</a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </a-space>
      </div>
    </div>
  </a-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { DownOutlined } from '@ant-design/icons-vue'
import type { OrderDetailViewModel, OrderActionType } from '../../types/orderDetail'

const props = defineProps<{
  order: OrderDetailViewModel
  primaryAction: OrderActionType
  risks: string[]
  slaText: string
  slaDanger: boolean
}>()

defineEmits<{
  (e: 'primaryAction'): void
  (e: 'copyOrder'): void
  (e: 'editRemark'): void
  (e: 'openAfterSales'): void
  (e: 'openLogs'): void
}>()

const statusColor = computed(() => {
  if (props.order.status === '交易完成') return 'green'
  if (props.order.status === '待发货') return 'blue'
  if (props.order.status === '待收货') return 'cyan'
  if (props.order.status.includes('退款')) return 'orange'
  if (props.order.status === '取消' || props.order.status === '交易关闭') return 'default'
  return 'processing'
})

const currentStage = computed(() => {
  if (props.order.status.includes('退款')) return '售后处理'
  if (props.order.status === '待发货') return '履约待发货'
  if (props.order.status === '待收货') return '在途配送'
  if (props.order.status === '交易完成') return '履约完成'
  if (props.order.status === '待支付') return '待支付确认'
  return '归档/关闭'
})
</script>
