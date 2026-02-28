<template>
  <div class="products-workbench">
    <div class="page-title">商品管理</div>

    <div class="products-command-wrap">
      <ProductCommandBar
        :items="commandItems"
        :active-key="activeCommandKey"
        @select="handleCommandSelect"
      />
    </div>

    <a-card class="products-warning-board">
      <div class="warning-board-title">库存预警面板</div>
      <a-row :gutter="16">
        <a-col :xs="24" :lg="8">
          <div class="warning-setting">
            <span>预警阈值</span>
            <a-input-number v-model:value="warningThreshold" :min="1" />
            <a-button type="primary" size="small">保存</a-button>
          </div>
          <div class="warning-meta">
            低于阈值的商品将进入提醒列表，可直接执行补货与调整阈值操作。
          </div>
        </a-col>
        <a-col :xs="24" :lg="16">
          <a-table
            :columns="warningColumns"
            :data-source="warningList"
            :pagination="false"
            size="small"
            :scroll="{ x: 720 }"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'level'">
                <a-tag :color="record.stock <= warningThreshold / 2 ? 'red' : 'orange'">
                  {{ record.level }}
                </a-tag>
              </template>
              <template v-else-if="column.key === 'action'">
                <a-space>
                  <a-button type="link" @click="quickReplenish(record.key)">补货</a-button>
                  <a-button type="link" @click="applyWarningFilter">查看商品</a-button>
                </a-space>
              </template>
            </template>
          </a-table>
        </a-col>
      </a-row>
    </a-card>

    <TableWrapper
      class="products-main-card"
      :loading="tableLoading"
      :skeleton-mode="viewMode === 'card' ? 'card' : 'table'"
    >
      <template #filters>
        <a-tabs v-model:activeKey="activeTab" class="product-tabs">
          <a-tab-pane key="all" :tab="`全部商品(${products.length})`" />
          <a-tab-pane key="draft" :tab="`草稿箱(${drafts.length})`" />
        </a-tabs>

        <ProductFilterPanel
          :filters="filters"
          :status-options="statusOptions"
          :category-options="categoryOptions"
          :channel-options="channelOptions"
          :shop-options="shopOptions"
          :is-advanced-open="isAdvancedOpen"
          :active-preset-id="activePresetId"
          :presets="viewPresets"
          @update:filters="updateFilters"
          @update:isAdvancedOpen="onAdvancedOpenChange"
          @query="runQuery"
          @reset="resetFilters"
          @save-preset="savePreset"
          @apply-preset="applyPreset"
        />
      </template>

      <template #actions>
        <a-space class="batch-actions" wrap>
          <a-button v-if="hasPermission('products:create')" type="primary" @click="goCreate"
            >新增商品</a-button
          >
          <a-button v-if="hasPermission('products:batch')" @click="runBatchAction('up')"
            >批量上架</a-button
          >
          <a-button v-if="hasPermission('products:batch')" @click="runBatchAction('down')"
            >批量下架</a-button
          >
          <a-button v-if="hasPermission('products:batch')" @click="runBatchAction('stock')"
            >批量增加库存</a-button
          >
          <a-button v-if="hasPermission('products:delete')" danger @click="runBatchAction('delete')"
            >批量删除</a-button
          >
          <a-button v-if="hasPermission('products:export')" type="dashed">导出数据</a-button>
          <a-button @click="toggleView">{{
            viewMode === 'table' ? '卡片展示' : '表格展示'
          }}</a-button>
          <ColumnSetting :columns="allColumns" v-model="visibleKeys" @reset="resetColumns" />
        </a-space>
      </template>

      <ProductDraftTable
        v-if="activeTab === 'draft'"
        :drafts="drafts"
        @open="openDraft"
        @duplicate="duplicateDraft"
        @remove="removeDraft"
      />

      <template v-else-if="isMobile">
        <a-list :data-source="pagedProducts" item-layout="vertical">
          <template #renderItem="{ item }">
            <a-list-item>
              <a-card>
                <div class="product-name">{{ item.name }}</div>
                <div class="product-meta">商品编码：{{ item.code }}</div>
                <div class="product-meta">类目：{{ item.category }}</div>
                <div class="product-meta">售价/库存：¥{{ item.price }} / {{ item.stock }}</div>
                <div class="product-meta">利润率：{{ calcProfitRate(item) }}%</div>
                <div class="product-tag-row">
                  <a-tag :color="getProductStatusMeta(item.status).color">
                    {{ getProductStatusMeta(item.status).label }}
                  </a-tag>
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
                  <a-progress
                    :percent="Math.min(100, (item.stock / 300) * 100)"
                    size="small"
                    :show-info="false"
                  />
                </div>
                <div class="card-footer">
                  <ProductActionCell
                    :record="item"
                    :primary-actions="getProductPrimaryActions(item)"
                    :more-actions="getProductMoreActions(item)"
                    :get-popup-container="getPopupContainer"
                    @action="handleProductAction"
                  />
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

      <ProductTableView
        v-else
        :columns="columns"
        :data-source="filteredProducts"
        :pagination="tablePagination"
        :row-selection="rowSelection"
        :warning-threshold="warningThreshold"
        :get-product-status-meta="getProductStatusMeta"
        :calc-profit="calcProfit"
        :calc-profit-rate="calcProfitRate"
        :get-action-bundle="getActionBundle"
        :get-popup-container="getPopupContainer"
        @action="handleProductAction"
        @copy-code="copyCode"
        @adjust-stock="adjustStock"
        @change-status="changeStatus"
      />
    </TableWrapper>
  </div>
</template>

<script setup lang="ts">
import { computed, h, onMounted, ref, watch } from 'vue'
import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import { useRouter } from 'vue-router'
import { message, Modal, notification } from 'ant-design-vue'
import TableWrapper from '../components/TableWrapper.vue'
import ColumnSetting from '../components/ColumnSetting.vue'
import ProductCommandBar from '../components/products/ProductCommandBar.vue'
import ProductFilterPanel from '../components/products/ProductFilterPanel.vue'
import ProductTableView from '../components/products/ProductTableView.vue'
import ProductDraftTable from '../components/products/ProductDraftTable.vue'
import ProductActionCell from '../components/products/ProductActionCell.vue'
import { useIsMobile } from '../utils/useIsMobile'
import { useListPageState } from '../utils/useListPageState'
import { hasPermission } from '../utils/permissions'
import { fetchProducts } from '../api/endpoints'
import { useColumnConfig } from '../utils/columnConfig'
import {
  productActionConfig,
  productStatusActions,
  productStatusConfig,
  type ActionDef,
} from '../utils/statusConfig'
import type {
  ProductActionDef,
  ProductDraftItem,
  ProductFilterModel,
  ProductListItem,
  ProductViewPreset,
} from '../types/product-list'
import '../styles/products-v2.css'

dayjs.extend(isBetween)

const isMobile = useIsMobile()
const router = useRouter()
const activeTab = ref('all')
const viewMode = ref<'table' | 'card'>('table')
const isAdvancedOpen = ref(false)
const activeCommandKey = ref('all')
const activePresetId = ref('')
const warningThreshold = ref(30)
const tableLoading = ref(false)
const selectedRowKeys = ref<string[]>([])
const selectedRows = ref<ProductListItem[]>([])
const scrollContainerRef = ref<HTMLElement | null>(null)

const DRAFT_KEY = 'product-drafts'
const PRESET_KEY = 'product-view-presets'
const USE_REMOTE = false

const getPopupContainer = (trigger?: HTMLElement) =>
  (trigger?.ownerDocument?.body ?? document.body) as HTMLElement

const allColumns = [
  { title: '商品基本信息', dataIndex: 'info', key: 'info', width: 360 },
  { title: '成本价/利润率(主SKU)', dataIndex: 'profit', key: 'profit', width: 190 },
  { title: '售价/库存/销量', dataIndex: 'priceStock', key: 'priceStock', width: 180 },
  { title: '商品状态', dataIndex: 'status', key: 'status', width: 130 },
  { title: '时间信息', dataIndex: 'time', key: 'time', width: 220 },
  { title: '操作', key: 'action', width: 260, fixed: 'right' as const },
]

const {
  visibleKeys,
  filteredColumns: columns,
  reset: resetColumns,
} = useColumnConfig('columns:products', allColumns)

const products = ref<ProductListItem[]>([
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
    updatedAt: '2026-02-28 12:01:12',
    code: '10242601000224',
    brand: '星曜',
    image: 'https://picsum.photos/id/1062/100/100',
    channel: '积分商城',
    shop: '星辰旗舰店',
    auditStatus: '审核通过',
    mediaCompleteness: 94,
    updatedBy: '运营专员',
  },
  {
    key: 'p2',
    name: 'Aurora 无线降噪耳机',
    category: '数码/耳机',
    price: 899,
    cost: 560,
    stock: 22,
    sales: 214,
    status: '库存紧张',
    listedAt: '2026-02-01',
    updatedAt: '2026-02-28 09:44:21',
    code: '10382601000223',
    brand: 'Aurora',
    image: 'https://picsum.photos/id/180/100/100',
    channel: '商城',
    shop: 'Aurora官方店',
    auditStatus: '审核通过',
    mediaCompleteness: 86,
    updatedBy: '系统',
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
    updatedAt: '2026-02-27 18:20:05',
    code: '10962601000198',
    brand: 'Lume',
    image: 'https://picsum.photos/id/1084/100/100',
    channel: '直播带货',
    shop: 'Lume旗舰店',
    auditStatus: '审核通过',
    mediaCompleteness: 92,
    updatedBy: '运营专员',
  },
  {
    key: 'p4',
    name: 'Nebula 游戏键盘 RGB',
    category: '数码/外设',
    price: 499,
    cost: 260,
    stock: 84,
    sales: 158,
    status: '待审核',
    listedAt: '2026-01-08',
    updatedAt: '2026-02-26 10:05:41',
    code: '11012601000201',
    brand: 'Nebula',
    image: 'https://picsum.photos/id/1040/100/100',
    channel: '商城',
    shop: 'Nebula外设店',
    auditStatus: '待审核',
    mediaCompleteness: 65,
    updatedBy: '商品经理',
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
    updatedAt: '2026-02-28 16:10:33',
    code: '11282601000311',
    brand: 'Pulse',
    image: 'https://picsum.photos/id/1025/100/100',
    channel: '积分商城',
    shop: 'Pulse音频店',
    auditStatus: '审核通过',
    mediaCompleteness: 82,
    updatedBy: '系统',
  },
  {
    key: 'p6',
    name: 'Mira 平板电脑 11 英寸',
    category: '数码/平板',
    price: 2699,
    cost: 1980,
    stock: 64,
    sales: 137,
    status: '已下架',
    listedAt: '2026-01-28',
    updatedAt: '2026-02-25 15:22:09',
    code: '11452601000287',
    brand: 'Mira',
    image: 'https://picsum.photos/id/1011/100/100',
    channel: '商城',
    shop: 'Mira数码店',
    auditStatus: '审核通过',
    mediaCompleteness: 90,
    updatedBy: '运营专员',
  },
])

const drafts = ref<ProductDraftItem[]>([])
const rawDrafts = ref<Array<any>>([])
const viewPresets = ref<ProductViewPreset[]>([])

const { filters, pagination, bindScrollContainer } = useListPageState('list:products', {
  filters: {
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
    profitMin: null as number | null,
    profitMax: null as number | null,
    warningOnly: false,
    channel: '',
    shop: '',
  } as ProductFilterModel,
  pagination: {
    current: 1,
    pageSize: 20,
  },
})

const warningColumns = [
  { title: '商品', dataIndex: 'name', key: 'name' },
  { title: '当前库存', dataIndex: 'stock', key: 'stock', width: 100 },
  { title: '等级', dataIndex: 'level', key: 'level', width: 120 },
  { title: '操作', key: 'action', width: 160 },
]

const statusOptions = [
  { label: '上架中', value: '上架中' },
  { label: '库存紧张', value: '库存紧张' },
  { label: '待审核', value: '待审核' },
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

const channelOptions = computed(() => {
  const set = new Set(products.value.map((item) => item.channel))
  return Array.from(set).map((value) => ({ label: value, value }))
})

const shopOptions = computed(() => {
  const set = new Set(products.value.map((item) => item.shop))
  return Array.from(set).map((value) => ({ label: value, value }))
})

const warningList = computed(() =>
  products.value
    .filter((item) => item.stock <= warningThreshold.value)
    .map((item) => ({
      key: item.key,
      name: item.name,
      stock: item.stock,
      level: item.stock <= warningThreshold.value / 2 ? '高预警' : '中预警',
    }))
)

const commandItems = computed(() => {
  const today = dayjs().format('YYYY-MM-DD')
  return [
    {
      key: 'all',
      label: '全部商品',
      value: products.value.length,
      helper: '当前可管理商品总数',
    },
    {
      key: 'onSale',
      label: '上架中',
      value: products.value.filter((item) => item.status === '上架中').length,
      helper: '可售卖商品',
    },
    {
      key: 'warning',
      label: '库存预警',
      value: products.value.filter((item) => item.stock <= warningThreshold.value).length,
      helper: `低于 ${warningThreshold.value} 件`,
    },
    {
      key: 'review',
      label: '待审核',
      value: products.value.filter((item) => item.status === '待审核').length,
      helper: '待提审或审核中',
    },
    {
      key: 'updatedToday',
      label: '今日更新',
      value: products.value.filter((item) => item.updatedAt.startsWith(today)).length,
      helper: '今日有变更商品',
    },
  ]
})

const getProductStatusMeta = (status: string) =>
  productStatusConfig[status] ?? { label: status, color: 'default' }

const isActionAllowed = (action: ActionDef) =>
  !action.permission || hasPermission(action.permission)

const getProductActions = (record: { status: string }) => {
  const keys = productStatusActions[record.status] ?? productStatusActions['上架中']
  return keys
    .map((key) => productActionConfig[key])
    .filter((item): item is ProductActionDef => Boolean(item))
    .filter(isActionAllowed)
}

const getProductPrimaryActions = (record: ProductListItem) => getProductActions(record).slice(0, 2)

const getProductMoreActions = (record: ProductListItem) => getProductActions(record).slice(2)

const getActionBundle = (record: ProductListItem) => ({
  primary: getProductPrimaryActions(record),
  more: getProductMoreActions(record),
})

const calcProfit = (record: ProductListItem) => record.price - record.cost

const calcProfitRate = (record: ProductListItem) => {
  if (!record.price) return '0.0'
  return ((calcProfit(record) / record.price) * 100).toFixed(1)
}

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
    const profitRate = Number(calcProfitRate(item))
    const matchProfit =
      (filters.profitMin === null || profitRate >= filters.profitMin) &&
      (filters.profitMax === null || profitRate <= filters.profitMax)
    const matchDate =
      filters.dateRange.length === 0 ||
      dayjs(item.listedAt).isBetween(filters.dateRange[0], filters.dateRange[1], 'day', '[]')
    const matchWarning = !filters.warningOnly || item.stock <= warningThreshold.value
    const matchChannel = !filters.channel || item.channel === filters.channel
    const matchShop = !filters.shop || item.shop === filters.shop

    return (
      matchName &&
      matchCode &&
      matchCategory &&
      matchBrand &&
      matchStatus &&
      matchPrice &&
      matchStock &&
      matchProfit &&
      matchDate &&
      matchWarning &&
      matchChannel &&
      matchShop
    )
  })
})

const pagedProducts = computed(() => {
  const start = (pagination.current - 1) * pagination.pageSize
  return filteredProducts.value.slice(start, start + pagination.pageSize)
})

watch(
  () => filteredProducts.value.length,
  (total) => {
    const max = Math.max(1, Math.ceil(total / pagination.pageSize))
    if (pagination.current > max) pagination.current = max
  },
  { immediate: true }
)

const tablePagination = computed(() => ({
  current: pagination.current,
  pageSize: pagination.pageSize,
  total: filteredProducts.value.length,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50'],
  onChange: (page: number, pageSize: number) => {
    pagination.current = page
    pagination.pageSize = pageSize
  },
}))

const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys: string[], rows: ProductListItem[]) => {
    selectedRowKeys.value = keys
    selectedRows.value = rows
  },
}))

const updateFilters = (next: ProductFilterModel) => {
  Object.assign(filters, next)
}

const onAdvancedOpenChange = (value: boolean) => {
  isAdvancedOpen.value = value
}

const runQuery = () => {
  pagination.current = 1
  void loadProducts()
}

const resetFilters = () => {
  Object.assign(filters, {
    name: '',
    code: '',
    category: '',
    brand: '',
    statuses: [],
    dateRange: [],
    priceMin: null,
    priceMax: null,
    stockMin: null,
    stockMax: null,
    profitMin: null,
    profitMax: null,
    warningOnly: false,
    channel: '',
    shop: '',
  } satisfies ProductFilterModel)
  activeCommandKey.value = 'all'
  activePresetId.value = ''
  pagination.current = 1
}

const loadPresets = () => {
  const raw = localStorage.getItem(PRESET_KEY)
  if (!raw) return
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) viewPresets.value = parsed as ProductViewPreset[]
  } catch {
    viewPresets.value = []
  }
}

const savePresets = () => {
  localStorage.setItem(PRESET_KEY, JSON.stringify(viewPresets.value))
}

const savePreset = () => {
  const id = `preset-${Date.now()}`
  const preset: ProductViewPreset = {
    id,
    name: `视图 ${dayjs().format('MM-DD HH:mm')}`,
    filters: JSON.parse(JSON.stringify(filters)) as ProductFilterModel,
    updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
  }
  viewPresets.value = [preset, ...viewPresets.value].slice(0, 8)
  activePresetId.value = preset.id
  savePresets()
  message.success('视图已保存')
}

const applyPreset = (presetId: string) => {
  if (!presetId) {
    activePresetId.value = ''
    return
  }
  const target = viewPresets.value.find((item) => item.id === presetId)
  if (!target) return
  Object.assign(filters, target.filters)
  activePresetId.value = presetId
  pagination.current = 1
}

const applyWarningFilter = () => {
  activeTab.value = 'all'
  activeCommandKey.value = 'warning'
  filters.warningOnly = true
  filters.statuses = []
  pagination.current = 1
}

const handleCommandSelect = (key: string) => {
  activeCommandKey.value = key
  activeTab.value = 'all'
  filters.warningOnly = false

  switch (key) {
    case 'onSale':
      filters.statuses = ['上架中']
      break
    case 'warning':
      filters.statuses = []
      filters.warningOnly = true
      break
    case 'review':
      filters.statuses = ['待审核']
      break
    case 'updatedToday': {
      const today = dayjs().format('YYYY-MM-DD')
      filters.dateRange = [today, today]
      break
    }
    default:
      filters.statuses = []
      filters.dateRange = []
      filters.warningOnly = false
  }

  pagination.current = 1
}

const loadDrafts = () => {
  const raw = localStorage.getItem(DRAFT_KEY)
  const list = raw ? (JSON.parse(raw) as Array<any>) : []
  rawDrafts.value = list
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

const duplicateDraft = (id: string) => {
  const source = rawDrafts.value.find((item) => item.id === id)
  if (!source) return
  const copy = {
    ...source,
    id: `copy-${Date.now()}`,
    title: `${source.title ?? '未命名草稿'}（副本）`,
    updatedAt: dayjs().toISOString(),
  }
  rawDrafts.value = [copy, ...rawDrafts.value]
  localStorage.setItem(DRAFT_KEY, JSON.stringify(rawDrafts.value))
  loadDrafts()
  message.success('草稿已复制')
}

const removeDraft = (id: string) => {
  rawDrafts.value = rawDrafts.value.filter((item) => item.id !== id)
  localStorage.setItem(DRAFT_KEY, JSON.stringify(rawDrafts.value))
  loadDrafts()
  message.success('草稿已删除')
}

const goCreate = () => router.push('/products/create')

const toggleView = () => {
  viewMode.value = viewMode.value === 'table' ? 'card' : 'table'
}

const copyCode = async (record: ProductListItem) => {
  try {
    await navigator.clipboard.writeText(record.code)
    message.success('商品编码已复制')
  } catch {
    message.warning('复制失败，请手动复制')
  }
}

const adjustStock = (record: ProductListItem) => {
  Modal.confirm({
    title: `调整 ${record.name} 库存阈值`,
    content: h(
      'div',
      `当前库存 ${record.stock}，建议阈值 ${Math.max(5, Math.floor(record.stock / 2))}`
    ),
    onOk: () => message.success('库存阈值已更新'),
  })
}

const changeStatus = (record: ProductListItem) => {
  const next = record.status === '已下架' ? '上架中' : '已下架'
  products.value = products.value.map((item) =>
    item.key === record.key ? { ...item, status: next } : item
  )
  message.success(`状态已修改为${next}`)
}

const quickReplenish = (key: string) => {
  products.value = products.value.map((item) =>
    item.key === key ? { ...item, stock: item.stock + 20, status: '上架中' } : item
  )
  message.success('已完成补货')
}

const handleProductAction = (actionKey: string, record: ProductListItem) => {
  if (actionKey === 'edit') {
    router.push(`/products/create?edit=${record.key}`)
    return
  }
  if (actionKey === 'view') {
    router.push(`/products/${record.key}`)
    return
  }
  if (actionKey === 'stock') {
    adjustStock(record)
    return
  }
  if (actionKey === 'copy') {
    void copyCode(record)
    return
  }
  if (actionKey === 'down' || actionKey === 'up') {
    const nextStatus = actionKey === 'down' ? '已下架' : '上架中'
    products.value = products.value.map((item) =>
      item.key === record.key ? { ...item, status: nextStatus } : item
    )
    message.success(`商品已${nextStatus === '已下架' ? '下架' : '上架'}`)
    return
  }
  if (actionKey === 'replenish') {
    quickReplenish(record.key)
    return
  }
  if (actionKey === 'review') {
    products.value = products.value.map((item) =>
      item.key === record.key ? { ...item, status: '待审核', auditStatus: '待审核' } : item
    )
    message.success('已提交审核')
    return
  }
  message.info(`已触发操作：${actionKey}`)
}

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

const loadProducts = async () => {
  if (!USE_REMOTE) return
  tableLoading.value = true
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
    products.value = res.list as ProductListItem[]
  } catch {
    message.error('商品列表加载失败，请检查接口配置')
  } finally {
    tableLoading.value = false
  }
}

onMounted(() => {
  scrollContainerRef.value = document.querySelector('.layout-content') as HTMLElement | null
  bindScrollContainer(scrollContainerRef)
  loadDrafts()
  loadPresets()
  void loadProducts()
})

watch(activeTab, (value) => {
  pagination.current = 1
  if (value === 'draft') loadDrafts()
})
</script>
