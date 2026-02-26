<template>
  <div>
    <div class="page-title">订单管理</div>

    <TableWrapper>
      <template #filters>
      <a-tabs v-model:active-key="activeTab" class="order-tabs" @change="onTabChange">
        <a-tab-pane v-for="tab in tabOptions" :key="tab.key" :tab="`${tab.label} (${tab.count})`" />
      </a-tabs>
      <a-alert
        type="warning"
        show-icon
        message="温馨提示：列表中标记红色的订单为售后中的订单，请先在售后订单中处理服务单，再进行发货操作，以免出现重复发货。"
        class="warning-tip"
      />

      <a-form layout="inline" class="filter-bar">
        <a-form-item label="订单编号">
          <a-input v-model:value="filters.orderId" placeholder="请输入订单编号" allow-clear />
        </a-form-item>
        <a-form-item label="订单状态">
          <a-select
            v-model:value="filters.statuses"
            :options="statusOptions"
            mode="multiple"
            allow-clear
            placeholder="全部"
            style="min-width: 220px"
            :get-popup-container="getPopupContainer"
          />
        </a-form-item>
        <a-form-item label="下单号码">
          <a-input v-model:value="filters.orderCode" placeholder="请输入下单号码" allow-clear />
        </a-form-item>
        <a-form-item label="商品名称">
          <a-input v-model:value="filters.productName" placeholder="请输入商品名称" allow-clear />
        </a-form-item>
        <a-form-item label="收货人手机">
          <a-input v-model:value="filters.phone" placeholder="请输入收货人手机号" allow-clear />
        </a-form-item>
        <a-form-item label="下单时间">
          <a-range-picker v-model:value="orderRange" :get-popup-container="getPopupContainer" />
        </a-form-item>
        <a-form-item label="支付时间">
          <a-range-picker v-model:value="payRange" :get-popup-container="getPopupContainer" />
        </a-form-item>
        <a-space>
          <a-button type="primary">搜索</a-button>
          <a-button v-if="hasPermission('orders:export')" @click="exportOrders()">导出</a-button>
          <a-button @click="resetFilters">重置</a-button>
        </a-space>
      </a-form>
      </template>

      <template #actions>
        <div class="batch-row">
          <a-upload :before-upload="preventUpload" :file-list="[]">
            <a-button>上传文件</a-button>
          </a-upload>
          <a-space>
            <a-button>上传</a-button>
            <a-button v-if="hasPermission('orders:export')" type="primary" ghost @click="exportOrders('待发货')"
              >待发货导出</a-button
            >
            <ColumnSetting :columns="allColumns" v-model="visibleKeys" @reset="reset" />
          </a-space>
        </div>
      </template>

      <template v-if="isMobile">
        <a-list :data-source="pagedOrders" item-layout="vertical">
          <template #renderItem="{ item }">
            <a-list-item>
              <a-card class="mobile-card" :class="{ 'mobile-card-warning': item.afterSale }">
                <div class="mobile-row">
                  <span class="mobile-label">订单号</span>
                  <span>{{ item.id }}</span>
                </div>
                <div class="mobile-row">
                  <span class="mobile-label">商品</span>
                  <span>{{ item.productName }}</span>
                </div>
                <div class="mobile-row">
                  <span class="mobile-label">实付金额</span>
                  <span>{{ item.paidAmount }}</span>
                </div>
                <div class="mobile-row">
                  <span class="mobile-label">状态</span>
                  <a-tag :color="getOrderStatusMeta(item.status).color">{{ getOrderStatusMeta(item.status).label }}</a-tag>
                </div>
                <div class="mobile-actions">
                  <template v-for="action in getOrderPrimaryActions(item)" :key="action.key">
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
            :total="filteredOrders.length"
            size="small"
          />
        </div>
      </template>
      <a-table
        v-else
        :columns="columns"
        :data-source="filteredOrders"
        :pagination="{ pageSize: 8 }"
        :scroll="{ x: 1200 }"
        :row-class-name="rowClassName"
        :loading="tableLoading"
        :locale="{ emptyText: h(TableEmpty, { description: '暂无订单数据' }) }"
      >
        <template #expandedRowRender="{ record }">
          <div class="expand-panel">
            <div class="expand-products">
              <div class="expand-title">商品明细</div>
              <div v-for="(item, index) in record.items ?? []" :key="index" class="expand-product-item">
                <img :src="item.image" alt="商品" />
                <div class="expand-product-info">
                  <div class="expand-product-name">{{ item.name }}</div>
                  <div class="expand-product-meta">{{ item.spec }}</div>
                  <div class="expand-product-meta">SPU: {{ item.spu }}</div>
                </div>
                <div class="expand-product-price">
                  <div>{{ item.price }}</div>
                  <div class="expand-product-qty">x{{ item.qty }}</div>
                </div>
              </div>
              <div v-if="!record.items || record.items.length === 0" class="expand-empty">暂无商品明细</div>
            </div>
            <div class="expand-row">
              <div class="expand-label">支付信息</div>
              <div class="expand-value">{{ record.payMethod }}</div>
              <div class="expand-value">支付时间：{{ record.payTime }}</div>
            </div>
            <div class="expand-row">
              <div class="expand-label">下单号码</div>
              <div class="expand-value">{{ record.orderCode }}</div>
              <div class="expand-value">备注：{{ record.note }}</div>
            </div>
            <div class="expand-row">
              <div class="expand-label">结算状态</div>
              <div class="expand-value">{{ record.settlement }}</div>
              <div class="expand-value">订单商品：{{ record.items?.length ?? 1 }} 件</div>
            </div>
          </div>
        </template>
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'product'">
            <div class="product-cell">
              <img :src="record.items?.[0]?.image ?? record.image" alt="商品" />
              <div>
                <div class="product-title">{{ record.items?.[0]?.name ?? record.productName }}</div>
                <div class="product-meta">{{ record.items?.[0]?.spec ?? record.productSku }}</div>
                <div class="product-meta">SPU: {{ record.items?.[0]?.spu ?? record.spu }}</div>
                <a-tag v-if="record.items && record.items.length > 1" color="blue" class="multi-tag">
                  +{{ record.items.length - 1 }} 件商品
                </a-tag>
              </div>
            </div>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="getOrderStatusMeta(record.status).color">{{ getOrderStatusMeta(record.status).label }}</a-tag>
          </template>
          <template v-else-if="column.key === 'amount'">
            <div class="amount-main">{{ record.paidAmount }}</div>
            <div class="amount-sub">单价 {{ record.unitPrice }} · 数量 {{ record.quantity }}</div>
          </template>
          <template v-else-if="column.key === 'receiver'">
            <div class="receiver-main">{{ record.receiver }}</div>
            <div class="receiver-sub">{{ record.phone }}</div>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <template v-for="action in getOrderPrimaryActions(record)" :key="action.key">
                <RouterLink v-if="action.to && isActionAllowed(action)" :to="action.to(record)">{{ action.label }}</RouterLink>
                <a-button v-else-if="isActionAllowed(action)" type="link">{{ action.label }}</a-button>
              </template>
              <a-dropdown
                v-if="getOrderMoreActions(record).length > 0"
                :menu="{ items: getOrderMoreMenuItems(record) }"
              >
                <a class="action-more" @click.prevent>更多</a>
              </a-dropdown>
            </a-space>
          </template>
        </template>
      </a-table>
    </TableWrapper>
  </div>
</template>

<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue'
import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import { RouterLink, useRouter } from 'vue-router'
import TableWrapper from '../components/TableWrapper.vue'
import ColumnSetting from '../components/ColumnSetting.vue'
import TableEmpty from '../components/TableEmpty.vue'
import { useIsMobile } from '../utils/useIsMobile'
import { usePersistedFilters } from '../utils/usePersistedFilters'
import { hasPermission } from '../utils/permissions'
import { orderActionConfig, orderStatusActions, orderStatusConfig, type ActionDef } from '../utils/statusConfig'
import { message } from 'ant-design-vue'
import { fetchOrders, type OrderItem } from '../api/endpoints'
import { createExportTask } from '../utils/exports'
import { useColumnConfig } from '../utils/columnConfig'

dayjs.extend(isBetween)
const isMobile = useIsMobile()
const router = useRouter()

const allColumns = [
  { title: '商品信息', key: 'product', width: 300 },
  { title: '订单编号', dataIndex: 'id', key: 'id', width: 180 },
  { title: '订单状态', dataIndex: 'status', key: 'status', width: 120 },
  { title: '金额信息', key: 'amount', width: 180 },
  { title: '收货信息', key: 'receiver', width: 180 },
  { title: '下单时间', dataIndex: 'orderTime', key: 'orderTime', width: 160 },
  { title: '操作', key: 'action', fixed: 'right', width: 160 },
]

const { visibleKeys, filteredColumns: columns, reset } = useColumnConfig('columns:orders', allColumns)
const tableLoading = ref(false)

type OrderLineItem = {
  name: string
  spec: string
  spu: string
  image: string
  price: string
  qty: number
}

type OrderRow = {
  key: string
  id: string
  productName: string
  productSku: string
  spu: string
  image: string
  items?: OrderLineItem[]
  orderTime: string
  payTime: string
  status: string
  orderCode: string
  quantity: number
  unitPrice: string
  paidAmount: string
  payMethod: string
  receiver: string
  phone: string
  note: string
  settlement: string
  afterSale: boolean
}

const orders: OrderRow[] = [
  {
    key: 'o1',
    id: 'DD2026020501703',
    productName: '测试1129 颜色 包色 内存 4G 容量规格 128GB',
    productSku: '颜色：包色 / 内存：4G / 128GB',
    spu: '1002251200002102',
    image: 'https://picsum.photos/seed/order1/80/80',
    items: [
      {
        name: '测试1129 颜色 包色 内存 4G 容量规格 128GB',
        spec: '颜色：包色 / 内存：4G / 128GB',
        spu: '1002251200002102',
        image: 'https://picsum.photos/seed/order1/80/80',
        price: '¥55',
        qty: 1,
      },
    ],
    orderTime: '2026-02-05 17:03',
    payTime: '暂未获取到支付信息',
    status: '取消',
    orderCode: '13567546709',
    quantity: 1,
    unitPrice: '¥55',
    paidAmount: '¥60',
    payMethod: '暂未获取到支付信息',
    receiver: 'admin',
    phone: '13567546709',
    note: '/',
    settlement: '未结算',
    afterSale: false,
  },
  {
    key: 'o2',
    id: 'DD2026020417142',
    productName: 'Apple iPhone 16 Pro 颜色 黄色 内存 4G 容量规格 128GB',
    productSku: '颜色：黄色 / 4G / 128GB',
    spu: 'SPU1008601',
    image: 'https://picsum.photos/seed/order2/80/80',
    items: [
      {
        name: 'Apple iPhone 16 Pro 颜色 黄色 内存 4G 容量规格 128GB',
        spec: '颜色：黄色 / 4G / 128GB',
        spu: 'SPU1008601',
        image: 'https://picsum.photos/seed/order2/80/80',
        price: '¥7,499',
        qty: 1,
      },
      {
        name: '星曜耳机 Pro',
        spec: '颜色：星空灰',
        spu: 'SPU1008609',
        image: 'https://picsum.photos/seed/order2b/80/80',
        price: '¥399',
        qty: 1,
      },
    ],
    orderTime: '2026-02-04 17:14',
    payTime: '2026-02-04 17:24',
    status: '待发货',
    orderCode: '13567546709',
    quantity: 1,
    unitPrice: '¥7,499',
    paidAmount: '¥7,511',
    payMethod: '微信支付',
    receiver: 'admin',
    phone: '13567546709',
    note: '加急发货',
    settlement: '未结算',
    afterSale: false,
  },
  {
    key: 'o3',
    id: 'DD2026020310021',
    productName: '猫爬架四层大型豪华猫玩具',
    productSku: '规格：200 / 红色 / 大',
    spu: 'SPU000905',
    image: 'https://picsum.photos/seed/order3/80/80',
    items: [
      {
        name: '猫爬架四层大型豪华猫玩具',
        spec: '规格：200 / 红色 / 大',
        spu: 'SPU000905',
        image: 'https://picsum.photos/seed/order3/80/80',
        price: '¥128',
        qty: 1,
      },
      {
        name: '猫咪磨爪玩具',
        spec: '尺寸：小号 / 颜色：原木',
        spu: 'SPU000906',
        image: 'https://picsum.photos/seed/order3b/80/80',
        price: '¥28',
        qty: 1,
      },
    ],
    orderTime: '2026-02-03 10:21',
    payTime: '2026-02-03 10:25',
    status: '待收货',
    orderCode: '13632223344',
    quantity: 2,
    unitPrice: '¥128',
    paidAmount: '¥256',
    payMethod: '支付宝',
    receiver: '周女士',
    phone: '13632223344',
    note: '送货上门',
    settlement: '已结算',
    afterSale: false,
  },
  {
    key: 'o4',
    id: 'DD2026020212240',
    productName: '智能手环 Pro',
    productSku: '黑色 / NFC',
    spu: 'SPU102910',
    image: 'https://picsum.photos/seed/order4/80/80',
    items: [
      {
        name: '智能手环 Pro',
        spec: '黑色 / NFC',
        spu: 'SPU102910',
        image: 'https://picsum.photos/seed/order4/80/80',
        price: '¥399',
        qty: 1,
      },
    ],
    orderTime: '2026-02-02 12:40',
    payTime: '2026-02-02 12:42',
    status: '交易完成',
    orderCode: '13900001234',
    quantity: 1,
    unitPrice: '¥399',
    paidAmount: '¥399',
    payMethod: '微信支付',
    receiver: '宋先生',
    phone: '13900001234',
    note: '/',
    settlement: '已结算',
    afterSale: false,
  },
  {
    key: 'o5',
    id: 'DD2026020115203',
    productName: '母婴推车轻便款',
    productSku: '灰色 / 轻便折叠',
    spu: 'SPU192200',
    image: 'https://picsum.photos/seed/order5/80/80',
    orderTime: '2026-02-01 15:03',
    payTime: '2026-02-01 15:08',
    status: '退款中',
    orderCode: '18677889900',
    quantity: 1,
    unitPrice: '¥2,480',
    paidAmount: '¥2,480',
    payMethod: '微信支付',
    receiver: '许先生',
    phone: '18677889900',
    note: '售后申请中',
    settlement: '未结算',
    afterSale: true,
  },
  {
    key: 'o6',
    id: 'DD2026013122129',
    productName: '会员礼包套装',
    productSku: '限定款',
    spu: 'SPU882100',
    image: 'https://picsum.photos/seed/order6/80/80',
    orderTime: '2026-01-31 22:12',
    payTime: '2026-01-31 22:15',
    status: '待支付',
    orderCode: '18822334455',
    quantity: 1,
    unitPrice: '¥699',
    paidAmount: '¥0',
    payMethod: '未支付',
    receiver: '林女士',
    phone: '18822334455',
    note: '/',
    settlement: '未结算',
    afterSale: false,
  },
  {
    key: 'o7',
    id: 'DD2026013010102',
    productName: '空气净化器 Pro',
    productSku: '白色 / 标准版',
    spu: 'SPU880012',
    image: 'https://picsum.photos/seed/order7/80/80',
    orderTime: '2026-01-30 10:12',
    payTime: '2026-01-30 10:15',
    status: '退款完成',
    orderCode: '13511112222',
    quantity: 1,
    unitPrice: '¥1,120',
    paidAmount: '¥1,120',
    payMethod: '支付宝',
    receiver: '沈先生',
    phone: '13511112222',
    note: '质量问题',
    settlement: '未结算',
    afterSale: true,
  },
  {
    key: 'o8',
    id: 'DD2026012912019',
    productName: '咖啡机套装',
    productSku: '银色 / 套装版',
    spu: 'SPU760112',
    image: 'https://picsum.photos/seed/order8/80/80',
    orderTime: '2026-01-29 12:01',
    payTime: '2026-01-29 12:05',
    status: '交易关闭',
    orderCode: '13766668888',
    quantity: 1,
    unitPrice: '¥2,980',
    paidAmount: '¥2,980',
    payMethod: '微信支付',
    receiver: '赵女士',
    phone: '13766668888',
    note: '/',
    settlement: '未结算',
    afterSale: false,
  },
  {
    key: 'o9',
    id: 'DD2026012809054',
    productName: '手机壳礼盒',
    productSku: '粉色 / 组合装',
    spu: 'SPU350010',
    image: 'https://picsum.photos/seed/order9/80/80',
    orderTime: '2026-01-28 09:05',
    payTime: '2026-01-28 09:10',
    status: '退款审核中',
    orderCode: '13288889999',
    quantity: 2,
    unitPrice: '¥79',
    paidAmount: '¥158',
    payMethod: '支付宝',
    receiver: '刘女士',
    phone: '13288889999',
    note: '申请退款',
    settlement: '未结算',
    afterSale: true,
  },
  {
    key: 'o10',
    id: 'DD2026012708451',
    productName: '运动耳机',
    productSku: '蓝色 / 防水',
    spu: 'SPU440982',
    image: 'https://picsum.photos/seed/order10/80/80',
    orderTime: '2026-01-27 08:45',
    payTime: '2026-01-27 08:47',
    status: '退款关闭',
    orderCode: '13922223333',
    quantity: 1,
    unitPrice: '¥299',
    paidAmount: '¥299',
    payMethod: '微信支付',
    receiver: '韩先生',
    phone: '13922223333',
    note: '/',
    settlement: '已结算',
    afterSale: false,
  },
  {
    key: 'o11',
    id: 'DD2026012609123',
    productName: '除螨仪',
    productSku: '白色 / 标准版',
    spu: 'SPU550221',
    image: 'https://picsum.photos/seed/order11/80/80',
    orderTime: '2026-01-26 09:12',
    payTime: '2026-01-26 09:20',
    status: '待签收',
    orderCode: '13100001111',
    quantity: 1,
    unitPrice: '¥899',
    paidAmount: '¥899',
    payMethod: '微信支付',
    receiver: '郑女士',
    phone: '13100001111',
    note: '/',
    settlement: '已结算',
    afterSale: false,
  },
]

const USE_REMOTE = false

const mapRemoteOrder = (item: OrderItem): OrderRow => {
  const first = item.items?.[0]
  const status = item.status ?? '待支付'
  const afterSale = /退款|售后/.test(status)
  return {
    key: item.id,
    id: item.id,
    productName: first?.name ?? '未命名商品',
    productSku: first?.spec ?? '-',
    spu: first?.spu ?? '-',
    image: first?.image ?? 'https://picsum.photos/seed/order-default/80/80',
    items: item.items ?? [],
    orderTime: item.orderTime,
    payTime: item.payTime,
    status,
    orderCode: item.orderCode,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    paidAmount: item.paidAmount,
    payMethod: item.payMethod,
    receiver: item.receiver,
    phone: item.phone,
    note: item.note,
    settlement: item.settlement,
    afterSale,
  }
}

onMounted(async () => {
  if (!USE_REMOTE) return
  try {
    const res = await fetchOrders({
      orderId: filters.orderId,
      statuses: filters.statuses,
      orderCode: filters.orderCode,
      productName: filters.productName,
      phone: filters.phone,
      orderStart: filters.orderRange[0],
      orderEnd: filters.orderRange[1],
      payStart: filters.payRange[0],
      payEnd: filters.payRange[1],
      page: pagination.current,
      pageSize: pagination.pageSize,
    })
    orders.splice(0, orders.length, ...res.list.map(mapRemoteOrder))
  } catch (error) {
    message.error('订单列表加载失败，请检查接口配置')
  }
})

const statusOptions = [
  { label: '待付款', value: '待付款' },
  { label: '待发货', value: '待发货' },
  { label: '待收货', value: '待收货' },
  { label: '待签收', value: '待签收' },
  { label: '交易完成', value: '交易完成' },
  { label: '取消', value: '取消' },
  { label: '退款中', value: '退款中' },
  { label: '退款完成', value: '退款完成' },
  { label: '退款审核中', value: '退款审核中' },
  { label: '退款关闭', value: '退款关闭' },
  { label: '交易关闭', value: '交易关闭' },
  { label: '退货售后', value: '退货售后' },
  { label: '换货售后', value: '换货售后' },
]

const tabKeys = [
  { key: 'all', label: '全部订单' },
  { key: '待发货', label: '待发货' },
  { key: '待收货', label: '待收货' },
  { key: '待付款', label: '待支付' },
  { key: '交易完成', label: '交易完成' },
  { key: '取消', label: '取消' },
  { key: '退款完成', label: '退款完成' },
  { key: '交易关闭', label: '交易关闭' },
  { key: '退款关闭', label: '退款关闭' },
  { key: '退款中', label: '退款中' },
  { key: '待签收', label: '待签收' },
  { key: '退款审核中', label: '退款审核中' },
  { key: '退款退货售后订单', label: '退款退货售后订单' },
  { key: '换货售后订单', label: '换货售后订单' },
]

const filters = usePersistedFilters('filters:orders', {
  orderId: '',
  orderCode: '',
  productName: '',
  phone: '',
  statuses: [] as string[],
  orderRange: [] as string[],
  payRange: [] as string[],
  activeTab: 'all',
})

const activeTab = computed({
  get: () => filters.activeTab,
  set: (value) => {
    filters.activeTab = value
  },
})

const orderRange = computed({
  get: () => {
    if (filters.orderRange.length === 2) {
      return [dayjs(filters.orderRange[0]), dayjs(filters.orderRange[1])]
    }
    return null
  },
  set: (value) => {
    if (!value || value.length !== 2) {
      filters.orderRange = []
      return
    }
    filters.orderRange = [value[0].format('YYYY-MM-DD'), value[1].format('YYYY-MM-DD')]
  },
})

const payRange = computed({
  get: () => {
    if (filters.payRange.length === 2) {
      return [dayjs(filters.payRange[0]), dayjs(filters.payRange[1])]
    }
    return null
  },
  set: (value) => {
    if (!value || value.length !== 2) {
      filters.payRange = []
      return
    }
    filters.payRange = [value[0].format('YYYY-MM-DD'), value[1].format('YYYY-MM-DD')]
  },
})

const tabOptions = computed(() =>
  tabKeys.map((tab) => {
    if (tab.key === 'all') {
      return { ...tab, count: orders.length }
    }
    if (tab.key === '退款退货售后订单') {
      return { ...tab, count: orders.filter((item) => item.afterSale).length }
    }
    if (tab.key === '换货售后订单') {
      return { ...tab, count: orders.filter((item) => item.status === '换货售后').length }
    }
    return { ...tab, count: orders.filter((item) => item.status === tab.key).length }
  })
)

const filteredOrders = computed(() => {
  const keyword = filters.orderId.trim()
  return orders.filter((item) => {
    const matchOrderId = !keyword || item.id.includes(keyword)
    const matchCode = !filters.orderCode || item.orderCode.includes(filters.orderCode.trim())
    const matchProduct = !filters.productName || item.productName.includes(filters.productName.trim())
    const matchPhone = !filters.phone || item.phone.includes(filters.phone.trim())
    const matchStatus = filters.statuses.length === 0 || filters.statuses.includes(item.status)
    const matchTab =
      filters.activeTab === 'all' ||
      (filters.activeTab === '退款退货售后订单' && item.afterSale) ||
      (filters.activeTab === '换货售后订单' && item.status === '换货售后') ||
      item.status === filters.activeTab
    const matchOrderDate =
      filters.orderRange.length === 0 ||
      dayjs(item.orderTime).isBetween(filters.orderRange[0], filters.orderRange[1], 'day', '[]')
    const matchPayDate =
      filters.payRange.length === 0 ||
      dayjs(item.payTime).isBetween(filters.payRange[0], filters.payRange[1], 'day', '[]')
    return matchOrderId && matchCode && matchProduct && matchPhone && matchStatus && matchTab && matchOrderDate && matchPayDate
  })
})

const pagination = usePersistedFilters('pagination:orders', { current: 1, pageSize: 4 })

const pagedOrders = computed(() => {
  const start = (pagination.current - 1) * pagination.pageSize
  return filteredOrders.value.slice(start, start + pagination.pageSize)
})

const getOrderStatusMeta = (status: string) =>
  orderStatusConfig[status] ?? { label: status, color: 'default' }

const isActionAllowed = (action: ActionDef) => !action.permission || hasPermission(action.permission)

const getOrderActions = (record: { status: string }) => {
  const keys = orderStatusActions[record.status] ?? ['view']
  return keys.map((key) => orderActionConfig[key]).filter(Boolean)
}

const getOrderPrimaryActions = (record: { status: string }) =>
  getOrderActions(record).filter(isActionAllowed).slice(0, 2)

const getOrderMoreActions = (record: { status: string }) =>
  getOrderActions(record).filter(isActionAllowed).slice(2)

const getOrderMoreMenuItems = (record: { status: string }) =>
  getOrderMoreActions(record).map((action) => ({
    key: action.key,
    label: action.label,
  }))

const resetFilters = () => {
  filters.orderId = ''
  filters.orderCode = ''
  filters.productName = ''
  filters.phone = ''
  filters.statuses = []
  filters.orderRange = []
  filters.payRange = []
  filters.activeTab = 'all'
  pagination.current = 1
}

const onTabChange = () => {
  filters.statuses = []
}

const exportOrders = (status?: string) => {
  const params = {
    orderId: filters.orderId,
    statuses: status ? [status] : filters.statuses,
    orderCode: filters.orderCode,
    productName: filters.productName,
    phone: filters.phone,
    orderStart: filters.orderRange[0],
    orderEnd: filters.orderRange[1],
    payStart: filters.payRange[0],
    payEnd: filters.payRange[1],
  }
  const task = createExportTask({
    module: 'orders',
    title: status ? `订单导出（${status}）` : '订单导出',
    params,
    fields: ['订单号', '商品', '金额', '状态', '下单时间'],
  })
  message.success('已加入导出队列，请在下载中心查看')
  router.push(`/exports?highlight=${task.id}`)
}

const rowClassName = (record: { afterSale: boolean }) => (record.afterSale ? 'row-after-sale' : '')

const preventUpload = () => false

const getPopupContainer = (trigger: HTMLElement) => trigger?.parentNode || document.body

</script>

<style scoped>
.card-section {
  margin-bottom: 16px;
}

.filter-bar {
  margin-bottom: 12px;
  row-gap: 8px;
}

.order-tabs :deep(.ant-tabs-nav) {
  margin-bottom: 12px;
}

.warning-tip {
  margin-bottom: 16px;
}

.amount-main {
  font-weight: 700;
  color: #ef4444;
}

.amount-sub {
  font-size: 12px;
  color: var(--text-secondary);
}

.receiver-main {
  font-weight: 600;
}

.receiver-sub {
  font-size: 12px;
  color: var(--text-secondary);
}

.expand-panel {
  background: #f8fafc;
  border-radius: 12px;
  padding: 12px 16px;
  display: grid;
  gap: 8px;
}

.expand-products {
  background: #fff;
  border-radius: 10px;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
}

.expand-title {
  font-weight: 600;
  margin-bottom: 8px;
}

.expand-product-item {
  display: grid;
  grid-template-columns: 48px 1fr auto;
  gap: 10px;
  align-items: center;
  padding: 8px 0;
  border-top: 1px dashed var(--border-color);
}

.expand-product-item:first-of-type {
  border-top: none;
}

.expand-product-item img {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  object-fit: cover;
}

.expand-product-name {
  font-weight: 600;
}

.expand-product-meta {
  font-size: 12px;
  color: var(--text-secondary);
}

.expand-product-price {
  text-align: right;
  font-weight: 600;
  color: var(--text-primary);
}

.expand-product-qty {
  font-size: 12px;
  color: var(--text-secondary);
}

.expand-empty {
  font-size: 12px;
  color: var(--text-secondary);
  padding: 8px 0;
}

.expand-row {
  display: grid;
  grid-template-columns: 90px 1fr 1fr;
  gap: 12px;
  align-items: center;
  font-size: 12px;
  color: var(--text-secondary);
}

.expand-label {
  font-weight: 600;
  color: var(--text-primary);
}

.batch-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 4px;
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

.multi-tag {
  margin-top: 6px;
}

.action-more {
  color: #1f6feb;
}

:deep(.row-after-sale td) {
  background: rgba(239, 68, 68, 0.08) !important;
}

.mobile-card {
  margin-bottom: 12px;
}

.mobile-card-warning {
  border-color: rgba(239, 68, 68, 0.3);
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

.mobile-pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}
</style>
