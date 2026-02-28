import { computed, onMounted, ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import { useDirtyGuard } from '../utils/useDirtyGuard'
import type {
  DecorBlockBase,
  DecorBuilderMode,
  DecorBuilderState,
  DecorComponentMeta,
  DecorImageItem,
  DecorPageConfig,
  DecorValidationIssue,
} from '../types/decor'

type UseDecorBuilderOptions = {
  mode: DecorBuilderMode
  storageKey: string
  initialBlocks: DecorBlockBase[]
  initialPageConfig: DecorPageConfig
}

const makeId = (prefix = 'blk') =>
  `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`

const clone = <T>(val: T): T => JSON.parse(JSON.stringify(val)) as T

const makeImage = (keyPrefix = 'img'): DecorImageItem => ({
  key: makeId(keyPrefix),
  url: '',
  link: '',
  trackCode: '',
})

export const createDecorBlock = (meta: DecorComponentMeta): DecorBlockBase => {
  const isProduct = meta.type.startsWith('product')
  const isCoupon = meta.type.startsWith('coupon')
  const isNav = meta.type.startsWith('nav')
  const imageCount = meta.type === 'banner-2' ? 2 : meta.type === 'banner-3' ? 3 : 1

  return {
    id: makeId(),
    type: meta.type,
    title: meta.title,
    group: meta.group,
    required: meta.type === 'store-header',
    locked: meta.type === 'store-header',
    visible: true,
    anchorName: '',
    jumpLink: '',
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#ffffff',
    backgroundImage: '',
    imageRadius: 12,
    imageAspectRatio:
      meta.type === 'carousel' ? '3:1' : meta.type.startsWith('product') ? '1:1' : '4:3',
    imageFit: 'cover',
    images: Array.from({ length: imageCount }, (_, idx) => makeImage(`img-${idx + 1}`)),
    dataSource: 'manual',
    sortBy: 'sales',
    productCount: isProduct ? (meta.type === 'product-1x4' ? 8 : 4) : 0,
    productColumns: meta.type === 'product-1x4' ? 4 : meta.type === 'product-1x2' ? 2 : 2,
    showOriginalPrice: true,
    showMemberPrice: false,
    showTagNew: true,
    showTagHot: true,
    showTagLimit: true,
    couponPool: isCoupon ? '默认券池' : '',
    couponCount: isCoupon ? 3 : 0,
    couponButtonText: isCoupon ? '立即领取' : '',
    navItems: isNav ? ['推荐', '新品', '热卖', '活动'] : [],
    navActiveColor: '#1677ff',
    navInactiveColor: '#64748b',
    floatingEnabled: meta.type === 'nav-float',
    floatingOffsetX: 12,
    floatingOffsetY: 140,
  }
}

export const useDecorBuilder = (options: UseDecorBuilderOptions) => {
  const blocks = ref<DecorBlockBase[]>(clone(options.initialBlocks))
  const pageConfig = ref<DecorPageConfig>(clone(options.initialPageConfig))
  const selectedId = ref<string | null>(blocks.value[0]?.id ?? null)
  const dirty = ref(false)
  const snapshot = ref('')

  const currentBlock = computed(
    () => blocks.value.find((item) => item.id === selectedId.value) ?? null
  )

  const buildSnapshot = () =>
    JSON.stringify({
      blocks: blocks.value,
      pageConfig: pageConfig.value,
    } satisfies DecorBuilderState)

  const markSaved = () => {
    snapshot.value = buildSnapshot()
    dirty.value = false
  }

  const loadDraft = () => {
    const raw = localStorage.getItem(options.storageKey)
    if (!raw) {
      markSaved()
      return
    }
    try {
      const parsed = JSON.parse(raw) as Partial<DecorBuilderState>
      if (Array.isArray(parsed.blocks)) blocks.value = parsed.blocks as DecorBlockBase[]
      if (parsed.pageConfig) pageConfig.value = parsed.pageConfig as DecorPageConfig
      selectedId.value = blocks.value[0]?.id ?? null
      markSaved()
    } catch {
      markSaved()
    }
  }

  onMounted(() => {
    loadDraft()
  })

  watch(
    () => buildSnapshot(),
    (val) => {
      dirty.value = val !== snapshot.value
    }
  )

  useDirtyGuard(dirty, { message: '装修内容未保存，确认离开当前页面吗？' })

  const addBlock = (meta: DecorComponentMeta, index?: number) => {
    const block = createDecorBlock(meta)
    if (typeof index !== 'number' || index < 0 || index > blocks.value.length) {
      blocks.value.push(block)
    } else {
      blocks.value.splice(index, 0, block)
    }
    selectedId.value = block.id
  }

  const removeBlock = (index: number) => {
    const block = blocks.value[index]
    if (!block) return
    if (block.required || block.locked) {
      message.warning('该楼层是固定模块，不可删除')
      return
    }
    blocks.value.splice(index, 1)
    if (selectedId.value === block.id) {
      selectedId.value = blocks.value[Math.max(0, index - 1)]?.id ?? blocks.value[0]?.id ?? null
    }
  }

  const duplicateBlock = (index: number) => {
    const source = blocks.value[index]
    if (!source) return
    const copied = clone(source)
    copied.id = makeId()
    copied.title = `${source.title}（副本）`
    copied.required = false
    copied.locked = false
    copied.images = source.images.map((img) => ({ ...img, key: makeId('img') }))
    blocks.value.splice(index + 1, 0, copied)
    selectedId.value = copied.id
  }

  const moveBlock = (from: number, to: number) => {
    if (from === to) return
    const maxIndex = blocks.value.length - 1
    if (from < 0 || from > maxIndex || to < 0 || to > maxIndex) return
    const current = blocks.value[from]
    if (current?.locked && to !== from) return
    const [item] = blocks.value.splice(from, 1)
    blocks.value.splice(to, 0, item)
  }

  const moveUp = (index: number) => {
    if (index <= 0) return
    moveBlock(index, index - 1)
  }

  const moveDown = (index: number) => {
    if (index >= blocks.value.length - 1) return
    moveBlock(index, index + 1)
  }

  const reorderForDrop = (from: number, to: number) => {
    const max = blocks.value.length
    if (from < 0 || from >= max) return
    if (from === to) return
    const moving = blocks.value[from]
    if (!moving || moving.locked) return

    const firstUnlockedIndex = blocks.value.findIndex((item) => !item.locked)
    const minTarget = firstUnlockedIndex === -1 ? 0 : firstUnlockedIndex

    const clampedSource = Math.max(minTarget, Math.min(from, max - 1))
    if (clampedSource !== from) return

    const [item] = blocks.value.splice(from, 1)
    const clampedTo = Math.max(minTarget, Math.min(to, blocks.value.length))
    blocks.value.splice(clampedTo, 0, item)
  }

  const validateBeforePublish = (): DecorValidationIssue[] => {
    const issues: DecorValidationIssue[] = []
    const visibleBlocks = blocks.value.filter((item) => item.visible)

    if (!visibleBlocks.length) {
      issues.push({ level: 'error', code: 'NO_VISIBLE_BLOCKS', message: '至少保留一个可见楼层' })
    }

    visibleBlocks.forEach((block) => {
      const needImage =
        block.type === 'carousel' ||
        block.type.startsWith('banner') ||
        block.type === 'event-entry' ||
        block.type === 'brand-wall'
      if (needImage && !block.images.some((item) => item.url)) {
        issues.push({
          level: 'error',
          code: 'BLOCK_IMAGE_REQUIRED',
          message: `楼层「${block.title}」缺少必填图片`,
          blockId: block.id,
        })
      }
      if (block.jumpLink && !/^https?:\/\/|^\//.test(block.jumpLink)) {
        issues.push({
          level: 'warning',
          code: 'LINK_FORMAT_WARN',
          message: `楼层「${block.title}」链接建议使用 http(s) 或站内路径`,
          blockId: block.id,
        })
      }
    })

    if (options.mode === 'home') {
      const hasHero = visibleBlocks.some(
        (item) => item.type === 'carousel' || item.type === 'banner-1'
      )
      if (!hasHero) {
        issues.push({
          level: 'error',
          code: 'HOME_HERO_REQUIRED',
          message: '首页必须包含轮播或主视觉广告楼层',
        })
      }
    }

    if (options.mode === 'page') {
      const hasClickable = visibleBlocks.some(
        (item) =>
          item.type.startsWith('product') ||
          item.type.startsWith('coupon') ||
          item.type === 'event-entry'
      )
      if (!hasClickable) {
        issues.push({
          level: 'error',
          code: 'PAGE_CLICKABLE_REQUIRED',
          message: '页面装修至少需要一个活动/商品/优惠券楼层',
        })
      }
      if (pageConfig.value.floatingEnabled && !pageConfig.value.floatingImage) {
        issues.push({
          level: 'error',
          code: 'FLOAT_IMAGE_REQUIRED',
          message: '开启悬浮导航时必须配置悬浮图标素材',
        })
      }
    }

    return issues
  }

  const saveDraft = () => {
    localStorage.setItem(
      options.storageKey,
      JSON.stringify({
        blocks: blocks.value,
        pageConfig: pageConfig.value,
      } satisfies DecorBuilderState)
    )
    markSaved()
    message.success('草稿已保存')
  }

  const publish = () => {
    const issues = validateBeforePublish()
    const errors = issues.filter((item) => item.level === 'error')
    if (errors.length) {
      message.error(errors[0].message)
      return { ok: false, issues }
    }
    localStorage.setItem(
      `${options.storageKey}:published`,
      JSON.stringify({
        blocks: blocks.value,
        pageConfig: pageConfig.value,
        publishedAt: new Date().toISOString(),
      })
    )
    markSaved()
    message.success('页面已发布')
    return { ok: true, issues }
  }

  return {
    blocks,
    pageConfig,
    selectedId,
    currentBlock,
    dirty,
    setSelectedId: (id: string | null) => (selectedId.value = id),
    addBlock,
    removeBlock,
    duplicateBlock,
    moveBlock,
    moveUp,
    moveDown,
    reorderForDrop,
    saveDraft,
    publish,
    validateBeforePublish,
  }
}
