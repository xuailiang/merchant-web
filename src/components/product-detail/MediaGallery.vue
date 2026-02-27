<template>
  <a-card title="媒体素材" class="pd-section-card pd-fade-in" id="section-media">
    <div class="pd-media-layout">
      <div class="pd-image-grid">
        <a-image-preview-group>
          <div
            v-for="item in imageItems"
            :key="item.id"
            class="pd-image-item"
            :class="{ active: highlightedSkuImage && highlightedSkuImage === item.url }"
          >
            <a-image :src="item.url" :preview="{ mask: '预览' }" />
            <a-tag v-if="item.isMain" color="blue" class="main-tag">主图</a-tag>
          </div>
        </a-image-preview-group>
      </div>

      <div class="pd-video-list">
        <div v-for="video in videoItems" :key="video.id" class="pd-video-card">
          <img :src="video.cover || video.url" :alt="video.name" />
          <div class="video-content">
            <div class="title">{{ video.name }}</div>
            <div class="duration">时长：{{ video.duration || '--:--' }}</div>
            <a-space>
              <a-button size="small" @click="previewVideo(video.url)">预览</a-button>
              <a-button size="small" type="link" @click="copyLink(video.url)">复制链接</a-button>
            </a-space>
          </div>
        </div>
        <a-empty v-if="videoItems.length === 0" description="暂无视频素材" :image="null" />
      </div>
    </div>
  </a-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { message } from 'ant-design-vue'
import type { ProductMediaItem } from '../../types/productDetail'

const props = defineProps<{
  media: ProductMediaItem[]
  highlightedSkuImage?: string
}>()

const imageItems = computed(() => props.media.filter((item) => item.type === 'image'))
const videoItems = computed(() => props.media.filter((item) => item.type === 'video'))

const copyLink = async (url: string) => {
  try {
    await navigator.clipboard.writeText(url)
    message.success('视频链接已复制')
  } catch {
    message.warning('复制失败，请手动复制')
  }
}

const previewVideo = (url: string) => {
  window.open(url, '_blank')
}
</script>
