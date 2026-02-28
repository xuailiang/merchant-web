<template>
  <div class="decor-v2-page">
    <DecorBuilderLayout title="页面装修" :meta="pageMeta" :dirty="dirty">
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
        title: '分类四宫格',
        desc: '4宫格入口',
        group: 'category',
        thumbClass: 'thumb-grid-4',
        badge: '常用',
      },
      {
        type: 'category-grid-8',
        title: '分类八宫格',
        desc: '8宫格入口',
        group: 'category',
        thumbClass: 'thumb-grid-8',
      },
      {
        type: 'category-list',
        title: '分类分栏',
        desc: '左侧分类右侧内容',
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
        title: '轮播图',
        desc: 'Banner轮播',
        group: 'ad',
        thumbClass: 'thumb-carousel',
      },
      {
        type: 'banner-1',
        title: '广告图1',
        desc: '单张主广告',
        group: 'ad',
        thumbClass: 'thumb-banner',
      },
      {
        type: 'banner-2',
        title: '广告图2',
        desc: '两图拼接',
        group: 'ad',
        thumbClass: 'thumb-dual',
      },
      {
        type: 'banner-3',
        title: '广告图3',
        desc: '三图拼接',
        group: 'ad',
        thumbClass: 'thumb-triple',
      },
      {
        type: 'event-entry',
        title: '活动入口',
        desc: '专题活动导流',
        group: 'activity',
        thumbClass: 'thumb-entry',
        badge: '新增',
      },
    ],
  },
  {
    key: 'product',
    label: '商品楼层',
    items: [
      {
        type: 'product-1x2',
        title: '一行两个',
        desc: '双列商品',
        group: 'product',
        thumbClass: 'thumb-product-2',
      },
      {
        type: 'product-1x4',
        title: '一行四个',
        desc: '四列陈列',
        group: 'product',
        thumbClass: 'thumb-product-4',
        badge: '常用',
      },
      {
        type: 'product-tab',
        title: '标签切换商品',
        desc: '按tab展示商品',
        group: 'product',
        thumbClass: 'thumb-tabs',
      },
      {
        type: 'product-rank',
        title: '热销榜',
        desc: '排行展示',
        group: 'product',
        thumbClass: 'thumb-rank',
      },
    ],
  },
  {
    key: 'activity',
    label: '活动楼层',
    items: [
      {
        type: 'video-floor',
        title: '活动视频',
        desc: '短视频活动位',
        group: 'activity',
        thumbClass: 'thumb-video',
      },
      {
        type: 'event-entry',
        title: '品牌活动入口',
        desc: '品牌活动集散',
        group: 'activity',
        thumbClass: 'thumb-entry',
      },
    ],
  },
  {
    key: 'coupon',
    label: '优惠券楼层',
    items: [
      {
        type: 'coupon-row',
        title: '优惠券横排',
        desc: '横向券组件',
        group: 'coupon',
        thumbClass: 'thumb-coupon-row',
        badge: '常用',
      },
      {
        type: 'coupon-grid',
        title: '优惠券宫格',
        desc: '宫格券组件',
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
        desc: '顶部导航',
        group: 'nav',
        thumbClass: 'thumb-nav',
      },
      {
        type: 'nav-float',
        title: '悬浮导航',
        desc: '右侧浮标',
        group: 'nav',
        thumbClass: 'thumb-float',
        badge: '高级',
      },
      {
        type: 'brand-wall',
        title: '品牌墙',
        desc: '品牌露出模块',
        group: 'ad',
        thumbClass: 'thumb-banner',
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
        desc: '搜索入口',
        group: 'basic',
        thumbClass: 'thumb-search',
      },
      {
        type: 'notice',
        title: '公告条',
        desc: '消息通知',
        group: 'basic',
        thumbClass: 'thumb-notice',
      },
      {
        type: 'richtext',
        title: '富文本',
        desc: '图文内容区',
        group: 'basic',
        thumbClass: 'thumb-rich',
      },
    ],
  },
] as const satisfies Array<{ key: string; label: string; items: DecorComponentMeta[] }>

const blockHero = createDecorBlock({
  type: 'banner-1',
  title: '活动主视觉',
  desc: '活动主图',
  group: 'ad',
  thumbClass: 'thumb-banner',
})
blockHero.images[0].url = 'https://picsum.photos/seed/pagev2-hero/1200/460'

const blockCoupon = createDecorBlock({
  type: 'coupon-row',
  title: '限时领券',
  desc: '券层',
  group: 'coupon',
  thumbClass: 'thumb-coupon-row',
})

const blockGoods = createDecorBlock({
  type: 'product-1x4',
  title: '活动商品',
  desc: '商品层',
  group: 'product',
  thumbClass: 'thumb-product-4',
})

const blockNav = createDecorBlock({
  type: 'nav-tabs',
  title: '快速导航',
  desc: '导航层',
  group: 'nav',
  thumbClass: 'thumb-nav',
})
blockNav.navItems = ['推荐', '爆款', '新品', '低价']

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
  mode: 'page',
  storageKey: 'decor:page:v2',
  initialBlocks: [blockHero, blockCoupon, blockGoods, blockNav],
  initialPageConfig: {
    name: '活动页',
    version: 'V4',
    backgroundColor: '#f8fafc',
    backgroundImage: '',
    navBgColor: '#0f172a',
    navTextColor: '#ffffff',
    navBgImage: '',
    locBgColor: '#111827',
    locTextColor: '#ffffff',
    floatingEnabled: false,
    floatingImage: '',
  },
})

const pageMeta = computed(() => `${pageConfig.value.version} · ${pageConfig.value.name}草稿`)

const toggleVisible = (id: string) => {
  const block = blocks.value.find((item) => item.id === id)
  if (!block || block.locked) return
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
