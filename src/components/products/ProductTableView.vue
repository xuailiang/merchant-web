<template>
  <a-table
    :columns="columns"
    :data-source="dataSource"
    :pagination="pagination"
    :row-selection="rowSelection"
    :scroll="{ x: 1480 }"
    class="products-table-v2"
    row-key="key"
    :locale="{ emptyText: h(TableEmpty, { description: '暂无商品数据' }) }"
  >
    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'info'">
        <div class="product-info">
          <img :src="record.image" alt="商品图" class="product-thumb" />
          <div class="product-info-main">
            <div class="product-name">{{ record.name }}</div>
            <div class="product-meta">商品编码：{{ record.code }}</div>
            <div class="product-meta">类目：{{ record.category }}</div>
            <div class="product-meta">渠道：{{ record.channel }} / 店铺：{{ record.shop }}</div>
            <div class="product-tag-row">
              <a-tag color="blue">{{ record.brand }}</a-tag>
              <a-tag v-if="record.auditStatus === '待审核'" color="cyan">待审核</a-tag>
              <a-tag v-if="record.stock <= warningThreshold" color="orange">库存预警</a-tag>
            </div>
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
      <template v-else-if="column.key === 'status'">
        <a-tag :color="getProductStatusMeta(record.status).color">
          {{ getProductStatusMeta(record.status).label }}
        </a-tag>
      </template>
      <template v-else-if="column.key === 'time'">
        <div class="product-meta">更新：{{ record.updatedAt }}</div>
        <div class="product-meta">首次上架：{{ record.listedAt }}</div>
      </template>
      <template v-else-if="column.key === 'action'">
        <ProductActionCell
          :record="record"
          :primary-actions="getActionBundle(record).primary"
          :more-actions="getActionBundle(record).more"
          :get-popup-container="getPopupContainer"
          @action="onAction"
        />
      </template>
    </template>

    <template #expandedRowRender="{ record }">
      <div class="product-expand">
        <div class="expand-summary">
          <div class="expand-kpi">
            <span class="label">主 SKU</span>
            <span class="value">{{ record.code }}-A1</span>
          </div>
          <div class="expand-kpi">
            <span class="label">媒体完整度</span>
            <span class="value">{{ record.mediaCompleteness ?? 80 }}%</span>
          </div>
          <div class="expand-kpi">
            <span class="label">最近操作</span>
            <span class="value">价格调整 / {{ record.updatedAt }}</span>
          </div>
        </div>
        <div class="expand-actions">
          <a-button size="small" @click="emit('copyCode', record)">复制编码</a-button>
          <a-button size="small" @click="emit('adjustStock', record)">调整库存阈值</a-button>
          <a-button size="small" @click="emit('changeStatus', record)">修改状态</a-button>
        </div>
      </div>
    </template>
  </a-table>
</template>

<script setup lang="ts">
import { h } from 'vue'
import TableEmpty from '../TableEmpty.vue'
import ProductActionCell from './ProductActionCell.vue'
import type { ProductActionDef, ProductListItem } from '../../types/product-list'
import type { StatusMeta } from '../../utils/statusConfig'

defineProps<{
  columns: Array<Record<string, unknown>>
  dataSource: ProductListItem[]
  pagination: Record<string, unknown>
  rowSelection: Record<string, unknown>
  warningThreshold: number
  getProductStatusMeta: (status: string) => StatusMeta
  calcProfit: (record: ProductListItem) => number
  calcProfitRate: (record: ProductListItem) => string
  getActionBundle: (record: ProductListItem) => {
    primary: ProductActionDef[]
    more: ProductActionDef[]
  }
  getPopupContainer: (trigger?: HTMLElement) => HTMLElement
}>()

const emit = defineEmits<{
  (event: 'action', actionKey: string, record: ProductListItem): void
  (event: 'copyCode', record: ProductListItem): void
  (event: 'adjustStock', record: ProductListItem): void
  (event: 'changeStatus', record: ProductListItem): void
}>()

const onAction = (actionKey: string, record: ProductListItem) => emit('action', actionKey, record)
</script>
