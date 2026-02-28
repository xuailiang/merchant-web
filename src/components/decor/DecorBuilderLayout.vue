<template>
  <div class="decor-v2">
    <a-card class="decor-v2-head">
      <div class="decor-v2-head-main">
        <div>
          <div class="decor-v2-title">{{ title }}</div>
          <div class="decor-v2-meta">{{ meta }}</div>
        </div>
        <a-space>
          <a-tag :color="dirty ? 'orange' : 'green'">{{ dirty ? '未保存' : '已保存' }}</a-tag>
          <slot name="head-actions" />
        </a-space>
      </div>
      <div v-if="compact" class="decor-v2-mobile-actions">
        <a-space>
          <a-button @click="libraryOpen = true">组件库</a-button>
          <a-button @click="configOpen = true">配置面板</a-button>
        </a-space>
      </div>
    </a-card>

    <div class="decor-v2-body" :class="{ compact }">
      <aside v-if="!compact" class="decor-v2-panel decor-v2-library">
        <slot name="library" />
      </aside>
      <main class="decor-v2-canvas-wrap">
        <slot name="canvas" />
      </main>
      <aside v-if="!compact" class="decor-v2-panel decor-v2-config">
        <slot name="config" />
      </aside>
    </div>

    <a-drawer v-model:open="libraryOpen" title="组件库" width="320">
      <slot name="library" />
    </a-drawer>
    <a-drawer v-model:open="configOpen" title="配置面板" width="380">
      <slot name="config" />
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useIsMobile } from '../../utils/useIsMobile'

defineProps<{
  title: string
  meta: string
  dirty: boolean
}>()

const compact = useIsMobile(1280)
const libraryOpen = ref(false)
const configOpen = ref(false)
</script>
