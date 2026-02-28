<template>
  <a-card title="SKU与价格" class="wizard-section-card">
    <a-alert
      message="设置规格后可生成 SKU，建议先设置批量价格，再做单条微调。"
      type="info"
      show-icon
      class="sku-alert"
    />

    <div class="sku-specs">
      <div v-for="group in specGroups" :key="group.key" class="sku-spec-row">
        <div class="sku-spec-label">{{ group.label }}</div>
        <div class="sku-spec-values">
          <a-tag
            v-for="tag in group.tags"
            :key="tag"
            closable
            color="blue"
            @close.prevent="emit('removeSpec', group.key, tag)"
          >
            {{ tag }}
          </a-tag>
          <a-input
            v-model:value="group.input"
            size="small"
            class="spec-input"
            placeholder="添加规格值"
            @pressEnter="emit('addSpec', group.key)"
          />
          <a-button size="small" @click="emit('addSpec', group.key)">添加</a-button>
        </div>
      </div>
    </div>

    <a-card title="批量设置" class="sku-batch-card" size="small">
      <a-form layout="inline" class="sku-batch-form">
        <a-form-item label="成本价">
          <a-input-number
            :value="batch.cost"
            size="small"
            @update:value="(val) => updateBatchField('cost', val)"
          />
        </a-form-item>
        <a-form-item label="原价">
          <a-input-number
            :value="batch.original"
            size="small"
            @update:value="(val) => updateBatchField('original', val)"
          />
        </a-form-item>
        <a-form-item label="售价">
          <a-input-number
            :value="batch.price"
            size="small"
            @update:value="(val) => updateBatchField('price', val)"
          />
        </a-form-item>
        <a-form-item label="库存">
          <a-input-number
            :value="batch.stock"
            size="small"
            @update:value="(val) => updateBatchField('stock', val)"
          />
        </a-form-item>
        <a-button type="primary" size="small" @click="emit('applyBatch')">应用到全部 SKU</a-button>
      </a-form>
    </a-card>

    <div class="sku-header">
      <div class="section-title">SKU 列表</div>
      <a-space>
        <a-button type="link" @click="emit('generateSku')">根据规格生成 SKU</a-button>
      </a-space>
    </div>

    <a-table
      :columns="skuColumns"
      :data-source="skus"
      :pagination="false"
      row-key="id"
      :scroll="{ x: 1160 }"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'image'">
          <a-avatar
            :src="record.image"
            shape="square"
            :size="42"
            class="sku-avatar"
            @click="emit('selectSkuImage', record.image)"
          />
        </template>
        <template v-else-if="column.key === 'combo'">
          <div class="sku-combo">{{ record.combo }}</div>
          <div class="sku-code">{{ record.code }}</div>
        </template>
        <template v-else-if="column.key === 'barcode'">
          <a-input
            :value="record.barcode"
            size="small"
            placeholder="条形码"
            @update:value="(val) => updateSkuField(record.id, 'barcode', val)"
          />
          <a-input
            :value="record.customCode"
            size="small"
            placeholder="自建码"
            @update:value="(val) => updateSkuField(record.id, 'customCode', val)"
          />
        </template>
        <template v-else-if="column.key === 'prices'">
          <a-space size="small">
            <a-input-number
              :value="record.price"
              size="small"
              :formatter="currencyFormatter"
              :parser="currencyParser"
              @update:value="(val) => updateSkuField(record.id, 'price', val)"
            />
            <a-input-number
              :value="record.original"
              size="small"
              :formatter="currencyFormatter"
              :parser="currencyParser"
              @update:value="(val) => updateSkuField(record.id, 'original', val)"
            />
            <a-input-number
              :value="record.cost"
              size="small"
              :formatter="currencyFormatter"
              :parser="currencyParser"
              @update:value="(val) => updateSkuField(record.id, 'cost', val)"
            />
          </a-space>
        </template>
        <template v-else-if="column.key === 'stock'">
          <a-input-number
            :value="record.stock"
            size="small"
            @update:value="(val) => updateSkuField(record.id, 'stock', val)"
          />
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
          <a-button type="text" danger @click="emit('removeSku', record.id)">删除</a-button>
        </template>
      </template>
    </a-table>
  </a-card>
</template>

<script setup lang="ts">
import type { SkuDraftItem, SpecGroupItem } from '../../types/create-product'

const props = defineProps<{
  specGroups: SpecGroupItem[]
  batch: {
    cost: number
    original: number
    price: number
    stock: number
  }
  skus: SkuDraftItem[]
  skuColumns: Array<Record<string, unknown>>
  currencyFormatter: (value?: number) => string
  currencyParser: (value: string) => number
  calcProfit: (record: SkuDraftItem) => number
  calcProfitRate: (record: SkuDraftItem) => number
}>()

const emit = defineEmits<{
  (event: 'addSpec', key: string): void
  (event: 'removeSpec', key: string, tag: string): void
  (event: 'applyBatch'): void
  (event: 'generateSku'): void
  (event: 'removeSku', id: string): void
  (event: 'selectSkuImage', image: string): void
  (event: 'update:batch', value: typeof props.batch): void
  (event: 'update:skus', value: SkuDraftItem[]): void
}>()

const updateBatchField = <K extends keyof typeof props.batch>(
  key: K,
  value: (typeof props.batch)[K]
) => {
  emit('update:batch', { ...props.batch, [key]: value })
}

const updateSkuField = <K extends keyof SkuDraftItem>(
  id: string,
  key: K,
  value: SkuDraftItem[K]
) => {
  const newSkus = props.skus.map((sku) => {
    if (sku.id === id) {
      return { ...sku, [key]: value }
    }
    return sku
  })
  emit('update:skus', newSkus)
}
</script>
