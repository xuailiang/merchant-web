<template>
  <transition name="bulk-fade">
    <div v-if="visible" class="bulk-bar">
      <div class="bulk-meta">已选择 {{ selectedCount }} 条订单</div>
      <a-space>
        <a-button
          v-for="action in actions"
          :key="action.key"
          :type="action.primary ? 'primary' : 'default'"
          @click="$emit('action', action.key)"
        >
          {{ action.label }}
        </a-button>
      </a-space>
    </div>
  </transition>
</template>

<script setup lang="ts">
defineProps<{
  visible: boolean
  selectedCount: number
  actions: Array<{
    key: string
    label: string
    primary?: boolean
  }>
}>()

defineEmits<{
  (e: 'action', key: string): void
}>()
</script>

<style scoped>
.bulk-bar {
  position: sticky;
  bottom: 12px;
  z-index: 12;
  margin-top: 14px;
  border-radius: 14px;
  border: 1px solid rgba(37, 99, 235, 0.3);
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(6px);
  padding: 10px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  box-shadow: 0 14px 28px rgba(15, 23, 42, 0.12);
}

.bulk-meta {
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
}

.bulk-fade-enter-active,
.bulk-fade-leave-active {
  transition: all 200ms ease;
}

.bulk-fade-enter-from,
.bulk-fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

@media (max-width: 768px) {
  .bulk-bar {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
