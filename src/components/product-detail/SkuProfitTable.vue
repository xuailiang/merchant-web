<template>
  <a-card title="SKU 与利润" class="pd-section-card pd-fade-in" id="section-sku">
    <div class="pd-sku-summary">
      <div class="item">
        <span>SKU 数量</span>
        <strong>{{ skus.length }}</strong>
      </div>
      <div class="item">
        <span>总库存</span>
        <strong>{{ totalStock }}</strong>
      </div>
      <div class="item">
        <span>平均毛利率</span>
        <strong>{{ avgProfitRate }}%</strong>
      </div>
      <div class="item warn">
        <span>低库存 SKU</span>
        <strong>{{ lowStockCount }}</strong>
      </div>
      <div class="item">
        <span>低毛利 SKU</span>
        <strong>{{ lowProfitCount }}</strong>
      </div>
    </div>

    <div class="pd-sku-filters">
      <a-segmented v-model:value="filterMode" :options="filterOptions" />
      <a-input
        v-model:value="keyword"
        placeholder="搜索规格组合/自建码"
        allow-clear
        style="width: 240px"
      />
    </div>

    <a-table
      :columns="columns"
      :data-source="filteredRows"
      :pagination="{ pageSize: 8 }"
      :scroll="{ x: 1100 }"
      row-key="id"
      :custom-row="customRow"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'image'">
          <a-image :src="record.image" :width="48" :height="48" class="sku-image" />
        </template>
        <template v-else-if="column.key === 'price'">
          <span class="price-highlight">¥{{ record.price }}</span>
        </template>
        <template v-else-if="column.key === 'originalPrice'">
          <span class="origin-price">¥{{ record.originalPrice }}</span>
        </template>
        <template v-else-if="column.key === 'profit'">
          <div class="profit-cell">
            <span class="profit-value">¥{{ calcProfit(record).toFixed(2) }}</span>
            <a-tag :color="calcProfitRate(record) >= 0.3 ? 'green' : 'orange'">
              {{ (calcProfitRate(record) * 100).toFixed(1) }}%
            </a-tag>
          </div>
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space>
            <a-button type="link" size="small" @click="copyText(record.id)">复制SKU</a-button>
            <a-button type="link" size="small" @click="copyText(record.customCode)"
              >复制自建码</a-button
            >
            <a-button type="link" size="small" @click="$emit('editSku', record.id)">编辑</a-button>
          </a-space>
        </template>
      </template>
    </a-table>
  </a-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { message } from 'ant-design-vue'
import type { ProductSkuItem } from '../../types/productDetail'

const LOW_STOCK_THRESHOLD = 20
const LOW_PROFIT_THRESHOLD = 0.25

const props = defineProps<{
  skus: ProductSkuItem[]
}>()

const emit = defineEmits<{
  (e: 'hoverImage', image: string): void
  (e: 'editSku', skuId: string): void
}>()

const filterMode = ref<'all' | 'lowStock' | 'lowProfit'>('all')
const keyword = ref('')

const filterOptions = [
  { label: '全部', value: 'all' },
  { label: '低库存', value: 'lowStock' },
  { label: '低毛利', value: 'lowProfit' },
]

const columns = [
  { title: '图片', dataIndex: 'image', key: 'image', width: 80, fixed: 'left' },
  { title: '规格组合', dataIndex: 'combo', key: 'combo', width: 220, fixed: 'left' },
  { title: '条形码', dataIndex: 'barcode', key: 'barcode', width: 130 },
  { title: '自建码', dataIndex: 'customCode', key: 'customCode', width: 130 },
  { title: '售价', dataIndex: 'price', key: 'price', width: 90 },
  { title: '原价', dataIndex: 'originalPrice', key: 'originalPrice', width: 90 },
  { title: '成本价', dataIndex: 'cost', key: 'cost', width: 90 },
  { title: '库存', dataIndex: 'stock', key: 'stock', width: 80 },
  { title: '利润/利润率', key: 'profit', width: 140 },
  { title: '操作', key: 'action', width: 220, fixed: 'right' },
]

const calcProfit = (record: ProductSkuItem) => record.price - record.cost
const calcProfitRate = (record: ProductSkuItem) =>
  record.price ? calcProfit(record) / record.price : 0

const filteredRows = computed(() => {
  return props.skus.filter((item) => {
    const matchMode =
      filterMode.value === 'all' ||
      (filterMode.value === 'lowStock' && item.stock <= LOW_STOCK_THRESHOLD) ||
      (filterMode.value === 'lowProfit' && calcProfitRate(item) <= LOW_PROFIT_THRESHOLD)
    const search = keyword.value.trim()
    const matchKeyword = !search || item.combo.includes(search) || item.customCode.includes(search)
    return matchMode && matchKeyword
  })
})

const totalStock = computed(() => props.skus.reduce((sum, item) => sum + item.stock, 0))
const lowStockCount = computed(
  () => props.skus.filter((item) => item.stock <= LOW_STOCK_THRESHOLD).length
)
const lowProfitCount = computed(
  () => props.skus.filter((item) => calcProfitRate(item) <= LOW_PROFIT_THRESHOLD).length
)
const avgProfitRate = computed(() => {
  if (!props.skus.length) return 0
  const rate = props.skus.reduce((sum, item) => sum + calcProfitRate(item), 0) / props.skus.length
  return Number((rate * 100).toFixed(1))
})

const copyText = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    message.success('已复制')
  } catch {
    message.warning('复制失败，请手动复制')
  }
}

const onRowHover = (record: ProductSkuItem) => {
  emit('hoverImage', record.image)
}

const customRow = (record: ProductSkuItem) => ({
  onMouseenter: () => onRowHover(record),
})
</script>
