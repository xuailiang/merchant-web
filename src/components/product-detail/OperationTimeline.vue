<template>
  <a-card title="操作日志" class="pd-section-card pd-fade-in" id="section-logs">
    <div class="pd-log-filter">
      <a-segmented v-model:value="activeCategory" :options="categoryOptions" />
    </div>
    <div v-for="group in groupedLogs" :key="group.label" class="pd-log-group">
      <div class="pd-log-group-title">{{ group.label }}</div>
      <a-timeline>
        <a-timeline-item v-for="item in group.items" :key="item.id">
          <div class="pd-log-head">
            <span>{{ item.action }}</span>
            <a-tag color="blue">{{ item.category }}</a-tag>
          </div>
          <div class="pd-log-desc">{{ item.detail }}</div>
          <div class="pd-log-meta">{{ item.user }} · {{ item.time }}</div>
        </a-timeline-item>
      </a-timeline>
    </div>
  </a-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import dayjs from 'dayjs'
import type { ProductOperationLog } from '../../types/productDetail'

const props = defineProps<{
  logs: ProductOperationLog[]
}>()

const activeCategory = ref<'全部' | ProductOperationLog['category']>('全部')
const categoryOptions = ['全部', '价格', '库存', '素材', '上架']

const filteredLogs = computed(() => {
  return props.logs.filter(
    (item) => activeCategory.value === '全部' || item.category === activeCategory.value
  )
})

const groupedLogs = computed(() => {
  const today = dayjs().startOf('day')
  const yesterday = today.subtract(1, 'day')
  const groups: Array<{ label: string; items: ProductOperationLog[] }> = [
    { label: '今天', items: [] },
    { label: '昨天', items: [] },
    { label: '更早', items: [] },
  ]
  filteredLogs.value.forEach((item) => {
    const date = dayjs(item.time)
    if (date.isAfter(today)) {
      groups[0].items.push(item)
      return
    }
    if (date.isAfter(yesterday)) {
      groups[1].items.push(item)
      return
    }
    groups[2].items.push(item)
  })
  return groups.filter((group) => group.items.length > 0)
})
</script>
