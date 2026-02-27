<template>
  <section class="mc-kpi">
    <article v-for="card in cards" :key="card.key" class="mc-kpi-card" :class="`tone-${card.tone}`">
      <div class="mc-kpi-title">{{ card.title }}</div>
      <div class="mc-kpi-value">{{ card.value }}</div>
      <div class="mc-kpi-sub">{{ card.subtitle }}</div>
    </article>
    <div class="mc-kpi-filters">
      <a-tag
        v-for="chip in chips"
        :key="chip.key"
        class="mc-chip"
        :class="{ active: activeChips.includes(chip.key) }"
        @click="$emit('toggle-chip', chip.key)"
      >
        {{ chip.label }}
      </a-tag>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  cards: Array<{
    key: string
    title: string
    value: string
    subtitle: string
    tone: 'info' | 'warning' | 'danger' | 'success'
  }>
  chips: Array<{ key: string; label: string }>
  activeChips: string[]
}>()

defineEmits<{
  (e: 'toggle-chip', key: string): void
}>()
</script>
