<template>
  <div class="inventory-page">
    <div class="page-title">库存中心</div>

    <a-row :gutter="16" class="kpi-row">
      <a-col :xs="24" :md="12" :xl="6">
        <a-card class="kpi-card">
          <div class="kpi-label">可用库存总量</div>
          <div class="kpi-value">{{ inventoryKpi.available }}</div>
          <div class="kpi-sub">较昨日 +2.1%</div>
        </a-card>
      </a-col>
      <a-col :xs="24" :md="12" :xl="6">
        <a-card class="kpi-card">
          <div class="kpi-label">锁定库存</div>
          <div class="kpi-value">{{ inventoryKpi.locked }}</div>
          <div class="kpi-sub">待发货订单占用</div>
        </a-card>
      </a-col>
      <a-col :xs="24" :md="12" :xl="6">
        <a-card class="kpi-card">
          <div class="kpi-label">低库存 SKU</div>
          <div class="kpi-value warning">{{ inventoryKpi.lowStock }}</div>
          <div class="kpi-sub">建议今日补货</div>
        </a-card>
      </a-col>
      <a-col :xs="24" :md="12" :xl="6">
        <a-card class="kpi-card">
          <div class="kpi-label">异常单据</div>
          <div class="kpi-value danger">{{ inventoryKpi.abnormal }}</div>
          <div class="kpi-sub">含盘点差异/调拨超时</div>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="16" class="warning-row">
      <a-col :xs="24" :xl="10">
        <a-card title="库存预警策略" class="panel-card">
          <a-form layout="vertical">
            <a-form-item label="默认预警阈值">
              <a-input-number v-model:value="warningThreshold" :min="1" style="width: 220px" />
            </a-form-item>
            <a-form-item label="预计售罄天数阈值">
              <a-input-number v-model:value="warningDays" :min="1" style="width: 220px" />
            </a-form-item>
            <a-form-item>
              <a-space direction="vertical" :size="10">
                <a-checkbox v-model:checked="autoCreateReplenish"
                  >低库存自动生成补货建议</a-checkbox
                >
                <a-checkbox v-model:checked="enableDingNotify">发送站内信与钉钉提醒</a-checkbox>
              </a-space>
            </a-form-item>
            <a-space>
              <a-button type="primary" @click="saveWarningPolicy">保存策略</a-button>
              <a-button @click="warningThreshold = 20">恢复默认</a-button>
            </a-space>
          </a-form>
        </a-card>
      </a-col>
      <a-col :xs="24" :xl="14">
        <a-card class="panel-card">
          <template #title>低库存提醒列表</template>
          <template #extra>
            <a-button
              size="small"
              type="primary"
              ghost
              :disabled="!hasPermission('inventory:replenish')"
              @click="generateReplenishFromWarnings"
            >
              一键生成补货建议
            </a-button>
          </template>
          <a-table
            :columns="lowStockColumns"
            :data-source="lowStockRows"
            :pagination="false"
            size="small"
            row-key="sku"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'level'">
                <a-tag :color="record.level === '高预警' ? 'red' : 'orange'">{{
                  record.level
                }}</a-tag>
              </template>
              <template v-else-if="column.key === 'action'">
                <a-button
                  type="link"
                  size="small"
                  :disabled="!hasPermission('inventory:replenish')"
                  @click="createReplenish(record)"
                >
                  生成补货
                </a-button>
              </template>
            </template>
          </a-table>
        </a-card>
      </a-col>
    </a-row>

    <a-card>
      <a-tabs v-model:activeKey="activeTab">
        <a-tab-pane key="ledger" tab="库存流水" />
        <a-tab-pane key="lock" tab="锁库存/解锁" />
        <a-tab-pane key="stocktake" tab="盘点单" />
        <a-tab-pane key="replenish" tab="补货建议" />
        <a-tab-pane key="transfer" tab="调拨单" />
        <a-tab-pane key="cost" tab="成本口径" />
      </a-tabs>

      <div v-if="activeTab === 'ledger'">
        <a-form layout="inline" class="filter-bar">
          <a-form-item label="SKU/SPU">
            <a-input
              v-model:value="ledgerFilters.keyword"
              placeholder="输入 SKU/SPU/商品名"
              allow-clear
            />
          </a-form-item>
          <a-form-item label="仓库">
            <a-select
              v-model:value="ledgerFilters.warehouse"
              :options="warehouseOptions"
              allow-clear
              placeholder="全部仓库"
              style="width: 160px"
            />
          </a-form-item>
          <a-form-item label="变动类型">
            <a-select
              v-model:value="ledgerFilters.direction"
              :options="directionOptions"
              allow-clear
              placeholder="全部类型"
              style="width: 150px"
            />
          </a-form-item>
          <a-form-item label="时间">
            <a-range-picker v-model:value="ledgerRange" />
          </a-form-item>
        </a-form>
        <a-table
          :columns="ledgerColumns"
          :data-source="filteredLedgerRows"
          :pagination="{ pageSize: 8 }"
          :scroll="{ x: 1400 }"
          row-key="id"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'direction'">
              <a-tag
                :color="
                  record.direction === '入库'
                    ? 'green'
                    : record.direction === '出库'
                      ? 'orange'
                      : 'blue'
                "
              >
                {{ record.direction }}
              </a-tag>
            </template>
            <template v-else-if="column.key === 'changeQty'">
              <span :class="record.changeQty > 0 ? 'text-green' : 'text-orange'">
                {{ record.changeQty > 0 ? `+${record.changeQty}` : record.changeQty }}
              </span>
            </template>
          </template>
        </a-table>
      </div>

      <div v-else-if="activeTab === 'lock'">
        <div class="toolbar">
          <a-space>
            <a-button
              type="primary"
              :disabled="!hasPermission('inventory:lock')"
              @click="batchUnlock"
              >批量解锁</a-button
            >
            <a-button :disabled="!hasPermission('inventory:lock')" @click="refreshLocks"
              >刷新锁库存</a-button
            >
          </a-space>
        </div>
        <a-table
          :columns="lockColumns"
          :data-source="lockRows"
          :pagination="{ pageSize: 8 }"
          :row-selection="lockRowSelection"
          row-key="id"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'status'">
              <a-tag :color="record.status === '锁定中' ? 'orange' : 'default'">{{
                record.status
              }}</a-tag>
            </template>
            <template v-else-if="column.key === 'action'">
              <a-space>
                <a-button
                  type="link"
                  :disabled="record.status !== '锁定中' || !hasPermission('inventory:lock')"
                  @click="unlockOne(record.id)"
                  >解锁</a-button
                >
              </a-space>
            </template>
          </template>
        </a-table>
      </div>

      <div v-else-if="activeTab === 'stocktake'">
        <div class="toolbar">
          <a-space>
            <a-button
              type="primary"
              :disabled="!hasPermission('inventory:stocktake')"
              @click="createStocktake"
              >新建盘点单</a-button
            >
          </a-space>
        </div>
        <a-table
          :columns="stocktakeColumns"
          :data-source="stocktakeRows"
          :pagination="{ pageSize: 8 }"
          row-key="id"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'status'">
              <a-tag
                :color="
                  record.status === '已完成'
                    ? 'green'
                    : record.status === '盘点中'
                      ? 'blue'
                      : 'orange'
                "
              >
                {{ record.status }}
              </a-tag>
            </template>
            <template v-else-if="column.key === 'action'">
              <a-space>
                <a-button type="link">查看</a-button>
                <a-button
                  type="link"
                  :disabled="record.status !== '草稿' || !hasPermission('inventory:stocktake')"
                  >开始盘点</a-button
                >
              </a-space>
            </template>
          </template>
        </a-table>
      </div>

      <div v-else-if="activeTab === 'replenish'">
        <div class="toolbar">
          <a-space>
            <a-button
              type="primary"
              :disabled="!hasPermission('inventory:replenish')"
              @click="generateReplenishFromWarnings"
              >生成补货建议</a-button
            >
            <a-button
              :disabled="!hasPermission('inventory:replenish')"
              @click="message.info('已推送给供货管理中心')"
              >推送采购入库</a-button
            >
          </a-space>
        </div>
        <a-table
          :columns="replenishColumns"
          :data-source="replenishRows"
          :pagination="{ pageSize: 8 }"
          row-key="id"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'status'">
              <a-tag
                :color="
                  record.status === '已完成'
                    ? 'green'
                    : record.status === '待审核'
                      ? 'orange'
                      : 'blue'
                "
              >
                {{ record.status }}
              </a-tag>
            </template>
            <template v-else-if="column.key === 'action'">
              <a-space>
                <a-button type="link">查看</a-button>
                <a-button
                  type="link"
                  :disabled="record.status !== '待审核' || !hasPermission('inventory:replenish')"
                  @click="approveReplenish(record.id)"
                >
                  审核通过
                </a-button>
              </a-space>
            </template>
          </template>
        </a-table>
      </div>

      <div v-else-if="activeTab === 'transfer'">
        <div class="toolbar">
          <a-space>
            <a-button
              type="primary"
              :disabled="!hasPermission('inventory:transfer')"
              @click="createTransfer"
              >新建调拨单</a-button
            >
          </a-space>
        </div>
        <a-table
          :columns="transferColumns"
          :data-source="transferRows"
          :pagination="{ pageSize: 8 }"
          row-key="id"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'status'">
              <a-tag
                :color="
                  record.status === '已完成'
                    ? 'green'
                    : record.status === '调拨中'
                      ? 'blue'
                      : 'orange'
                "
              >
                {{ record.status }}
              </a-tag>
            </template>
            <template v-else-if="column.key === 'action'">
              <a-space>
                <a-button type="link">查看</a-button>
                <a-button
                  type="link"
                  :disabled="record.status !== '待出库' || !hasPermission('inventory:transfer')"
                  >确认出库</a-button
                >
              </a-space>
            </template>
          </template>
        </a-table>
      </div>

      <div v-else>
        <a-row :gutter="16">
          <a-col :xs="24" :xl="12">
            <a-card title="成本核算口径" size="small" class="card-block">
              <a-radio-group v-model:value="costModel" button-style="solid">
                <a-radio-button value="moving-average">移动平均</a-radio-button>
                <a-radio-button value="fifo">先进先出(FIFO)</a-radio-button>
                <a-radio-button value="fixed">固定成本</a-radio-button>
              </a-radio-group>
              <div class="cost-tips">
                当前口径：<b>{{ costModelLabel }}</b
                >。将影响库存价值与毛利计算。
              </div>
            </a-card>
          </a-col>
          <a-col :xs="24" :xl="12">
            <a-card title="成本变更记录" size="small" class="card-block">
              <a-timeline>
                <a-timeline-item v-for="item in costLogs" :key="item.time">
                  <div>{{ item.desc }}</div>
                  <div class="timeline-time">{{ item.time }}</div>
                </a-timeline-item>
              </a-timeline>
            </a-card>
          </a-col>
        </a-row>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import dayjs from 'dayjs'
import { message } from 'ant-design-vue'
import { hasPermission } from '../utils/permissions'

const activeTab = ref('ledger')
const costModel = ref<'moving-average' | 'fifo' | 'fixed'>('moving-average')
const selectedLockIds = ref<string[]>([])
const warningThreshold = ref(20)
const warningDays = ref(5)
const autoCreateReplenish = ref(true)
const enableDingNotify = ref(true)

const inventoryKpi = {
  available: 12680,
  locked: 1820,
  lowStock: 5,
  abnormal: 5,
}

const warehouseOptions = [
  { label: '济南一仓', value: '济南一仓' },
  { label: '济南二仓', value: '济南二仓' },
  { label: '华北中转仓', value: '华北中转仓' },
]

const directionOptions = [
  { label: '入库', value: '入库' },
  { label: '出库', value: '出库' },
  { label: '锁定', value: '锁定' },
  { label: '解锁', value: '解锁' },
]

const ledgerFilters = ref({
  keyword: '',
  warehouse: undefined as string | undefined,
  direction: undefined as string | undefined,
  dateRange: [] as string[],
})

const ledgerRange = computed({
  get: () => {
    if (ledgerFilters.value.dateRange.length === 2) {
      return [dayjs(ledgerFilters.value.dateRange[0]), dayjs(ledgerFilters.value.dateRange[1])]
    }
    return null
  },
  set: (value) => {
    if (!value || value.length !== 2) {
      ledgerFilters.value.dateRange = []
      return
    }
    ledgerFilters.value.dateRange = [value[0].format('YYYY-MM-DD'), value[1].format('YYYY-MM-DD')]
  },
})

const ledgerColumns = [
  { title: '时间', dataIndex: 'time', key: 'time', width: 160 },
  { title: '业务单号', dataIndex: 'bizNo', key: 'bizNo', width: 180 },
  { title: 'SKU/SPU', dataIndex: 'sku', key: 'sku', width: 260 },
  { title: '仓库', dataIndex: 'warehouse', key: 'warehouse', width: 120 },
  { title: '变动类型', dataIndex: 'direction', key: 'direction', width: 110 },
  { title: '变动数量', dataIndex: 'changeQty', key: 'changeQty', width: 120 },
  { title: '锁定库存', dataIndex: 'lockedQty', key: 'lockedQty', width: 110 },
  { title: '可用库存', dataIndex: 'availableQty', key: 'availableQty', width: 110 },
  { title: '操作人', dataIndex: 'operator', key: 'operator', width: 120 },
  { title: '备注', dataIndex: 'remark', key: 'remark', width: 220 },
]

const ledgerRows = ref([
  {
    id: 'LG001',
    time: '2026-02-27 09:12:11',
    bizNo: 'OD202602270001',
    sku: '猫爬架-红色-200/SPU000905',
    warehouse: '济南一仓',
    direction: '锁定',
    changeQty: -2,
    lockedQty: 2,
    availableQty: 96,
    operator: '系统',
    remark: '订单占用库存',
  },
  {
    id: 'LG002',
    time: '2026-02-27 09:25:49',
    bizNo: 'PI202602270012',
    sku: '猫爬架-红色-200/SPU000905',
    warehouse: '济南一仓',
    direction: '入库',
    changeQty: 30,
    lockedQty: 2,
    availableQty: 126,
    operator: '仓管-王宁',
    remark: '采购入库单回传',
  },
  {
    id: 'LG003',
    time: '2026-02-27 10:05:02',
    bizNo: 'AS20260227008',
    sku: '猫抓柱-原木/SPU000906',
    warehouse: '济南二仓',
    direction: '解锁',
    changeQty: 1,
    lockedQty: 0,
    availableQty: 45,
    operator: '售后专员',
    remark: '售后驳回，释放占用',
  },
])

const filteredLedgerRows = computed(() => {
  return ledgerRows.value.filter((item) => {
    const keyword = ledgerFilters.value.keyword.trim()
    const matchKeyword = !keyword || item.sku.includes(keyword) || item.bizNo.includes(keyword)
    const matchWarehouse =
      !ledgerFilters.value.warehouse || item.warehouse === ledgerFilters.value.warehouse
    const matchDirection =
      !ledgerFilters.value.direction || item.direction === ledgerFilters.value.direction
    return matchKeyword && matchWarehouse && matchDirection
  })
})

const lowStockColumns = [
  { title: 'SKU', dataIndex: 'sku', key: 'sku', width: 260 },
  { title: '可用库存', dataIndex: 'stock', key: 'stock', width: 100 },
  { title: '近7天销量', dataIndex: 'sales7d', key: 'sales7d', width: 110 },
  { title: '预计售罄', dataIndex: 'depleteDays', key: 'depleteDays', width: 100 },
  { title: '预警等级', dataIndex: 'level', key: 'level', width: 100 },
  { title: '建议补货量', dataIndex: 'suggestQty', key: 'suggestQty', width: 110 },
  { title: '操作', key: 'action', width: 110 },
]

const lowStockRows = ref([
  {
    sku: '猫爬架-红色-200',
    stock: 8,
    sales7d: 32,
    depleteDays: '1.8天',
    level: '高预警',
    suggestQty: 80,
  },
  {
    sku: '猫抓柱-原木',
    stock: 14,
    sales7d: 29,
    depleteDays: '3.4天',
    level: '中预警',
    suggestQty: 50,
  },
  {
    sku: '逗猫棒-羽毛款',
    stock: 11,
    sales7d: 26,
    depleteDays: '2.9天',
    level: '高预警',
    suggestQty: 60,
  },
  {
    sku: '猫砂盆-加大款',
    stock: 17,
    sales7d: 20,
    depleteDays: '5.1天',
    level: '中预警',
    suggestQty: 40,
  },
  {
    sku: '宠物垫-秋冬款',
    stock: 9,
    sales7d: 24,
    depleteDays: '2.6天',
    level: '高预警',
    suggestQty: 55,
  },
])

const lockColumns = [
  { title: '锁定ID', dataIndex: 'id', key: 'id', width: 140 },
  { title: '订单号', dataIndex: 'orderId', key: 'orderId', width: 180 },
  { title: 'SKU', dataIndex: 'sku', key: 'sku' },
  { title: '锁定数量', dataIndex: 'qty', key: 'qty', width: 110 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '锁定时间', dataIndex: 'lockTime', key: 'lockTime', width: 160 },
  { title: '自动释放时间', dataIndex: 'expireTime', key: 'expireTime', width: 160 },
  { title: '操作', key: 'action', width: 100 },
]

const lockRows = ref([
  {
    id: 'LOCK-1001',
    orderId: 'DD2026020417142',
    sku: '猫爬架-红色-200',
    qty: 2,
    status: '锁定中',
    lockTime: '2026-02-27 10:01:09',
    expireTime: '2026-02-27 10:31:09',
  },
  {
    id: 'LOCK-1002',
    orderId: 'DD2026020310021',
    sku: '猫抓柱-原木',
    qty: 1,
    status: '已释放',
    lockTime: '2026-02-27 09:20:09',
    expireTime: '2026-02-27 09:50:09',
  },
])

const lockRowSelection = computed(() => ({
  selectedRowKeys: selectedLockIds.value,
  onChange: (keys: string[]) => {
    selectedLockIds.value = keys
  },
}))

const stocktakeColumns = [
  { title: '盘点单号', dataIndex: 'id', key: 'id', width: 150 },
  { title: '盘点仓库', dataIndex: 'warehouse', key: 'warehouse', width: 140 },
  { title: '盘点范围', dataIndex: 'scope', key: 'scope' },
  { title: '状态', dataIndex: 'status', key: 'status', width: 110 },
  { title: '差异数量', dataIndex: 'diffQty', key: 'diffQty', width: 120 },
  { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 160 },
  { title: '操作', key: 'action', width: 140 },
]

const stocktakeRows = ref([
  {
    id: 'PD20260227001',
    warehouse: '济南一仓',
    scope: '猫爬架类目',
    status: '盘点中',
    diffQty: 3,
    createdAt: '2026-02-27 09:00:00',
  },
  {
    id: 'PD20260226008',
    warehouse: '济南二仓',
    scope: '全仓',
    status: '已完成',
    diffQty: 0,
    createdAt: '2026-02-26 14:10:00',
  },
])

const replenishColumns = [
  { title: '补货单号', dataIndex: 'id', key: 'id', width: 160 },
  { title: '来源', dataIndex: 'source', key: 'source', width: 120 },
  { title: 'SKU', dataIndex: 'sku', key: 'sku' },
  { title: '建议数量', dataIndex: 'qty', key: 'qty', width: 110 },
  { title: '目标仓库', dataIndex: 'warehouse', key: 'warehouse', width: 140 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 110 },
  { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 170 },
  { title: '操作', key: 'action', width: 140 },
]

const replenishRows = ref([
  {
    id: 'RP20260227001',
    source: '预警自动',
    sku: '猫爬架-红色-200',
    qty: 80,
    warehouse: '济南一仓',
    status: '待审核',
    createdAt: '2026-02-27 10:16:00',
  },
  {
    id: 'RP20260226011',
    source: '人工创建',
    sku: '猫抓柱-原木',
    qty: 50,
    warehouse: '济南二仓',
    status: '待采购',
    createdAt: '2026-02-26 16:22:00',
  },
  {
    id: 'RP20260225008',
    source: '预警自动',
    sku: '猫砂盆-加大款',
    qty: 40,
    warehouse: '华北中转仓',
    status: '已完成',
    createdAt: '2026-02-25 14:03:00',
  },
])

const transferColumns = [
  { title: '调拨单号', dataIndex: 'id', key: 'id', width: 150 },
  { title: '调出仓', dataIndex: 'fromWarehouse', key: 'fromWarehouse', width: 140 },
  { title: '调入仓', dataIndex: 'toWarehouse', key: 'toWarehouse', width: 140 },
  { title: '商品', dataIndex: 'sku', key: 'sku' },
  { title: '数量', dataIndex: 'qty', key: 'qty', width: 90 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 160 },
  { title: '操作', key: 'action', width: 140 },
]

const transferRows = ref([
  {
    id: 'TR20260227009',
    fromWarehouse: '济南一仓',
    toWarehouse: '华北中转仓',
    sku: '猫爬架-红色-200',
    qty: 20,
    status: '调拨中',
    createdAt: '2026-02-27 08:45:00',
  },
  {
    id: 'TR20260226002',
    fromWarehouse: '济南二仓',
    toWarehouse: '济南一仓',
    sku: '猫抓柱-原木',
    qty: 10,
    status: '已完成',
    createdAt: '2026-02-26 11:20:00',
  },
])

const costLogs = [
  { time: '2026-02-24 10:10:00', desc: '成本口径从固定成本切换为移动平均' },
  { time: '2026-02-20 15:08:00', desc: '执行历史库存成本重算，影响 38 个 SKU' },
]

const costModelLabel = computed(() => {
  if (costModel.value === 'fifo') return '先进先出(FIFO)'
  if (costModel.value === 'fixed') return '固定成本'
  return '移动平均'
})

const unlockOne = (id: string) => {
  if (!hasPermission('inventory:lock')) return
  lockRows.value = lockRows.value.map((item) =>
    item.id === id ? { ...item, status: '已释放' } : item
  )
  message.success('已解锁库存')
}

const batchUnlock = () => {
  if (!hasPermission('inventory:lock')) return
  if (selectedLockIds.value.length === 0) {
    message.warning('请先选择要解锁的记录')
    return
  }
  const set = new Set(selectedLockIds.value)
  lockRows.value = lockRows.value.map((item) =>
    set.has(item.id) ? { ...item, status: '已释放' } : item
  )
  selectedLockIds.value = []
  message.success('批量解锁成功')
}

const refreshLocks = () => {
  message.success('锁库存状态已刷新')
}

const createStocktake = () => {
  if (!hasPermission('inventory:stocktake')) return
  stocktakeRows.value.unshift({
    id: `PD${dayjs().format('YYYYMMDDHHmmss')}`,
    warehouse: '济南一仓',
    scope: '按类目',
    status: '草稿',
    diffQty: 0,
    createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
  })
  message.success('已创建盘点单草稿')
}

const createTransfer = () => {
  if (!hasPermission('inventory:transfer')) return
  transferRows.value.unshift({
    id: `TR${dayjs().format('YYYYMMDDHHmmss')}`,
    fromWarehouse: '济南一仓',
    toWarehouse: '华北中转仓',
    sku: '待选择',
    qty: 0,
    status: '待出库',
    createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
  })
  message.success('已创建调拨单')
}

const saveWarningPolicy = () => {
  message.success('库存预警策略已保存')
}

const createReplenish = (row: { sku: string; suggestQty: number }) => {
  if (!hasPermission('inventory:replenish')) return
  replenishRows.value.unshift({
    id: `RP${dayjs().format('YYYYMMDDHHmmss')}`,
    source: '人工创建',
    sku: row.sku,
    qty: row.suggestQty,
    warehouse: '济南一仓',
    status: '待审核',
    createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
  })
  message.success('补货建议已生成')
}

const generateReplenishFromWarnings = () => {
  if (!hasPermission('inventory:replenish')) return
  const newRows = lowStockRows.value.slice(0, 2).map((item, idx) => ({
    id: `RP${dayjs().format('YYYYMMDDHHmmss')}${idx}`,
    source: '预警自动',
    sku: item.sku,
    qty: item.suggestQty,
    warehouse: '济南一仓',
    status: '待审核',
    createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
  }))
  replenishRows.value = [...newRows, ...replenishRows.value]
  message.success('已批量生成补货建议')
}

const approveReplenish = (id: string) => {
  if (!hasPermission('inventory:replenish')) return
  replenishRows.value = replenishRows.value.map((item) =>
    item.id === id ? { ...item, status: '待采购' } : item
  )
  message.success('补货单已通过')
}
</script>

<style scoped>
.inventory-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.kpi-row {
  margin-bottom: 4px;
}

.warning-row {
  margin-bottom: 4px;
}

.kpi-card {
  border-radius: 12px;
}

.panel-card {
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

.kpi-value.danger {
  color: var(--danger-color);
}

.kpi-sub {
  margin-top: 4px;
  color: var(--text-muted);
  font-size: 12px;
}

.filter-bar {
  margin-bottom: 12px;
  row-gap: 8px;
}

.toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
}

.text-green {
  color: var(--success-color);
  font-weight: 600;
}

.text-orange {
  color: var(--warning-color);
  font-weight: 600;
}

.card-block {
  margin-top: 8px;
}

.cost-tips {
  margin-top: 12px;
  font-size: 12px;
  color: var(--text-secondary);
}

.timeline-time {
  margin-top: 2px;
  color: var(--text-muted);
  font-size: 12px;
}
</style>
