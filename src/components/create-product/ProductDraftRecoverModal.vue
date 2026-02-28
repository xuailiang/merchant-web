<template>
  <a-modal :open="open" title="检测到未完成草稿" :footer="null" @update:open="emit('cancel')">
    <div class="recover-body">
      <p>最近一次草稿：{{ draftTitle }}</p>
      <p>更新时间：{{ updatedAt || '-' }}</p>
    </div>
    <div class="recover-actions">
      <a-space>
        <a-button @click="emit('discard')">新建空白</a-button>
        <a-button type="primary" @click="emit('recover')">继续编辑草稿</a-button>
      </a-space>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
defineProps<{
  open: boolean
  draftTitle: string
  updatedAt: string
}>()

const emit = defineEmits<{
  (event: 'recover'): void
  (event: 'discard'): void
  (event: 'cancel'): void
}>()
</script>
