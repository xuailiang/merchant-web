<template>
  <div class="order-detail-page">
    <a-breadcrumb>
      <a-breadcrumb-item>首页</a-breadcrumb-item>
      <a-breadcrumb-item>订单管理</a-breadcrumb-item>
      <a-breadcrumb-item>订单详情</a-breadcrumb-item>
    </a-breadcrumb>

    <div class="od-head">
      <div>
        <div class="page-title">订单详情</div>
        <div class="od-subtitle">履约指挥视图：状态判断、金额核对、包裹追踪与异常处理</div>
      </div>
      <a-space>
        <a-button @click="openSection('logs')">查看轨迹</a-button>
        <a-button type="primary" @click="runPrimaryAction">{{ primaryAction }}</a-button>
      </a-space>
    </div>

    <OrderHero
      :order="order"
      :primary-action="primaryAction"
      :risks="riskTags"
      :sla-text="slaText"
      :sla-danger="isSlaDanger"
      @primary-action="runPrimaryAction"
      @copy-order="copyOrderId"
      @edit-remark="message.info('备注编辑能力已预留')"
      @open-after-sales="goAfterSales"
      @open-logs="openSection('logs')"
    />

    <div class="od-nav-sticky">
      <OrderSectionNav :items="sections" :active-key="activeSection" @select="openSection" />
    </div>

    <div class="od-mobile-nav">
      <a-button @click="mobileNavOpen = true">目录导航</a-button>
    </div>

    <a-drawer v-model:open="mobileNavOpen" title="目录导航" placement="left" width="240">
      <OrderSectionNav
        vertical
        :items="sections"
        :active-key="activeSection"
        @select="onMobileSelect"
      />
    </a-drawer>

    <div class="od-layout">
      <div class="od-main">
        <a-card id="section-overview" title="订单概览" class="od-section-card od-fade-in">
          <a-steps :current="stepIndex" size="small">
            <a-step v-for="node in statusNodes" :key="node" :title="node" />
          </a-steps>
          <a-alert
            v-if="exceptionStatus"
            class="card-section"
            type="warning"
            show-icon
            :message="`异常状态：${exceptionStatus}`"
          />
          <a-space wrap>
            <a-tag color="blue">下单号码：{{ order.phone }}</a-tag>
            <a-tag color="purple">赠送积分：{{ order.points }}</a-tag>
            <a-tag color="orange">使用积分：{{ order.usedPoints }}</a-tag>
          </a-space>
        </a-card>

        <AmountBreakdown
          :amount="order.amount"
          :pay-method="order.payMethod"
          :pay-time="order.payTime"
          :pay-id="order.payId"
        />

        <PackageBoard
          mode="items"
          :packages="order.packages"
          :items="order.items"
          @copy-tracking="copyTracking"
        />

        <PackageBoard
          mode="logistics"
          :packages="order.packages"
          :items="order.items"
          @copy-tracking="copyTracking"
        />
      </div>

      <div class="od-side">
        <a-card class="od-side-card od-fade-in">
          <template #title>履约建议</template>
          <ul class="od-advice-list">
            <li>
              当前主动作建议：<strong>{{ primaryAction }}</strong>
            </li>
            <li>
              异常包裹：<strong>{{ riskPackageCount }}</strong> 个，建议优先处理。
            </li>
            <li>
              优惠合计：<strong>¥{{ totalDiscount }}</strong
              >，建议核验活动归因。
            </li>
            <li v-if="isSlaDanger">SLA 已接近超时，建议立即履约。</li>
          </ul>
        </a-card>

        <a-card id="section-consignee" title="收货与发票" class="od-side-card od-fade-in">
          <div class="od-consignee-row">
            <span class="label">收货人</span>
            <span class="value">{{ order.receiver }}</span>
          </div>
          <div class="od-consignee-row">
            <span class="label">联系电话</span>
            <span class="value">{{ order.phone }}</span>
          </div>
          <div class="od-consignee-row">
            <span class="label">收货地址</span>
            <span class="value">{{ order.address }}</span>
          </div>
          <div class="od-consignee-row">
            <span class="label">发票类型</span>
            <span class="value">{{ order.invoice.type }}</span>
          </div>
          <div class="od-consignee-row">
            <span class="label">发票抬头</span>
            <span class="value">{{ order.invoice.title }}</span>
          </div>
          <div class="od-consignee-row">
            <span class="label">发票内容</span>
            <span class="value">{{ order.invoice.content }}</span>
          </div>
          <div class="od-consignee-row">
            <span class="label">税号</span>
            <span class="value">{{ order.invoice.taxNo }}</span>
          </div>
        </a-card>

        <OrderTimeline :logs="order.logs" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import dayjs from 'dayjs'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import OrderHero from '../components/order-detail/OrderHero.vue'
import OrderSectionNav from '../components/order-detail/OrderSectionNav.vue'
import AmountBreakdown from '../components/order-detail/AmountBreakdown.vue'
import PackageBoard from '../components/order-detail/PackageBoard.vue'
import OrderTimeline from '../components/order-detail/OrderTimeline.vue'
import type { OrderActionType, OrderDetailViewModel, OrderSectionKey } from '../types/orderDetail'
import '../styles/order-detail.css'

const route = useRoute()
const router = useRouter()

const order = ref<OrderDetailViewModel>({
  id: (route.params.id as string) ?? 'DD20251205170346997142',
  orderTime: '2025-12-05 17:03:46',
  status: '待发货',
  settlement: '未结算',
  coupon: true,
  payMethod: '微信支付',
  payTime: '2025-12-05 17:07:03',
  payId: 'WX20251205170346997142',
  receiver: '徐爱亮',
  phone: '13589090329',
  address: '山东省济南市历下区新泺大街888号',
  points: 0,
  usedPoints: 0,
  shippingDeadline: '2025-12-05 19:03:46',
  amount: {
    goodsTotal: 55,
    freight: 5,
    platformCoupon: 8,
    storeCoupon: 5,
    campaignDiscount: 6,
    shippingCoupon: 2,
    otherDiscount: 0,
    pointDiscount: 0,
    orderTotal: 60,
    payAmount: 39,
  },
  invoice: {
    type: '电子普票',
    title: '山东京宝淘东有限公司',
    content: '商品明细',
    taxNo: '91370100MA3A00001X',
  },
  packages: [
    {
      id: 'PKG001',
      carrier: '顺丰速运',
      tracking: 'SF1234567890',
      shipTime: '2025-12-06 10:12:20',
      status: '运输中',
      items: ['i1'],
      traces: [
        { time: '2025-12-06 10:12:20', desc: '顺丰速运 已收取快件' },
        { time: '2025-12-06 14:30:00', desc: '快件到达【济南高新集散中心】' },
        { time: '2025-12-06 18:00:00', desc: '快件已发往【北京顺义集散中心】' },
        { time: '2025-12-07 10:13:00', desc: '快件派送中，派件员：张三' },
      ],
    },
    {
      id: 'PKG002',
      carrier: '中通快递',
      tracking: 'ZT9876543210',
      shipTime: '2025-12-06 11:00:00',
      status: '运输异常',
      items: ['i2'],
      traces: [
        { time: '2025-12-06 11:00:00', desc: '中通快递 已揽收' },
        { time: '2025-12-07 09:00:00', desc: '快件已到达【北京朝阳区网点】' },
        { time: '2025-12-07 15:30:00', desc: '包裹外箱破损，转异常件处理' },
      ],
    },
  ],
  items: [
    {
      key: 'i1',
      packageId: 'PKG001',
      name: '测试1129 颜色 包色 内存 4G 容量规格 128GBx1',
      sku: 'SPU: 1002251200002102 | 10022512000021',
      price: 55,
      qty: 1,
      paid: 39,
      discount: 16,
      freight: 5,
      image: 'https://picsum.photos/seed/detail1/80/80',
    },
    {
      key: 'i2',
      packageId: 'PKG002',
      name: '配件-充电器',
      sku: 'SKU: PJ-CHARGER-01',
      price: 19,
      qty: 1,
      paid: 0,
      discount: 0,
      freight: 0,
      image: 'https://picsum.photos/seed/detail2/80/80',
    },
  ],
  logs: [
    {
      id: 'l1',
      category: '系统',
      time: '2025-12-05 17:03:46',
      action: '用户提交订单，系统创建订单成功',
    },
    { id: 'l2', category: '支付', time: '2025-12-05 17:07:03', action: '支付成功，订单进入待发货' },
    { id: 'l3', category: '发货', time: '2025-12-06 10:12:20', action: '包裹 PKG001 已发货' },
    { id: 'l4', category: '发货', time: '2025-12-06 11:00:00', action: '包裹 PKG002 已发货' },
    {
      id: 'l5',
      category: '售后',
      time: '2025-12-07 15:40:00',
      action: '客户反馈包裹破损，进入异常处理',
    },
  ],
})

const statusNodes = ['待支付', '待发货', '待收货', '待签收', '交易完成']

const stepIndex = computed(() => {
  const index = statusNodes.indexOf(order.value.status)
  if (index >= 0) return index
  if (order.value.status.includes('退款')) return 2
  if (order.value.status === '取消' || order.value.status === '交易关闭') return 1
  return 0
})

const exceptionStatus = computed(() => {
  if (statusNodes.includes(order.value.status)) return ''
  return order.value.status
})

const riskTags = computed(() => {
  const tags: string[] = []
  if (order.value.status.includes('退款')) tags.push('退款中')
  if (riskPackageCount.value > 0) tags.push('异常件')
  if (isSlaDanger.value && order.value.status === '待发货') tags.push('SLA风险')
  return tags
})

const riskPackageCount = computed(
  () =>
    order.value.packages.filter(
      (pkg) =>
        pkg.status.includes('异常') || pkg.status.includes('退回') || pkg.status.includes('拦截')
    ).length
)

const totalDiscount = computed(() => {
  const amount = order.value.amount
  return (
    amount.platformCoupon +
    amount.storeCoupon +
    amount.campaignDiscount +
    amount.shippingCoupon +
    amount.otherDiscount +
    amount.pointDiscount
  )
})

const slaText = computed(() => {
  if (order.value.status !== '待发货') return '当前无需发货 SLA'
  const diff = dayjs(order.value.shippingDeadline).diff(dayjs(), 'minute')
  if (diff <= 0) return '已超时'
  const h = Math.floor(diff / 60)
  const m = diff % 60
  return `${h}小时${m}分钟内需发货`
})

const isSlaDanger = computed(() => {
  if (order.value.status !== '待发货') return false
  const diff = dayjs(order.value.shippingDeadline).diff(dayjs(), 'minute')
  return diff <= 60
})

const primaryAction = computed<OrderActionType>(() => {
  const status = order.value.status
  if (status === '待支付') return '催付'
  if (status === '待发货') return '立即发货'
  if (status === '待收货') return '查看物流'
  if (status.includes('退款')) return '处理售后'
  if (status === '交易完成' || status === '取消' || status === '交易关闭') return '查看归档'
  return '查看订单'
})

const sections = computed<Array<{ key: OrderSectionKey; label: string; badge?: string }>>(() => [
  { key: 'overview', label: '订单概览' },
  { key: 'amount', label: '金额与优惠' },
  { key: 'items', label: '商品与包裹', badge: String(order.value.packages.length) },
  { key: 'logistics', label: '物流轨迹' },
  { key: 'consignee', label: '收货与发票' },
  { key: 'logs', label: '操作轨迹', badge: String(order.value.logs.length) },
])

const activeSection = ref<OrderSectionKey>('overview')
const mobileNavOpen = ref(false)

const sectionToIdMap: Record<OrderSectionKey, string> = {
  overview: 'section-overview',
  amount: 'section-amount',
  items: 'section-items',
  logistics: 'section-logistics',
  consignee: 'section-consignee',
  logs: 'section-logs',
}

const openSection = (key: OrderSectionKey) => {
  const id = sectionToIdMap[key]
  const el = document.getElementById(id)
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  activeSection.value = key
}

const onMobileSelect = (key: OrderSectionKey) => {
  mobileNavOpen.value = false
  openSection(key)
}

const syncActiveSection = () => {
  const offset = 132
  const current = (Object.keys(sectionToIdMap) as OrderSectionKey[]).find((key) => {
    const el = document.getElementById(sectionToIdMap[key])
    if (!el) return false
    const rect = el.getBoundingClientRect()
    return rect.top - offset <= 20 && rect.bottom - offset >= 20
  })
  if (current) activeSection.value = current
}

onMounted(() => {
  window.addEventListener('scroll', syncActiveSection, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', syncActiveSection)
})

const copyTracking = async (tracking: string) => {
  try {
    await navigator.clipboard.writeText(tracking)
    message.success('快递单号已复制')
  } catch {
    message.warning('复制失败，请手动复制')
  }
}

const copyOrderId = async () => {
  try {
    await navigator.clipboard.writeText(order.value.id)
    message.success('订单号已复制')
  } catch {
    message.warning('复制失败，请手动复制')
  }
}

const goAfterSales = () => {
  router.push('/orders/after-sales')
}

const runPrimaryAction = () => {
  const action = primaryAction.value
  if (action === '立即发货') {
    router.push(`/orders/ship/${order.value.id}`)
    return
  }
  if (action === '查看物流') {
    openSection('logistics')
    return
  }
  if (action === '处理售后') {
    router.push('/orders/after-sales')
    return
  }
  if (action === '催付') {
    message.success('已发送催付提醒')
    return
  }
  if (action === '查看归档') {
    message.info('归档视图能力已预留')
    return
  }
  message.info('已定位订单基础信息')
}
</script>
