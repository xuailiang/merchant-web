<template>
  <section class="mc-detail">
    <template v-if="record">
      <div class="mc-detail-head">
        <div>
          <h3 class="mc-detail-title">{{ record.title }}</h3>
          <div class="mc-detail-sub">
            <a-tag color="blue">{{ record.type }}</a-tag>
            <a-tag v-if="record.priority === '高'" color="orange">高优先</a-tag>
            <span>接收人：{{ record.recipient }}</span>
            <span v-if="record.bizNo">业务号：{{ record.bizNo }}</span>
          </div>
        </div>
        <a-space>
          <a-button
            size="small"
            :disabled="record.status === 'read'"
            @click="$emit('mark-read', record.id)"
          >
            标记已读
          </a-button>
          <a-tooltip :title="record.retryCount >= record.maxRetry ? '重试次数已达上限' : ''">
            <a-button
              size="small"
              :disabled="record.status !== 'failed' || record.retryCount >= record.maxRetry"
              @click="$emit('retry', record.id)"
            >
              失败重试
            </a-button>
          </a-tooltip>
          <a-button size="small" type="primary" @click="$emit('go-biz', record)">跳转业务</a-button>
        </a-space>
      </div>

      <a-timeline class="mc-timeline">
        <a-timeline-item color="blue">创建：{{ record.createdAt }}</a-timeline-item>
        <a-timeline-item :color="record.sentAt ? 'blue' : 'gray'">
          发送：{{ record.sentAt || '未发送' }}
        </a-timeline-item>
        <a-timeline-item
          :color="record.status === 'read' ? 'green' : record.status === 'failed' ? 'red' : 'blue'"
        >
          状态：{{ statusLabel }}
          <span v-if="record.readAt">（{{ record.readAt }}）</span>
        </a-timeline-item>
      </a-timeline>

      <div class="mc-detail-body">
        <div class="mc-content">{{ record.content }}</div>
        <a-alert
          v-if="record.status === 'failed'"
          type="error"
          show-icon
          :message="`失败原因：${record.lastError || '未知错误'}`"
          :description="`重试次数 ${record.retryCount}/${record.maxRetry}`"
        />
      </div>
    </template>
    <a-empty v-else description="请选择一条消息查看详情" />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { MessageRecord } from '../../types/message-center'

const props = defineProps<{
  record?: MessageRecord
}>()

defineEmits<{
  (e: 'mark-read', id: string): void
  (e: 'retry', id: string): void
  (e: 'go-biz', record: MessageRecord): void
}>()

const statusLabel = computed(() => {
  const status = props.record?.status
  if (status === 'queued') return '排队中'
  if (status === 'sending') return '发送中'
  if (status === 'success') return '发送成功'
  if (status === 'failed') return '发送失败'
  if (status === 'read') return '已读'
  return '-'
})
</script>
