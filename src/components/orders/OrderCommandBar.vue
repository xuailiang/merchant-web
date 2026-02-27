<template>
  <div class="command-bar">
    <article
      v-for="card in cards"
      :key="card.key"
      class="command-card"
      :class="`tone-${card.tone}`"
      role="button"
      tabindex="0"
      @click="$emit('select', card.key)"
    >
      <div class="card-head">
        <span class="card-title">{{ card.title }}</span>
      </div>
      <div class="card-value">{{ card.value }}</div>
      <div class="card-subtitle">{{ card.subtitle }}</div>
    </article>
  </div>
</template>

<script setup lang="ts">
import type { OrderSummaryCard } from '../../types/order'

defineProps<{
  cards: OrderSummaryCard[]
}>()

defineEmits<{
  (e: 'select', key: string): void
}>()
</script>

<style scoped>
.command-bar {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 14px;
}

.command-card {
  padding: 12px;
  border-radius: 14px;
  border: 1px solid rgba(148, 163, 184, 0.28);
  background: #fff;
  cursor: pointer;
  transition:
    transform 220ms ease,
    box-shadow 220ms ease,
    border-color 220ms ease;
}

.command-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.08);
}

.card-title {
  font-size: 12px;
  color: #64748b;
  font-weight: 600;
}

.card-value {
  margin-top: 6px;
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
}

.card-subtitle {
  margin-top: 4px;
  font-size: 12px;
  color: #475569;
  line-height: 1.5;
}

.tone-normal {
  border-color: rgba(34, 197, 94, 0.35);
  background: linear-gradient(180deg, #ffffff 0%, #f3fff6 100%);
}

.tone-warning {
  border-color: rgba(245, 158, 11, 0.4);
  background: linear-gradient(180deg, #ffffff 0%, #fffaf0 100%);
}

.tone-danger {
  border-color: rgba(239, 68, 68, 0.38);
  background: linear-gradient(180deg, #ffffff 0%, #fff6f6 100%);
}

@media (max-width: 1400px) {
  .command-bar {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .command-bar {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
