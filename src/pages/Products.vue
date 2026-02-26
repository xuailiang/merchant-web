<template>
  <div>
    <div class="page-title">商品管理</div>
    <a-card>
      <a-row :gutter="16" class="card-section warning-section">
        <a-col :xs="24" :lg="8">
          <a-card class="warning-card">
            <div class="warning-title">库存预警阈值</div>
            <div class="warning-setting">
              <a-input-number v-model:value="warningThreshold" :min="1" />
              <a-button type="primary" size="small">保存</a-button>
            </div>
            <div class="warning-meta">低于阈值的商品将进入提醒列表。</div>
          </a-card>
        </a-col>
        <a-col :xs="24" :lg="16">
          <a-card class="warning-card">
            <div class="warning-title">库存预警提醒</div>
            <a-table
              :columns="warningColumns"
              :data-source="warningList"
              :pagination="false"
              size="small"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'level'">
                  <a-tag :color="record.stock <= warningThreshold / 2 ? 'red' : 'orange'">{{ record.level }}</a-tag>
                </template>
                <template v-else-if="column.key === 'action'">
                  <a-space>
                    <a-button type="link">补货</a-button>
                    <a-button type="link">调整阈值</a-button>
                  </a-space>
                </template>
              </template>
            </a-table>
          </a-card>
        </a-col>
      </a-row>
    </a-card>

    <TableWrapper>
      <template #filters>
        <a-tabs v-model:activeKey="activeTab" class="product-tabs">
          <a-tab-pane key="all" :tab="`全部商品(${products.length})`" />
          <a-tab-pane key="draft" :tab="`草稿箱(${drafts.length})`" />
        </a-tabs>

        <a-form layout="inline" class="filter-bar">
          <a-form-item label="商品名称">
            <a-input v-model:value="filters.name" placeholder="请输入商品名称" allow-clear />
          </a-form-item>
          <a-form-item label="商品编码">
            <a-input v-model:value="filters.code" placeholder="请输入商品编码" allow-clear />
          </a-form-item>
          <a-form-item label="商品分类">
            <a-select v-model:value="filters.category" :options="categoryOptions" allow-clear placeholder="请选择" />
          </a-form-item>
          <a-form-item label="品牌名称">
            <a-input v-model:value="filters.brand" placeholder="请输入品牌名称" allow-clear />
          </a-form-item>
          <a-form-item label="售价区间">
            <a-input-number v-model:value="filters.priceMin" placeholder="最低价" />
            <span class="range-split">-</span>
            <a-input-number v-model:value="filters.priceMax" placeholder="最高价" />
          </a-form-item>
          <a-form-item label="库存区间">
            <a-input-number v-model:value="filters.stockMin" placeholder="最低库存" />
            <span class="range-split">-</span>
            <a-input-number v-model:value="filters.stockMax" placeholder="最高库存" />
          </a-form-item>
          <a-form-item label="首次上架日期">
            <a-range-picker v-model:value="rangeValue" />
          </a-form-item>
          <a-form-item label="商品状态">
            <a-select
              v-model:value="filters.statuses"
              :options="statusOptions"
              mode="multiple"
              allow-clear
              placeholder="请选择"
              style="min-width: 160px"
            />
          </a-form-item>
          <a-space>
            <a-button type="primary">查询</a-button>
            <a-button @click="resetFilters">重置</a-button>
          </a-space>
        </a-form>
      </template>

      <template #actions>
        <a-space class="batch-actions" wrap>
          <a-button v-if="hasPermission('products:create')" type="primary" @click="goCreate">新增商品</a-button>
          <a-button v-if="hasPermission('products:batch')" @click="runBatchAction('up')">批量上架</a-button>
          <a-button v-if="hasPermission('products:batch')" @click="runBatchAction('down')">批量下架</a-button>
          <a-button v-if="hasPermission('products:batch')" @click="runBatchAction('stock')">批量增加库存</a-button>
          <a-button v-if="hasPermission('products:delete')" danger @click="runBatchAction('delete')">批量删除</a-button>
          <a-button v-if="hasPermission('products:export')" type="dashed">导出数据</a-button>
          <a-button @click="toggleView">
            {{ viewMode === 'table' ? '卡片展示' : '表格展示' }}
          </a-button>
          <ColumnSetting :columns="allColumns" v-model="visibleKeys" @reset="reset" />
        </a-space>
      </template>

      <template v-if="activeTab === 'draft'">
        <a-table :columns="draftColumns" :data-source="drafts" :pagination="{ pageSize: 6 }" :scroll="{ x: 1000 }">
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'info'">
              <div class="product-info">
                <div class="draft-thumb">
                  <img v-if="record.image" :src="record.image" alt="草稿图" />
                  <div v-else class="draft-thumb-placeholder" />
                </div>
                <div>
                  <div class="product-name">{{ record.title }}</div>
                  <div class="product-meta">草稿ID：{{ record.id }}</div>
                  <div class="product-meta">更新：{{ record.updatedAt }}</div>
                </div>
              </div>
            </template>
            <template v-else-if="column.key === 'price'">
              <div v-if="record.price">¥{{ record.price }}</div>
              <div v-else class="draft-skeleton-line"></div>
            </template>
            <template v-else-if="column.key === 'stock'">
              <div v-if="record.stock !== null && record.stock !== undefined">{{ record.stock }}</div>
              <div v-else class="draft-skeleton-line"></div>
            </template>
            <template v-else-if="column.key === 'status'">
              <a-tag color="orange">草稿</a-tag>
            </template>
            <template v-else-if="column.key === 'action'">
              <a-space>
                <a-button type="link" @click="openDraft(record.id)">继续编辑</a-button>
                <a-button type="link" danger @click="removeDraft(record.id)">删除</a-button>
              </a-space>
            </template>
          </template>
        </a-table>
      </template>
      <template v-else-if="isMobile">
        <a-list :data-source="pagedProducts" item-layout="vertical">
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
                  <span class="mobile-label">售价/库存</span>
                  <span>¥{{ item.price }} / {{ item.stock }}</span>
                </div>
                <div class="mobile-row">
                  <span class="mobile-label">利润率</span>
                  <span>{{ calcProfitRate(item) }}%</span>
                </div>
                <div class="mobile-row">
                  <span class="mobile-label">状态</span>
                  <a-tag :color="getProductStatusMeta(item.status).color">{{ getProductStatusMeta(item.status).label }}</a-tag>
                </div>
                <div class="mobile-actions">
                  <template v-for="action in getProductPrimaryActions(item)" :key="action.key">
                    <RouterLink v-if="action.to && isActionAllowed(action)" :to="action.to(item)">{{ action.label }}</RouterLink>
                    <a-button v-else-if="isActionAllowed(action)" type="link">{{ action.label }}</a-button>
                  </template>
                </div>
              </a-card>
            </a-list-item>
          </template>
        </a-list>
        <div class="mobile-pagination">
          <a-pagination
            v-model:current="pagination.current"
            :page-size="pagination.pageSize"
            :total="filteredProducts.length"
            size="small"
          />
        </div>
      </template>
      <div v-else-if="viewMode === 'card'" class="card-grid">
        <a-row :gutter="[16, 16]">
          <a-col v-for="item in pagedProducts" :key="item.key" :xs="24" :sm="12" :lg="6">
            <a-card class="product-card">
              <div class="card-media">
                <img :src="item.image" alt="商品图" />
                <a-tag class="card-status" :color="getProductStatusMeta(item.status).color">
                  {{ getProductStatusMeta(item.status).label }}
                </a-tag>
              </div>
              <div class="card-body">
                <div class="card-title">{{ item.name }}</div>
                <div class="card-meta">
                  <a-tag color="blue">{{ item.category }}</a-tag>
                  <span>{{ item.brand }}</span>
                </div>
                <div class="card-code">商品编码：{{ item.code }}</div>
                <div class="card-price">
                  <span class="price-main">¥{{ item.price }}</span>
                  <span class="price-sub">销量 {{ item.sales }}</span>
                </div>
                <div class="card-meta">
                  <span>成本价 ¥{{ item.cost }}</span>
                  <span>利润率 {{ calcProfitRate(item) }}%</span>
                </div>
                <div class="card-stock">
                  <span>库存：{{ item.stock }}</span>
                  <a-progress :percent="Math.min(100, (item.stock / 300) * 100)" size="small" :show-info="false" />
                </div>
                <div class="card-meta">
                  <span>更新：{{ item.updatedAt }}</span>
                </div>
                <div class="card-actions">
                  <template v-for="action in getProductPrimaryActions(item)" :key="action.key">
                    <RouterLink v-if="action.to && isActionAllowed(action)" :to="action.to(item)">{{ action.label }}</RouterLink>
                    <a-button v-else-if="isActionAllowed(action)" type="link" :danger="action.danger">{{ action.label }}</a-button>
                  </template>
                  <a-dropdown
                    v-if="getProductMoreActions(item).length"
                    :getPopupContainer="getPopupContainer"
                    :menu="{ items: getProductMoreMenuItems(item) }"
                  >
                    <a-button type="link">更多</a-button>
                  </a-dropdown>
                </div>
              </div>
            </a-card>
          </a-col>
        </a-row>
        <div class="card-pagination">
          <a-pagination
            v-model:current="pagination.current"
            :page-size="pagination.pageSize"
            :total="filteredProducts.length"
            :show-size-changer="false"
          />
        </div>
      </div>
      <a-table
        v-else
        :columns="columns"
        :data-source="filteredProducts"
        :pagination="{ pageSize: 6 }"
        :scroll="{ x: 1300 }"
        class="products-table"
        :loading="tableLoading"
        :locale="{ emptyText: h(TableEmpty, { description: '暂无商品数据' }) }"
        :row-selection="rowSelection"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'info'">
            <div class="product-info">
              <img :src="record.image" alt="商品图" class="product-thumb" />
              <div>
                <div class="product-name">{{ record.name }}</div>
                <div class="product-meta">商品编码：{{ record.code }}</div>
                <div class="product-meta">类目：{{ record.category }}</div>
                <a-tag color="blue" class="product-tag">{{ record.brand }}</a-tag>
              </div>
            </div>
          </template>
          <template v-else-if="column.key === 'profit'">
            <div class="profit-cell">
              <span class="profit-value">¥{{ calcProfit(record).toFixed(2) }}</span>
              <a-tag :color="Number(calcProfitRate(record)) >= 30 ? 'green' : 'orange'">
                {{ calcProfitRate(record) }}%
              </a-tag>
            </div>
          </template>
          <template v-else-if="column.key === 'priceStock'">
            <div class="price-stack">¥{{ record.price }}</div>
            <div class="product-meta">库存：{{ record.stock }}</div>
            <div class="product-meta">销量：{{ record.sales }}</div>
          </template>
          <template v-else-if="column.key === 'channel'">
            <div class="product-meta">{{ record.channel }}</div>
            <div class="product-meta">店铺：{{ record.shop }}</div>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="getProductStatusMeta(record.status).color">{{ getProductStatusMeta(record.status).label }}</a-tag>
          </template>
          <template v-else-if="column.key === 'time'">
            <div class="product-meta">更新：{{ record.updatedAt }}</div>
            <div class="product-meta">首次上架：{{ record.listedAt }}</div>
          </template>
          <template v-else-if="column.key === 'action'">
            <div class="actions">
              <template v-for="action in getProductPrimaryActions(record)" :key="action.key">
                <RouterLink v-if="action.to && isActionAllowed(action)" class="action-link" :to="action.to(record)">{{
                  action.label
                }}</RouterLink>
                <a-button
                  v-else-if="isActionAllowed(action)"
                  size="small"
                  class="action-btn"
                  :danger="action.danger"
                >
                  {{ action.label }}
                </a-button>
              </template>
              <a-dropdown
                v-if="getProductMoreActions(record).length"
                :getPopupContainer="getPopupContainer"
                :menu="{ items: getProductMoreMenuItems(record) }"
              >
                <a-button size="small" class="action-btn">更多</a-button>
              </a-dropdown>
            </div>
          </template>
        </template>
      </a-table>
    </TableWrapper>
  </div>
</template>

<script setup lang="ts">
import { computed, h, onMounted, ref, watch } from 'vue'
import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import { RouterLink, useRouter } from 'vue-router'
import TableWrapper from '../components/TableWrapper.vue'
import ColumnSetting from '../components/ColumnSetting.vue'
import TableEmpty from '../components/TableEmpty.vue'
import { useIsMobile } from '../utils/useIsMobile'
import { usePersistedFilters } from '../utils/usePersistedFilters'
import { hasPermission } from '../utils/permissions'
import { fetchProducts } from '../api/endpoints'
import { message, Modal, notification } from 'ant-design-vue'
import { useColumnConfig } from '../utils/columnConfig'
import {
  productActionConfig,
  productStatusActions,
  productStatusConfig,
  type ActionDef,
} from '../utils/statusConfig'

const isMobile = useIsMobile()
const router = useRouter()
const activeTab = ref('all')
const viewMode = ref<'table' | 'card'>('table')
const drafts = ref<Array<{ id: string; title: string; updatedAt: string; image?: string; price?: number | null; stock?: number | null }>>([])
const DRAFT_KEY = 'product-drafts'
const warningThreshold = ref(30)
const getPopupContainer = (trigger: HTMLElement) => trigger?.parentNode || document.body
dayjs.extend(isBetween)
const allColumns = [
  { title: '商品基本信息', dataIndex: 'info', key: 'info', width: 320 },
  { title: '成本价/利润率(主SKU)', dataIndex: 'profit', key: 'profit', width: 170 },
  { title: '售价/库存/销量', dataIndex: 'priceStock', key: 'priceStock', width: 170 },
  { title: '渠道/店铺', dataIndex: 'channel', key: 'channel', width: 150 },
  { title: '商品状态', dataIndex: 'status', key: 'status', width: 110 },
  { title: '时间信息', dataIndex: 'time', key: 'time', width: 190 },
  { title: '操作', key: 'action', width: 200 },
]

const { visibleKeys, filteredColumns: columns, reset } = useColumnConfig('columns:products', allColumns)
const tableLoading = ref(false)

const products = ref([
  {
    key: 'p1',
    name: '星曜Pro 智能手机 256G',
    category: '数码/手机',
    price: 3499,
    cost: 2899,
    stock: 58,
    sales: 326,
    status: '上架中',
    listedAt: '2026-01-22',
    updatedAt: '2026-02-01 12:01:12',
    code: '10242601000224',
    brand: '星曜',
    image: 'https://picsum.photos/id/1062/100/100',
    channel: '积分商城',
    shop: '星辰旗舰店',
  },
  {
    key: 'p2',
    name: 'Aurora 无线降噪耳机',
    category: '数码/耳机',
    price: 899,
    cost: 560,
    stock: 32,
    sales: 214,
    status: '库存紧张',
    listedAt: '2026-02-01',
    updatedAt: '2026-02-02 09:44:21',
    code: '10382601000223',
    brand: 'Aurora',
    image: 'https://picsum.photos/id/180/100/100',
    channel: '商城',
    shop: 'Aurora官方店',
  },
  {
    key: 'p3',
    name: 'Lume 智能手表 S3',
    category: '数码/穿戴',
    price: 1299,
    cost: 860,
    stock: 126,
    sales: 402,
    status: '上架中',
    listedAt: '2026-01-15',
    updatedAt: '2026-01-31 18:20:05',
    code: '10962601000198',
    brand: 'Lume',
    image: 'https://picsum.photos/id/1084/100/100',
    channel: '直播带货',
    shop: 'Lume旗舰店',
  },
  {
    key: 'p4',
    name: 'Nebula 游戏键盘 RGB',
    category: '数码/外设',
    price: 499,
    cost: 260,
    stock: 84,
    sales: 158,
    status: '上架中',
    listedAt: '2026-01-08',
    updatedAt: '2026-01-30 10:05:41',
    code: '11012601000201',
    brand: 'Nebula',
    image: 'https://picsum.photos/id/1040/100/100',
    channel: '商城',
    shop: 'Nebula外设店',
  },
  {
    key: 'p5',
    name: 'Pulse 便携音箱',
    category: '数码/音频',
    price: 359,
    cost: 190,
    stock: 18,
    sales: 92,
    status: '库存紧张',
    listedAt: '2026-02-02',
    updatedAt: '2026-02-02 16:10:33',
    code: '11282601000311',
    brand: 'Pulse',
    image: 'https://picsum.photos/id/1025/100/100',
    channel: '积分商城',
    shop: 'Pulse音频店',
  },
  {
    key: 'p6',
    name: 'Mira 平板电脑 11 英寸',
    category: '数码/平板',
    price: 2699,
    cost: 1980,
    stock: 64,
    sales: 137,
    status: '上架中',
    listedAt: '2026-01-28',
    updatedAt: '2026-02-01 15:22:09',
    code: '11452601000287',
    brand: 'Mira',
    image: 'https://picsum.photos/id/1011/100/100',
    channel: '商城',
    shop: 'Mira数码店',
  },
])

const USE_REMOTE = false

onMounted(async () => {
  if (!USE_REMOTE) return
  try {
    const res = await fetchProducts({
      name: filters.name,
      code: filters.code,
      category: filters.category,
      brand: filters.brand,
      statuses: filters.statuses,
      priceMin: filters.priceMin,
      priceMax: filters.priceMax,
      stockMin: filters.stockMin,
      stockMax: filters.stockMax,
      startDate: filters.dateRange[0],
      endDate: filters.dateRange[1],
      page: pagination.current,
      pageSize: pagination.pageSize,
    })
    products.value = res.list as typeof products.value
  } catch (error) {
    message.error('商品列表加载失败，请检查接口配置')
  }
})

const warningColumns = [
  { title: '商品', dataIndex: 'name', key: 'name' },
  { title: '当前库存', dataIndex: 'stock', key: 'stock', width: 100 },
  { title: '等级', dataIndex: 'level', key: 'level', width: 120 },
  { title: '操作', key: 'action', width: 160 },
]

const warningList = computed(() => {
  return products.value
    .filter((item) => item.stock <= warningThreshold.value)
    .map((item) => ({
      key: item.key,
      name: item.name,
      stock: item.stock,
      level: item.stock <= warningThreshold.value / 2 ? '高预警' : '中预警',
    }))
})

const filters = usePersistedFilters('filters:products', {
  name: '',
  code: '',
  category: '',
  brand: '',
  statuses: [] as string[],
  dateRange: [] as string[],
  priceMin: null as number | null,
  priceMax: null as number | null,
  stockMin: null as number | null,
  stockMax: null as number | null,
})

if (!Array.isArray(filters.statuses)) {
  filters.statuses = []
}

const statusOptions = [
  { label: '上架中', value: '上架中' },
  { label: '库存紧张', value: '库存紧张' },
  { label: '已下架', value: '已下架' },
]

const categoryOptions = [
  { label: '数码/手机', value: '数码/手机' },
  { label: '数码/耳机', value: '数码/耳机' },
  { label: '数码/穿戴', value: '数码/穿戴' },
  { label: '数码/外设', value: '数码/外设' },
  { label: '数码/音频', value: '数码/音频' },
  { label: '数码/平板', value: '数码/平板' },
]

const getProductStatusMeta = (status: string) =>
  productStatusConfig[status] ?? { label: status, color: 'default' }

const isActionAllowed = (action: ActionDef) => !action.permission || hasPermission(action.permission as any)

const getProductActions = (record: { status: string }) => {
  const keys = productStatusActions[record.status] ?? productStatusActions['上架中']
  return keys.map((key) => productActionConfig[key]).filter(Boolean)
}

const getProductPrimaryActions = (record: { status: string }) =>
  getProductActions(record).filter(isActionAllowed).slice(0, 2)

const getProductMoreActions = (record: { status: string }) =>
  getProductActions(record).filter(isActionAllowed).slice(2)

const getProductMoreMenuItems = (record: { status: string }) =>
  getProductMoreActions(record).map((action) => ({
    key: action.key,
    label: action.label,
  }))

const rangeValue = computed({
  get: () => {
    if (filters.dateRange.length === 2) {
      return [dayjs(filters.dateRange[0]), dayjs(filters.dateRange[1])]
    }
    return null
  },
  set: (value) => {
    if (!value || value.length !== 2) {
      filters.dateRange = []
      return
    }
    filters.dateRange = [
      value[0].format('YYYY-MM-DD'),
      value[1].format('YYYY-MM-DD'),
    ]
  },
})

const filteredProducts = computed(() => {
  return products.value.filter((item) => {
    const matchName = !filters.name || item.name.includes(filters.name)
    const matchCode = !filters.code || item.code.includes(filters.code)
    const matchCategory = !filters.category || item.category === filters.category
    const matchBrand = !filters.brand || item.brand.includes(filters.brand)
    const matchStatus = filters.statuses.length === 0 || filters.statuses.includes(item.status)
    const matchPrice =
      (filters.priceMin === null || item.price >= filters.priceMin) &&
      (filters.priceMax === null || item.price <= filters.priceMax)
    const matchStock =
      (filters.stockMin === null || item.stock >= filters.stockMin) &&
      (filters.stockMax === null || item.stock <= filters.stockMax)
    const matchDate =
      filters.dateRange.length === 0 ||
      dayjs(item.listedAt).isBetween(
        filters.dateRange[0],
        filters.dateRange[1],
        'day',
        '[]'
      )
    return (
      matchName &&
      matchCode &&
      matchCategory &&
      matchBrand &&
      matchStatus &&
      matchPrice &&
      matchStock &&
      matchDate
    )
  })
})

const pagination = usePersistedFilters('pagination:products', { current: 1, pageSize: 20 })

const pagedProducts = computed(() => {
  const start = (pagination.current - 1) * pagination.pageSize
  return filteredProducts.value.slice(start, start + pagination.pageSize)
})

const selectedRowKeys = ref<string[]>([])
const selectedRows = ref<any[]>([])

const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys: string[], rows: any[]) => {
    selectedRowKeys.value = keys
    selectedRows.value = rows
  },
}))

type BatchType = 'up' | 'down' | 'stock' | 'delete'

const runBatchAction = (type: BatchType) => {
  if (viewMode.value !== 'table') {
    message.warning('请切换到表格并选择商品')
    return
  }
  if (selectedRowKeys.value.length === 0) {
    message.warning('请先选择商品')
    return
  }
  const actionLabel =
    type === 'up' ? '上架' : type === 'down' ? '下架' : type === 'stock' ? '增加库存' : '删除'
  const prev = products.value.map((item) => ({ ...item }))
  Modal.confirm({
    title: `确认批量${actionLabel}`,
    content: `将对 ${selectedRowKeys.value.length} 个商品执行“${actionLabel}”操作`,
    okText: '确认',
    cancelText: '取消',
    onOk: () => {
      const selectedSet = new Set(selectedRowKeys.value)
      if (type === 'delete') {
        products.value = products.value.filter((item) => !selectedSet.has(item.key))
      } else if (type === 'stock') {
        products.value = products.value.map((item) =>
          selectedSet.has(item.key) ? { ...item, stock: item.stock + 10 } : item
        )
      } else {
        products.value = products.value.map((item) =>
          selectedSet.has(item.key)
            ? { ...item, status: type === 'up' ? '上架中' : '已下架' }
            : item
        )
      }
      notification.open({
        message: `已批量${actionLabel}`,
        description: `已处理 ${selectedRowKeys.value.length} 个商品`,
        btn: () =>
          h(
            'a-button',
            {
              type: 'link',
              onClick: () => {
                products.value = prev
                selectedRowKeys.value = []
                selectedRows.value = []
                notification.destroy()
              },
            },
            '撤销'
          ),
      })
      selectedRowKeys.value = []
      selectedRows.value = []
    },
  })
}

const resetFilters = () => {
  filters.name = ''
  filters.code = ''
  filters.category = ''
  filters.brand = ''
  filters.statuses = []
  filters.dateRange = []
  filters.priceMin = null
  filters.priceMax = null
  filters.stockMin = null
  filters.stockMax = null
  pagination.current = 1
}

const calcProfit = (record: { price: number; cost: number }) => record.price - record.cost
const calcProfitRate = (record: { price: number; cost: number }) => {
  if (!record.price) return '0.0'
  return ((calcProfit(record) / record.price) * 100).toFixed(1)
}

const goCreate = () => {
  router.push('/products/create')
}

const toggleView = () => {
  viewMode.value = viewMode.value === 'table' ? 'card' : 'table'
}

const loadDrafts = () => {
  const raw = localStorage.getItem(DRAFT_KEY)
  const list = raw ? (JSON.parse(raw) as Array<any>) : []
  drafts.value = list.map((item) => ({
    id: item.id,
    title: item.title,
    updatedAt: item.updatedAt ? dayjs(item.updatedAt).format('YYYY-MM-DD HH:mm') : '-',
    image: item?.data?.imageList?.[0]?.url,
    price: item?.data?.skus?.[0]?.price ?? null,
    stock: item?.data?.skus?.[0]?.stock ?? null,
  }))
}

const openDraft = (id: string) => {
  router.push({ path: '/products/create', query: { draft: id } })
}

const removeDraft = (id: string) => {
  drafts.value = drafts.value.filter((item) => item.id !== id)
  localStorage.setItem(DRAFT_KEY, JSON.stringify(drafts.value))
}

const draftColumns = [
  { title: '商品信息', key: 'info', width: 360 },
  { title: '价格', key: 'price', width: 120 },
  { title: '库存', key: 'stock', width: 120 },
  { title: '状态', key: 'status', width: 120 },
  { title: '操作', key: 'action', width: 160 },
]

onMounted(loadDrafts)

watch(activeTab, (value) => {
  if (value === 'draft') loadDrafts()
})
</script>

<style scoped>
.filter-bar {
  margin-bottom: 16px;
  row-gap: 8px;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  width: 100%;
}

.product-tabs {
  margin-bottom: 8px;
}

.draft-thumb {
  width: 56px;
  height: 56px;
  border-radius: 10px;
  overflow: hidden;
  background: #f1f5f9;
  border: 1px dashed var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
}

.draft-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.draft-thumb-placeholder {
  width: 60%;
  height: 60%;
  border-radius: 6px;
  background: linear-gradient(135deg, #e2e8f0, #f8fafc);
}

.draft-skeleton-line {
  height: 12px;
  width: 60px;
  border-radius: 6px;
  background: linear-gradient(90deg, #e2e8f0 25%, #f8fafc 50%, #e2e8f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.warning-section {
  margin-bottom: 16px;
}

.warning-card {
  background: #f8fafc;
  border: 1px solid var(--border-color);
}

.warning-title {
  font-weight: 600;
  margin-bottom: 8px;
}

.warning-setting {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.warning-meta {
  font-size: 12px;
  color: var(--text-secondary);
}

.batch-actions {
  margin: 12px 0 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  position: relative;
  z-index: 1;
}

.range-split {
  padding: 0 6px;
  color: var(--text-secondary);
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

.mobile-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.product-info {
  display: flex;
  gap: 12px;
  align-items: center;
}

.product-thumb {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  object-fit: cover;
}

.product-name {
  font-weight: 600;
  margin-bottom: 4px;
}

.product-meta {
  font-size: 12px;
  color: var(--text-secondary);
}

.product-tag {
  margin-top: 6px;
}

.price-stack {
  font-weight: 600;
  color: #ef4444;
}

.card-grid {
  margin-top: 8px;
}

.product-card :deep(.ant-card-body) {
  padding: 0;
}

.card-media {
  position: relative;
  height: 180px;
  overflow: hidden;
}

.card-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-status {
  position: absolute;
  top: 10px;
  right: 10px;
}

.card-body {
  padding: 12px 14px 10px;
}

.card-title {
  font-weight: 600;
  margin-bottom: 6px;
}

.card-meta {
  display: flex;
  gap: 8px;
  align-items: center;
  color: var(--text-secondary);
  font-size: 12px;
  margin-bottom: 10px;
}

.card-code {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 6px;
}

.card-price {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 8px;
}

.price-main {
  color: #ef4444;
  font-weight: 700;
  font-size: 18px;
}

.price-sub {
  font-size: 12px;
  color: var(--text-secondary);
}

.card-stock {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.card-actions {
  border-top: 1px solid var(--border-color);
  padding: 8px 12px;
  display: flex;
  justify-content: space-between;
}

.product-card {
  border-radius: 4px;
}

.card-media img {
  border-radius: 0;
}

.card-actions :deep(.ant-btn-link) {
  padding: 0;
  height: auto;
}

.card-pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
.products-table :deep(.ant-table-container) {
  overflow-x: auto;
}

.products-table :deep(.ant-table) {
  width: 100%;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.action-link {
  color: #1f6feb;
  font-weight: 500;
  padding: 2px 4px;
  border-radius: 6px;
  background: rgba(31, 111, 235, 0.08);
}

.action-btn {
  padding: 0 8px;
  height: 24px;
  border-radius: 6px;
  border: 1px solid rgba(148, 163, 184, 0.4);
}

.mobile-pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}
</style>
