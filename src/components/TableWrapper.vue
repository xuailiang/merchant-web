<template>
  <a-card class="table-wrapper">
    <div v-if="showHeader" class="table-header">
      <div class="table-title">
        <div class="table-title-main">{{ title }}</div>
        <div v-if="subtitle" class="table-title-sub">{{ subtitle }}</div>
      </div>
      <div class="table-header-extra">
        <slot name="header-extra" />
      </div>
    </div>

    <div v-if="$slots.filters" class="table-filters">
      <slot name="filters" />
    </div>

    <div v-if="$slots.actions" class="table-actions">
      <slot name="actions" />
    </div>

    <div class="table-content">
      <slot />
    </div>

    <div v-if="$slots.footer" class="table-footer">
      <slot name="footer" />
    </div>
  </a-card>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'

const props = defineProps<{
  title?: string
  subtitle?: string
}>()

const slots = useSlots()
const showHeader = computed(() => !!props.title || !!props.subtitle || !!slots['header-extra'])
</script>

<style scoped>
.table-wrapper {
  border-radius: 14px;
}

.table-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.table-title-main {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
}

.table-title-sub {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 4px;
}

.table-header-extra {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.table-filters {
  margin-bottom: 16px;
}

.table-actions {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.table-content {
  min-height: 120px;
}

.table-footer {
  margin-top: 16px;
}
</style>
