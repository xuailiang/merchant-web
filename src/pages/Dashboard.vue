<template>
  <div>
    <div class="page-title">仪表盘</div>

    <a-row :gutter="16" class="card-section">
      <a-col v-for="item in overviewStats" :key="item.title" :xs="24" :sm="12" :lg="8" :xl="4">
        <a-card>
          <a-statistic :title="item.title" :value="item.value" />
          <div class="stat-meta">
            <a-tag :color="item.trend >= 0 ? 'green' : 'red'">
              {{ item.trend >= 0 ? '+' : '' }}{{ item.trend }}%
            </a-tag>
            <span class="stat-note">{{ item.note }}</span>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="16" class="card-section">
      <a-col :xs="24" :lg="16">
        <a-card title="销售目标进度">
          <div class="progress-group">
            <div v-for="item in salesProgress" :key="item.label" class="progress-item">
              <div class="progress-label">{{ item.label }}</div>
              <a-progress :percent="item.percent" :stroke-color="item.percent > 60 ? '#52c41a' : '#1677ff'" />
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
        <a-card title="运营提醒">
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
        <a-card title="近 7 日成交趋势">
          <div ref="lineContainer" class="chart-box"></div>
        </a-card>
      </a-col>
      <a-col :xs="24" :lg="12">
        <a-card title="品类销售分布">
          <div ref="columnContainer" class="chart-box"></div>
        </a-card>
      </a-col>
    </a-row>

    <a-card class="card-section" title="周期报表">
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
          <a-card class="report-card">
            <div class="report-title">订单报表</div>
            <div class="report-value">12,840</div>
            <div class="report-meta">退单率 2.1%</div>
            <a-button type="link" @click="openReport('orders')">查看明细</a-button>
          </a-card>
        </a-col>
        <a-col :xs="24" :lg="6">
          <a-card class="report-card">
            <div class="report-title">利润报表</div>
            <div class="report-value">¥1,284,000</div>
            <div class="report-meta">毛利率 26.4%</div>
            <a-button type="link" @click="openReport('profit')">查看明细</a-button>
          </a-card>
        </a-col>
        <a-col :xs="24" :lg="6">
          <a-card class="report-card">
            <div class="report-title">库存周转</div>
            <div class="report-value">18.6 天</div>
            <div class="report-meta">滞销 SKU 42</div>
            <a-button type="link" @click="openReport('inventory')">查看明细</a-button>
          </a-card>
        </a-col>
        <a-col :xs="24" :lg="6">
          <a-card class="report-card">
            <div class="report-title">渠道对比</div>
            <div class="report-value">抖音 38%</div>
            <div class="report-meta">Top: 自有小程序</div>
            <a-button type="link" @click="openReport('channel')">查看明细</a-button>
          </a-card>
        </a-col>
      </a-row>
    </a-card>

    <a-row :gutter="16" class="card-section">
      <a-col :xs="24" :lg="8">
        <a-card title="订单周期报表">
          <div ref="orderReportContainer" class="chart-box"></div>
        </a-card>
      </a-col>
      <a-col :xs="24" :lg="8">
        <a-card title="利润趋势">
          <div ref="profitReportContainer" class="chart-box"></div>
        </a-card>
      </a-col>
      <a-col :xs="24" :lg="8">
        <a-card title="渠道对比">
          <div ref="channelReportContainer" class="chart-box"></div>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="16">
      <a-col :xs="24" :lg="16">
        <a-card title="热销商品">
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
        <a-card title="最新订单">
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
      color: '#1677ff',
      point: { size: 4, shape: 'circle' },
      area: { style: { fill: 'l(90) 0:#ffffff 1:#e6f4ff' } },
    })
    linePlot.render()
  }
  if (columnContainer.value) {
    columnPlot = new Column(columnContainer.value, {
      data: categoryData,
      xField: 'category',
      yField: 'value',
      height: 260,
      color: '#52c41a',
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
      color: '#1677ff',
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
      color: '#fa8c16',
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
      color: '#722ed1',
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
.stat-meta {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-note {
  color: #8c8c8c;
  font-size: 12px;
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
  font-weight: 500;
}

.status-block {
  margin-top: 24px;
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

.order-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
}

.order-amount {
  font-weight: 600;
}

.chart-box {
  height: 260px;
}

.report-detail-toolbar {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
}

.report-toolbar {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
}

.report-grid .report-card {
  background: #f8fafc;
  border: 1px solid var(--border-color);
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
  color: var(--text-secondary);
  font-size: 12px;
  margin-bottom: 6px;
}

.mobile-card {
  margin-bottom: 12px;
}

.mobile-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  color: var(--text-primary);
}

.mobile-label {
  color: var(--text-secondary);
}
</style>
