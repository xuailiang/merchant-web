<template>
  <div class="od-section-nav" :class="{ vertical }">
    <button
      v-for="item in items"
      :key="item.key"
      class="od-nav-item"
      :class="{ active: item.key === activeKey }"
      type="button"
      @click="$emit('select', item.key)"
    >
      {{ item.label }}
      <span v-if="item.badge" class="od-nav-badge">{{ item.badge }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import type { OrderSectionKey } from '../../types/orderDetail'

defineProps<{
  items: Array<{ key: OrderSectionKey; label: string; badge?: string }>
  activeKey: OrderSectionKey
  vertical?: boolean
}>()

defineEmits<{
  (e: 'select', key: OrderSectionKey): void
}>()
</script>
