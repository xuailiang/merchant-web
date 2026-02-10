<template>
  <div class="decor-page">
    <div class="page-title">页面装修</div>

    <a-card class="toolbar-card">
      <div class="toolbar">
        <div class="toolbar-info">
          <div class="toolbar-title">页面配置</div>
          <div class="toolbar-meta">当前页面：活动页 · 草稿 · 上次保存 10:42</div>
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
        <a-collapse class="component-collapse" :default-active-key="['category', 'ad', 'product']">
          <a-collapse-panel key="category" header="分类楼层">
            <div class="tool-grid">
              <div
                v-for="item in componentLibrary.category"
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
          </a-collapse-panel>
          <a-collapse-panel key="ad" header="广告楼层">
            <div class="tool-grid">
              <div
                v-for="item in componentLibrary.ad"
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
          </a-collapse-panel>
          <a-collapse-panel key="product" header="商品楼层">
            <div class="tool-grid">
              <div
                v-for="item in componentLibrary.product"
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
          </a-collapse-panel>
          <a-collapse-panel key="activity" header="活动楼层">
            <div class="tool-grid">
              <div
                v-for="item in componentLibrary.activity"
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
          </a-collapse-panel>
          <a-collapse-panel key="coupon" header="优惠券楼层">
            <div class="tool-grid">
              <div
                v-for="item in componentLibrary.coupon"
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
          </a-collapse-panel>
          <a-collapse-panel key="nav" header="导航楼层">
            <div class="tool-grid">
              <div
                v-for="item in componentLibrary.nav"
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
          </a-collapse-panel>
          <a-collapse-panel key="basic" header="基础组件">
            <div class="tool-grid">
              <div
                v-for="item in componentLibrary.basic"
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
          </a-collapse-panel>
        </a-collapse>
      </div>

      <div class="canvas-panel">
        <a-card class="preview-card">
          <div class="preview-header">
            <span>页面画布</span>
            <a-tag color="blue">拖拽排序</a-tag>
          </div>
          <div class="preview-canvas" ref="canvasRef" @dragover.prevent @drop="onCanvasDrop">
            <div
              v-for="(block, index) in blocks"
              :key="block.id"
              class="preview-block"
              :class="[{ active: selectedId === block.id }, block.typeClass]"
              draggable="true"
              @click="selectBlock(block.id)"
              @dragstart="onDragStart(index)"
              @dragover.prevent="onDragOver(index)"
              @drop="onDrop(index)"
            >
              <div class="block-handle">
                <span>{{ block.title }}</span>
                <a-space size="small">
                  <a-tag>{{ block.type }}</a-tag>
                  <a-button type="text" size="small" @click.stop="removeBlock(index)">删除</a-button>
                </a-space>
              </div>
              <div class="block-body">
                <div class="block-preview">
                  <template v-if="block.type === 'carousel' || block.type === 'banner-1'">
                    <div class="preview-hero"></div>
                  </template>
                  <template v-else-if="block.type === 'banner-2'">
                    <div class="preview-split">
                      <div></div>
                      <div></div>
                    </div>
                  </template>
                  <template v-else-if="block.type === 'banner-3'">
                    <div class="preview-triple">
                      <div></div>
                      <div></div>
                      <div></div>
                    </div>
                  </template>
                  <template v-else-if="block.type === 'category-grid-4'">
                    <div class="preview-grid grid-4">
                      <span v-for="i in 4" :key="i"></span>
                    </div>
                  </template>
                  <template v-else-if="block.type === 'category-grid-8'">
                    <div class="preview-grid grid-8">
                      <span v-for="i in 8" :key="i"></span>
                    </div>
                  </template>
                  <template v-else-if="block.type === 'category-list'">
                    <div class="preview-list">
                      <div class="preview-list-left"></div>
                      <div class="preview-list-right"></div>
                    </div>
                  </template>
                  <template v-else-if="block.type === 'product-1x2'">
                    <div class="preview-product grid-2">
                      <div v-for="i in 2" :key="i"></div>
                    </div>
                  </template>
                  <template v-else-if="block.type === 'product-1x4'">
                    <div class="preview-product grid-4">
                      <div v-for="i in 4" :key="i"></div>
                    </div>
                  </template>
                  <template v-else-if="block.type === 'product-tab'">
                    <div class="preview-tabs">
                      <span v-for="i in 3" :key="i"></span>
                    </div>
                    <div class="preview-product grid-2">
                      <div v-for="i in 2" :key="i"></div>
                    </div>
                  </template>
                  <template v-else-if="block.type === 'product-rank'">
                    <div class="preview-rank">
                      <div v-for="i in 3" :key="i"></div>
                    </div>
                  </template>
                  <template v-else-if="block.type === 'flash-sale' || block.type === 'group-buy'">
                    <div class="preview-flash">
                      <div class="flash-header"></div>
                      <div class="preview-product grid-3">
                        <div v-for="i in 3" :key="i"></div>
                      </div>
                    </div>
                  </template>
                  <template v-else-if="block.type === 'event-entry'">
                    <div class="preview-entry"></div>
                  </template>
                  <template v-else-if="block.type === 'coupon-row'">
                    <div class="preview-coupon-row">
                      <div v-for="i in 3" :key="i"></div>
                    </div>
                  </template>
                  <template v-else-if="block.type === 'coupon-grid'">
                    <div class="preview-coupon-grid">
                      <div v-for="i in 4" :key="i"></div>
                    </div>
                  </template>
                  <template v-else-if="block.type === 'nav-tabs'">
                    <div class="preview-nav">
                      <span v-for="i in 4" :key="i"></span>
                    </div>
                  </template>
                  <template v-else-if="block.type === 'nav-float'">
                    <div class="preview-float"></div>
                  </template>
                  <template v-else-if="block.type === 'notice'">
                    <div class="preview-notice"></div>
                  </template>
                  <template v-else-if="block.type === 'search'">
                    <div class="preview-search"></div>
                  </template>
                  <template v-else>
                    <div class="block-placeholder">{{ block.title }} 内容预览</div>
                  </template>
                </div>
              </div>
            </div>
            <div v-if="!blocks.length" class="canvas-empty">拖拽左侧组件到此处</div>
          </div>
        </a-card>
      </div>

      <div class="config-panel">
        <a-card class="config-card">
          <a-tabs v-model:active-key="configTab" size="small">
            <a-tab-pane key="block" tab="楼层配置">
              <div v-if="!currentBlock" class="empty-config">请选择画布中的组件进行配置</div>
              <a-form v-else layout="vertical" class="config-form">
                <a-form-item label="楼层名称">
                  <a-input v-model:value="currentBlock.title" placeholder="请输入楼层名称" />
                </a-form-item>
                <a-form-item label="是否导航">
                  <a-switch v-model:checked="currentBlock.nav" />
                </a-form-item>
                <a-form-item label="主图宽度">
                  <a-input-number v-model:value="currentBlock.mainWidth" :min="0" style="width: 100%" />
                </a-form-item>
                <a-form-item label="主图高度">
                  <a-input-number v-model:value="currentBlock.mainHeight" :min="0" style="width: 100%" />
                </a-form-item>
                <a-form-item label="楼层背景图">
                  <a-upload
                    list-type="picture-card"
                    :file-list="currentBlock.bgImageList"
                    :before-upload="preventUpload"
                  >
                    <div>+ 添加图片</div>
                  </a-upload>
                  <a-button size="small" @click="openAssetPicker({ kind: 'block-bg' })">从素材库选择</a-button>
                </a-form-item>
                <a-form-item label="楼层背景色">
                  <div class="color-input">
                    <input v-model="currentBlock.bg" type="color" />
                    <a-input v-model:value="currentBlock.bg" />
                  </div>
                </a-form-item>
                <a-form-item label="图片组">
                  <div class="image-config">
                    <div v-for="(img, idx) in currentBlock.images" :key="img.key" class="image-row">
                      <span>图片{{ idx + 1 }}</span>
                      <div class="image-thumb" v-if="img.url">
                        <img :src="img.url" alt="img" />
                      </div>
                      <a-button type="link" @click="openAssetPicker({ kind: 'block-image', imageKey: img.key })">从素材库选择</a-button>
                    </div>
                  </div>
                </a-form-item>
                <a-form-item label="链接">
                  <a-input v-model:value="currentBlock.link" placeholder="请输入链接地址" />
                </a-form-item>
                <a-form-item label="隐藏楼层">
                  <a-switch v-model:checked="currentBlock.hidden" />
                </a-form-item>
                <a-form-item>
                  <a-checkbox v-model:checked="currentBlock.hideGap">隐藏该模块下方的间隙</a-checkbox>
                </a-form-item>
                <a-button type="primary" block>保存</a-button>
              </a-form>
            </a-tab-pane>
            <a-tab-pane key="page" tab="页面背景">
              <a-form layout="vertical" class="config-form">
                <a-form-item label="背景图片">
                  <a-upload
                    list-type="picture-card"
                    :file-list="pageConfig.bgImageList"
                    :before-upload="preventUpload"
                  >
                    <div>+ 添加图片</div>
                  </a-upload>
                  <a-button size="small" @click="openAssetPicker({ kind: 'page-bg' })">从素材库选择</a-button>
                </a-form-item>
                <a-form-item label="背景颜色">
                  <div class="color-input">
                    <input v-model="pageConfig.bgColor" type="color" />
                    <a-input v-model:value="pageConfig.bgColor" />
                  </div>
                </a-form-item>
                <a-form-item label="导航标签背景图">
                  <a-upload
                    list-type="picture-card"
                    :file-list="pageConfig.navBgImageList"
                    :before-upload="preventUpload"
                  >
                    <div>+ 添加图片</div>
                  </a-upload>
                  <a-button size="small" @click="openAssetPicker({ kind: 'page-nav-bg' })">从素材库选择</a-button>
                </a-form-item>
                <a-form-item label="导航标签背景色">
                  <div class="color-input">
                    <input v-model="pageConfig.navBgColor" type="color" />
                    <a-input v-model:value="pageConfig.navBgColor" />
                  </div>
                </a-form-item>
                <a-form-item label="导航标签文字颜色">
                  <div class="color-input">
                    <input v-model="pageConfig.navTextColor" type="color" />
                    <a-input v-model:value="pageConfig.navTextColor" />
                  </div>
                </a-form-item>
                <a-form-item label="定位标签背景色">
                  <div class="color-input">
                    <input v-model="pageConfig.locBgColor" type="color" />
                    <a-input v-model:value="pageConfig.locBgColor" />
                  </div>
                </a-form-item>
                <a-form-item label="定位标签文字颜色">
                  <div class="color-input">
                    <input v-model="pageConfig.locTextColor" type="color" />
                    <a-input v-model:value="pageConfig.locTextColor" />
                  </div>
                </a-form-item>
                <a-form-item label="是否开启悬浮">
                  <a-switch v-model:checked="pageConfig.floating" />
                </a-form-item>
                <a-form-item label="定位图片">
                  <a-upload
                    list-type="picture-card"
                    :file-list="pageConfig.floatingImageList"
                    :before-upload="preventUpload"
                  >
                    <div>+ 添加图片</div>
                  </a-upload>
                  <a-button size="small" @click="openAssetPicker({ kind: 'page-float' })">从素材库选择</a-button>
                </a-form-item>
                <a-button type="primary" block>保存</a-button>
              </a-form>
            </a-tab-pane>
          </a-tabs>
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
        <div class="phone-top">
          <span class="camera"></span>
          <span class="speaker"></span>
          <span class="dot"></span>
        </div>
        <div class="phone-screen">
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
                <div
                  v-if="block.type === 'carousel'"
                  class="phone-banner"
                  :style="getImageStyle(block)"
                >
                  <span v-if="!getBlockImage(block)">750×200px</span>
                </div>
                <div
                  v-else-if="block.type.startsWith('banner')"
                  class="phone-banner-sm"
                  :style="getImageStyle(block)"
                >
                  <span v-if="!getBlockImage(block)">广告位</span>
                </div>
                <div v-else-if="block.type.startsWith('product')" class="phone-product-grid">
                  <div
                    v-for="i in 4"
                    :key="i"
                    class="phone-product-item"
                    :style="getImageStyle(block, i)"
                  ></div>
                </div>
                <div v-else-if="block.type.startsWith('coupon')" class="phone-coupon-row">
                  <div
                    v-for="i in 2"
                    :key="i"
                    class="phone-coupon-item"
                    :style="getImageStyle(block, i)"
                  ></div>
                </div>
                <div v-else-if="block.type.startsWith('category')" class="phone-category-grid">
                  <div
                    v-for="i in 8"
                    :key="i"
                    class="phone-category-item"
                    :style="getImageStyle(block, i)"
                  ></div>
                </div>
                <div v-else class="phone-placeholder">内容预览</div>
              </div>
            </div>
          </div>
        </div>
        <div class="phone-home"></div>
      </div>
    </a-modal>
    <AssetPicker v-model:open="assetPickerOpen" type="image" :multiple="false" @select="onAssetSelect" />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import AssetPicker from '../components/AssetPicker.vue'
import type { AssetItem } from '../mock/assets'
import { message } from 'ant-design-vue'
import { useDirtyGuard } from '../utils/useDirtyGuard'

const createUpload = (url: string, name: string) => ({
  uid: `${Date.now()}-${name}`,
  name,
  status: 'done',
  url,
})

const componentLibrary = {
  category: [
    { type: 'category-grid-4', title: '分类四宫格', desc: '4宫格图标导航', thumbClass: 'thumb-grid-4' },
    { type: 'category-grid-8', title: '分类八宫格', desc: '8宫格快速入口', thumbClass: 'thumb-grid-8' },
    { type: 'category-list', title: '分类列表', desc: '左侧目录+右侧内容', thumbClass: 'thumb-split' },
  ],
  ad: [
    { type: 'banner-1', title: '广告图一', desc: '单张主视觉广告', thumbClass: 'thumb-banner' },
    { type: 'banner-2', title: '广告图二', desc: '两图并列展示', thumbClass: 'thumb-dual' },
    { type: 'banner-3', title: '广告图三', desc: '三图拼接活动区', thumbClass: 'thumb-triple' },
    { type: 'carousel', title: '轮播图', desc: '首页Banner轮播', thumbClass: 'thumb-carousel' },
  ],
  product: [
    { type: 'product-1x2', title: '商品一行两列', desc: '双列商品推荐', thumbClass: 'thumb-product-2' },
    { type: 'product-1x4', title: '商品一行四列', desc: '四列商品瀑布流', thumbClass: 'thumb-product-4' },
    { type: 'product-tab', title: '商品标签切换', desc: '多标签商品楼层', thumbClass: 'thumb-tabs' },
    { type: 'product-rank', title: '热销排行榜', desc: '销量排行列表', thumbClass: 'thumb-rank' },
  ],
  activity: [
    { type: 'flash-sale', title: '限时秒杀', desc: '倒计时活动', thumbClass: 'thumb-flash' },
    { type: 'group-buy', title: '拼团专区', desc: '拼团活动展示', thumbClass: 'thumb-group' },
    { type: 'event-entry', title: '活动入口', desc: '节日活动入口', thumbClass: 'thumb-entry' },
  ],
  coupon: [
    { type: 'coupon-row', title: '优惠券横排', desc: '横向优惠券栏', thumbClass: 'thumb-coupon-row' },
    { type: 'coupon-grid', title: '优惠券宫格', desc: '多张优惠券展示', thumbClass: 'thumb-coupon-grid' },
  ],
  nav: [
    { type: 'nav-tabs', title: '标签导航', desc: '顶部标签导航条', thumbClass: 'thumb-nav' },
    { type: 'nav-float', title: '悬浮导航', desc: '右侧悬浮入口', thumbClass: 'thumb-float' },
  ],
  basic: [
    { type: 'notice', title: '公告条', desc: '站内通知与活动预告', thumbClass: 'thumb-notice' },
    { type: 'search', title: '搜索栏', desc: '快捷搜索商品', thumbClass: 'thumb-search' },
    { type: 'richtext', title: '富文本区', desc: '图文详情说明', thumbClass: 'thumb-rich' },
  ],
}

const makeBlock = (item: { type: string; title: string }) => ({
  id: `p-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  type: item.type,
  title: item.title,
  typeClass: item.type,
  bg: '#ffffff',
  padding: 12,
  nav: false,
  mainWidth: 750,
  mainHeight: 375,
  bgImageList: [createUpload('https://picsum.photos/200/120?random=1', 'bg.png')],
  images: [
    { key: 'img-1', label: '图片1', url: 'https://picsum.photos/seed/decor1/300/200' },
    { key: 'img-2', label: '图片2', url: 'https://picsum.photos/seed/decor2/300/200' },
  ],
  link: '',
  hidden: false,
  hideGap: false,
})

const blocks = reactive([
  makeBlock({ type: 'carousel', title: '顶部轮播' }),
  makeBlock({ type: 'notice', title: '活动公告' }),
  makeBlock({ type: 'product-1x4', title: '爆款推荐' }),
])

const pageConfig = reactive({
  bgImageList: [createUpload('https://picsum.photos/200/120?random=11', 'page-bg.png')],
  bgColor: '#ffffff',
  navBgImageList: [createUpload('https://picsum.photos/200/120?random=12', 'nav-bg.png')],
  navBgColor: '#f43f5e',
  navTextColor: '#ffffff',
  locBgColor: '#111827',
  locTextColor: '#ffffff',
  floating: true,
  floatingImageList: [createUpload('https://picsum.photos/120/120?random=13', 'float.png')],
})

const dirty = ref(false)
const snapshot = ref('')

const buildSnapshot = () =>
  JSON.stringify({
    blocks: JSON.parse(JSON.stringify(blocks)),
    pageConfig: JSON.parse(JSON.stringify(pageConfig)),
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

useDirtyGuard(dirty, { message: '页面配置未保存，确认离开吗？' })

const selectedId = ref<string | null>(blocks[0]?.id ?? null)
const dragIndex = ref<number | null>(null)
const draggingPalette = ref<{ type: string; title: string } | null>(null)
const configTab = ref('block')
const showPreview = ref(false)
const previewSelectedId = ref<string | null>(blocks[0]?.id ?? null)
const phoneCanvas = ref<HTMLDivElement | null>(null)
const autoScroll = ref(false)
const snapshotFlash = ref(false)
const canvasRef = ref<HTMLDivElement | null>(null)
const assetPickerOpen = ref(false)
const assetPickerTarget = ref<{
  kind: 'block-bg' | 'block-image' | 'page-bg' | 'page-nav-bg' | 'page-float'
  imageKey?: string
} | null>(null)
let scrollTimer: number | null = null

const currentBlock = computed(() => blocks.find((b) => b.id === selectedId.value))

const onDragStart = (index: number) => {
  dragIndex.value = index
}

const onDragOver = (index: number) => {
  if (dragIndex.value === null || dragIndex.value === index) return
}

const onDrop = (index: number) => {
  if (dragIndex.value === null) return
  const item = blocks.splice(dragIndex.value, 1)[0]
  blocks.splice(index, 0, item)
  dragIndex.value = null
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

const addBlock = (item: { type: string; title: string }, index?: number) => {
  const block = makeBlock(item)
  if (index === undefined || index < 0 || index > blocks.length) {
    blocks.push(block)
  } else {
    blocks.splice(index, 0, block)
  }
}

const removeBlock = (index: number) => {
  const removed = blocks.splice(index, 1)[0]
  if (removed?.id === selectedId.value) {
    selectedId.value = blocks[0]?.id ?? null
  }
}

const saveDraft = () => {
  message.success('草稿已保存')
  markSaved()
}

const publishPage = () => {
  message.success('页面已发布')
  markSaved()
}

const selectBlock = (id: string) => {
  selectedId.value = id
  configTab.value = 'block'
}

const preventUpload = () => false

const openAssetPicker = (target: { kind: 'block-bg' | 'block-image' | 'page-bg' | 'page-nav-bg' | 'page-float'; imageKey?: string }) => {
  assetPickerTarget.value = target
  assetPickerOpen.value = true
}

const onAssetSelect = (assets: AssetItem[]) => {
  const asset = assets[0]
  if (!asset || !assetPickerTarget.value) return
  const uploadList = [createUpload(asset.url, asset.name)]
  if (assetPickerTarget.value.kind === 'block-bg') {
    if (currentBlock.value) currentBlock.value.bgImageList = uploadList
  } else if (assetPickerTarget.value.kind === 'block-image') {
    if (!currentBlock.value) return
    const img = currentBlock.value.images.find((item: any) => item.key === assetPickerTarget.value?.imageKey)
    if (img) img.url = asset.url
  } else if (assetPickerTarget.value.kind === 'page-bg') {
    pageConfig.bgImageList = uploadList
  } else if (assetPickerTarget.value.kind === 'page-nav-bg') {
    pageConfig.navBgImageList = uploadList
  } else if (assetPickerTarget.value.kind === 'page-float') {
    pageConfig.floatingImageList = uploadList
  }
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

const getBlockImage = (block: { bgImageList?: Array<{ url?: string }> }) => block.bgImageList?.[0]?.url

const getImageStyle = (
  block: { bgImageList?: Array<{ url?: string }>; images?: Array<{ url?: string }>; id: string },
  index = 0
) => {
  const url =
    block.images?.[index]?.url ||
    block.bgImageList?.[index]?.url ||
    block.bgImageList?.[0]?.url
  if (!url) return {}
  return {
    backgroundImage: `url(${url})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }
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
  grid-template-columns: 320px 1fr 380px;
  gap: 16px;
}

.component-panel,
.config-panel {
  position: sticky;
  top: 88px;
  align-self: flex-start;
}

.component-panel {
  background: #fff;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  padding: 16px;
  max-height: calc(100vh - 140px);
  overflow: auto;
}

.component-collapse :deep(.ant-collapse-item) {
  border: none;
}

.component-collapse :deep(.ant-collapse-header) {
  padding: 8px 0;
  font-weight: 600;
}

.preview-card {
  min-height: 720px;
  max-width: 420px;
  margin: 0 auto;
  width: 100%;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-weight: 600;
}

.preview-canvas {
  background: #f5f7fb;
  border-radius: 12px;
  padding: 16px;
  min-height: 680px;
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

.preview-block.active {
  border-color: #1f6feb;
  box-shadow: 0 0 0 2px rgba(31, 111, 235, 0.2);
}

.block-handle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  margin-bottom: 8px;
}

.block-placeholder {
  height: 90px;
  border-radius: 10px;
  background: #eef2ff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
}

.block-preview {
  display: grid;
  gap: 10px;
}

.preview-hero {
  height: 120px;
  border-radius: 10px;
  background: linear-gradient(135deg, #c7d2fe, #e0e7ff);
}

.preview-split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.preview-split div,
.preview-triple div,
.preview-entry {
  height: 84px;
  border-radius: 10px;
  background: #fde68a;
}

.preview-triple {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.preview-grid {
  display: grid;
  gap: 8px;
}

.preview-grid span {
  height: 44px;
  border-radius: 8px;
  background: #e2e8f0;
}

.preview-grid.grid-4 {
  grid-template-columns: repeat(4, 1fr);
}

.preview-grid.grid-8 {
  grid-template-columns: repeat(4, 1fr);
}

.preview-list {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 8px;
}

.preview-list-left,
.preview-list-right {
  height: 90px;
  border-radius: 10px;
  background: #f1f5f9;
}

.preview-product {
  display: grid;
  gap: 8px;
}

.preview-product div {
  height: 80px;
  border-radius: 10px;
  background: #f8fafc;
  border: 1px dashed #e2e8f0;
}

.preview-product.grid-2 {
  grid-template-columns: repeat(2, 1fr);
}

.preview-product.grid-3 {
  grid-template-columns: repeat(3, 1fr);
}

.preview-product.grid-4 {
  grid-template-columns: repeat(4, 1fr);
}

.preview-tabs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.preview-tabs span {
  height: 28px;
  border-radius: 6px;
  background: #dbeafe;
}

.preview-rank {
  display: grid;
  gap: 6px;
}

.preview-rank div {
  height: 28px;
  border-radius: 6px;
  background: #fee2e2;
}

.preview-flash .flash-header {
  height: 32px;
  border-radius: 6px;
  background: #fde68a;
}

.preview-entry {
  background: #bbf7d0;
}

.preview-coupon-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.preview-coupon-row div,
.preview-coupon-grid div {
  height: 56px;
  border-radius: 8px;
  background: #fef3c7;
}

.preview-coupon-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.preview-nav {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.preview-nav span {
  height: 24px;
  border-radius: 999px;
  background: #bfdbfe;
}

.preview-float {
  width: 48px;
  height: 80px;
  border-radius: 12px;
  background: #fdba74;
}

.preview-notice {
  height: 36px;
  border-radius: 8px;
  background: #fef9c3;
}

.preview-search {
  height: 40px;
  border-radius: 999px;
  background: #e2e8f0;
}

.tool-grid {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 8px;
}

.tool-item {
  border: 1px dashed var(--border-color);
  border-radius: 10px;
  padding: 12px;
  cursor: grab;
  background: #fff;
  display: grid;
  gap: 6px;
}

.tool-item:hover {
  border-color: #1f6feb;
  background: rgba(31, 111, 235, 0.06);
}

.tool-thumb {
  height: 58px;
  border-radius: 8px;
  background: linear-gradient(135deg, #e2e8f0, #f8fafc);
}

.thumb-grid-4 {
  background: repeating-linear-gradient(90deg, #e2e8f0, #e2e8f0 22%, #f8fafc 22%, #f8fafc 50%);
}

.thumb-grid-8 {
  background: repeating-linear-gradient(90deg, #e2e8f0, #e2e8f0 12%, #f8fafc 12%, #f8fafc 25%);
}

.thumb-split {
  background: linear-gradient(90deg, #e2e8f0 35%, #f8fafc 35%);
}

.thumb-banner {
  background: linear-gradient(135deg, #fecdd3, #fce7f3);
}

.thumb-dual {
  background: linear-gradient(90deg, #fed7aa 50%, #fef3c7 50%);
}

.thumb-triple {
  background: linear-gradient(90deg, #bfdbfe 33%, #fcd34d 33%, #fcd34d 66%, #fbcfe8 66%);
}

.thumb-carousel {
  background: linear-gradient(135deg, #c7d2fe, #e0e7ff);
}

.thumb-product-2 {
  background: linear-gradient(90deg, #e2e8f0 50%, #f8fafc 50%);
}

.thumb-product-4 {
  background: repeating-linear-gradient(90deg, #e2e8f0, #e2e8f0 18%, #f8fafc 18%, #f8fafc 25%);
}

.thumb-tabs {
  background: linear-gradient(180deg, #e2e8f0 25%, #f8fafc 25%);
}

.thumb-rank {
  background: linear-gradient(180deg, #fecaca, #fee2e2);
}

.thumb-flash {
  background: linear-gradient(135deg, #fde68a, #fca5a5);
}

.thumb-group {
  background: linear-gradient(135deg, #bae6fd, #e0f2fe);
}

.thumb-entry {
  background: linear-gradient(135deg, #bbf7d0, #dcfce7);
}

.thumb-coupon-row {
  background: linear-gradient(90deg, #fde68a 60%, #fef3c7 60%);
}

.thumb-coupon-grid {
  background: repeating-linear-gradient(90deg, #fde68a, #fde68a 20%, #fef3c7 20%, #fef3c7 40%);
}

.thumb-nav {
  background: linear-gradient(90deg, #93c5fd, #bfdbfe);
}

.thumb-float {
  background: radial-gradient(circle at top right, #f97316, #fdba74);
}

.thumb-notice {
  background: linear-gradient(90deg, #fef9c3, #fef3c7);
}

.thumb-search {
  background: linear-gradient(90deg, #e2e8f0 70%, #cbd5f5 70%);
}

.thumb-rich {
  background: linear-gradient(180deg, #e2e8f0 30%, #f8fafc 30%);
}

.tool-title {
  font-weight: 600;
}

.tool-desc {
  font-size: 12px;
  color: var(--text-secondary);
}

.section-title {
  font-weight: 600;
  margin-bottom: 12px;
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

.config-card {
  min-height: 520px;
}

.config-form :deep(.ant-form-item) {
  margin-bottom: 12px;
}

.color-input {
  display: grid;
  grid-template-columns: 44px 1fr;
  gap: 8px;
  align-items: center;
}

.color-input input[type='color'] {
  width: 44px;
  height: 32px;
  padding: 0;
  border: none;
  background: transparent;
}

.image-config {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.image-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 10px;
  border: 1px dashed var(--border-color);
  border-radius: 8px;
  background: #f8fafc;
}

.image-thumb {
  width: 42px;
  height: 42px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.image-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.empty-config {
  color: var(--text-secondary);
  font-size: 12px;
  padding: 12px 0;
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

.phone-shell::before {
  content: none;
}

.phone-flash::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 46px;
  background: rgba(255, 255, 255, 0.7);
  animation: flash 0.3s ease-in-out;
  pointer-events: none;
}

.phone-top {
  display: none;
}

.camera,
.speaker,
.dot {
  display: none;
}

.phone-screen {
  border-radius: 48px;
  overflow: hidden;
  background: #fff;
  width: 100%;
  height: 100%;
  position: relative;
}

.phone-screen::before {
  content: '';
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  width: 140px;
  height: 36px;
  background: #000;
  border-radius: 20px;
  z-index: 10;
}

.phone-canvas {
  height: 100%;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  background: #f8fafc;
  padding: 70px 16px 16px;
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
  background-size: cover;
  background-position: center;
}

.phone-coupon-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.phone-coupon-item {
  height: 60px;
  border-radius: 10px;
  background: #fde68a;
  background-size: cover;
  background-position: center;
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
  background-size: cover;
  background-position: center;
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

.phone-home {
  display: none;
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

@media (max-width: 1200px) {
  .builder {
    grid-template-columns: 1fr;
  }

  .component-panel,
  .config-panel {
    position: static;
  }
}
</style>
