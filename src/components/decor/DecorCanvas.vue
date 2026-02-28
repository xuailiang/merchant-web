<template>
  <a-card class="decor-v2-card decor-v2-canvas-card">
    <div class="decor-v2-canvas-head">
      <div>画布编辑区</div>
      <a-tag color="blue">固定手机宽度 390px</a-tag>
    </div>
    <div class="decor-v2-canvas-stage">
      <div
        ref="canvasRef"
        class="decor-v2-canvas"
        @dragover.prevent="onCanvasDragOver"
        @drop.prevent="onCanvasDrop"
      >
        <template v-for="(block, index) in blocks" :key="block.id">
          <div
            class="decor-v2-block"
            :class="{
              selected: selectedId === block.id,
              hidden: !block.visible,
              'drop-before': dropIndex === index && draggingBlockIndex !== index,
              'drop-after':
                index === blocks.length - 1 &&
                dropIndex === blocks.length &&
                draggingBlockIndex !== index,
            }"
            :data-index="index"
            draggable="true"
            @click="emit('select', block.id)"
            @dragstart="onBlockDragStart(index, $event)"
            @dragover.prevent="onCanvasDragOver"
            @dragend="clearDropLine"
          >
            <div class="decor-v2-block-head">
              <div class="decor-v2-block-title">
                <span>{{ block.title }}</span>
                <a-tag>{{ block.type }}</a-tag>
                <a-tag v-if="block.locked" color="gold">固定</a-tag>
                <a-tag v-if="!block.visible" color="default">隐藏</a-tag>
              </div>
              <a-space size="small">
                <a-tooltip title="复制">
                  <a-button type="text" size="small" @click.stop="emit('duplicate', index)"
                    >复制</a-button
                  >
                </a-tooltip>
                <a-tooltip title="上移">
                  <a-button type="text" size="small" @click.stop="emit('move-up', index)"
                    >上移</a-button
                  >
                </a-tooltip>
                <a-tooltip title="下移">
                  <a-button type="text" size="small" @click.stop="emit('move-down', index)"
                    >下移</a-button
                  >
                </a-tooltip>
                <a-tooltip :title="block.visible ? '隐藏' : '显示'">
                  <a-button type="text" size="small" @click.stop="emit('toggle-visible', block.id)">
                    {{ block.visible ? '隐藏' : '显示' }}
                  </a-button>
                </a-tooltip>
                <a-tooltip title="删除">
                  <a-button type="text" danger size="small" @click.stop="emit('remove', index)"
                    >删除</a-button
                  >
                </a-tooltip>
              </a-space>
            </div>

            <div class="decor-v2-block-body" :style="blockPreviewStyle(block)">
              <template v-if="block.type.startsWith('product')">
                <div class="decor-v2-preview-grid" :style="productGridStyle(block.productColumns)">
                  <div
                    v-for="n in Math.min(block.productColumns * 2, 8)"
                    :key="n"
                    class="decor-v2-preview-product"
                  ></div>
                </div>
              </template>
              <template v-else-if="block.type.startsWith('coupon')">
                <div
                  class="decor-v2-preview-grid"
                  :style="productGridStyle(block.type === 'coupon-grid' ? 2 : 3)"
                >
                  <div
                    v-for="n in block.type === 'coupon-grid' ? 4 : 3"
                    :key="n"
                    class="decor-v2-preview-coupon"
                  ></div>
                </div>
              </template>
              <template v-else-if="block.type.startsWith('category')">
                <div
                  class="decor-v2-preview-grid"
                  :style="productGridStyle(block.type === 'category-grid-4' ? 4 : 4)"
                >
                  <div
                    v-for="n in block.type === 'category-grid-4' ? 4 : 8"
                    :key="n"
                    class="decor-v2-preview-category"
                  ></div>
                </div>
              </template>
              <template v-else-if="block.type === 'nav-tabs'">
                <div class="decor-v2-preview-tabs">
                  <span v-for="(item, idx) in block.navItems.slice(0, 4)" :key="`${item}-${idx}`">{{
                    item
                  }}</span>
                </div>
              </template>
              <template v-else-if="block.type === 'search'">
                <div class="decor-v2-preview-search">搜索商品</div>
              </template>
              <template v-else-if="block.type === 'notice'">
                <div class="decor-v2-preview-notice">公告：今日满减活动已上线</div>
              </template>
              <template v-else-if="block.type === 'richtext'">
                <div class="decor-v2-preview-rich">图文内容区</div>
              </template>
              <template v-else>
                <div class="decor-v2-preview-banner">
                  <span>{{ block.images[0]?.url ? '已配置素材' : '待配置素材' }}</span>
                </div>
              </template>
            </div>
          </div>
        </template>
        <div v-if="!blocks.length" class="decor-v2-empty">拖拽左侧组件到画布开始装修</div>
      </div>
    </div>
  </a-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { DecorBlockBase, DecorComponentMeta } from '../../types/decor'

const props = defineProps<{
  blocks: DecorBlockBase[]
  selectedId: string | null
}>()

const emit = defineEmits<{
  (e: 'select', id: string): void
  (e: 'insert', payload: { item: DecorComponentMeta; index: number }): void
  (e: 'reorder', payload: { from: number; to: number }): void
  (e: 'duplicate', index: number): void
  (e: 'remove', index: number): void
  (e: 'move-up', index: number): void
  (e: 'move-down', index: number): void
  (e: 'toggle-visible', id: string): void
}>()

const canvasRef = ref<HTMLElement | null>(null)
const dropIndex = ref(-1)
const draggingBlockIndex = ref<number | null>(null)

const productGridStyle = (cols: number) => ({
  gridTemplateColumns: `repeat(${Math.max(1, Math.min(4, cols))}, minmax(0, 1fr))`,
})

const blockPreviewStyle = (block: DecorBlockBase) => {
  if (!block.backgroundImage) return {}
  return {
    backgroundImage: `url(${block.backgroundImage})`,
    backgroundPosition: 'center',
    backgroundSize: 'cover',
  }
}

const getHoverInsertIndex = (event: DragEvent, draggingIndex?: number | null) => {
  if (!canvasRef.value) return props.blocks.length
  const all = Array.from(canvasRef.value.querySelectorAll<HTMLElement>('.decor-v2-block'))
  const items =
    draggingIndex === null || draggingIndex === undefined
      ? all
      : all.filter((item) => Number(item.dataset.index) !== draggingIndex)
  if (!items.length) return 0
  const y = event.clientY
  for (let i = 0; i < items.length; i += 1) {
    const rect = items[i].getBoundingClientRect()
    if (y < rect.top + rect.height / 2) {
      const index = Number(items[i].dataset.index)
      return Number.isNaN(index) ? props.blocks.length : index
    }
  }
  return props.blocks.length
}

const parseComponent = (event: DragEvent): DecorComponentMeta | null => {
  const raw = event.dataTransfer?.getData('application/decor-component')
  if (!raw) return null
  try {
    return JSON.parse(raw) as DecorComponentMeta
  } catch {
    return null
  }
}

const parseBlockIndex = (event: DragEvent): number | null => {
  const raw = event.dataTransfer?.getData('application/decor-block-index')
  if (!raw) return null
  const val = Number(raw)
  return Number.isNaN(val) ? null : val
}

const onCanvasDragOver = (event: DragEvent) => {
  dropIndex.value = getHoverInsertIndex(event, draggingBlockIndex.value)
}

const clearDropLine = () => {
  dropIndex.value = -1
  draggingBlockIndex.value = null
}

const onCanvasDrop = (event: DragEvent) => {
  const insertRaw = getHoverInsertIndex(event, draggingBlockIndex.value)
  const component = parseComponent(event)
  if (component) {
    emit('insert', { item: component, index: insertRaw })
    clearDropLine()
    return
  }
  const from = parseBlockIndex(event)
  if (from !== null) {
    const targetIndex = insertRaw > from ? insertRaw - 1 : insertRaw
    emit('reorder', { from, to: targetIndex })
  }
  clearDropLine()
}

const onBlockDragStart = (index: number, event: DragEvent) => {
  if (!event.dataTransfer) return
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('application/decor-block-index', String(index))
  draggingBlockIndex.value = index
  dropIndex.value = index
}
</script>
