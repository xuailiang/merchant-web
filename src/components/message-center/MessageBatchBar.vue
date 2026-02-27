<template>
  <transition name="batch-fade">
    <div v-if="selectedCount > 0" class="mc-batch">
      <div class="mc-batch-meta">已选择 {{ selectedCount }} 条消息</div>
      <a-space>
        <a-button size="small" @click="$emit('action', 'markRead')">批量已读</a-button>
        <a-button size="small" @click="$emit('action', 'retry')">批量重试</a-button>
        <a-button size="small" danger @click="$emit('action', 'archive')">批量归档</a-button>
      </a-space>
    </div>
  </transition>
</template>

<script setup lang="ts">
import type { MessageBatchAction } from '../../types/message-center'

defineProps<{
  selectedCount: number
}>()

defineEmits<{
  (e: 'action', action: MessageBatchAction): void
}>()
</script>
