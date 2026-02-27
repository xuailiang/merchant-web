<template>
  <a-card id="section-logs" title="操作轨迹" class="od-section-card od-fade-in">
    <div class="od-log-filter">
      <a-segmented v-model:value="activeCategory" :options="categoryOptions" />
    </div>
    <div v-for="group in groupedLogs" :key="group.label" class="od-log-group">
      <div class="od-log-group-title">{{ group.label }}</div>
      <a-timeline>
        <a-timeline-item v-for="item in group.items" :key="item.id">
          <div class="od-log-action">
            <span>{{ item.action }}</span>
            <a-tag color="blue">{{ item.category }}</a-tag>
          </div>
          <div class="od-log-time">{{ item.time }}</div>
        </a-timeline-item>
      </a-timeline>
    </div>
  </a-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import dayjs from 'dayjs'
import type { OrderOperationLog } from '../../types/orderDetail'

const props = defineProps<{
  logs: OrderOperationLog[]
}>()

const activeCategory = ref<'全部' | OrderOperationLog['category']>('全部')
const categoryOptions = ['全部', '支付', '发货', '售后', '系统']

const filteredLogs = computed(() =>
  props.logs.filter(
    (item) => activeCategory.value === '全部' || item.category === activeCategory.value
  )
)

const groupedLogs = computed(() => {
  const today = dayjs().startOf('day')
  const yesterday = today.subtract(1, 'day')
  const result: Array<{ label: string; items: OrderOperationLog[] }> = [
    { label: '今天', items: [] },
    { label: '昨天', items: [] },
    { label: '更早', items: [] },
  ]
  filteredLogs.value.forEach((item) => {
    const date = dayjs(item.time)
    if (date.isAfter(today)) {
      result[0].items.push(item)
      return
    }
    if (date.isAfter(yesterday)) {
      result[1].items.push(item)
      return
    }
    result[2].items.push(item)
  })
  return result.filter((group) => group.items.length > 0)
})
</script>
