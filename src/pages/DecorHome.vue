<template>
  <div class="decor-v2-page">
    <DecorBuilderLayout title="首页装修" :meta="pageMeta" :dirty="dirty">
      <template #head-actions>
        <a-button @click="previewOpen = !previewOpen">
          {{ previewOpen ? '关闭实时预览' : '实时预览' }}
        </a-button>
        <a-button @click="saveDraft">保存草稿</a-button>
        <a-button type="primary" @click="publishPage">发布上线</a-button>
      </template>

      <template #library>
        <DecorComponentLibrary :groups="libraryGroups" @add="(item) => addBlock(item)" />
      </template>

      <template #canvas>
        <DecorCanvas
          :blocks="blocks"
          :selected-id="selectedId"
          @select="setSelectedId"
          @insert="({ item, index }) => addBlock(item, index)"
          @reorder="({ from, to }) => reorderForDrop(from, to)"
          @duplicate="duplicateBlock"
          @remove="removeBlock"
          @move-up="moveUp"
          @move-down="moveDown"
          @toggle-visible="toggleVisible"
        />
      </template>

      <template #config>
        <DecorConfigPanel
          :selected-block="currentBlock"
          :page-config="pageConfig"
          :blocks="blocks"
          @open-asset="openAssetPicker"
          @move-up="moveUp"
          @move-down="moveDown"
          @toggle-visible="toggleVisible"
        />
      </template>
    </DecorBuilderLayout>

    <DecorPhonePreview
      v-model:open="previewOpen"
      mode="drawer"
      :blocks="blocks"
      :selected-id="selectedId"
      :page-config="pageConfig"
      :show-store-header="true"
      @select="setSelectedId"
    />

    <AssetPicker
      v-model:open="assetPickerOpen"
      type="image"
      :multiple="false"
      @select="onAssetSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import AssetPicker from '../components/AssetPicker.vue'
import DecorBuilderLayout from '../components/decor/DecorBuilderLayout.vue'
import DecorComponentLibrary from '../components/decor/DecorComponentLibrary.vue'
import DecorCanvas from '../components/decor/DecorCanvas.vue'
import DecorConfigPanel from '../components/decor/DecorConfigPanel.vue'
import DecorPhonePreview from '../components/decor/DecorPhonePreview.vue'
import { createDecorBlock, useDecorBuilder } from '../composables/useDecorBuilder'
import type { AssetItem } from '../mock/assets'
import type { DecorComponentMeta, DecorConfigAssetTarget } from '../types/decor'
import '../styles/decor-builder-v2.css'

const libraryGroups = [
  {
    key: 'category',
    label: '分类楼层',
    items: [
      {
        type: 'category-grid-4',
        title: '四宫格分类',
        desc: '4类目快捷入口',
        group: 'category',
        thumbClass: 'thumb-grid-4',
        badge: '常用',
      },
      {
        type: 'category-grid-8',
        title: '八宫格分类',
        desc: '8类目快捷入口',
        group: 'category',
        thumbClass: 'thumb-grid-8',
      },
      {
        type: 'category-list',
        title: '分栏分类',
        desc: '左类目右内容',
        group: 'category',
        thumbClass: 'thumb-split',
      },
    ],
  },
  {
    key: 'ad',
    label: '广告楼层',
    items: [
      {
        type: 'carousel',
        title: '顶部轮播',
        desc: '首屏品牌主视觉',
        group: 'ad',
        thumbClass: 'thumb-carousel',
        badge: '常用',
      },
      {
        type: 'banner-1',
        title: '单图广告',
        desc: '一张主图广告',
        group: 'ad',
        thumbClass: 'thumb-banner',
      },
      {
        type: 'banner-2',
        title: '双图拼接',
        desc: '双图活动位',
        group: 'ad',
        thumbClass: 'thumb-dual',
      },
      {
        type: 'banner-3',
        title: '三图拼接',
        desc: '三图导购位',
        group: 'ad',
        thumbClass: 'thumb-triple',
      },
      {
        type: 'event-entry',
        title: '活动入口',
        desc: '节日活动入口',
        group: 'activity',
        thumbClass: 'thumb-entry',
      },
      {
        type: 'brand-wall',
        title: '品牌墙',
        desc: '品牌 logo 区',
        group: 'ad',
        thumbClass: 'thumb-banner',
      },
    ],
  },
  {
    key: 'product',
    label: '商品楼层',
    items: [
      {
        type: 'product-1x2',
        title: '商品两列',
        desc: '主推商品卡片',
        group: 'product',
        thumbClass: 'thumb-product-2',
        badge: '常用',
      },
      {
        type: 'product-1x4',
        title: '商品四列',
        desc: '高密度陈列',
        group: 'product',
        thumbClass: 'thumb-product-4',
      },
      {
        type: 'product-tab',
        title: '标签切换',
        desc: '按主题切换商品',
        group: 'product',
        thumbClass: 'thumb-tabs',
      },
      {
        type: 'product-rank',
        title: '热销榜单',
        desc: '按销量排行',
        group: 'product',
        thumbClass: 'thumb-rank',
      },
    ],
  },
  {
    key: 'coupon',
    label: '优惠券楼层',
    items: [
      {
        type: 'coupon-row',
        title: '横排优惠券',
        desc: '3张横排券',
        group: 'coupon',
        thumbClass: 'thumb-coupon-row',
      },
      {
        type: 'coupon-grid',
        title: '宫格优惠券',
        desc: '4张券宫格',
        group: 'coupon',
        thumbClass: 'thumb-coupon-grid',
      },
    ],
  },
  {
    key: 'nav',
    label: '导航楼层',
    items: [
      {
        type: 'nav-tabs',
        title: '标签导航',
        desc: '顶部分栏导航',
        group: 'nav',
        thumbClass: 'thumb-nav',
      },
      {
        type: 'nav-float',
        title: '悬浮导航',
        desc: '右侧浮标导航',
        group: 'nav',
        thumbClass: 'thumb-float',
        badge: '高级',
      },
    ],
  },
  {
    key: 'basic',
    label: '基础组件',
    items: [
      {
        type: 'search',
        title: '搜索栏',
        desc: '商品关键词检索',
        group: 'basic',
        thumbClass: 'thumb-search',
      },
      {
        type: 'notice',
        title: '公告条',
        desc: '通知与活动提醒',
        group: 'basic',
        thumbClass: 'thumb-notice',
      },
      {
        type: 'richtext',
        title: '富文本区',
        desc: '图文说明内容',
        group: 'basic',
        thumbClass: 'thumb-rich',
      },
      {
        type: 'video-floor',
        title: '视频楼层',
        desc: '短视频宣传位',
        group: 'basic',
        thumbClass: 'thumb-video',
        badge: '新增',
      },
    ],
  },
] as const satisfies Array<{ key: string; label: string; items: DecorComponentMeta[] }>

const storeHeader = createDecorBlock({
  type: 'store-header',
  title: '店铺头部',
  desc: '固定店铺抬头',
  group: 'home-only',
  thumbClass: 'thumb-header',
  badge: '常用',
})
storeHeader.locked = true
storeHeader.required = true
storeHeader.visible = true

const hero = createDecorBlock({
  type: 'carousel',
  title: '首页轮播',
  desc: '首页主视觉',
  group: 'ad',
  thumbClass: 'thumb-carousel',
})
hero.images[0].url = 'https://picsum.photos/seed/homev2-hero/1200/500'

const search = createDecorBlock({
  type: 'search',
  title: '搜索入口',
  desc: '搜索入口',
  group: 'basic',
  thumbClass: 'thumb-search',
})

const category = createDecorBlock({
  type: 'category-grid-8',
  title: '热门分类',
  desc: '分类入口',
  group: 'category',
  thumbClass: 'thumb-grid-8',
})

const products = createDecorBlock({
  type: 'product-1x2',
  title: '今日主推',
  desc: '商品推荐',
  group: 'product',
  thumbClass: 'thumb-product-2',
})

const pageDefault = {
  name: '店铺首页',
  version: 'V5',
  backgroundColor: '#f8fafc',
  backgroundImage: '',
  navBgColor: '#ffffff',
  navTextColor: '#0f172a',
  navBgImage: '',
  locBgColor: '#111827',
  locTextColor: '#ffffff',
  floatingEnabled: true,
  floatingImage: '',
}

const {
  blocks,
  pageConfig,
  selectedId,
  currentBlock,
  dirty,
  setSelectedId,
  addBlock,
  removeBlock,
  duplicateBlock,
  moveUp,
  moveDown,
  reorderForDrop,
  saveDraft,
  publish,
} = useDecorBuilder({
  mode: 'home',
  storageKey: 'decor:home:v2',
  initialBlocks: [storeHeader, hero, search, category, products],
  initialPageConfig: pageDefault,
})

const pageMeta = computed(() => `${pageConfig.value.version} · 首页装修草稿`)

const toggleVisible = (id: string) => {
  const block = blocks.value.find((item) => item.id === id)
  if (!block) return
  if (block.locked) return
  block.visible = !block.visible
}

const previewOpen = ref(false)
const assetPickerOpen = ref(false)
const assetTarget = ref<DecorConfigAssetTarget | null>(null)

const openAssetPicker = (target: DecorConfigAssetTarget) => {
  assetTarget.value = target
  assetPickerOpen.value = true
}

const onAssetSelect = (assets: AssetItem[]) => {
  const asset = assets[0]
  const target = assetTarget.value
  if (!asset || !target) return

  switch (target.kind) {
    case 'page-bg':
      pageConfig.value.backgroundImage = asset.url
      break
    case 'page-nav-bg':
      pageConfig.value.navBgImage = asset.url
      break
    case 'page-float':
      pageConfig.value.floatingImage = asset.url
      break
    case 'block-bg': {
      const block = blocks.value.find((item) => item.id === target.blockId)
      if (block) block.backgroundImage = asset.url
      break
    }
    case 'block-image': {
      const block = blocks.value.find((item) => item.id === target.blockId)
      const image = block?.images.find((item) => item.key === target.imageKey)
      if (image) image.url = asset.url
      break
    }
    default:
      break
  }
}

const publishPage = () => {
  publish()
}
</script>
