<template>
  <a-card class="pd-hero pd-fade-in" :body-style="{ padding: '18px' }">
    <div class="pd-hero-grid">
      <div class="pd-media">
        <a-image
          :src="coverMedia?.cover || product.cover"
          :preview="{ mask: '预览' }"
          class="pd-main-image"
        />
        <div class="pd-media-track">
          <button
            v-for="item in mediaPreview"
            :key="item.id"
            class="pd-media-chip"
            :class="{ active: activeMediaId === item.id }"
            type="button"
            @click="activeMediaId = item.id"
          >
            <img :src="item.cover || item.url" :alt="item.name" />
            <span v-if="item.type === 'video'" class="video-tag">视频</span>
          </button>
        </div>
      </div>

      <div class="pd-summary">
        <div class="pd-title-row">
          <h1 class="pd-title">{{ product.name }}</h1>
          <div class="pd-tags">
            <a-tag :color="product.status === '上架中' ? 'green' : 'default'">{{
              product.status
            }}</a-tag>
            <a-tag v-for="tag in product.tagList" :key="tag" color="blue">{{ tag }}</a-tag>
          </div>
        </div>
        <p class="pd-subtitle">{{ product.subtitle }}</p>
        <div class="pd-meta">
          <span
            >商品编号：<strong class="mono">{{ product.id }}</strong></span
          >
          <span
            >品牌：<strong>{{ product.brand }}</strong></span
          >
          <span
            >类目：<strong>{{ product.category }}</strong></span
          >
          <span
            >SPU：<strong class="mono">{{ product.spu }}</strong></span
          >
        </div>
      </div>

      <div class="pd-metrics-panel">
        <div class="pd-metrics-grid">
          <div class="pd-metric">
            <div class="label">售价区间</div>
            <div class="value">¥{{ metrics.priceRange }}</div>
          </div>
          <div class="pd-metric">
            <div class="label">毛利区间</div>
            <div class="value success">{{ metrics.profitRange }}</div>
          </div>
          <div class="pd-metric">
            <div class="label">库存</div>
            <div class="value">{{ product.stock }}</div>
          </div>
          <div class="pd-metric">
            <div class="label">月销量</div>
            <div class="value">{{ product.monthSales }}</div>
          </div>
          <div class="pd-metric">
            <div class="label">退款率</div>
            <div class="value warn">{{ product.refundRate }}%</div>
          </div>
          <div class="pd-metric">
            <div class="label">健康分</div>
            <div class="value primary">{{ metrics.healthScore }}</div>
          </div>
        </div>
        <a-space class="pd-actions">
          <a-button @click="$emit('copy')">复制商品</a-button>
          <a-button type="primary" @click="$emit('edit')">编辑商品</a-button>
          <a-button danger ghost @click="$emit('toggleStatus')">
            {{ product.status === '上架中' ? '下架' : '上架' }}
          </a-button>
        </a-space>
      </div>
    </div>
  </a-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ProductDetailViewModel, ProductMediaItem } from '../../types/productDetail'

const props = defineProps<{
  product: ProductDetailViewModel
  metrics: {
    priceRange: string
    profitRange: string
    healthScore: number
  }
}>()

defineEmits<{
  (e: 'edit'): void
  (e: 'copy'): void
  (e: 'toggleStatus'): void
}>()

const mediaPreview = computed(() => props.product.media.slice(0, 8))
const activeMediaId = ref(mediaPreview.value[0]?.id ?? '')

const coverMedia = computed<ProductMediaItem | undefined>(() => {
  return props.product.media.find((item) => item.id === activeMediaId.value)
})
</script>
