<template>
  <div class="marketing-attribution-page">
    <div class="page-title">营销效果归因</div>

    <a-row :gutter="16" class="kpi-row">
      <a-col :xs="24" :md="12" :xl="6">
        <a-card class="kpi-card">
          <div class="kpi-label">活动归因成交额</div>
          <div class="kpi-value">¥{{ kpi.gmv }}</div>
          <div class="kpi-sub">活动订单 GMV 占比 41%</div>
        </a-card>
      </a-col>
      <a-col :xs="24" :md="12" :xl="6">
        <a-card class="kpi-card">
          <div class="kpi-label">券核销金额</div>
          <div class="kpi-value">¥{{ kpi.coupon }}</div>
          <div class="kpi-sub">核销率 {{ kpi.couponRate }}%</div>
        </a-card>
      </a-col>
      <a-col :xs="24" :md="12" :xl="6">
        <a-card class="kpi-card">
          <div class="kpi-label">整体 ROI</div>
          <div class="kpi-value success">{{ kpi.roi }}</div>
          <div class="kpi-sub">投产比 = GMV / 投放成本</div>
        </a-card>
      </a-col>
      <a-col :xs="24" :md="12" :xl="6">
        <a-card class="kpi-card">
          <div class="kpi-label">渠道转化率</div>
          <div class="kpi-value warning">{{ kpi.channelRate }}%</div>
          <div class="kpi-sub">点击到成交转化</div>
        </a-card>
      </a-col>
    </a-row>

    <a-card>
      <a-form layout="inline" class="filter-bar">
        <a-form-item label="活动/券名称">
          <a-input v-model:value="filters.keyword" placeholder="输入活动或优惠券名称" allow-clear />
        </a-form-item>
        <a-form-item label="归因渠道">
          <a-select
            v-model:value="filters.channel"
            :options="channelOptions"
            allow-clear
            placeholder="全部渠道"
            style="width: 140px"
            :get-popup-container="getPopupContainer"
          />
        </a-form-item>
        <a-form-item label="时间区间">
          <a-range-picker v-model:value="rangeValue" :get-popup-container="getPopupContainer" />
        </a-form-item>
        <a-space>
          <a-button type="primary" @click="message.success('筛选已更新')">查询</a-button>
          <a-button @click="resetFilters">重置</a-button>
          <a-button>导出归因报表</a-button>
        </a-space>
      </a-form>
    </a-card>

    <a-row :gutter="16">
      <a-col :xs="24" :xl="14">
        <a-card title="活动与优惠券核销效果">
          <a-table
            :columns="campaignColumns"
            :data-source="filteredCampaigns"
            row-key="id"
            :pagination="{ pageSize: 6 }"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'roi'">
                <a-tag
                  :color="
                    Number(record.roi) >= 3 ? 'green' : Number(record.roi) >= 2 ? 'blue' : 'orange'
                  "
                >
                  ROI {{ record.roi }}
                </a-tag>
              </template>
              <template v-else-if="column.key === 'conversion'">
                <span>{{ record.conversion }}%</span>
              </template>
            </template>
          </a-table>
        </a-card>
      </a-col>
      <a-col :xs="24" :xl="10">
        <a-card title="券核销构成">
          <a-list :data-source="couponEffects" size="small">
            <template #renderItem="{ item }">
              <a-list-item>
                <a-list-item-meta
                  :title="item.name"
                  :description="`发放 ${item.sent} / 核销 ${item.used}`"
                />
                <a-tag :color="item.rate >= 45 ? 'green' : item.rate >= 30 ? 'blue' : 'orange'">
                  {{ item.rate }}%
                </a-tag>
              </a-list-item>
            </template>
          </a-list>
        </a-card>
      </a-col>
    </a-row>

    <a-card title="渠道转化漏斗" class="funnel-card">
      <div class="funnel-grid">
        <div v-for="step in funnelData" :key="step.name" class="funnel-item">
          <div class="funnel-title">{{ step.name }}</div>
          <a-progress :percent="step.rate" :show-info="false" :stroke-color="step.color" />
          <div class="funnel-values">
            <span>{{ step.value }}</span>
            <span>{{ step.rate }}%</span>
          </div>
        </div>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import dayjs from 'dayjs'
import { message } from 'ant-design-vue'

const kpi = {
  gmv: '286,400',
  coupon: '32,840',
  couponRate: 43,
  roi: '3.4',
  channelRate: 7.6,
}

const filters = ref({
  keyword: '',
  channel: undefined as string | undefined,
  dateRange: [] as string[],
})

const channelOptions = [
  { label: '短信', value: '短信' },
  { label: '社群', value: '社群' },
  { label: '直播', value: '直播' },
  { label: '站内推送', value: '站内推送' },
]

const rangeValue = computed({
  get: () => {
    if (filters.value.dateRange.length !== 2) return null
    return [dayjs(filters.value.dateRange[0]), dayjs(filters.value.dateRange[1])]
  },
  set: (value) => {
    if (!value || value.length !== 2) {
      filters.value.dateRange = []
      return
    }
    filters.value.dateRange = [value[0].format('YYYY-MM-DD'), value[1].format('YYYY-MM-DD')]
  },
})

const campaignColumns = [
  { title: '活动/券', dataIndex: 'name', key: 'name', width: 180 },
  { title: '渠道', dataIndex: 'channel', key: 'channel', width: 100 },
  { title: '曝光', dataIndex: 'exposure', key: 'exposure', width: 100 },
  { title: '下单', dataIndex: 'orders', key: 'orders', width: 90 },
  { title: '核销金额(元)', dataIndex: 'couponAmount', key: 'couponAmount', width: 120 },
  { title: '成交金额(元)', dataIndex: 'gmv', key: 'gmv', width: 120 },
  { title: 'ROI', dataIndex: 'roi', key: 'roi', width: 110 },
  { title: '转化率', dataIndex: 'conversion', key: 'conversion', width: 90 },
]

const campaigns = [
  {
    id: 'ca1',
    name: '春季焕新满减',
    channel: '社群',
    exposure: '42,110',
    orders: 862,
    couponAmount: '8,420',
    gmv: '62,180',
    roi: '3.7',
    conversion: 8.2,
  },
  {
    id: 'ca2',
    name: '会员周五券包',
    channel: '短信',
    exposure: '28,300',
    orders: 479,
    couponAmount: '6,110',
    gmv: '35,040',
    roi: '2.8',
    conversion: 6.9,
  },
  {
    id: 'ca3',
    name: '直播间加价购券',
    channel: '直播',
    exposure: '62,400',
    orders: 1_121,
    couponAmount: '9,830',
    gmv: '88,530',
    roi: '3.2',
    conversion: 7.1,
  },
  {
    id: 'ca4',
    name: '新人首单券',
    channel: '站内推送',
    exposure: '15,820',
    orders: 208,
    couponAmount: '2,240',
    gmv: '12,920',
    roi: '1.9',
    conversion: 4.8,
  },
]

const couponEffects = [
  { name: '满500减50', sent: 8200, used: 3480, rate: 42.4 },
  { name: '满200减20', sent: 12400, used: 5210, rate: 42.0 },
  { name: '新人券', sent: 3600, used: 1690, rate: 46.9 },
  { name: '直播券', sent: 2100, used: 680, rate: 32.4 },
]

const funnelData = [
  { name: '触达用户', value: '148,220', rate: 100, color: '#1677ff' },
  { name: '点击访问', value: '31,660', rate: 42, color: '#2f54eb' },
  { name: '加入购物车', value: '10,520', rate: 33, color: '#13c2c2' },
  { name: '提交订单', value: '4,260', rate: 40, color: '#52c41a' },
  { name: '支付成功', value: '3,120', rate: 73, color: '#faad14' },
]

const filteredCampaigns = computed(() => {
  return campaigns.filter((item) => {
    const keyword = filters.value.keyword.trim()
    const matchKeyword = !keyword || item.name.includes(keyword)
    const matchChannel = !filters.value.channel || item.channel === filters.value.channel
    return matchKeyword && matchChannel
  })
})

const resetFilters = () => {
  filters.value.keyword = ''
  filters.value.channel = undefined
  filters.value.dateRange = []
}

const getPopupContainer = (trigger?: HTMLElement) => trigger?.ownerDocument?.body ?? document.body
</script>

<style scoped>
.marketing-attribution-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.kpi-row {
  margin-bottom: 4px;
}

.kpi-card {
  border-radius: 12px;
}

.kpi-label {
  color: var(--text-secondary);
  font-size: 12px;
}

.kpi-value {
  margin-top: 6px;
  font-size: 26px;
  font-weight: 700;
  color: var(--text-primary);
}

.kpi-value.warning {
  color: var(--warning-color);
}

.kpi-value.success {
  color: var(--success-color);
}

.kpi-sub {
  margin-top: 4px;
  color: var(--text-muted);
  font-size: 12px;
}

.filter-bar {
  row-gap: 8px;
}

.funnel-card {
  margin-bottom: 8px;
}

.funnel-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}

.funnel-item {
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 10px 12px;
  background: var(--surface-elevated);
}

.funnel-title {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.funnel-values {
  margin-top: 6px;
  display: flex;
  justify-content: space-between;
  font-weight: 600;
}
</style>
