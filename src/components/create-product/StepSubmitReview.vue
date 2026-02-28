<template>
  <a-card title="提交审核" class="wizard-section-card">
    <div class="review-overview">
      <div class="review-item">
        <span class="label">商品标题</span>
        <span class="value">{{ form.name || '-' }}</span>
      </div>
      <div class="review-item">
        <span class="label">图片数量</span>
        <span class="value">{{ imagesCount }} 张</span>
      </div>
      <div class="review-item">
        <span class="label">SKU 数量</span>
        <span class="value">{{ skuCount }} 条</span>
      </div>
      <div class="review-item">
        <span class="label">平均利润率</span>
        <span class="value">{{ avgProfitRate }}%</span>
      </div>
    </div>

    <a-alert
      v-if="errors.length"
      type="warning"
      show-icon
      :message="`当前仍有 ${errors.length} 项待完善`"
      class="review-alert"
    />
    <a-alert v-else type="success" show-icon message="校验通过，可提交审核" class="review-alert" />

    <a-list bordered :data-source="reviewRows" size="small">
      <template #renderItem="{ item }">
        <a-list-item class="review-row">
          <span>{{ item.label }}</span>
          <a-tag :color="item.ok ? 'green' : 'orange'">{{ item.ok ? '完成' : '待补充' }}</a-tag>
        </a-list-item>
      </template>
    </a-list>

    <div v-if="errors.length" class="review-errors">
      <div class="title">问题清单</div>
      <a-space direction="vertical" size="small">
        <a-button
          v-for="(error, index) in errors"
          :key="`${error}-${index}`"
          type="link"
          class="error-link"
          @click="emit('jumpToError')"
        >
          {{ error }}
        </a-button>
      </a-space>
    </div>
  </a-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CreateProductFormState, SkuDraftItem } from '../../types/create-product'

const props = defineProps<{
  form: CreateProductFormState
  imagesCount: number
  skuCount: number
  skus: SkuDraftItem[]
  errors: string[]
}>()

const emit = defineEmits<{
  (event: 'jumpToError'): void
}>()

const avgProfitRate = computed(() => {
  if (props.skus.length === 0) return '0.0'
  const rate =
    props.skus.reduce((sum, sku) => {
      if (!sku.price) return sum
      return sum + (sku.price - sku.cost) / sku.price
    }, 0) / props.skus.length
  return (rate * 100).toFixed(1)
})

const reviewRows = computed(() => [
  { label: '基础信息', ok: Boolean(props.form.name && props.form.brand && props.form.category) },
  { label: '素材信息', ok: props.imagesCount > 0 },
  { label: 'SKU 与价格', ok: props.skuCount > 0 && props.skus.every((item) => item.price > 0) },
  {
    label: '物流与服务',
    ok: Boolean(props.form.shipping && props.form.tax && props.form.exchange > 0),
  },
])
</script>
