<template>
  <div class="sla-pill" :class="`sla-${status}`">
    <span v-if="status !== 'safe'" class="sla-dot" />
    <span class="sla-label">{{ label }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { OrderSlaStatus } from '../../types/order'

const props = defineProps<{
  minutesLeft: number
}>()

const status = computed<OrderSlaStatus>(() => {
  if (props.minutesLeft <= 0) return 'expired'
  if (props.minutesLeft <= 180) return 'warning'
  return 'safe'
})

const label = computed(() => {
  if (status.value === 'expired') return `超时 ${Math.abs(props.minutesLeft)} 分钟`
  if (status.value === 'warning') return `剩余 ${props.minutesLeft} 分钟`
  const hours = Math.floor(props.minutesLeft / 60)
  const mins = props.minutesLeft % 60
  return `剩余 ${hours}h ${mins}m`
})
</script>

<style scoped>
.sla-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 999px;
  padding: 3px 10px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid transparent;
}

.sla-label {
  white-space: nowrap;
}

.sla-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.sla-safe {
  color: #047857;
  background: rgba(16, 185, 129, 0.12);
  border-color: rgba(16, 185, 129, 0.34);
}

.sla-warning {
  color: #a16207;
  background: rgba(245, 158, 11, 0.16);
  border-color: rgba(245, 158, 11, 0.38);
}

.sla-expired {
  color: #b91c1c;
  background: rgba(248, 113, 113, 0.16);
  border-color: rgba(248, 113, 113, 0.45);
}

.sla-expired .sla-dot,
.sla-warning .sla-dot {
  animation: dot-pulse 1.3s infinite;
}

@keyframes dot-pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.25;
  }
  100% {
    opacity: 1;
  }
}
</style>
