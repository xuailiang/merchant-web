<template>
  <div class="orders-v2">
    <div class="page-head">
      <div>
        <div class="page-title">订单管理</div>
        <div class="page-sub">履约执行优先：先看风险，再处理订单。</div>
      </div>
      <a-space>
        <a-button @click="resetFilters">重置视图</a-button>
        <a-button type="primary" @click="exportOrders()">创建导出任务</a-button>
      </a-space>
    </div>

    <TableWrapper :loading="tableLoading">
      <template #filters>
        <OrderCommandBar :cards="commandCards" @select="onCommandSelect" />

        <div class="orders-toolbar">
          <a-tabs v-model:active-key="activeTab" class="order-tabs" @change="onTabChange">
            <a-tab-pane
              v-for="tab in tabOptions"
              :key="tab.key"
              :tab="`${tab.label} (${tab.count})`"
            />
          </a-tabs>

          <div class="view-controls">
            <a-select
              v-model:value="currentPreset"
              style="width: 180px"
              :options="presetOptions"
              @change="applyPreset"
            />
            <a-button @click="saveCurrentPreset">保存当前视图</a-button>
          </div>
        </div>

        <a-alert
          type="warning"
          show-icon
          message="温馨提示：红色风险订单建议优先处理，售后中的订单请先完成服务单再发货。"
          class="warning-tip"
        />

        <a-form layout="inline" class="filter-basic">
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
          <a-form-item label="商品名称">
            <a-input v-model:value="filters.productName" placeholder="请输入商品名称" allow-clear />
          </a-form-item>
          <a-form-item label="下单号码">
            <a-input v-model:value="filters.orderCode" placeholder="请输入下单号码" allow-clear />
          </a-form-item>
          <a-form-item label="收货人手机">
            <a-input v-model:value="filters.phone" placeholder="请输入手机号" allow-clear />
          </a-form-item>
          <a-form-item label="下单时间">
            <a-range-picker v-model:value="orderRange" :get-popup-container="getPopupContainer" />
          </a-form-item>
          <a-form-item label="支付时间">
            <a-range-picker v-model:value="payRange" :get-popup-container="getPopupContainer" />
          </a-form-item>
          <a-space>
            <a-button type="primary" @click="pagination.current = 1">搜索</a-button>
            <a-button @click="showAdvanced = !showAdvanced">
              {{ showAdvanced ? '收起高级筛选' : '高级筛选' }}
            </a-button>
          </a-space>
        </a-form>

        <a-form v-if="showAdvanced" layout="inline" class="filter-advanced">
          <a-form-item label="支付渠道">
            <a-select
              v-model:value="filters.paymentMethod"
              :options="paymentOptions"
              allow-clear
              placeholder="全部"
              style="width: 140px"
            />
          </a-form-item>
          <a-form-item label="发货仓">
            <a-select
              v-model:value="filters.warehouse"
              :options="warehouseOptions"
              allow-clear
              placeholder="全部"
              style="width: 140px"
            />
          </a-form-item>
          <a-form-item label="售后冲突">
            <a-select
              v-model:value="filters.afterSaleMode"
              :options="afterSaleOptions"
              style="width: 150px"
            />
          </a-form-item>
          <a-form-item label="利润区间">
            <a-select
              v-model:value="filters.profitRange"
              :options="profitOptions"
              style="width: 150px"
            />
          </a-form-item>
          <a-form-item label="SLA区间">
            <a-select v-model:value="filters.slaRange" :options="slaOptions" style="width: 170px" />
          </a-form-item>
          <a-form-item label="风险筛选">
            <a-select
              v-model:value="filters.riskType"
              :options="riskOptions"
              style="width: 170px"
            />
          </a-form-item>
        </a-form>
      </template>

      <template #actions>
        <div class="batch-row">
          <a-upload :before-upload="preventUpload" :file-list="[]">
            <a-button>上传文件</a-button>
          </a-upload>
          <a-space>
            <a-button>上传</a-button>
            <a-button
              v-if="hasPermission('orders:export')"
              type="primary"
              ghost
              @click="exportOrders('待发货')"
            >
              待发货导出
            </a-button>
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
                  <span class="mobile-label">实付/利润</span>
                  <span>{{ item.paidAmount }} / {{ formatCurrency(item.estimatedProfit) }}</span>
                </div>
                <div class="mobile-row">
                  <span class="mobile-label">SLA</span>
                  <OrderSlaPill :minutes-left="item.slaMinutesLeft" />
                </div>
                <div class="mobile-row">
                  <span class="mobile-label">状态</span>
                  <a-tag :color="getOrderStatusMeta(item.status).color">{{
                    getOrderStatusMeta(item.status).label
                  }}</a-tag>
                </div>
                <OrderRiskTagGroup :tags="item.riskFlags" />
                <div class="mobile-actions">
                  <template v-for="action in getOrderPrimaryActions(item)" :key="action.key">
                    <RouterLink v-if="action.to && isActionAllowed(action)" :to="action.to(item)">{{
                      action.label
                    }}</RouterLink>
                    <a-button
                      v-else-if="isActionAllowed(action)"
                      type="link"
                      @click="handleOrderAction(action.key, item)"
                    >
                      {{ action.label }}
                    </a-button>
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
        :pagination="tablePagination"
        :scroll="{ x: 1600 }"
        :row-class-name="rowClassName"
        :row-selection="rowSelection"
        :locale="{ emptyText: h(TableEmpty, { description: '暂无订单数据' }) }"
      >
        <template #expandedRowRender="{ record }">
          <div class="expand-panel">
            <div class="expand-card">
              <div class="expand-title">商品清单</div>
              <div v-for="(item, index) in record.items" :key="index" class="expand-product-item">
                <img :src="item.image" alt="商品" />
                <div>
                  <div class="expand-product-name">{{ item.name }}</div>
                  <div class="expand-product-meta">{{ item.spec }}</div>
                  <div class="expand-product-meta">SPU: {{ item.spu }}</div>
                </div>
                <div class="expand-product-price">
                  <div>{{ item.price }}</div>
                  <div>x{{ item.qty }}</div>
                </div>
              </div>
            </div>

            <div class="expand-card">
              <div class="expand-title">支付 / 优惠 / 物流</div>
              <div class="expand-kv">
                <div class="expand-kv-label">支付信息</div>
                <div>{{ record.payMethod }} / {{ record.payTime }}</div>
              </div>
              <div class="expand-kv">
                <div class="expand-kv-label">金额利润</div>
                <div>
                  实付 {{ record.paidAmount }}，预估毛利
                  {{ formatCurrency(record.estimatedProfit) }}（{{
                    record.estimatedMargin.toFixed(1)
                  }}%）
                </div>
              </div>
              <div class="expand-kv">
                <div class="expand-kv-label">操作轨迹</div>
                <div>{{ record.logs.join(' / ') }}</div>
              </div>
              <div class="expand-title" style="margin-top: 8px">包裹信息</div>
              <div v-for="pkg in record.packages" :key="pkg.id" class="package-item">
                <div class="package-head">
                  <span>{{ pkg.carrier }} · {{ pkg.tracking }}</span>
                  <a-tag :color="pkg.status === '异常' ? 'red' : 'blue'">{{ pkg.status }}</a-tag>
                </div>
                <div class="package-meta">更新时间：{{ pkg.updatedAt }}</div>
              </div>
            </div>
          </div>
        </template>

        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'product'">
            <OrderProductStack
              :items="record.items"
              :fallback-name="record.productName"
              :fallback-spec="record.productSku"
            />
          </template>

          <template v-else-if="column.key === 'status'">
            <div class="status-cell">
              <a-tag :color="getOrderStatusMeta(record.status).color">
                {{ getOrderStatusMeta(record.status).label }}
              </a-tag>
              <OrderRiskTagGroup :tags="record.riskFlags" />
            </div>
          </template>

          <template v-else-if="column.key === 'sla'">
            <OrderSlaPill :minutes-left="record.slaMinutesLeft" />
            <div class="amount-sub">截止：{{ record.slaDeadline }}</div>
          </template>

          <template v-else-if="column.key === 'amount'">
            <div class="amount-main">{{ record.paidAmount }}</div>
            <div class="amount-sub">单价 {{ record.unitPrice }} · 数量 {{ record.quantity }}</div>
            <div class="amount-profit">
              毛利 {{ formatCurrency(record.estimatedProfit) }}（{{
                record.estimatedMargin.toFixed(1)
              }}%）
            </div>
          </template>

          <template v-else-if="column.key === 'logistics'">
            <div class="logistics-main">{{ record.packageCount }} 个包裹</div>
            <div class="logistics-sub">{{ record.latestLogisticsAt }}</div>
          </template>

          <template v-else-if="column.key === 'receiver'">
            <div class="receiver-main">{{ record.receiver }} / {{ record.phone }}</div>
            <div class="receiver-sub">{{ record.region }}</div>
            <span class="buyer-tier">{{ record.buyerTier }}</span>
          </template>

          <template v-else-if="column.key === 'action'">
            <div class="action-cell">
              <template v-for="action in getOrderPrimaryActions(record)" :key="action.key">
                <RouterLink
                  v-if="action.to && isActionAllowed(action)"
                  :to="action.to(record)"
                  class="action-link"
                >
                  {{ action.label }}
                </RouterLink>
                <a-button
                  v-else-if="isActionAllowed(action)"
                  type="link"
                  class="action-link-btn"
                  @click="handleOrderAction(action.key, record)"
                >
                  {{ action.label }}
                </a-button>
              </template>
              <a-dropdown
                v-if="getOrderMoreActions(record).length > 0"
                :menu="getOrderMoreMenu(record)"
              >
                <a class="action-more action-link" @click.prevent>更多</a>
              </a-dropdown>
            </div>
          </template>
        </template>
      </a-table>

      <OrderBulkActionBar
        :visible="selectedRowKeys.length > 0"
        :selected-count="selectedRowKeys.length"
        :actions="bulkActions"
        @action="handleBulkAction"
      />
    </TableWrapper>
  </div>
</template>

<script setup lang="ts">
import { computed, h, onMounted, ref, watch } from 'vue'
import dayjs, { type Dayjs } from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import { RouterLink, useRouter } from 'vue-router'
import { message, type MenuProps } from 'ant-design-vue'
import TableWrapper from '../components/TableWrapper.vue'
import ColumnSetting from '../components/ColumnSetting.vue'
import TableEmpty from '../components/TableEmpty.vue'
import OrderCommandBar from '../components/orders/OrderCommandBar.vue'
import OrderRiskTagGroup from '../components/orders/OrderRiskTagGroup.vue'
import OrderSlaPill from '../components/orders/OrderSlaPill.vue'
import OrderProductStack from '../components/orders/OrderProductStack.vue'
import OrderBulkActionBar from '../components/orders/OrderBulkActionBar.vue'
import { useIsMobile } from '../utils/useIsMobile'
import { useListPageState } from '../utils/useListPageState'
import { hasPermission } from '../utils/permissions'
import {
  applyOrderRiskPriority,
  orderActionConfig,
  orderStatusActions,
  orderStatusConfig,
  type ActionDef,
} from '../utils/statusConfig'
import { createExportTask } from '../utils/exports'
import { useColumnConfig } from '../utils/columnConfig'
import type { OrderRiskFlag, OrderSummaryCard, OrderViewPreset } from '../types/order'
import { fetchOrders, type OrderItem } from '../api/endpoints'
import '../styles/orders-v2.css'

dayjs.extend(isBetween)

const isMobile = useIsMobile()
const router = useRouter()
const tableLoading = ref(false)
const scrollContainerRef = ref<HTMLElement | null>(null)
const showAdvanced = ref(false)
const selectedRowKeys = ref<string[]>([])

type OrderLineItem = {
  name: string
  spec: string
  spu: string
  image: string
  price: string
  qty: number
}

type OrderPackage = {
  id: string
  carrier: string
  tracking: string
  status: '待揽收' | '运输中' | '派送中' | '已签收' | '异常'
  updatedAt: string
}

type OrderRow = {
  key: string
  id: string
  productName: string
  productSku: string
  spu: string
  image: string
  items: OrderLineItem[]
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
  buyerTier: '普通' | '会员' | 'VIP'
  region: string
  warehouse: string
  paymentChannel: '微信支付' | '支付宝' | '银行卡' | '未支付'
  slaDeadline: string
  slaMinutesLeft: number
  estimatedProfit: number
  estimatedMargin: number
  packageCount: number
  latestLogisticsAt: string
  riskFlags: OrderRiskFlag[]
  packages: OrderPackage[]
  logs: string[]
}

const parseMoney = (value: string) => Number(value.replace(/[^\d.-]/g, '') || 0)
const formatCurrency = (value: number) => `¥${value.toFixed(2)}`

const buildRiskFlags = (
  status: string,
  margin: number,
  slaMinutesLeft: number,
  hasAbnormalPkg: boolean
) => {
  const flags: OrderRiskFlag[] = []
  if (/退款|售后/.test(status)) flags.push({ label: '售后中', level: 'danger' })
  if (slaMinutesLeft <= 30) flags.push({ label: '超时风险', level: 'danger' })
  if (margin < 15) flags.push({ label: '低毛利', level: 'warning' })
  if (hasAbnormalPkg) flags.push({ label: '物流异常', level: 'warning' })
  if (flags.length === 0) flags.push({ label: '正常', level: 'normal' })
  return flags
}

const now = dayjs()

const mockOrders: OrderRow[] = [
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
    buyerTier: '普通',
    region: '山东 济南',
    warehouse: '华北一仓',
    paymentChannel: '未支付',
    slaDeadline: now.add(350, 'minute').format('YYYY-MM-DD HH:mm'),
    slaMinutesLeft: 350,
    estimatedProfit: 12,
    estimatedMargin: 20,
    packageCount: 0,
    latestLogisticsAt: '未发货',
    riskFlags: [{ label: '正常', level: 'normal' }],
    packages: [],
    logs: ['系统创建订单', '用户取消订单', '自动关闭支付单'],
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
    quantity: 2,
    unitPrice: '¥7,499',
    paidAmount: '¥7,511',
    payMethod: '微信支付',
    receiver: 'admin',
    phone: '13567546709',
    note: '加急发货',
    settlement: '未结算',
    afterSale: false,
    buyerTier: 'VIP',
    region: '山东 济南',
    warehouse: '华东二仓',
    paymentChannel: '微信支付',
    slaDeadline: now.add(22, 'minute').format('YYYY-MM-DD HH:mm'),
    slaMinutesLeft: 22,
    estimatedProfit: 642,
    estimatedMargin: 8.5,
    packageCount: 1,
    latestLogisticsAt: '未揽收',
    riskFlags: [],
    packages: [
      {
        id: 'PKG-1001',
        carrier: '顺丰',
        tracking: 'SF1038892211',
        status: '待揽收',
        updatedAt: '2026-02-27 10:20',
      },
    ],
    logs: ['支付成功', '仓库拣货完成', '待交接快递员'],
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
      {
        name: '逗猫棒高级款',
        spec: '彩色羽毛',
        spu: 'SPU000907',
        image: 'https://picsum.photos/seed/order3c/80/80',
        price: '¥15',
        qty: 1,
      },
    ],
    orderTime: '2026-02-03 10:21',
    payTime: '2026-02-03 10:25',
    status: '待收货',
    orderCode: '13632223344',
    quantity: 3,
    unitPrice: '¥128',
    paidAmount: '¥256',
    payMethod: '支付宝',
    receiver: '周女士',
    phone: '13632223344',
    note: '送货上门',
    settlement: '已结算',
    afterSale: false,
    buyerTier: '会员',
    region: '山东 青岛',
    warehouse: '华北一仓',
    paymentChannel: '支付宝',
    slaDeadline: now.add(240, 'minute').format('YYYY-MM-DD HH:mm'),
    slaMinutesLeft: 240,
    estimatedProfit: 86,
    estimatedMargin: 33.6,
    packageCount: 2,
    latestLogisticsAt: '2026-02-27 09:12 已到达青岛分拨中心',
    riskFlags: [],
    packages: [
      {
        id: 'PKG-1002',
        carrier: '中通',
        tracking: 'ZT222123876',
        status: '运输中',
        updatedAt: '2026-02-27 09:12',
      },
      {
        id: 'PKG-1003',
        carrier: '中通',
        tracking: 'ZT222123877',
        status: '派送中',
        updatedAt: '2026-02-27 11:41',
      },
    ],
    logs: ['支付成功', '分包裹发货', '用户查看物流'],
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
    buyerTier: '普通',
    region: '江苏 苏州',
    warehouse: '华东二仓',
    paymentChannel: '微信支付',
    slaDeadline: now.add(420, 'minute').format('YYYY-MM-DD HH:mm'),
    slaMinutesLeft: 420,
    estimatedProfit: 124,
    estimatedMargin: 31.1,
    packageCount: 1,
    latestLogisticsAt: '2026-02-27 08:22 已签收',
    riskFlags: [],
    packages: [
      {
        id: 'PKG-1004',
        carrier: '京东快递',
        tracking: 'JD77881299',
        status: '已签收',
        updatedAt: '2026-02-27 08:22',
      },
    ],
    logs: ['支付成功', '发货完成', '订单签收完成'],
  },
  {
    key: 'o5',
    id: 'DD2026020115203',
    productName: '母婴推车轻便款',
    productSku: '灰色 / 轻便折叠',
    spu: 'SPU192200',
    image: 'https://picsum.photos/seed/order5/80/80',
    items: [
      {
        name: '母婴推车轻便款',
        spec: '灰色 / 轻便折叠',
        spu: 'SPU192200',
        image: 'https://picsum.photos/seed/order5/80/80',
        price: '¥2,480',
        qty: 1,
      },
    ],
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
    buyerTier: 'VIP',
    region: '广东 深圳',
    warehouse: '华南仓',
    paymentChannel: '微信支付',
    slaDeadline: now.subtract(36, 'minute').format('YYYY-MM-DD HH:mm'),
    slaMinutesLeft: -36,
    estimatedProfit: 320,
    estimatedMargin: 12.9,
    packageCount: 1,
    latestLogisticsAt: '2026-02-27 09:55 申请拦截',
    riskFlags: [],
    packages: [
      {
        id: 'PKG-1005',
        carrier: '圆通',
        tracking: 'YT997722',
        status: '异常',
        updatedAt: '2026-02-27 09:55',
      },
    ],
    logs: ['用户发起退款', '售后待审核', '订单进入拦截流程'],
  },
  {
    key: 'o6',
    id: 'DD2026013122129',
    productName: '会员礼包套装',
    productSku: '限定款',
    spu: 'SPU882100',
    image: 'https://picsum.photos/seed/order6/80/80',
    items: [
      {
        name: '会员礼包套装',
        spec: '限定款',
        spu: 'SPU882100',
        image: 'https://picsum.photos/seed/order6/80/80',
        price: '¥699',
        qty: 1,
      },
    ],
    orderTime: '2026-01-31 22:12',
    payTime: '暂未获取到支付信息',
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
    buyerTier: '普通',
    region: '北京 朝阳',
    warehouse: '华北一仓',
    paymentChannel: '未支付',
    slaDeadline: now.add(520, 'minute').format('YYYY-MM-DD HH:mm'),
    slaMinutesLeft: 520,
    estimatedProfit: 0,
    estimatedMargin: 0,
    packageCount: 0,
    latestLogisticsAt: '未支付未发货',
    riskFlags: [],
    packages: [],
    logs: ['订单创建', '待支付提醒已发送', '用户未付款'],
  },
  {
    key: 'o7',
    id: 'DD2026013010102',
    productName: '空气净化器 Pro',
    productSku: '白色 / 标准版',
    spu: 'SPU880012',
    image: 'https://picsum.photos/seed/order7/80/80',
    items: [
      {
        name: '空气净化器 Pro',
        spec: '白色 / 标准版',
        spu: 'SPU880012',
        image: 'https://picsum.photos/seed/order7/80/80',
        price: '¥1,120',
        qty: 1,
      },
    ],
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
    buyerTier: '会员',
    region: '上海 浦东',
    warehouse: '华东二仓',
    paymentChannel: '支付宝',
    slaDeadline: now.add(280, 'minute').format('YYYY-MM-DD HH:mm'),
    slaMinutesLeft: 280,
    estimatedProfit: 110,
    estimatedMargin: 9.8,
    packageCount: 1,
    latestLogisticsAt: '2026-02-27 07:15 退款完成',
    riskFlags: [],
    packages: [
      {
        id: 'PKG-1006',
        carrier: '顺丰',
        tracking: 'SF90118822',
        status: '已签收',
        updatedAt: '2026-02-27 07:15',
      },
    ],
    logs: ['售后审核通过', '退款完成', '订单归档'],
  },
  {
    key: 'o8',
    id: 'DD2026012912019',
    productName: '咖啡机套装',
    productSku: '银色 / 套装版',
    spu: 'SPU760112',
    image: 'https://picsum.photos/seed/order8/80/80',
    items: [
      {
        name: '咖啡机套装',
        spec: '银色 / 套装版',
        spu: 'SPU760112',
        image: 'https://picsum.photos/seed/order8/80/80',
        price: '¥2,980',
        qty: 1,
      },
    ],
    orderTime: '2026-01-29 12:01',
    payTime: '2026-01-29 12:05',
    status: '交易关闭',
    orderCode: '13766668888',
    quantity: 1,
    unitPrice: '¥2,980',
    paidAmount: '¥2,980',
    payMethod: '银行卡支付',
    receiver: '赵女士',
    phone: '13766668888',
    note: '/',
    settlement: '未结算',
    afterSale: false,
    buyerTier: '普通',
    region: '浙江 杭州',
    warehouse: '华东二仓',
    paymentChannel: '银行卡',
    slaDeadline: now.add(150, 'minute').format('YYYY-MM-DD HH:mm'),
    slaMinutesLeft: 150,
    estimatedProfit: 860,
    estimatedMargin: 28.8,
    packageCount: 1,
    latestLogisticsAt: '2026-02-27 12:11 已关闭',
    riskFlags: [],
    packages: [
      {
        id: 'PKG-1007',
        carrier: '申通',
        tracking: 'ST1123987',
        status: '运输中',
        updatedAt: '2026-02-27 12:11',
      },
    ],
    logs: ['支付成功', '超时未发货关闭', '结算撤销'],
  },
  {
    key: 'o9',
    id: 'DD2026012809054',
    productName: '手机壳礼盒',
    productSku: '粉色 / 组合装',
    spu: 'SPU350010',
    image: 'https://picsum.photos/seed/order9/80/80',
    items: [
      {
        name: '手机壳礼盒',
        spec: '粉色 / 组合装',
        spu: 'SPU350010',
        image: 'https://picsum.photos/seed/order9/80/80',
        price: '¥79',
        qty: 2,
      },
    ],
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
    buyerTier: '会员',
    region: '河南 郑州',
    warehouse: '华中仓',
    paymentChannel: '支付宝',
    slaDeadline: now.subtract(8, 'minute').format('YYYY-MM-DD HH:mm'),
    slaMinutesLeft: -8,
    estimatedProfit: 28,
    estimatedMargin: 17.7,
    packageCount: 1,
    latestLogisticsAt: '2026-02-27 13:18 退款审核中',
    riskFlags: [],
    packages: [
      {
        id: 'PKG-1008',
        carrier: '韵达',
        tracking: 'YD7788612',
        status: '异常',
        updatedAt: '2026-02-27 13:18',
      },
    ],
    logs: ['退款申请创建', '商家待审核', '自动提醒已发送'],
  },
]

mockOrders.forEach((item) => {
  const hasAbnormal = item.packages.some((pkg) => pkg.status === '异常')
  item.riskFlags = buildRiskFlags(
    item.status,
    item.estimatedMargin,
    item.slaMinutesLeft,
    hasAbnormal
  )
})

const orders: OrderRow[] = mockOrders
const USE_REMOTE = false

const mapRemoteOrder = (item: OrderItem): OrderRow => {
  const first = item.items?.[0]
  const parsedPaid = parseMoney(item.paidAmount)
  const estimatedProfit = item.estimatedProfit ?? Number((parsedPaid * 0.18).toFixed(2))
  const estimatedMargin =
    item.estimatedMargin ?? Number(((estimatedProfit / (parsedPaid || 1)) * 100).toFixed(2))
  const packages =
    item.packages?.map((pkg) => ({
      id: pkg.id,
      carrier: pkg.carrier,
      tracking: pkg.tracking,
      status: (pkg.status as OrderPackage['status']) ?? '运输中',
      updatedAt: pkg.updatedAt,
    })) ?? []
  const slaMinutesLeft =
    typeof item.slaMinutesLeft === 'number'
      ? item.slaMinutesLeft
      : dayjs(item.slaDeadline ?? dayjs().add(180, 'minute')).diff(dayjs(), 'minute')
  const hasAbnormal = packages.some((pkg) => pkg.status === '异常')
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
    status: item.status ?? '待支付',
    orderCode: item.orderCode,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    paidAmount: item.paidAmount,
    payMethod: item.payMethod,
    receiver: item.receiver,
    phone: item.phone,
    note: item.note,
    settlement: item.settlement,
    afterSale: /退款|售后/.test(item.status),
    buyerTier: item.buyerTier ?? '普通',
    region: item.region ?? '未知',
    warehouse: item.warehouse ?? '默认仓',
    paymentChannel: item.paymentChannel ?? '微信支付',
    slaDeadline: item.slaDeadline ?? dayjs().add(180, 'minute').format('YYYY-MM-DD HH:mm'),
    slaMinutesLeft,
    estimatedProfit,
    estimatedMargin,
    packageCount: item.packageCount ?? packages.length,
    latestLogisticsAt: item.latestLogisticsAt ?? packages[0]?.updatedAt ?? '暂无物流',
    riskFlags: buildRiskFlags(item.status, estimatedMargin, slaMinutesLeft, hasAbnormal),
    packages,
    logs: ['接口数据同步', '状态驱动生成操作', '等待用户处理'],
  }
}

const getPopupContainer = (trigger?: HTMLElement): HTMLElement =>
  trigger?.ownerDocument?.body ?? document.body

const allColumns = [
  { title: '订单与商品', key: 'product', width: 340 },
  { title: '订单编号', dataIndex: 'id', key: 'id', width: 190 },
  { title: '状态与风险', dataIndex: 'status', key: 'status', width: 210 },
  { title: '履约时效', key: 'sla', width: 190 },
  { title: '金额与利润', key: 'amount', width: 240 },
  { title: '物流进度', key: 'logistics', width: 220 },
  { title: '买家与收货', key: 'receiver', width: 210 },
  { title: '下单时间', dataIndex: 'orderTime', key: 'orderTime', width: 170 },
  { title: '操作', key: 'action', fixed: 'right', width: 220, className: 'order-col-action' },
]

const {
  visibleKeys,
  filteredColumns: columns,
  reset,
} = useColumnConfig('columns:orders', allColumns)

type FiltersState = {
  orderId: string
  orderCode: string
  productName: string
  phone: string
  statuses: string[]
  orderRange: string[]
  payRange: string[]
  activeTab: string
  paymentMethod: string
  warehouse: string
  afterSaleMode: 'all' | 'yes' | 'no'
  profitRange: 'all' | 'loss' | 'low' | 'mid' | 'high'
  slaRange: 'all' | 'safe' | 'warning' | 'expired' | 'urgent'
  riskType: 'all' | 'afterSale' | 'logistics' | 'lowProfit' | 'sla'
}

const { filters, pagination, bindScrollContainer } = useListPageState<
  FiltersState,
  { current: number; pageSize: number }
>('list:orders', {
  filters: {
    orderId: '',
    orderCode: '',
    productName: '',
    phone: '',
    statuses: [] as string[],
    orderRange: [] as string[],
    payRange: [] as string[],
    activeTab: 'all',
    paymentMethod: '',
    warehouse: '',
    afterSaleMode: 'all',
    profitRange: 'all',
    slaRange: 'all',
    riskType: 'all',
  },
  pagination: {
    current: 1,
    pageSize: 8,
  },
})

if (!Array.isArray(filters.statuses)) filters.statuses = []

const activeTab = computed({
  get: () => filters.activeTab,
  set: (value) => {
    filters.activeTab = value
  },
})

const orderRange = computed({
  get: () => {
    if (filters.orderRange.length === 2) {
      return [dayjs(filters.orderRange[0]), dayjs(filters.orderRange[1])] as [Dayjs, Dayjs]
    }
    return null
  },
  set: (value: [Dayjs, Dayjs] | null) => {
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
      return [dayjs(filters.payRange[0]), dayjs(filters.payRange[1])] as [Dayjs, Dayjs]
    }
    return null
  },
  set: (value: [Dayjs, Dayjs] | null) => {
    if (!value || value.length !== 2) {
      filters.payRange = []
      return
    }
    filters.payRange = [value[0].format('YYYY-MM-DD'), value[1].format('YYYY-MM-DD')]
  },
})

const paymentOptions = [
  { label: '全部', value: '' },
  { label: '微信支付', value: '微信支付' },
  { label: '支付宝', value: '支付宝' },
  { label: '银行卡', value: '银行卡' },
  { label: '未支付', value: '未支付' },
]

const warehouseOptions = [
  { label: '全部', value: '' },
  { label: '华北一仓', value: '华北一仓' },
  { label: '华东二仓', value: '华东二仓' },
  { label: '华南仓', value: '华南仓' },
  { label: '华中仓', value: '华中仓' },
]

const afterSaleOptions = [
  { label: '全部', value: 'all' },
  { label: '仅售后冲突', value: 'yes' },
  { label: '排除售后', value: 'no' },
]

const profitOptions = [
  { label: '全部', value: 'all' },
  { label: '亏损', value: 'loss' },
  { label: '低毛利(<15%)', value: 'low' },
  { label: '中毛利(15-30%)', value: 'mid' },
  { label: '高毛利(>30%)', value: 'high' },
]

const slaOptions = [
  { label: '全部', value: 'all' },
  { label: '安全(>180分钟)', value: 'safe' },
  { label: '预警(30-180分钟)', value: 'warning' },
  { label: '已超时(<=0分钟)', value: 'expired' },
  { label: '紧急(<=180分钟)', value: 'urgent' },
]

const riskOptions = [
  { label: '全部', value: 'all' },
  { label: '售后冲突', value: 'afterSale' },
  { label: '物流异常', value: 'logistics' },
  { label: '低毛利', value: 'lowProfit' },
  { label: '超时风险', value: 'sla' },
]

const statusOptions = [
  { label: '待支付', value: '待支付' },
  { label: '待发货', value: '待发货' },
  { label: '待收货', value: '待收货' },
  { label: '交易完成', value: '交易完成' },
  { label: '取消', value: '取消' },
  { label: '退款中', value: '退款中' },
  { label: '退款完成', value: '退款完成' },
  { label: '退款审核中', value: '退款审核中' },
  { label: '交易关闭', value: '交易关闭' },
]

const tabKeys = [
  { key: 'all', label: '全部订单' },
  { key: '待发货', label: '待发货' },
  { key: '待收货', label: '待收货' },
  { key: '待支付', label: '待支付' },
  { key: '交易完成', label: '交易完成' },
  { key: '退款中', label: '退款中' },
  { key: '退款审核中', label: '退款审核中' },
  { key: '退款完成', label: '退款完成' },
  { key: '交易关闭', label: '交易关闭' },
]

const tabOptions = computed(() =>
  tabKeys.map((tab) => ({
    ...tab,
    count:
      tab.key === 'all' ? orders.length : orders.filter((item) => item.status === tab.key).length,
  }))
)

const filteredOrders = computed(() => {
  const keyword = filters.orderId.trim()

  return orders.filter((item) => {
    const matchOrderId = !keyword || item.id.includes(keyword)
    const matchCode = !filters.orderCode || item.orderCode.includes(filters.orderCode.trim())
    const matchProduct =
      !filters.productName || item.productName.includes(filters.productName.trim())
    const matchPhone = !filters.phone || item.phone.includes(filters.phone.trim())
    const matchStatus = filters.statuses.length === 0 || filters.statuses.includes(item.status)
    const matchTab = filters.activeTab === 'all' || item.status === filters.activeTab
    const matchOrderDate =
      filters.orderRange.length === 0 ||
      dayjs(item.orderTime).isBetween(filters.orderRange[0], filters.orderRange[1], 'day', '[]')
    const matchPayDate =
      filters.payRange.length === 0 ||
      dayjs(item.payTime).isBetween(filters.payRange[0], filters.payRange[1], 'day', '[]')
    const matchPayment = !filters.paymentMethod || item.paymentChannel === filters.paymentMethod
    const matchWarehouse = !filters.warehouse || item.warehouse === filters.warehouse
    const matchAfterSale =
      filters.afterSaleMode === 'all' ||
      (filters.afterSaleMode === 'yes' && item.afterSale) ||
      (filters.afterSaleMode === 'no' && !item.afterSale)
    const matchProfit =
      filters.profitRange === 'all' ||
      (filters.profitRange === 'loss' && item.estimatedMargin < 0) ||
      (filters.profitRange === 'low' && item.estimatedMargin >= 0 && item.estimatedMargin < 15) ||
      (filters.profitRange === 'mid' && item.estimatedMargin >= 15 && item.estimatedMargin <= 30) ||
      (filters.profitRange === 'high' && item.estimatedMargin > 30)

    const matchSla =
      filters.slaRange === 'all' ||
      (filters.slaRange === 'safe' && item.slaMinutesLeft > 180) ||
      (filters.slaRange === 'warning' && item.slaMinutesLeft > 30 && item.slaMinutesLeft <= 180) ||
      (filters.slaRange === 'expired' && item.slaMinutesLeft <= 0) ||
      (filters.slaRange === 'urgent' && item.slaMinutesLeft <= 180)

    const riskLabels = item.riskFlags.map((risk) => risk.label)
    const matchRisk =
      filters.riskType === 'all' ||
      (filters.riskType === 'afterSale' && riskLabels.includes('售后中')) ||
      (filters.riskType === 'logistics' && riskLabels.includes('物流异常')) ||
      (filters.riskType === 'lowProfit' && riskLabels.includes('低毛利')) ||
      (filters.riskType === 'sla' && riskLabels.includes('超时风险'))

    return (
      matchOrderId &&
      matchCode &&
      matchProduct &&
      matchPhone &&
      matchStatus &&
      matchTab &&
      matchOrderDate &&
      matchPayDate &&
      matchPayment &&
      matchWarehouse &&
      matchAfterSale &&
      matchProfit &&
      matchSla &&
      matchRisk
    )
  })
})

const pagedOrders = computed(() => {
  const start = (pagination.current - 1) * pagination.pageSize
  return filteredOrders.value.slice(start, start + pagination.pageSize)
})

watch(
  () => filteredOrders.value.length,
  (total) => {
    const max = Math.max(1, Math.ceil(total / pagination.pageSize))
    if (pagination.current > max) pagination.current = max
  },
  { immediate: true }
)

const tablePagination = computed(() => ({
  current: pagination.current,
  pageSize: pagination.pageSize,
  total: filteredOrders.value.length,
  showSizeChanger: true,
  pageSizeOptions: ['8', '20', '50'],
  onChange: (page: number, pageSize: number) => {
    pagination.current = page
    pagination.pageSize = pageSize
  },
}))

const selectedRows = computed(() =>
  filteredOrders.value.filter((order) => selectedRowKeys.value.includes(order.key))
)

const bulkActions = computed(() => {
  const actions: Array<{ key: string; label: string; primary?: boolean }> = [
    { key: 'export', label: '批量导出', primary: true },
  ]
  if (selectedRows.value.length > 0 && selectedRows.value.every((row) => row.status === '待发货')) {
    actions.unshift({ key: 'ship', label: '批量发货' })
  }
  if (selectedRows.value.some((row) => row.afterSale)) {
    actions.push({ key: 'afterSale', label: '批量售后处理' })
  }
  actions.push({ key: 'note', label: '批量备注' })
  return actions
})

const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys: (string | number)[]) => {
    selectedRowKeys.value = keys.map(String)
  },
}))

const latestDay = computed(() =>
  orders
    .map((item) => dayjs(item.orderTime))
    .sort((a, b) => b.valueOf() - a.valueOf())[0]
    ?.format('YYYY-MM-DD')
)

const commandCards = computed<OrderSummaryCard[]>(() => {
  const ordersOfDay = orders.filter(
    (item) => dayjs(item.orderTime).format('YYYY-MM-DD') === latestDay.value
  )
  const waitShipUrgent = orders.filter(
    (item) => item.status === '待发货' && item.slaMinutesLeft <= 180
  ).length
  const refundPending = orders.filter((item) =>
    ['退款审核中', '退款中'].includes(item.status)
  ).length
  const abnormalLogistics = orders.filter((item) =>
    item.riskFlags.some((risk) => risk.label === '物流异常')
  ).length
  const highValuePending = orders.filter(
    (item) => ['待发货', '待支付'].includes(item.status) && parseMoney(item.paidAmount) >= 1000
  ).length
  const shipDone = ordersOfDay.filter((item) => ['待收货', '交易完成'].includes(item.status)).length
  const shipRate = ordersOfDay.length ? ((shipDone / ordersOfDay.length) * 100).toFixed(1) : '0.0'
  const refundRate = ordersOfDay.length
    ? (
        (ordersOfDay.filter((item) => ['退款中', '退款审核中', '退款完成'].includes(item.status))
          .length /
          ordersOfDay.length) *
        100
      ).toFixed(1)
    : '0.0'

  return [
    {
      key: 'urgentShip',
      title: '待发货(临近超时)',
      value: `${waitShipUrgent}`,
      subtitle: '优先处理红色 SLA 订单',
      tone: waitShipUrgent > 0 ? 'danger' : 'normal',
    },
    {
      key: 'refundPending',
      title: '退款待审',
      value: `${refundPending}`,
      subtitle: '售后冲突先处理',
      tone: refundPending > 8 ? 'danger' : 'warning',
    },
    {
      key: 'abnormalLogistics',
      title: '异常物流',
      value: `${abnormalLogistics}`,
      subtitle: '查看异常包裹与轨迹',
      tone: abnormalLogistics > 0 ? 'warning' : 'normal',
    },
    {
      key: 'highValuePending',
      title: '高价值待处理',
      value: `${highValuePending}`,
      subtitle: '实付>=1000元',
      tone: highValuePending > 0 ? 'warning' : 'normal',
    },
    {
      key: 'shipRate',
      title: '今日已完成发货率',
      value: `${shipRate}%`,
      subtitle: '最新工作日口径',
      tone: Number(shipRate) > 90 ? 'normal' : 'warning',
    },
    {
      key: 'refundRate',
      title: '今日退款率',
      value: `${refundRate}%`,
      subtitle: '含退款审核中',
      tone: Number(refundRate) > 6 ? 'danger' : 'normal',
    },
  ]
})

const onCommandSelect = (key: string) => {
  filters.statuses = []
  filters.riskType = 'all'
  filters.slaRange = 'all'
  filters.profitRange = 'all'
  filters.afterSaleMode = 'all'

  if (key === 'urgentShip') {
    filters.activeTab = '待发货'
    filters.slaRange = 'urgent'
  } else if (key === 'refundPending') {
    filters.activeTab = '退款审核中'
    filters.statuses = ['退款审核中', '退款中']
    filters.afterSaleMode = 'yes'
  } else if (key === 'abnormalLogistics') {
    filters.activeTab = 'all'
    filters.riskType = 'logistics'
  } else if (key === 'highValuePending') {
    filters.activeTab = '待发货'
  } else if (key === 'shipRate') {
    filters.activeTab = '待收货'
  } else if (key === 'refundRate') {
    filters.activeTab = '退款中'
    filters.afterSaleMode = 'yes'
  }
  pagination.current = 1
}

const getOrderStatusMeta = (status: string) =>
  orderStatusConfig[status] ?? { label: status, color: 'default' }

const isActionAllowed = (action: ActionDef) =>
  !action.permission || hasPermission(action.permission)

const getOrderActions = (record: OrderRow) => {
  const keys = orderStatusActions[record.status] ?? ['view']
  const orderedKeys = applyOrderRiskPriority(
    keys,
    record.riskFlags.map((risk) => risk.label)
  )
  return orderedKeys.map((key) => orderActionConfig[key]).filter(Boolean)
}

const getOrderPrimaryActions = (record: OrderRow) =>
  getOrderActions(record).filter(isActionAllowed).slice(0, 2)

const getOrderMoreActions = (record: OrderRow) =>
  getOrderActions(record).filter(isActionAllowed).slice(2)

const handleOrderAction = (actionKey: string, record: OrderRow) => {
  const action = orderActionConfig[actionKey]
  if (action?.to) {
    router.push(action.to(record))
    return
  }
  if (actionKey === 'afterSale') {
    router.push(`/orders/after-sales?orderId=${record.id}`)
    return
  }
  if (actionKey === 'ship') {
    router.push(`/orders/ship/${record.id}`)
    return
  }
  if (actionKey === 'logistics') {
    message.success(`已打开物流轨迹：${record.id}`)
    return
  }
  if (actionKey === 'remindPay') {
    message.success(`已发送催付提醒：${record.phone}`)
    return
  }
  message.success(`已执行：${action?.label ?? actionKey}`)
}

const getOrderMoreMenu = (record: OrderRow): MenuProps => {
  const actions = getOrderMoreActions(record)
  return {
    items: actions.map((action) => ({ key: action.key, label: action.label })),
    onClick: ({ key }) => handleOrderAction(String(key), record),
  }
}

const resetFilters = () => {
  filters.orderId = ''
  filters.orderCode = ''
  filters.productName = ''
  filters.phone = ''
  filters.statuses = []
  filters.orderRange = []
  filters.payRange = []
  filters.activeTab = 'all'
  filters.paymentMethod = ''
  filters.warehouse = ''
  filters.afterSaleMode = 'all'
  filters.profitRange = 'all'
  filters.slaRange = 'all'
  filters.riskType = 'all'
  pagination.current = 1
}

const onTabChange = () => {
  filters.statuses = []
  pagination.current = 1
}

const exportOrders = (status?: string) => {
  const ids = selectedRowKeys.value
  const task = createExportTask({
    module: 'orders',
    title: status ? `订单导出（${status}）` : ids.length ? '订单导出（批量）' : '订单导出',
    params: {
      orderId: filters.orderId,
      orderCode: filters.orderCode,
      statuses: status ? [status] : filters.statuses,
      productName: filters.productName,
      phone: filters.phone,
      paymentMethod: filters.paymentMethod,
      warehouse: filters.warehouse,
      orderStart: filters.orderRange[0],
      orderEnd: filters.orderRange[1],
      payStart: filters.payRange[0],
      payEnd: filters.payRange[1],
      orderIds: ids,
    },
    fields: ['订单号', '商品', '状态', 'SLA', '实付金额', '预估毛利', '物流进度'],
  })
  message.success('已加入导出队列，请在下载中心查看')
  router.push(`/exports?highlight=${task.id}`)
}

const rowClassName = (record: OrderRow) => (record.afterSale ? 'row-after-sale' : '')
const preventUpload = () => false

const handleBulkAction = (key: string) => {
  if (key === 'ship') {
    message.success(`已创建 ${selectedRowKeys.value.length} 条批量发货任务`)
    return
  }
  if (key === 'export') {
    exportOrders()
    return
  }
  if (key === 'afterSale') {
    router.push('/orders/after-sales')
    return
  }
  message.success(`已执行批量操作：${key}`)
}

const presetsStorageKey = 'orders:view-presets'
const readPresetStorage = () => {
  const raw = localStorage.getItem(presetsStorageKey)
  if (!raw) return [] as Array<{ key: string; label: string; filters: FiltersState }>
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const builtInPresets: Array<{
  key: OrderViewPreset
  label: string
  filters: Partial<FiltersState>
}> = [
  { key: 'default', label: '默认视图', filters: { activeTab: 'all' } },
  {
    key: 'fulfillment',
    label: '仓配专员视图',
    filters: { activeTab: '待发货', slaRange: 'urgent', afterSaleMode: 'no' },
  },
  {
    key: 'afterSale',
    label: '售后优先视图',
    filters: { afterSaleMode: 'yes', activeTab: '退款审核中', statuses: ['退款审核中', '退款中'] },
  },
]

const customPresets =
  ref<Array<{ key: string; label: string; filters: FiltersState }>>(readPresetStorage())
const currentPreset = ref<string>('default')

const presetOptions = computed(() => [
  ...builtInPresets.map((item) => ({ label: item.label, value: item.key })),
  ...customPresets.value.map((item) => ({ label: item.label, value: item.key })),
])

const applyPreset = (key: string) => {
  const builtIn = builtInPresets.find((item) => item.key === key)
  if (builtIn) {
    resetFilters()
    Object.assign(filters, builtIn.filters)
    pagination.current = 1
    return
  }
  const custom = customPresets.value.find((item) => item.key === key)
  if (custom) {
    Object.assign(filters, custom.filters)
    pagination.current = 1
  }
}

const saveCurrentPreset = () => {
  const key = `preset-${Date.now()}`
  const label = `自定义视图 ${dayjs().format('MM-DD HH:mm')}`
  customPresets.value.unshift({
    key,
    label,
    filters: JSON.parse(JSON.stringify(filters)) as FiltersState,
  })
  localStorage.setItem(presetsStorageKey, JSON.stringify(customPresets.value))
  currentPreset.value = key
  message.success('当前筛选已保存为自定义视图')
}

const filteredKeySet = computed(() => new Set(filteredOrders.value.map((item) => item.key)))
watch(filteredKeySet, () => {
  selectedRowKeys.value = selectedRowKeys.value.filter((key) => filteredKeySet.value.has(key))
})

const loadOrders = async () => {
  if (!USE_REMOTE) return
  tableLoading.value = true
  try {
    const res = await fetchOrders({
      orderId: filters.orderId,
      orderCode: filters.orderCode,
      statuses: filters.statuses,
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
  } catch {
    message.error('订单列表加载失败，请检查接口配置')
  } finally {
    tableLoading.value = false
  }
}

onMounted(() => {
  scrollContainerRef.value = document.querySelector('.layout-content') as HTMLElement | null
  bindScrollContainer(scrollContainerRef)
  void loadOrders()
})
</script>
