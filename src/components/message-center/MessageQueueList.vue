<template>
  <div class="mc-queue">
    <div class="mc-queue-header">
      <div class="mc-queue-title">{{ title }}</div>
      <div class="mc-queue-extra">{{ items.length }} 条</div>
    </div>
    <a-list :data-source="items" class="mc-queue-list">
      <template #renderItem="{ item }">
        <a-list-item>
          <article
            class="mc-item"
            :class="{ active: selectedId === item.id }"
            @click="$emit('select', item.id)"
          >
            <a-checkbox
              :checked="selectedIds.includes(item.id)"
              @click.stop
              @change="$emit('toggle-check', item.id)"
            />
            <div class="mc-item-main">
              <div class="mc-item-title">
                <span class="mc-item-text">{{ item.title }}</span>
                <a-tag v-if="item.status === 'failed'" color="red">失败</a-tag>
                <a-tag v-else-if="item.status === 'read'" color="green">已读</a-tag>
                <a-tag v-else color="blue">未读</a-tag>
                <a-tag v-if="item.priority === '高'" color="orange">高优先</a-tag>
              </div>
              <div class="mc-item-desc">{{ item.content }}</div>
              <div class="mc-item-meta">
                <span>{{ item.type }}</span>
                <span v-if="item.bizNo">业务号 {{ item.bizNo }}</span>
                <span>{{ item.sentAt || item.createdAt }}</span>
              </div>
            </div>
          </article>
        </a-list-item>
      </template>
    </a-list>
  </div>
</template>

<script setup lang="ts">
import type { MessageRecord } from '../../types/message-center'

defineProps<{
  title: string
  items: MessageRecord[]
  selectedId: string
  selectedIds: string[]
}>()

defineEmits<{
  (e: 'select', id: string): void
  (e: 'toggle-check', id: string): void
}>()
</script>
