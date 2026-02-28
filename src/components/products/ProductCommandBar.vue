<template>
  <div class="product-command-bar">
    <button
      v-for="item in items"
      :key="item.key"
      class="command-card"
      :class="{ active: activeKey === item.key }"
      type="button"
      @click="emit('select', item.key)"
    >
      <div class="command-meta">{{ item.label }}</div>
      <div class="command-value">{{ item.value }}</div>
      <div class="command-sub">{{ item.helper }}</div>
    </button>
  </div>
</template>

<script setup lang="ts">
export type CommandItem = {
  key: string
  label: string
  value: number
  helper: string
}

defineProps<{
  items: CommandItem[]
  activeKey: string
}>()

const emit = defineEmits<{
  (event: 'select', key: string): void
}>()
</script>
