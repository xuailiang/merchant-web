<template>
  <a-table
    :columns="columns"
    :data-source="drafts"
    :pagination="{ pageSize: 8 }"
    :scroll="{ x: 980 }"
    row-key="id"
  >
    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'info'">
        <div class="product-info">
          <div class="draft-thumb">
            <img v-if="record.image" :src="record.image" alt="草稿图" />
            <div v-else class="draft-thumb-placeholder"></div>
          </div>
          <div>
            <div class="product-name">{{ record.title }}</div>
            <div class="product-meta">草稿ID：{{ record.id }}</div>
            <div class="product-meta">更新：{{ record.updatedAt }}</div>
          </div>
        </div>
      </template>
      <template v-else-if="column.key === 'price'">
        <div v-if="record.price !== null && record.price !== undefined">¥{{ record.price }}</div>
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
        <div class="draft-actions">
          <a-button type="link" @click="emit('open', record.id)">继续编辑</a-button>
          <a-button type="link" @click="emit('duplicate', record.id)">复制草稿</a-button>
          <a-button type="link" danger @click="emit('remove', record.id)">删除</a-button>
        </div>
      </template>
    </template>
  </a-table>
</template>

<script setup lang="ts">
import type { ProductDraftItem } from '../../types/product-list'

defineProps<{
  drafts: ProductDraftItem[]
}>()

const emit = defineEmits<{
  (event: 'open', id: string): void
  (event: 'duplicate', id: string): void
  (event: 'remove', id: string): void
}>()

const columns = [
  { title: '商品信息', key: 'info', width: 360 },
  { title: '价格', key: 'price', width: 120 },
  { title: '库存', key: 'stock', width: 120 },
  { title: '状态', key: 'status', width: 120 },
  { title: '操作', key: 'action', width: 220 },
]
</script>
