<template>
  <a-modal
    v-if="previewMode === 'modal'"
    :open="open"
    width="460px"
    :footer="null"
    title="页面预览"
    class="decor-v2-preview-modal"
    @update:open="emit('update:open', $event)"
    @after-open-change="handleOpenChange"
  >
    <div class="decor-v2-preview-body">
      <div class="decor-v2-preview-toolbar">
        <a-button size="small" class="decor-v2-preview-btn" @click="toggleAutoScroll">
          {{ autoScroll ? '暂停滚动' : '开始滚动' }}
        </a-button>
        <a-button size="small" class="decor-v2-preview-btn" @click="triggerSnapshot"
          >截图模拟</a-button
        >
      </div>
      <div class="decor-v2-phone" :class="{ flash: snapshotFlash }">
        <div class="decor-v2-phone-screen">
          <div v-if="showStoreHeader" class="decor-v2-store-head">
            <div class="status-row">
              <span>10:08</span>
              <div class="status-group"><span>4G</span><span>91%</span></div>
            </div>
            <div class="merchant-row">
              <div class="avatar"></div>
              <div class="merchant-meta">
                <div class="name">天猫旗舰店</div>
                <div class="fans">33.0万粉丝</div>
              </div>
              <a-button size="small" type="primary" class="follow">+ 关注</a-button>
            </div>
            <div class="tabs">
              <span class="active">推荐</span><span>宝贝</span><span>分类</span><span>作品</span>
            </div>
          </div>
          <div ref="phoneCanvasRef" class="decor-v2-phone-canvas" :style="pageStyle">
            <div
              v-for="block in blocks"
              :key="block.id"
              class="decor-v2-phone-block"
              :class="{ active: selectedId === block.id }"
              :style="phoneBlockStyle(block)"
              @click="emit('select', block.id)"
            >
              <div class="title">{{ block.title }}</div>
              <template v-if="block.type.startsWith('product')">
                <div class="grid" :style="gridStyle(block.productColumns)">
                  <div v-for="n in Math.min(block.productCount, 8)" :key="n" class="product"></div>
                </div>
              </template>
              <template v-else-if="block.type.startsWith('coupon')">
                <div class="grid" :style="gridStyle(block.type === 'coupon-grid' ? 2 : 3)">
                  <div
                    v-for="n in block.type === 'coupon-grid' ? 4 : 3"
                    :key="n"
                    class="coupon"
                  ></div>
                </div>
              </template>
              <template v-else-if="block.type.startsWith('category')">
                <div class="grid" :style="gridStyle(4)">
                  <div
                    v-for="n in block.type === 'category-grid-4' ? 4 : 8"
                    :key="n"
                    class="category"
                  ></div>
                </div>
              </template>
              <template v-else-if="block.type === 'search'">
                <div class="search">搜索商品名称/编码</div>
              </template>
              <template v-else-if="block.type === 'notice'">
                <div class="notice">公告：本周运费满99包邮</div>
              </template>
              <template v-else-if="block.type === 'richtext'">
                <div class="richtext">图文详情内容区域</div>
              </template>
              <template v-else-if="block.type === 'nav-tabs'">
                <div class="tabs-nav">
                  <span
                    v-for="(item, idx) in block.navItems.slice(0, 4)"
                    :key="`${item}-${idx}`"
                    :style="{ color: idx === 0 ? block.navActiveColor : block.navInactiveColor }"
                  >
                    {{ item }}
                  </span>
                </div>
              </template>
              <template v-else>
                <div class="banner" :style="bannerStyle(block)">
                  <span v-if="!block.images[0]?.url">待配置素材</span>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </a-modal>

  <a-drawer
    v-else
    :open="open"
    width="460"
    placement="right"
    :mask="false"
    :destroy-on-close="false"
    title="实时预览"
    class="decor-v2-preview-drawer"
    @update:open="emit('update:open', $event)"
    @after-open-change="handleOpenChange"
  >
    <div class="decor-v2-preview-body">
      <div class="decor-v2-preview-toolbar">
        <a-button size="small" class="decor-v2-preview-btn" @click="toggleAutoScroll">
          {{ autoScroll ? '暂停滚动' : '开始滚动' }}
        </a-button>
        <a-button size="small" class="decor-v2-preview-btn" @click="triggerSnapshot"
          >截图模拟</a-button
        >
      </div>
      <div class="decor-v2-phone" :class="{ flash: snapshotFlash }">
        <div class="decor-v2-phone-screen">
          <div v-if="showStoreHeader" class="decor-v2-store-head">
            <div class="status-row">
              <span>10:08</span>
              <div class="status-group"><span>4G</span><span>91%</span></div>
            </div>
            <div class="merchant-row">
              <div class="avatar"></div>
              <div class="merchant-meta">
                <div class="name">天猫旗舰店</div>
                <div class="fans">33.0万粉丝</div>
              </div>
              <a-button size="small" type="primary" class="follow">+ 关注</a-button>
            </div>
            <div class="tabs">
              <span class="active">推荐</span><span>宝贝</span><span>分类</span><span>作品</span>
            </div>
          </div>
          <div ref="phoneCanvasRef" class="decor-v2-phone-canvas" :style="pageStyle">
            <div
              v-for="block in blocks"
              :key="block.id"
              class="decor-v2-phone-block"
              :class="{ active: selectedId === block.id }"
              :style="phoneBlockStyle(block)"
              @click="emit('select', block.id)"
            >
              <div class="title">{{ block.title }}</div>
              <template v-if="block.type.startsWith('product')">
                <div class="grid" :style="gridStyle(block.productColumns)">
                  <div v-for="n in Math.min(block.productCount, 8)" :key="n" class="product"></div>
                </div>
              </template>
              <template v-else-if="block.type.startsWith('coupon')">
                <div class="grid" :style="gridStyle(block.type === 'coupon-grid' ? 2 : 3)">
                  <div
                    v-for="n in block.type === 'coupon-grid' ? 4 : 3"
                    :key="n"
                    class="coupon"
                  ></div>
                </div>
              </template>
              <template v-else-if="block.type.startsWith('category')">
                <div class="grid" :style="gridStyle(4)">
                  <div
                    v-for="n in block.type === 'category-grid-4' ? 4 : 8"
                    :key="n"
                    class="category"
                  ></div>
                </div>
              </template>
              <template v-else-if="block.type === 'search'">
                <div class="search">搜索商品名称/编码</div>
              </template>
              <template v-else-if="block.type === 'notice'">
                <div class="notice">公告：本周运费满99包邮</div>
              </template>
              <template v-else-if="block.type === 'richtext'">
                <div class="richtext">图文详情内容区域</div>
              </template>
              <template v-else-if="block.type === 'nav-tabs'">
                <div class="tabs-nav">
                  <span
                    v-for="(item, idx) in block.navItems.slice(0, 4)"
                    :key="`${item}-${idx}`"
                    :style="{ color: idx === 0 ? block.navActiveColor : block.navInactiveColor }"
                  >
                    {{ item }}
                  </span>
                </div>
              </template>
              <template v-else>
                <div class="banner" :style="bannerStyle(block)">
                  <span v-if="!block.images[0]?.url">待配置素材</span>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </a-drawer>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useDecorPreview } from '../../composables/useDecorPreview'
import type { DecorBlockBase, DecorPageConfig } from '../../types/decor'

const props = defineProps<{
  open: boolean
  blocks: DecorBlockBase[]
  selectedId: string | null
  pageConfig: DecorPageConfig
  showStoreHeader?: boolean
  mode?: 'modal' | 'drawer'
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'select', id: string): void
}>()

const phoneCanvasRef = ref<HTMLElement | null>(null)
const { autoScroll, snapshotFlash, toggleAutoScroll, triggerSnapshot, handleOpenChange } =
  useDecorPreview(phoneCanvasRef)

const previewMode = computed(() => props.mode ?? 'modal')

const pageStyle = computed(() => {
  const style: Record<string, string> = {
    backgroundColor: props.pageConfig.backgroundColor || '#f8fafc',
  }
  if (props.pageConfig.backgroundImage) {
    style.backgroundImage = `url(${props.pageConfig.backgroundImage})`
    style.backgroundSize = 'cover'
    style.backgroundPosition = 'center'
  }
  return style
})

const phoneBlockStyle = (block: DecorBlockBase) => ({
  padding: `${block.padding}px`,
  marginBottom: `${block.marginBottom}px`,
  backgroundColor: block.backgroundColor || '#ffffff',
})

const gridStyle = (columns: number) => ({
  gridTemplateColumns: `repeat(${Math.max(1, Math.min(4, columns))}, minmax(0, 1fr))`,
})

const bannerStyle = (block: DecorBlockBase) => {
  const first = block.images[0]?.url || block.backgroundImage
  if (!first) return {}
  return {
    backgroundImage: `url(${first})`,
    backgroundSize: block.imageFit,
    backgroundPosition: 'center',
    borderRadius: `${block.imageRadius}px`,
  }
}
</script>
