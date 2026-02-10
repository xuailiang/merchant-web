<template>
  <div class="decor-page">
    <div class="page-title">首页装修</div>
    <a-card class="toolbar-card">
      <div class="toolbar">
        <div class="toolbar-info">
          <div class="toolbar-title">店铺首页</div>
          <div class="toolbar-meta">当前版本：V3 · 上次保存 10:32 · 草稿</div>
        </div>
        <a-space>
          <a-tag :color="dirty ? 'orange' : 'green'">{{ dirty ? '未保存' : '已保存' }}</a-tag>
          <a-button @click="showPreview = true">预览</a-button>
          <a-button @click="saveDraft">保存草稿</a-button>
          <a-button type="primary" @click="publishPage">发布上线</a-button>
        </a-space>
      </div>
    </a-card>

    <div class="builder">
      <div class="component-panel">
        <div class="section-title">组件库</div>
        <div class="tool-grid">
          <div
            v-for="item in palette"
            :key="item.type"
            class="tool-item"
            draggable="true"
            @dragstart="onPaletteDrag(item)"
            @click="addBlock(item)"
          >
            <div class="tool-thumb" :class="item.thumbClass"></div>
            <div class="tool-title">{{ item.title }}</div>
            <div class="tool-desc">{{ item.desc }}</div>
          </div>
        </div>
      </div>

      <div class="canvas-panel">
        <a-card class="preview-card">
          <div class="preview-header">
            <span>店铺首页预览</span>
            <a-tag color="blue">拖拽排序</a-tag>
          </div>
          <div
            class="preview-canvas"
            ref="canvasRef"
            @dragover.prevent
            @drop="onCanvasDrop"
          >
            <div
              v-for="(block, index) in blocks"
              :key="block.id"
              class="preview-block"
              draggable="true"
              @dragstart="onDragStart(index)"
              @dragover.prevent="onDragOver(index)"
              @drop="onDrop(index)"
            >
              <div class="block-handle">
                <span>{{ block.title }}</span>
                <a-space size="small">
                  <a-tag>{{ block.type }}</a-tag>
                  <a-button
                    v-if="isAssetBlock(block.type)"
                    type="text"
                    size="small"
                    @click.stop="openAssetPicker(block.id)"
                  >
                    选择素材
                  </a-button>
                  <a-button type="text" size="small" @click.stop="removeBlock(index)">删除</a-button>
                </a-space>
              </div>
              <div class="block-body">
                <template v-if="block.type === '轮播'">
                  <div class="carousel-mock" :style="getBlockImageStyle(block)">
                    <div v-if="!block.imageUrl" class="carousel-item">Banner 预览</div>
                  </div>
                </template>
                <template v-else-if="block.type === '视频'">
                  <div class="video-mock">视频预览</div>
                </template>
                <template v-else-if="block.type === '图片'">
                  <div class="image-mock" :style="getBlockImageStyle(block)">图片楼层</div>
                </template>
                <template v-else-if="block.type.startsWith('商品列表')">
                  <div class="product-mock" :style="productGridStyle(block.type)">
                    <div v-for="n in 4" :key="n" class="product-item">商品 {{ n }}</div>
                  </div>
                </template>
                <template v-else-if="block.type === '公告'">
                  <div class="notice-mock">公告：满减活动火热进行中</div>
                </template>
                <template v-else-if="block.type === '搜索'">
                  <div class="search-mock">搜索栏预览</div>
                </template>
                <template v-else-if="block.type === '分类'">
                  <div class="category-mock">
                    <span v-for="n in 6" :key="n">分类 {{ n }}</span>
                  </div>
                </template>
                <template v-else-if="block.type === '富文本'">
                  <div class="text-mock">富文本图文说明区域</div>
                </template>
                <template v-else>
                  <div class="text-mock">{{ block.title }} 内容区</div>
                </template>
              </div>
            </div>
            <div v-if="!blocks.length" class="canvas-empty">
              拖拽左侧组件到此处开始装修
            </div>
          </div>
        </a-card>
      </div>

      <div class="config-panel">
        <a-card class="tool-card">
          <div class="section-title">楼层列表</div>
          <a-list :data-source="blocks" size="small">
            <template #renderItem="{ item, index }">
              <a-list-item>
                <a-list-item-meta :title="item.title" :description="item.type" />
                <a-space>
                  <a-button size="small" @click="moveUp(index)">上移</a-button>
                  <a-button size="small" @click="moveDown(index)">下移</a-button>
                </a-space>
              </a-list-item>
            </template>
          </a-list>
        </a-card>
      </div>
    </div>

    <a-modal v-model:open="showPreview" width="460px" :footer="null" title="预览" class="preview-modal" @after-open-change="onPreviewToggle">
      <div class="preview-toolbar">
        <a-button class="preview-btn" size="small" @click="toggleAutoScroll">
          {{ autoScroll ? '暂停滚动' : '开始滚动' }}
        </a-button>
        <a-button class="preview-btn" size="small" @click="triggerSnapshot">截图模拟</a-button>
      </div>
      <div class="phone-shell" :class="{ 'phone-flash': snapshotFlash }">
        <div class="phone-screen">
          <div class="shop-header">
            <div class="shop-status">
              <span>10:08</span>
              <div class="shop-signal">4G</div>
              <div class="shop-battery">91</div>
            </div>
            <div class="shop-info">
              <div class="shop-avatar"></div>
              <div class="shop-name">天猫旗舰店</div>
              <a-button type="primary" size="small" class="shop-follow">+ 关注</a-button>
            </div>
            <div class="shop-tabs">
              <span class="active">推荐</span>
              <span>宝贝</span>
              <span>分类</span>
              <span>作品</span>
            </div>
          </div>
          <div class="phone-canvas" ref="phoneCanvas">
            <div
              v-for="block in blocks"
              :key="block.id"
              class="phone-block"
              :class="{ active: previewSelectedId === block.id }"
              @click="previewSelectedId = block.id"
            >
              <div class="phone-block-title">{{ block.title }}</div>
              <div class="phone-block-body">
                <div v-if="block.type === '轮播'" class="phone-banner" :style="getBlockImageStyle(block)">750×200px</div>
                <div v-else-if="block.type === '图片'" class="phone-banner-sm" :style="getBlockImageStyle(block)">广告位</div>
                <div v-else-if="block.type.startsWith('商品列表')" class="phone-product-grid">
                  <div v-for="i in 4" :key="i" class="phone-product-item"></div>
                </div>
                <div v-else-if="block.type === '分类'" class="phone-category-grid">
                  <div v-for="i in 8" :key="i" class="phone-category-item"></div>
                </div>
                <div v-else class="phone-placeholder">内容预览</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </a-modal>
    <AssetPicker v-model:open="assetPickerOpen" type="image" :multiple="false" @select="onAssetSelect" />
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, reactive, ref, watch } from 'vue'
import AssetPicker from '../components/AssetPicker.vue'
import type { AssetItem } from '../mock/assets'
import { message } from 'ant-design-vue'
import { useDirtyGuard } from '../utils/useDirtyGuard'

const palette = [
  { type: '轮播', title: '轮播图', desc: '首页Banner轮播', thumbClass: 'thumb-carousel' },
  { type: '视频', title: '视频楼层', desc: '支持商品宣传视频', thumbClass: 'thumb-video' },
  { type: '图片', title: '图片楼层', desc: '自定义图片展示', thumbClass: 'thumb-banner' },
  { type: '公告', title: '公告条', desc: '站内通知与活动预告', thumbClass: 'thumb-notice' },
  { type: '搜索', title: '搜索栏', desc: '快捷搜索商品', thumbClass: 'thumb-search' },
  { type: '分类', title: '分类导航', desc: '类目快速入口', thumbClass: 'thumb-grid-8' },
  { type: '商品列表-2', title: '商品列表(一行2个)', desc: '适合大图推荐', thumbClass: 'thumb-product-2' },
  { type: '商品列表-3', title: '商品列表(一行3个)', desc: '经典三列布局', thumbClass: 'thumb-product-3' },
  { type: '商品列表-4', title: '商品列表(一行4个)', desc: '密集陈列', thumbClass: 'thumb-product-4' },
  { type: '活动入口', title: '活动入口', desc: '节日活动入口', thumbClass: 'thumb-entry' },
  { type: '品牌墙', title: '品牌墙', desc: '品牌Logo展示', thumbClass: 'thumb-brand' },
  { type: '富文本', title: '富文本区', desc: '图文详情说明', thumbClass: 'thumb-rich' },
]

const blocks = reactive([
  { id: 'b1', type: '轮播', title: '首页轮播', imageUrl: 'https://picsum.photos/seed/home1/1200/600' },
  { id: 'b2', type: '搜索', title: '搜索栏' },
  { id: 'b3', type: '商品列表-2', title: '精选推荐' },
  { id: 'b4', type: '商品列表-4', title: '热卖榜单' },
  { id: 'b5', type: '品牌墙', title: '合作品牌', imageUrl: 'https://picsum.photos/seed/home2/1200/600' },
])

const dirty = ref(false)
const snapshot = ref('')

const buildSnapshot = () =>
  JSON.stringify({
    blocks: JSON.parse(JSON.stringify(blocks)),
  })

const markSaved = () => {
  snapshot.value = buildSnapshot()
  dirty.value = false
}

onMounted(() => {
  markSaved()
})

watch(
  () => buildSnapshot(),
  (val) => {
    dirty.value = val !== snapshot.value
  }
)

useDirtyGuard(dirty, { message: '首页装修未保存，确认离开吗？' })

const dragIndex = ref<number | null>(null)
const draggingPalette = ref<{ type: string; title: string } | null>(null)
const showPreview = ref(false)
const previewSelectedId = ref<string | null>(blocks[0]?.id ?? null)
const phoneCanvas = ref<HTMLDivElement | null>(null)
const autoScroll = ref(false)
const snapshotFlash = ref(false)
const canvasRef = ref<HTMLDivElement | null>(null)
const assetPickerOpen = ref(false)
const assetPickerBlockId = ref<string | null>(null)
let scrollTimer: number | null = null

const isAssetBlock = (type: string) => ['轮播', '图片', '品牌墙', '活动入口'].includes(type)

const openAssetPicker = (blockId: string) => {
  assetPickerBlockId.value = blockId
  assetPickerOpen.value = true
}

const onAssetSelect = (assets: AssetItem[]) => {
  const asset = assets[0]
  if (!asset || !assetPickerBlockId.value) return
  const block = blocks.find((item) => item.id === assetPickerBlockId.value)
  if (block) (block as any).imageUrl = asset.url
}

const getBlockImageStyle = (block: any) => {
  if (!block.imageUrl) return {}
  return {
    backgroundImage: `url(${block.imageUrl})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }
}

const onDragStart = (index: number) => {
  dragIndex.value = index
}

const onDragOver = (index: number) => {
  if (dragIndex.value === null || dragIndex.value === index) return
}

const onPaletteDrag = (item: { type: string; title: string }) => {
  draggingPalette.value = item
}

const onCanvasDrop = (event?: DragEvent) => {
  if (!draggingPalette.value) return
  const insertIndex = getDropIndex(event)
  addBlock(draggingPalette.value, insertIndex)
  draggingPalette.value = null
}

const onDrop = (index: number) => {
  if (dragIndex.value === null) return
  const item = blocks.splice(dragIndex.value, 1)[0]
  blocks.splice(index, 0, item)
  dragIndex.value = null
}

const addBlock = (item: { type: string; title: string }, index?: number) => {
  const block = { id: `b-${Date.now()}`, type: item.type, title: item.title }
  if (index === undefined || index < 0 || index > blocks.length) {
    blocks.push(block)
  } else {
    blocks.splice(index, 0, block)
  }
}

const removeBlock = (index: number) => {
  blocks.splice(index, 1)
}

const saveDraft = () => {
  message.success('草稿已保存')
  markSaved()
}

const publishPage = () => {
  message.success('首页已发布')
  markSaved()
}

const moveUp = (index: number) => {
  if (index === 0) return
  const item = blocks.splice(index, 1)[0]
  blocks.splice(index - 1, 0, item)
}

const moveDown = (index: number) => {
  if (index === blocks.length - 1) return
  const item = blocks.splice(index, 1)[0]
  blocks.splice(index + 1, 0, item)
}

const productGridStyle = (type: string) => {
  const cols = type.includes('2') ? 2 : type.includes('3') ? 3 : 4
  return { gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }
}

const getDropIndex = (event?: DragEvent) => {
  if (!event || !canvasRef.value) return blocks.length
  const target = (event.target as HTMLElement | null)?.closest('.preview-block') as HTMLElement | null
  if (!target) return blocks.length
  const nodes = Array.from(canvasRef.value.querySelectorAll('.preview-block'))
  const index = nodes.indexOf(target)
  if (index === -1) return blocks.length
  const rect = target.getBoundingClientRect()
  const isAfter = event.clientY > rect.top + rect.height / 2
  return isAfter ? index + 1 : index
}

const onPreviewToggle = async (open: boolean) => {
  if (open) {
    previewSelectedId.value = blocks[0]?.id ?? null
    await nextTick()
    if (phoneCanvas.value) {
      phoneCanvas.value.scrollTop = 0
    }
  } else {
    stopAutoScroll()
  }
}

const startAutoScroll = () => {
  if (!phoneCanvas.value || scrollTimer) return
  scrollTimer = window.setInterval(() => {
    const el = phoneCanvas.value
    if (!el) return
    const maxScroll = el.scrollHeight - el.clientHeight
    if (el.scrollTop >= maxScroll) {
      el.scrollTop = 0
    } else {
      el.scrollTop += 2
    }
  }, 30)
}

const stopAutoScroll = () => {
  if (scrollTimer) {
    window.clearInterval(scrollTimer)
    scrollTimer = null
  }
  autoScroll.value = false
}

const toggleAutoScroll = () => {
  autoScroll.value = !autoScroll.value
  if (autoScroll.value) {
    startAutoScroll()
  } else {
    stopAutoScroll()
  }
}

const triggerSnapshot = () => {
  snapshotFlash.value = true
  window.setTimeout(() => {
    snapshotFlash.value = false
  }, 280)
}
</script>

<style scoped>
.decor-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.toolbar-card {
  border: 1px solid var(--border-color);
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.toolbar-title {
  font-weight: 600;
}

.toolbar-meta {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 4px;
}

.builder {
  display: grid;
  grid-template-columns: 320px 1fr 320px;
  gap: 16px;
}

.component-panel {
  position: sticky;
  top: 88px;
  align-self: flex-start;
  background: #fff;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  padding: 16px;
  max-height: calc(100vh - 140px);
  overflow: auto;
}

.config-panel {
  position: sticky;
  top: 88px;
  align-self: flex-start;
}

.canvas-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.preview-card {
  min-height: 640px;
  max-width: 420px;
  width: 100%;
  margin: 0 auto;
}

.tool-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.tool-item {
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 10px;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tool-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.08);
}

.tool-thumb {
  width: 100%;
  height: 64px;
  border-radius: 10px;
  background: #eef2f7;
  margin-bottom: 8px;
  position: relative;
  overflow: hidden;
}

.thumb-carousel {
  background: linear-gradient(135deg, #c7d2fe, #93c5fd);
}

.thumb-video {
  background: linear-gradient(135deg, #fca5a5, #f97316);
}

.thumb-banner {
  background: linear-gradient(135deg, #bae6fd, #38bdf8);
}

.thumb-notice {
  background: linear-gradient(135deg, #fde68a, #fbbf24);
}

.thumb-search {
  background: linear-gradient(135deg, #e2e8f0, #cbd5f5);
}

.thumb-grid-8 {
  background: linear-gradient(135deg, #d1fae5, #6ee7b7);
}

.thumb-product-2 {
  background: linear-gradient(135deg, #fecdd3, #fb7185);
}

.thumb-product-3 {
  background: linear-gradient(135deg, #ddd6fe, #a78bfa);
}

.thumb-product-4 {
  background: linear-gradient(135deg, #bbf7d0, #22c55e);
}

.thumb-entry {
  background: linear-gradient(135deg, #fde68a, #fb923c);
}

.thumb-brand {
  background: linear-gradient(135deg, #fbcfe8, #f472b6);
}

.thumb-rich {
  background: linear-gradient(135deg, #e0f2fe, #7dd3fc);
}

.tool-title {
  font-weight: 600;
}

.tool-desc {
  font-size: 12px;
  color: var(--text-secondary);
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-weight: 600;
}

.preview-canvas {
  background: #f8fafc;
  border-radius: 12px;
  padding: 16px;
  min-height: 600px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: calc(100vh - 260px);
  overflow: auto;
}

.preview-block {
  background: #fff;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 12px;
  cursor: grab;
}

.block-handle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  margin-bottom: 8px;
}

.block-body {
  color: var(--text-secondary);
}

.carousel-mock {
  display: flex;
  gap: 8px;
}

.carousel-item {
  flex: 1;
  height: 80px;
  border-radius: 8px;
  background: #dbeafe;
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-mock {
  height: 120px;
  border-radius: 8px;
  background: #fde68a;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-mock {
  height: 100px;
  border-radius: 8px;
  background: #bfdbfe;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-mock {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}

.product-item {
  height: 60px;
  border-radius: 6px;
  background: #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notice-mock {
  height: 48px;
  border-radius: 8px;
  background: #fef3c7;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-mock {
  height: 48px;
  border-radius: 8px;
  background: #e0f2fe;
  display: flex;
  align-items: center;
  justify-content: center;
}

.category-mock {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.category-mock span {
  height: 40px;
  border-radius: 6px;
  background: #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.text-mock {
  height: 80px;
  border-radius: 8px;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tool-card {
  margin-bottom: 0;
}

.section-title {
  font-weight: 600;
  margin-bottom: 12px;
}

.tool-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.tool-item {
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 10px;
  cursor: pointer;
  background: #fff;
  transition: all 0.2s ease;
}

.tool-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.08);
}

.tool-title {
  font-weight: 600;
}

.tool-desc {
  font-size: 12px;
  color: var(--text-secondary);
}

.canvas-empty {
  height: 120px;
  border: 1px dashed var(--border-color);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  background: #fff;
}

.preview-modal :deep(.ant-modal-body) {
  display: flex;
  flex-direction: column;
  gap: 12px;
  justify-content: center;
  background: #f1f5f9;
  padding: 16px 12px 20px;
}

.preview-toolbar {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.preview-btn {
  border-radius: 10px;
  padding: 0 16px;
  height: 32px;
  font-weight: 600;
  border-color: #cbd5f5;
  color: #1f2937;
  background: #fff;
  box-shadow: 0 8px 16px rgba(15, 23, 42, 0.08);
}

.preview-btn:hover {
  color: #1d4ed8;
  border-color: #93c5fd;
}

.phone-shell {
  width: 390px;
  height: 800px;
  background: #000;
  border-radius: 60px;
  padding: 14px;
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.3),
    inset 0 0 6px rgba(255, 255, 255, 0.1);
  position: relative;
}

.phone-shell.phone-flash::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 60px;
  background: rgba(255, 255, 255, 0.7);
  animation: flash 0.3s ease-in-out;
  pointer-events: none;
}

.phone-screen {
  width: 100%;
  height: 100%;
  background: #fff;
  border-radius: 48px;
  overflow: hidden;
  position: relative;
}

.shop-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: #fdecec;
  padding: 16px 16px 8px;
}

.shop-status {
  display: flex;
  justify-content: space-between;
  font-weight: 600;
  font-size: 12px;
  color: #111827;
}

.shop-signal,
.shop-battery {
  background: #111827;
  color: #fff;
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 10px;
}

.shop-info {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
}

.shop-avatar {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: #f97316;
}

.shop-name {
  font-weight: 700;
  font-size: 16px;
}

.shop-follow {
  margin-left: auto;
  background: linear-gradient(120deg, #fb923c, #f97316);
  border: none;
}

.shop-tabs {
  display: flex;
  gap: 16px;
  margin-top: 10px;
  font-weight: 600;
  color: #111827;
}

.shop-tabs .active {
  color: #f97316;
}

.phone-canvas {
  height: 100%;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  background: #f8fafc;
  padding: 12px 16px 16px;
  display: grid;
  gap: 12px;
}

.phone-block {
  background: #fff;
  border-radius: 14px;
  padding: 12px;
  border: 1px solid #e2e8f0;
}

.phone-block.active {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.phone-block-title {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 8px;
}

.phone-block-body {
  display: grid;
  gap: 8px;
}

.phone-banner {
  height: 140px;
  border-radius: 12px;
  background: #f0abfc;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3b0764;
  font-weight: 600;
}

.phone-banner-sm {
  height: 80px;
  border-radius: 10px;
  background: #fbcfe8;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #831843;
}

.phone-product-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.phone-product-item {
  height: 88px;
  border-radius: 10px;
  background: #fce7f3;
}

.phone-category-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
}

.phone-category-item {
  height: 44px;
  border-radius: 8px;
  background: #e2e8f0;
}

.phone-placeholder {
  height: 60px;
  border-radius: 10px;
  background: #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
}

@keyframes flash {
  0% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

@media (max-width: 992px) {
  .builder {
    grid-template-columns: 1fr;
  }

  .component-panel {
    position: static;
  }
}
</style>
