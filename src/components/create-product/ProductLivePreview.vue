<template>
  <a-card class="live-preview-card">
    <template #title>
      <div class="live-preview-title">
        <span>实时预览</span>
        <a-button type="link" size="small" @click="emit('toggle', !collapsed)">
          {{ collapsed ? '展开' : '收起' }}
        </a-button>
      </div>
    </template>
    <div v-if="!collapsed" class="preview-shell">
      <div class="preview-notch"></div>
      <div class="preview-content">
        <div class="preview-image">
          <img :src="preview.image" alt="预览主图" />
          <div class="preview-count">1 / {{ Math.max(preview.imageCount, 1) }}</div>
        </div>
        <div class="preview-info">
          <div class="price">
            ¥{{ preview.price }}
            <span class="original">¥{{ preview.original }}</span>
          </div>
          <div class="title">{{ preview.title }}</div>
          <div class="subtitle">{{ preview.subtitle }}</div>
          <div class="meta">
            <span>规格：{{ preview.spec }}</span>
            <span>素材完整度：{{ preview.mediaCompleteness }}%</span>
          </div>
        </div>
        <div class="preview-detail">{{ preview.detail }}</div>
      </div>
    </div>
    <div v-else class="preview-collapsed">预览已折叠，展开可查看实时效果</div>
  </a-card>
</template>

<script setup lang="ts">
defineProps<{
  collapsed: boolean
  preview: {
    title: string
    subtitle: string
    price: string
    original: string
    detail: string
    spec: string
    image: string
    imageCount: number
    mediaCompleteness: number
  }
}>()

const emit = defineEmits<{
  (event: 'toggle', value: boolean): void
}>()
</script>
