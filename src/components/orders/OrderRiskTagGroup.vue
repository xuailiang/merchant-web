<template>
  <div class="risk-group">
    <a-tag v-for="tag in tags" :key="tag.label" class="risk-tag" :class="`risk-${tag.level}`">
      {{ tag.label }}
    </a-tag>
  </div>
</template>

<script setup lang="ts">
import type { OrderRiskFlag } from '../../types/order'

defineProps<{
  tags: OrderRiskFlag[]
}>()
</script>

<style scoped>
.risk-group {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.risk-tag {
  margin-inline-end: 0;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  border: 1px solid transparent;
}

.risk-normal {
  color: #0f766e;
  background: rgba(20, 184, 166, 0.12);
  border-color: rgba(20, 184, 166, 0.3);
}

.risk-warning {
  color: #a16207;
  background: rgba(245, 158, 11, 0.16);
  border-color: rgba(245, 158, 11, 0.34);
}

.risk-danger {
  color: #b91c1c;
  background: rgba(248, 113, 113, 0.14);
  border-color: rgba(248, 113, 113, 0.34);
}
</style>
