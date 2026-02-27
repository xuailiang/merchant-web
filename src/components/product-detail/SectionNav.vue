<template>
  <div class="pd-section-nav" :class="{ vertical }">
    <button
      v-for="item in items"
      :key="item.key"
      type="button"
      class="pd-nav-item"
      :class="{ active: item.key === activeKey }"
      @click="$emit('select', item.key)"
    >
      {{ item.label }}
      <span v-if="item.badge" class="pd-nav-badge">{{ item.badge }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import type { SectionKey } from '../../types/productDetail'

defineProps<{
  items: Array<{ key: SectionKey; label: string; badge?: string }>
  activeKey: SectionKey
  vertical?: boolean
}>()

defineEmits<{
  (e: 'select', key: SectionKey): void
}>()
</script>
