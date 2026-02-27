<template>
  <div class="dashboard-v2">
    <section class="command-hero section-enter">
      <div class="hero-head">
        <div>
          <div class="dashboard-title">经营指挥台</div>
          <div class="dashboard-subtitle">
            围绕履约与利润平衡，聚焦当日风险、转化卡点与可执行动作。
          </div>
          <div class="dashboard-time">数据更新时间：{{ lastUpdatedText }}</div>
        </div>
        <div class="hero-tools">
          <a-select
            v-model:value="currentPeriod"
            :options="dashboardPeriodOptions"
            style="width: 120px"
          />
          <a-range-picker
            v-model:value="dashboardRange"
            :allow-clear="false"
            :get-popup-container="getPopupContainer"
          />
          <a-button type="primary" @click="generateWeeklyReport">生成周报</a-button>
          <a-button class="ghost-btn" @click="goDownloadCenter">下载中心</a-button>
        </div>
      </div>

      <div class="hero-body">
        <div class="kpi-grid">
          <article
            v-for="card in kpiCards"
            :key="card.key"
            class="kpi-card"
            role="button"
            tabindex="0"
            @click="handleRoute(card.action)"
          >
            <div class="kpi-top">
              <span>{{ card.title }}</span>
              <ArrowRightOutlined />
            </div>
            <div class="kpi-value">{{ card.value }}</div>
            <div class="kpi-meta">
              <span :class="card.trend >= 0 ? 'trend-rise' : 'trend-drop'">
                {{ card.trend >= 0 ? '+' : '' }}{{ card.trend }}%
              </span>
              <span class="kpi-note">{{ card.note }}</span>
            </div>
          </article>
        </div>

        <aside class="todo-panel">
          <div class="todo-header">
            <div>
              <div class="todo-title">今日待办</div>
              <div class="todo-sub">优先处理超时风险与退款介入</div>
            </div>
            <a-tag color="processing">可执行</a-tag>
          </div>
          <div class="todo-list">
            <div
              v-for="item in todoActions"
              :key="item.key"
              class="todo-item"
              role="button"
              tabindex="0"
              @click="handleRoute(item.action)"
            >
              <div
                class="todo-value"
                :class="{
                  'todo-danger': item.level === 'danger',
                  'todo-warning': item.level === 'warning',
                  'todo-normal': item.level === 'normal',
                }"
              >
                {{ item.value }}
              </div>
              <div class="todo-copy">
                <span class="todo-name">{{ item.label }}</span>
                <span class="todo-hint">{{ item.hint }}</span>
              </div>
              <a-button type="link" size="small">去处理</a-button>
            </div>
          </div>
        </aside>
      </div>

      <div class="risk-strip">
        <div
          v-for="signal in riskSignals"
          :key="signal.key"
          class="risk-pill"
          :class="`risk-pill-${signal.level}`"
        >
          <WarningOutlined />
          <span>{{ signal.label }}：{{ signal.value }}</span>
          <a @click.prevent="handleRoute(signal.action)">去处理</a>
        </div>
      </div>
    </section>

    <a-row :gutter="16" class="dashboard-row section-enter delay-1">
      <a-col :xs="24" :xl="14">
        <a-card class="dash-card">
          <template #title>
            <span class="dash-title">成交额 vs 毛利率</span>
            <span class="dash-subtitle">双轴图识别“高成交低毛利”时段</span>
          </template>
          <div ref="dualAxesRef" class="chart-shell"></div>
        </a-card>
      </a-col>
      <a-col :xs="24" :xl="10">
        <a-card class="dash-card">
          <template #title>
            <span class="dash-title">履约漏斗</span>
            <span class="dash-subtitle">点击节点快速定位流程卡点</span>
          </template>
          <div ref="funnelRef" class="chart-shell"></div>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="16" class="dashboard-row section-enter delay-2">
      <a-col :xs="24" :xl="15">
        <a-card class="dash-card">
          <template #title>
            <span class="dash-title">订单时段热力矩阵</span>
            <span class="dash-subtitle">小时 × 星期，点击时段查看异常订单</span>
          </template>
          <div ref="heatmapRef" class="chart-shell"></div>
        </a-card>
      </a-col>
      <a-col :xs="24" :xl="9">
        <a-card class="dash-card">
          <template #title>
            <span class="dash-title">履约健康仪表盘</span>
            <span class="dash-subtitle">准时率 / 异常件 / 退款介入综合评分</span>
          </template>
          <div ref="gaugeRef" class="chart-shell"></div>
          <div class="gauge-extra">
            <div class="gauge-hint">{{ currentSnapshot.gaugeHint }}</div>
            <span class="gauge-badge" :class="gaugeClass">{{ gaugeLabel }}</span>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="16" class="dashboard-row section-enter delay-3">
      <a-col :xs="24" :xl="12">
        <a-card class="dash-card">
          <template #title>
            <span class="dash-title">品类 / 渠道贡献</span>
            <span class="dash-subtitle">蓝色代表规模，绿色代表效率</span>
          </template>
          <div ref="channelRef" class="chart-shell"></div>
        </a-card>
      </a-col>
      <a-col :xs="24" :xl="12">
        <a-card class="dash-card">
          <template #title>
            <span class="dash-title">最近异常订单</span>
            <span class="dash-subtitle">
              {{
                selectedDualPeriod ? `${selectedDualPeriod} 周期` : '全部周期'
              }}，优先处理高风险订单
            </span>
          </template>
          <div class="risk-list">
            <article v-for="order in visibleRiskOrders" :key="order.key" class="risk-item">
              <div class="risk-main">
                <div class="risk-id-line">
                  <span class="risk-id">{{ order.orderId }}</span>
                  <a-tag :class="`risk-level-${order.level}`">{{ order.status }}</a-tag>
                </div>
                <div class="risk-issue">{{ order.issue }}</div>
                <div class="risk-meta">{{ order.period }} · 金额 {{ order.amount }}</div>
              </div>
              <a-button type="link" @click="handleRoute(order.action)">去处理</a-button>
            </article>
            <a-empty
              v-if="visibleRiskOrders.length === 0"
              description="当前筛选周期无异常订单"
              :image="null"
            />
          </div>
        </a-card>
      </a-col>
    </a-row>

    <section class="report-panel section-enter delay-4">
      <div class="report-head">
        <a-space>
          <h3 class="dash-title" style="margin: 0">周期报表</h3>
          <span class="dash-subtitle">保留原有明细抽屉，并增强业务域筛选</span>
        </a-space>
        <a-space>
          <a-button type="primary" @click="generateWeeklyReport">生成报表</a-button>
          <a-button @click="goDownloadCenter">导出记录</a-button>
        </a-space>
      </div>
      <div class="report-grid">
        <article
          v-for="card in currentSnapshot.reportCards"
          :key="card.domain"
          class="report-card"
          role="button"
          tabindex="0"
          @click="openReport(card.domain)"
        >
          <div class="report-card-top">
            <span class="report-card-title">{{ card.title }}</span>
            <a-tag v-if="card.abnormal" class="report-abnormal">异常</a-tag>
          </div>
          <div class="report-card-value">{{ card.value }}</div>
          <div class="report-card-meta">{{ card.meta }}</div>
          <div class="report-trend">
            <span :class="card.mom >= 0 ? 'trend-rise' : 'trend-drop'">环比 {{ card.mom }}%</span>
            <span :class="card.yoy >= 0 ? 'trend-rise' : 'trend-drop'">同比 {{ card.yoy }}%</span>
          </div>
          <div class="report-link">查看明细</div>
        </article>
      </div>
    </section>

    <a-drawer v-model:open="reportOpen" width="980" :title="reportTitle">
      <div class="drawer-toolbar">
        <a-space>
          <a-select
            v-model:value="reportDomain"
            :options="reportDomainOptions"
            style="width: 170px"
          />
          <a-range-picker
            v-model:value="reportDetailRange"
            :get-popup-container="getPopupContainer"
          />
        </a-space>
        <a-space>
          <a-button type="primary" @click="message.success('报表导出任务已加入队列')">
            导出明细
          </a-button>
          <a-button @click="message.success('已发送到打印队列')">打印</a-button>
        </a-space>
      </div>
      <a-table
        :columns="reportColumns"
        :data-source="reportRows"
        :pagination="{ pageSize: 6 }"
        :scroll="{ x: 920 }"
      />
    </a-drawer>

    <a-drawer v-model:open="heatmapDrawerOpen" width="620" :title="heatmapDrawerTitle">
      <template v-if="selectedHeatmapAnomalies.length">
        <div v-for="item in selectedHeatmapAnomalies" :key="item.key" class="anomaly-row">
          <div>
            <div style="font-weight: 700">{{ item.orderId }}</div>
            <div style="color: #475569">{{ item.issue }}</div>
            <div style="color: #64748b; font-size: 12px">
              {{ item.delayMinutes }} 分钟 · {{ item.weekday }} {{ item.hour }}
            </div>
          </div>
          <a-button type="link" @click="handleRoute(item.action)">查看订单</a-button>
        </div>
      </template>
      <a-empty v-else description="该时段暂无异常订单" />
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { ArrowRightOutlined, WarningOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import dayjs, { type Dayjs } from 'dayjs'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { dashboardData, dashboardPeriodOptions } from '../mock/dashboard-v2'
import '../styles/dashboard-v2.css'
import type { DashboardPeriod, ReportDomain, RouteTarget } from '../types/dashboard'
import {
  createChannelChart,
  createDualAxesChart,
  createFunnelChart,
  createGaugeChart,
  createHeatmapChart,
} from '../utils/dashboardCharts'

const router = useRouter()

const currentPeriod = ref<DashboardPeriod>('week')
const dashboardRange = ref<[Dayjs, Dayjs]>([dayjs().subtract(6, 'day'), dayjs()])
const reportOpen = ref(false)
const reportDomain = ref<ReportDomain>('orders')
const reportDetailRange = ref<[Dayjs, Dayjs] | null>(null)
const selectedDualPeriod = ref<string | null>(null)
const heatmapDrawerOpen = ref(false)
const selectedHeatmap = ref<{ weekday: string; hour: string } | null>(null)

const dualAxesRef = ref<HTMLDivElement | null>(null)
const funnelRef = ref<HTMLDivElement | null>(null)
const heatmapRef = ref<HTMLDivElement | null>(null)
const gaugeRef = ref<HTMLDivElement | null>(null)
const channelRef = ref<HTMLDivElement | null>(null)

const reportDomainOptions = [
  { label: '订单', value: 'orders' },
  { label: '利润', value: 'profit' },
  { label: '库存', value: 'inventory' },
  { label: '渠道', value: 'channel' },
]

const currentSnapshot = computed(() => dashboardData[currentPeriod.value])
const kpiCards = computed(() => currentSnapshot.value.kpiCards)
const todoActions = computed(() => currentSnapshot.value.todoActions)
const riskSignals = computed(() => currentSnapshot.value.riskSignals)

const visibleRiskOrders = computed(() => {
  if (!selectedDualPeriod.value) return currentSnapshot.value.riskOrders
  return currentSnapshot.value.riskOrders.filter((item) => item.period === selectedDualPeriod.value)
})

const selectedHeatmapAnomalies = computed(() => {
  if (!selectedHeatmap.value) return currentSnapshot.value.heatmapAnomalies
  return currentSnapshot.value.heatmapAnomalies.filter(
    (item) =>
      item.weekday === selectedHeatmap.value?.weekday && item.hour === selectedHeatmap.value?.hour
  )
})

const reportTitle = computed(() => currentSnapshot.value.reportDetails[reportDomain.value].title)
const reportColumns = computed(
  () => currentSnapshot.value.reportDetails[reportDomain.value].columns
)
const reportRows = computed(() => currentSnapshot.value.reportDetails[reportDomain.value].rows)

const gaugeClass = computed(() => {
  const score = currentSnapshot.value.gaugeScore
  if (score >= 86) return 'gauge-good'
  if (score >= 70) return 'gauge-ok'
  return 'gauge-risk'
})

const gaugeLabel = computed(() => {
  const score = currentSnapshot.value.gaugeScore
  if (score >= 86) return '健康'
  if (score >= 70) return '可控'
  return '告警'
})

const heatmapDrawerTitle = computed(() => {
  if (!selectedHeatmap.value) return '时段异常订单'
  return `${selectedHeatmap.value.weekday} ${selectedHeatmap.value.hour} 异常订单`
})

const lastUpdatedText = dayjs().format('YYYY-MM-DD HH:mm')

const getPopupContainer = (trigger?: HTMLElement): HTMLElement =>
  trigger?.ownerDocument?.body ?? document.body

const handleRoute = (target: RouteTarget) => {
  router.push({
    path: target.path,
    query: target.query ?? {},
  })
}

const openReport = (domain: ReportDomain) => {
  reportDomain.value = domain
  reportOpen.value = true
}

const goDownloadCenter = () => {
  router.push('/exports')
}

const generateWeeklyReport = () => {
  message.success('报表生成任务已创建，可在下载中心查看进度')
}

const chartInstances: Array<{ destroy: () => void }> = []
const chartFrameHandles: number[] = []

const destroyCharts = () => {
  while (chartFrameHandles.length) {
    const frameId = chartFrameHandles.pop()
    if (typeof frameId === 'number') cancelAnimationFrame(frameId)
  }
  while (chartInstances.length) {
    chartInstances.pop()?.destroy()
  }
}

const renderCharts = () => {
  destroyCharts()
  const snapshot = currentSnapshot.value

  if (dualAxesRef.value) {
    const chart = createDualAxesChart(dualAxesRef.value, snapshot.dualAxes, (point) => {
      selectedDualPeriod.value = selectedDualPeriod.value === point.period ? null : point.period
    })
    chart.render()
    chartInstances.push(chart)
  }

  if (funnelRef.value) {
    const chart = createFunnelChart(funnelRef.value, snapshot.funnel, (node) => {
      if (node.action) handleRoute(node.action)
    })
    chart.render()
    chartInstances.push(chart)
  }

  chartFrameHandles.push(
    requestAnimationFrame(() => {
      if (heatmapRef.value) {
        const chart = createHeatmapChart(heatmapRef.value, snapshot.heatmap, (point) => {
          selectedHeatmap.value = { weekday: point.weekday, hour: point.hour }
          heatmapDrawerOpen.value = true
        })
        chart.render()
        chartInstances.push(chart)
      }
    })
  )

  chartFrameHandles.push(
    requestAnimationFrame(() => {
      if (gaugeRef.value) {
        const chart = createGaugeChart(gaugeRef.value, snapshot.gaugeScore)
        chart.render()
        chartInstances.push(chart)
      }

      if (channelRef.value) {
        const chart = createChannelChart(channelRef.value, snapshot.channelContribution)
        chart.render()
        chartInstances.push(chart)
      }
    })
  )
}

watch(currentPeriod, async () => {
  selectedDualPeriod.value = null
  selectedHeatmap.value = null
  await nextTick()
  renderCharts()
})

onMounted(async () => {
  await nextTick()
  renderCharts()
})

onBeforeUnmount(() => {
  destroyCharts()
})
</script>
