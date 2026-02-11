<template>
  <div class="dashboard-page">
    <section class="dashboard-hero">
      <div class="hero-copy">
        <div class="hero-kicker">经营驾驶舱</div>
        <div class="page-title">仪表盘</div>
        <div class="hero-subtitle">聚合订单、库存与渠道数据，聚焦关键指标与经营节奏。</div>
        <div class="hero-actions">
          <a-button type="primary" class="hero-primary">生成周报</a-button>
          <a-button class="hero-ghost">下载中心</a-button>
        </div>
        <div class="hero-tags">
          <span>导出队列可追踪</span>
          <span>库存预警实时提示</span>
          <span>渠道对比一键查看</span>
        </div>
      </div>
      <div class="hero-card">
        <div class="hero-card-title">核心指标速览</div>
        <div class="hero-card-grid">
          <div v-for="item in overviewStats.slice(0, 3)" :key="item.title" class="hero-stat">
            <div class="hero-stat-title">{{ item.title }}</div>
            <div class="hero-stat-value">{{ item.value }}</div>
            <div class="hero-stat-meta">
              <span :class="item.trend >= 0 ? 'rise' : 'drop'">
                {{ item.trend >= 0 ? '+' : '' }}{{ item.trend }}%
              </span>
              <span>{{ item.note }}</span>
            </div>
          </div>
        </div>
        <div class="hero-divider"></div>
        <div class="hero-mini">
          <div>
            <div class="mini-label">今日订单效率</div>
            <div class="mini-value">96.2%</div>
          </div>
          <div>
            <div class="mini-label">库存健康度</div>
            <div class="mini-value">良好</div>
          </div>
        </div>
      </div>
    </section>

    <a-row :gutter="16" class="card-section metric-grid">
      <a-col v-for="item in overviewStats" :key="item.title" :xs="24" :sm="12" :lg="8" :xl="4">
        <a-card class="stat-card">
          <div class="stat-title">{{ item.title }}</div>
          <div class="stat-value">{{ item.value }}</div>
          <div class="stat-meta">
            <span :class="item.trend >= 0 ? 'rise' : 'drop'">
              {{ item.trend >= 0 ? '+' : '' }}{{ item.trend }}%
            </span>
            <span class="stat-note">{{ item.note }}</span>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="16" class="card-section">
      <a-col :xs="24" :lg="16">
        <a-card title="销售目标进度" class="panel-card panel-card--progress">
          <div class="progress-group">
            <div v-for="item in salesProgress" :key="item.label" class="progress-item">
              <div class="progress-label">{{ item.label }}</div>
              <a-progress :percent="item.percent" :stroke-color="item.percent > 60 ? '#10b981' : '#2563eb'" />
            </div>
          </div>
          <div class="status-block">
            <div class="status-title">订单状态分布</div>
            <div class="status-tags">
              <a-tag v-for="status in orderStatus" :key="status.label" :color="status.color">
                {{ status.label }} {{ status.value }}
              </a-tag>
            </div>
          </div>
        </a-card>
      </a-col>
      <a-col :xs="24" :lg="8">
        <a-card title="运营提醒" class="panel-card panel-card--alerts">
          <a-list :data-source="alerts" size="small">
            <template #renderItem="{ item }">
              <a-list-item>
                <a-alert :message="item" type="warning" show-icon />
              </a-list-item>
            </template>
          </a-list>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="16" class="card-section">
      <a-col :xs="24" :lg="12">
        <a-card title="近 7 日成交趋势" class="panel-card panel-card--chart">
          <div ref="lineContainer" class="chart-box"></div>
        </a-card>
      </a-col>
      <a-col :xs="24" :lg="12">
        <a-card title="品类销售分布" class="panel-card panel-card--chart">
          <div ref="columnContainer" class="chart-box"></div>
        </a-card>
      </a-col>
    </a-row>

    <a-card class="card-section report-panel panel-card">
      <div class="report-toolbar">
        <a-space>
          <a-range-picker v-model:value="reportRange" :get-popup-container="getPopupContainer" />
          <a-select v-model:value="reportPeriod" :options="periodOptions" style="width: 140px" />
        </a-space>
        <a-space>
          <a-button type="primary">生成报表</a-button>
          <a-button>导出报表</a-button>
        </a-space>
      </div>
      <a-row :gutter="16" class="report-grid">
        <a-col :xs="24" :lg="6">
          <a-card class="report-card" @click="openReport('orders')">
            <div class="report-title">订单报表</div>
            <div class="report-value">12,840</div>
            <div class="report-meta">退单率 2.1%</div>
            <div class="report-link">查看明细</div>
          </a-card>
        </a-col>
        <a-col :xs="24" :lg="6">
          <a-card class="report-card" @click="openReport('profit')">
            <div class="report-title">利润报表</div>
            <div class="report-value">¥1,284,000</div>
            <div class="report-meta">毛利率 26.4%</div>
            <div class="report-link">查看明细</div>
          </a-card>
        </a-col>
        <a-col :xs="24" :lg="6">
          <a-card class="report-card" @click="openReport('inventory')">
            <div class="report-title">库存周转</div>
            <div class="report-value">18.6 天</div>
            <div class="report-meta">滞销 SKU 42</div>
            <div class="report-link">查看明细</div>
          </a-card>
        </a-col>
        <a-col :xs="24" :lg="6">
          <a-card class="report-card" @click="openReport('channel')">
            <div class="report-title">渠道对比</div>
            <div class="report-value">抖音 38%</div>
            <div class="report-meta">Top: 自有小程序</div>
            <div class="report-link">查看明细</div>
          </a-card>
        </a-col>
      </a-row>
    </a-card>

    <a-row :gutter="16" class="card-section">
      <a-col :xs="24" :lg="8">
        <a-card title="订单周期报表" class="panel-card panel-card--mini-chart">
          <div ref="orderReportContainer" class="chart-box"></div>
        </a-card>
      </a-col>
      <a-col :xs="24" :lg="8">
        <a-card title="利润趋势" class="panel-card panel-card--mini-chart">
          <div ref="profitReportContainer" class="chart-box"></div>
        </a-card>
      </a-col>
      <a-col :xs="24" :lg="8">
        <a-card title="渠道对比" class="panel-card panel-card--mini-chart">
          <div ref="channelReportContainer" class="chart-box"></div>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="16" class="card-section">
      <a-col :xs="24" :lg="16">
        <a-card title="热销商品" class="panel-card panel-card--table">
          <template v-if="isMobile">
            <a-list :data-source="hotProducts">
              <template #renderItem="{ item }">
                <a-list-item>
                  <a-card class="mobile-card">
                    <div class="mobile-row">
                      <span class="mobile-label">商品</span>
                      <span>{{ item.name }}</span>
                    </div>
                    <div class="mobile-row">
                      <span class="mobile-label">类目</span>
                      <span>{{ item.category }}</span>
                    </div>
                    <div class="mobile-row">
                      <span class="mobile-label">销量</span>
                      <span>{{ item.sales }}</span>
                    </div>
                    <div class="mobile-row">
                      <span class="mobile-label">销售额</span>
                      <span>{{ item.revenue }}</span>
                    </div>
                  </a-card>
                </a-list-item>
              </template>
            </a-list>
          </template>
          <a-table
            v-else
            :columns="productColumns"
            :data-source="hotProducts"
            :pagination="false"
            :scroll="{ x: 700 }"
          />
        </a-card>
      </a-col>
      <a-col :xs="24" :lg="8">
        <a-card title="最新订单" class="panel-card panel-card--list">
          <a-list :data-source="latestOrders">
            <template #renderItem="{ item }">
              <a-list-item>
                <a-list-item-meta :title="item.id" :description="item.customer" />
                <div class="order-meta">
                  <div class="order-amount">{{ item.amount }}</div>
                  <a-tag>{{ item.status }}</a-tag>
                </div>
              </a-list-item>
            </template>
          </a-list>
        </a-card>
      </a-col>
    </a-row>

    <a-drawer v-model:open="reportOpen" width="920" :title="reportTitle">
      <div class="report-detail-toolbar">
        <a-space>
          <a-range-picker v-model:value="reportDetailRange" :get-popup-container="getPopupContainer" />
          <a-select v-model:value="reportDetailPeriod" :options="periodOptions" style="width: 120px" />
        </a-space>
        <a-space>
          <a-button type="primary">导出明细</a-button>
          <a-button>打印</a-button>
        </a-space>
      </div>
      <a-table :columns="reportColumns" :data-source="reportRows" :pagination="{ pageSize: 6 }" :scroll="{ x: 900 }" />
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { Column, Line } from '@antv/g2plot'
import dayjs from 'dayjs'
import { useIsMobile } from '../utils/useIsMobile'
import {
  alerts,
  hotProducts,
  latestOrders,
  orderStatus,
  overviewStats,
  salesProgress,
} from '../mock/dashboard'

const lineContainer = ref<HTMLDivElement | null>(null)
const columnContainer = ref<HTMLDivElement | null>(null)
const orderReportContainer = ref<HTMLDivElement | null>(null)
const profitReportContainer = ref<HTMLDivElement | null>(null)
const channelReportContainer = ref<HTMLDivElement | null>(null)
const isMobile = useIsMobile()

let linePlot: Line | null = null
let columnPlot: Column | null = null
let orderPlot: Column | null = null
let profitPlot: Line | null = null
let channelPlot: Column | null = null

const lineData = [
  { day: '周一', value: 28.6 },
  { day: '周二', value: 32.1 },
  { day: '周三', value: 30.4 },
  { day: '周四', value: 36.8 },
  { day: '周五', value: 42.3 },
  { day: '周六', value: 38.7 },
  { day: '周日', value: 46.1 },
]

const categoryData = [
  { category: '手机', value: 42.6 },
  { category: '耳机', value: 18.2 },
  { category: '穿戴', value: 16.4 },
  { category: '外设', value: 12.8 },
  { category: '音频', value: 10.0 },
]

const orderReportData = [
  { period: 'W1', value: 3200 },
  { period: 'W2', value: 3680 },
  { period: 'W3', value: 4020 },
  { period: 'W4', value: 3940 },
]

const profitReportData = [
  { period: 'W1', value: 268 },
  { period: 'W2', value: 292 },
  { period: 'W3', value: 320 },
  { period: 'W4', value: 310 },
]

const channelReportData = [
  { channel: '抖音', value: 38 },
  { channel: '小程序', value: 28 },
  { channel: '门店', value: 19 },
  { channel: '分销', value: 15 },
]

onMounted(() => {
  if (lineContainer.value) {
    linePlot = new Line(lineContainer.value, {
      data: lineData,
      xField: 'day',
      yField: 'value',
      smooth: true,
      height: 260,
      color: '#2563eb',
      point: { size: 4, shape: 'circle' },
      area: { style: { fill: 'l(90) 0:#f8fafc 1:#dbeafe' } },
    })
    linePlot.render()
  }
  if (columnContainer.value) {
    columnPlot = new Column(columnContainer.value, {
      data: categoryData,
      xField: 'category',
      yField: 'value',
      height: 260,
      color: '#f59e0b',
      columnWidthRatio: 0.5,
    })
    columnPlot.render()
  }
  if (orderReportContainer.value) {
    orderPlot = new Column(orderReportContainer.value, {
      data: orderReportData,
      xField: 'period',
      yField: 'value',
      height: 220,
      color: '#2563eb',
      columnWidthRatio: 0.5,
    })
    orderPlot.render()
  }
  if (profitReportContainer.value) {
    profitPlot = new Line(profitReportContainer.value, {
      data: profitReportData,
      xField: 'period',
      yField: 'value',
      height: 220,
      color: '#10b981',
      point: { size: 4, shape: 'circle' },
    })
    profitPlot.render()
  }
  if (channelReportContainer.value) {
    channelPlot = new Column(channelReportContainer.value, {
      data: channelReportData,
      xField: 'channel',
      yField: 'value',
      height: 220,
      color: '#7c3aed',
      columnWidthRatio: 0.6,
    })
    channelPlot.render()
  }
})

onBeforeUnmount(() => {
  linePlot?.destroy()
  columnPlot?.destroy()
  orderPlot?.destroy()
  profitPlot?.destroy()
  channelPlot?.destroy()
  linePlot = null
  columnPlot = null
  orderPlot = null
  profitPlot = null
  channelPlot = null
})

const reportPeriod = ref('week')
const reportRange = ref<[dayjs.Dayjs, dayjs.Dayjs] | null>(null)
const periodOptions = [
  { label: '按周', value: 'week' },
  { label: '按月', value: 'month' },
  { label: '按季', value: 'quarter' },
]

const getPopupContainer = (trigger: HTMLElement) => trigger?.parentNode || document.body

const reportOpen = ref(false)
const reportType = ref<'orders' | 'profit' | 'inventory' | 'channel'>('orders')
const reportDetailRange = ref<[dayjs.Dayjs, dayjs.Dayjs] | null>(null)
const reportDetailPeriod = ref('week')

const reportTitle = computed(() => {
  if (reportType.value === 'orders') return '订单报表明细'
  if (reportType.value === 'profit') return '利润报表明细'
  if (reportType.value === 'inventory') return '库存周转明细'
  return '渠道对比明细'
})

const reportColumns = computed(() => {
  if (reportType.value === 'orders') {
    return [
      { title: '周期', dataIndex: 'period', key: 'period' },
      { title: '订单数', dataIndex: 'orders', key: 'orders' },
      { title: '退款率', dataIndex: 'refundRate', key: 'refundRate' },
      { title: '成交额', dataIndex: 'gmv', key: 'gmv' },
    ]
  }
  if (reportType.value === 'profit') {
    return [
      { title: '周期', dataIndex: 'period', key: 'period' },
      { title: '毛利', dataIndex: 'profit', key: 'profit' },
      { title: '毛利率', dataIndex: 'margin', key: 'margin' },
      { title: '费用', dataIndex: 'cost', key: 'cost' },
    ]
  }
  if (reportType.value === 'inventory') {
    return [
      { title: 'SKU', dataIndex: 'sku', key: 'sku' },
      { title: '周转天数', dataIndex: 'turnover', key: 'turnover' },
      { title: '库存', dataIndex: 'stock', key: 'stock' },
      { title: '滞销等级', dataIndex: 'slow', key: 'slow' },
    ]
  }
  return [
    { title: '渠道', dataIndex: 'channel', key: 'channel' },
    { title: '订单数', dataIndex: 'orders', key: 'orders' },
    { title: '成交额', dataIndex: 'gmv', key: 'gmv' },
    { title: '占比', dataIndex: 'share', key: 'share' },
  ]
})

const reportRows = computed(() => {
  if (reportType.value === 'orders') {
    return [
      { key: 'r1', period: '2026-W1', orders: 3120, refundRate: '2.1%', gmv: '¥1,240,000' },
      { key: 'r2', period: '2026-W2', orders: 3680, refundRate: '1.8%', gmv: '¥1,420,000' },
    ]
  }
  if (reportType.value === 'profit') {
    return [
      { key: 'r1', period: '2026-W1', profit: '¥268,000', margin: '26.4%', cost: '¥112,000' },
      { key: 'r2', period: '2026-W2', profit: '¥292,000', margin: '27.1%', cost: '¥108,000' },
    ]
  }
  if (reportType.value === 'inventory') {
    return [
      { key: 'r1', sku: '猫爬架', turnover: '12天', stock: 320, slow: '中' },
      { key: 'r2', sku: '智能手环', turnover: '28天', stock: 120, slow: '高' },
    ]
  }
  return [
    { key: 'r1', channel: '抖音', orders: 4200, gmv: '¥1,320,000', share: '38%' },
    { key: 'r2', channel: '小程序', orders: 3100, gmv: '¥980,000', share: '28%' },
  ]
})

const openReport = (type: 'orders' | 'profit' | 'inventory' | 'channel') => {
  reportType.value = type
  reportOpen.value = true
}

const productColumns = [
  { title: '商品名称', dataIndex: 'name', key: 'name' },
  { title: '类目', dataIndex: 'category', key: 'category' },
  { title: '销量', dataIndex: 'sales', key: 'sales' },
  { title: '销售额', dataIndex: 'revenue', key: 'revenue' },
]
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@600;700&family=Source+Sans+3:wght@400;500;600&display=swap');

.dashboard-page {
  --ink: #0f172a;
  --accent: #2563eb;
  --accent-strong: #1d4ed8;
  --accent-warm: #f59e0b;
  --surface: #ffffff;
  --surface-2: #f8fafc;
  --muted: #94a3b8;
  --border: #e2e8f0;
  font-family: 'Source Sans 3', "PingFang SC", "Microsoft YaHei", sans-serif;
  color: var(--ink);
}

.dashboard-page :deep(.ant-card) {
  border-radius: 18px;
  border: 1px solid rgba(148, 163, 184, 0.3);
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.08);
  background: var(--surface);
}

.dashboard-page :deep(.ant-card-head) {
  border-bottom: 1px solid rgba(148, 163, 184, 0.18);
  font-weight: 600;
  font-size: 15px;
}

.dashboard-page :deep(.ant-card-head-title) {
  font-family: 'Fraunces', serif;
  letter-spacing: 0.3px;
}

.dashboard-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
  gap: 24px;
  padding: 28px 28px 24px;
  background: linear-gradient(135deg, #f9f5ec 0%, #eef2ff 55%, #f8fafc 100%);
  border-radius: 24px;
  margin-bottom: 20px;
  border: 1px solid rgba(148, 163, 184, 0.25);
}

.hero-copy {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.hero-kicker {
  font-size: 12px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: rgba(15, 23, 42, 0.45);
}

.page-title {
  font-family: 'Fraunces', serif;
  font-size: clamp(28px, 3.2vw, 40px);
  font-weight: 700;
}

.hero-subtitle {
  color: #475569;
  font-size: 16px;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.hero-primary {
  height: 40px;
  padding: 0 20px;
  border-radius: 12px;
  font-weight: 600;
}

.hero-ghost {
  height: 40px;
  padding: 0 20px;
  border-radius: 12px;
  border: 1px solid rgba(37, 99, 235, 0.3);
  color: #1d4ed8;
}

.hero-tags {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.hero-tags span {
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(37, 99, 235, 0.08);
  color: #1e3a8a;
  font-size: 12px;
}

.hero-card {
  background: #0f172a;
  color: #e2e8f0;
  border-radius: 20px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.12);
}

.hero-card-title {
  font-size: 14px;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: rgba(226, 232, 240, 0.7);
}

.hero-card-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.hero-stat {
  background: rgba(30, 41, 59, 0.6);
  padding: 12px;
  border-radius: 14px;
}

.hero-stat-title {
  font-size: 12px;
  color: rgba(226, 232, 240, 0.7);
  margin-bottom: 6px;
}

.hero-stat-value {
  font-size: 20px;
  font-weight: 600;
  color: #f8fafc;
  margin-bottom: 6px;
}

.hero-stat-meta {
  font-size: 12px;
  display: flex;
  gap: 8px;
  align-items: center;
}

.hero-divider {
  height: 1px;
  background: rgba(148, 163, 184, 0.2);
}

.hero-mini {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.mini-label {
  font-size: 12px;
  color: rgba(226, 232, 240, 0.6);
}

.mini-value {
  font-size: 16px;
  font-weight: 600;
  color: #f8fafc;
}

.card-section {
  margin-bottom: 20px;
}

.metric-grid .stat-card {
  position: relative;
  overflow: hidden;
  background: #fff;
}

.stat-title {
  font-size: 13px;
  color: #64748b;
  margin-bottom: 6px;
}

.stat-value {
  font-size: 22px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 10px;
}

.stat-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.stat-note {
  color: #64748b;
}

.rise {
  color: #10b981;
  font-weight: 600;
}

.drop {
  color: #ef4444;
  font-weight: 600;
}

.panel-card :deep(.ant-card-body) {
  background: #fff;
}

.panel-card--progress {
  background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
}

.panel-card--alerts :deep(.ant-alert) {
  border-radius: 12px;
  border: 1px solid rgba(245, 158, 11, 0.25);
  background: rgba(245, 158, 11, 0.08);
}

.panel-card--alerts :deep(.ant-alert-message) {
  font-weight: 600;
  color: #92400e;
}

.panel-card--chart {
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
}

.panel-card--chart .chart-box {
  padding: 6px 0 8px;
}

.progress-group {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.progress-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.progress-label {
  font-weight: 600;
  color: #1e293b;
}

.status-block {
  margin-top: 22px;
}

.status-title {
  font-weight: 600;
  margin-bottom: 8px;
}

.status-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.status-tags :deep(.ant-tag) {
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.3);
  padding: 2px 10px;
}

.chart-box {
  height: 260px;
}

.report-panel {
  background: linear-gradient(135deg, #f8fafc 0%, #fdf4ff 100%);
}

.report-panel :deep(.ant-card-head) {
  background: rgba(255, 255, 255, 0.7);
}

.report-panel :deep(.ant-card-body) {
  background: transparent;
}

.report-toolbar {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
}

.report-grid .report-card {
  background: #fff;
  border: 1px solid rgba(148, 163, 184, 0.2);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.report-grid .report-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 18px 28px rgba(15, 23, 42, 0.12);
}

.report-title {
  font-weight: 600;
  margin-bottom: 4px;
}

.report-value {
  font-size: 20px;
  font-weight: 700;
  color: #1d4ed8;
  margin-bottom: 4px;
}

.report-meta {
  color: #64748b;
  font-size: 12px;
  margin-bottom: 8px;
}

.report-link {
  font-size: 12px;
  color: #2563eb;
  font-weight: 600;
}

.panel-card--mini-chart {
  background: #0f172a;
  color: #e2e8f0;
}

.panel-card--mini-chart :deep(.ant-card-head) {
  border-bottom: 1px solid rgba(148, 163, 184, 0.2);
  color: #e2e8f0;
}

.panel-card--mini-chart :deep(.ant-card-body) {
  background: transparent;
}

.panel-card--mini-chart .chart-box {
  height: 220px;
}

.panel-card--table :deep(.ant-table) {
  border-radius: 14px;
  overflow: hidden;
}

.panel-card--table :deep(.ant-table-thead > tr > th) {
  background: #f1f5f9;
  color: #1e293b;
  font-weight: 600;
}

.panel-card--table :deep(.ant-table-tbody > tr:hover > td) {
  background: #f8fafc;
}

.panel-card--list :deep(.ant-list-item) {
  padding: 12px 0;
  border-bottom: 1px solid rgba(148, 163, 184, 0.18);
}

.panel-card--list :deep(.ant-list-item:last-child) {
  border-bottom: none;
}

.panel-card--list :deep(.ant-list-item-meta-title) {
  font-weight: 600;
  color: #0f172a;
}

.panel-card--list :deep(.ant-list-item-meta-description) {
  color: #64748b;
}

.report-detail-toolbar {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
}

.mobile-card {
  margin-bottom: 12px;
  background: #f8fafc;
  border: 1px solid rgba(148, 163, 184, 0.2);
}

.mobile-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  color: #0f172a;
}

.mobile-label {
  color: #64748b;
}

.order-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
}

.order-amount {
  font-weight: 700;
  color: #1d4ed8;
}

@media (max-width: 992px) {
  .dashboard-hero {
    grid-template-columns: 1fr;
  }

  .hero-card-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .hero-mini {
    flex-direction: column;
    gap: 10px;
  }
}
</style>
