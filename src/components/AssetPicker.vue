<template>
  <a-modal :open="open" title="素材库" width="900px" :footer="null" @update:open="emit('update:open', $event)">
    <div class="picker-toolbar">
      <a-input v-model:value="keyword" placeholder="搜索素材名称" allow-clear style="width: 220px" />
      <a-select
        v-model:value="folder"
        :options="folderOptions"
        allow-clear
        placeholder="全部分类"
        style="width: 160px"
        :get-popup-container="getPopupContainer"
      />
      <a-tabs v-model:activeKey="activeTab" size="small">
        <a-tab-pane key="all" tab="全部" />
        <a-tab-pane key="image" tab="图片" />
        <a-tab-pane key="video" tab="视频" />
      </a-tabs>
    </div>

    <div class="picker-grid">
      <div
        v-for="item in filteredAssets"
        :key="item.key"
        class="picker-card"
        :class="{ selected: selectedKeys.includes(item.key) }"
        @click="toggleSelect(item)"
      >
        <div class="picker-thumb">
          <img :src="item.cover" alt="asset" />
          <div v-if="item.type === 'video'" class="picker-play">▶</div>
        </div>
        <div class="picker-title">{{ item.name }}</div>
        <div class="picker-meta">{{ item.folder }} · {{ item.size }}MB</div>
      </div>
    </div>

    <div class="picker-footer">
      <div class="picker-tip">已选择 {{ selectedKeys.length }} 项</div>
      <a-space>
        <a-button @click="close">取消</a-button>
        <a-button type="primary" @click="confirm">确认选择</a-button>
      </a-space>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ASSETS, type AssetItem, getAssetFolders } from '../mock/assets'

const props = defineProps<{
  open: boolean
  type?: 'image' | 'video' | 'all'
  multiple?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'select', value: AssetItem[]): void
}>()

const keyword = ref('')
const folder = ref<string | undefined>()
const activeTab = ref('all')
const selectedKeys = ref<string[]>([])

watch(
  () => props.open,
  (val) => {
    if (val) {
      selectedKeys.value = []
      keyword.value = ''
      folder.value = undefined
      activeTab.value = props.type ?? 'all'
    }
  }
)

const assets = ASSETS

const folderOptions = getAssetFolders().map((item) => ({ label: item, value: item }))

const filteredAssets = computed(() => {
  return assets.filter((item) => {
    if (props.type && props.type !== 'all' && item.type !== props.type) return false
    if (activeTab.value !== 'all' && item.type !== activeTab.value) return false
    if (folder.value && item.folder !== folder.value) return false
    if (keyword.value && !item.name.includes(keyword.value)) return false
    return true
  })
})

const toggleSelect = (item: AssetItem) => {
  if (!props.multiple) {
    selectedKeys.value = [item.key]
    return
  }
  if (selectedKeys.value.includes(item.key)) {
    selectedKeys.value = selectedKeys.value.filter((key) => key !== item.key)
  } else {
    selectedKeys.value.push(item.key)
  }
}

const confirm = () => {
  const selected = assets.filter((item) => selectedKeys.value.includes(item.key))
  emit('select', selected)
  emit('update:open', false)
}

const close = () => emit('update:open', false)

const getPopupContainer = (trigger: HTMLElement) => trigger?.parentNode || document.body
</script>

<style scoped>
.picker-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.picker-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
  max-height: 420px;
  overflow-y: auto;
  padding-right: 4px;
}

.picker-card {
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #fff;
}

.picker-card:hover {
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.08);
}

.picker-card.selected {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.picker-thumb {
  position: relative;
  width: 100%;
  height: 120px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 6px;
}

.picker-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.picker-play {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 22px;
  background: rgba(15, 23, 42, 0.35);
}

.picker-title {
  font-weight: 600;
  margin-bottom: 2px;
  font-size: 13px;
}

.picker-meta {
  font-size: 12px;
  color: var(--text-secondary);
}

.picker-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
}

.picker-tip {
  font-size: 12px;
  color: var(--text-secondary);
}
</style>
