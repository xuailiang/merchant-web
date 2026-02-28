<template>
  <a-card class="decor-v2-card">
    <div class="decor-v2-card-title">组件库</div>
    <a-input v-model:value="keyword" allow-clear placeholder="搜索组件名称/描述" />
    <a-collapse class="decor-v2-collapse" :default-active-key="defaultActiveKeys">
      <a-collapse-panel v-for="group in renderedGroups" :key="group.key" :header="group.label">
        <div class="decor-v2-tool-grid">
          <div
            v-for="item in group.items"
            :key="item.type"
            class="decor-v2-tool-item"
            draggable="true"
            @dragstart="onDragstart(item, $event)"
            @dragend="onDragend"
            @click="onCardClick(item)"
          >
            <div class="decor-v2-thumb" :class="item.thumbClass"></div>
            <div class="decor-v2-tool-head">
              <div class="decor-v2-tool-title">{{ item.title }}</div>
              <a-tag v-if="item.badge" size="small" color="blue">{{ item.badge }}</a-tag>
            </div>
            <div class="decor-v2-tool-desc">{{ item.desc }}</div>
          </div>
        </div>
      </a-collapse-panel>
    </a-collapse>
  </a-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { DecorComponentMeta } from '../../types/decor'

type GroupItem = {
  key: string
  label: string
  items: DecorComponentMeta[]
}

const props = defineProps<{
  groups: GroupItem[]
}>()

const emit = defineEmits<{
  (e: 'add', item: DecorComponentMeta): void
}>()

const keyword = ref('')
const dragging = ref(false)
const dragEndedAt = ref(0)

const defaultActiveKeys = computed(() => props.groups.slice(0, 3).map((item) => item.key))

const renderedGroups = computed(() => {
  const key = keyword.value.trim()
  if (!key) return props.groups
  return props.groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => item.title.includes(key) || item.desc.includes(key)),
    }))
    .filter((group) => group.items.length > 0)
})

const onDragstart = (item: DecorComponentMeta, event: DragEvent) => {
  if (!event.dataTransfer) return
  dragging.value = true
  event.dataTransfer.effectAllowed = 'copy'
  event.dataTransfer.setData('application/decor-component', JSON.stringify(item))
}

const onDragend = () => {
  dragging.value = false
  dragEndedAt.value = Date.now()
}

const onCardClick = (item: DecorComponentMeta) => {
  if (dragging.value) return
  if (Date.now() - dragEndedAt.value < 240) return
  emit('add', item)
}
</script>
