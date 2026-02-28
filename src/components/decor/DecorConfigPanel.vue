<!-- eslint-disable vue/no-mutating-props -->
<template>
  <a-card class="decor-v2-card">
    <a-tabs v-model:activeKey="activeTab" size="small" class="decor-v2-config-tabs">
      <a-tab-pane key="block" tab="组件配置">
        <div v-if="!selectedBlock" class="decor-v2-empty">请选择画布中的组件进行配置</div>
        <a-form v-else layout="vertical" class="decor-v2-form">
          <a-form-item label="楼层名称">
            <a-input v-model:value="selectedBlock.title" />
          </a-form-item>

          <a-row :gutter="10">
            <a-col :span="12">
              <a-form-item label="显示状态">
                <a-switch
                  v-model:checked="selectedBlock.visible"
                  checked-children="显示"
                  un-checked-children="隐藏"
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="参与导航">
                <a-switch :checked="!!selectedBlock.anchorName" @change="onAnchorChange" />
              </a-form-item>
            </a-col>
          </a-row>

          <a-form-item v-if="selectedBlock.anchorName" label="导航锚点名称">
            <a-input v-model:value="selectedBlock.anchorName" />
          </a-form-item>

          <a-form-item label="整层跳转链接">
            <a-input
              v-model:value="selectedBlock.jumpLink"
              placeholder="/marketing/campaigns 或 https://..."
            />
          </a-form-item>

          <a-row :gutter="10">
            <a-col :span="12">
              <a-form-item label="内边距">
                <a-input-number
                  v-model:value="selectedBlock.padding"
                  :min="0"
                  :max="48"
                  style="width: 100%"
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="下间距">
                <a-input-number
                  v-model:value="selectedBlock.marginBottom"
                  :min="0"
                  :max="64"
                  style="width: 100%"
                />
              </a-form-item>
            </a-col>
          </a-row>

          <a-form-item label="背景色">
            <div class="decor-v2-color-row">
              <input v-model="selectedBlock.backgroundColor" type="color" />
              <a-input v-model:value="selectedBlock.backgroundColor" />
            </div>
          </a-form-item>

          <a-form-item label="背景图">
            <div class="decor-v2-asset-row">
              <div class="decor-v2-asset-thumb">
                <img
                  v-if="selectedBlock.backgroundImage"
                  :src="selectedBlock.backgroundImage"
                  alt="bg"
                />
                <span v-else>未选择</span>
              </div>
              <a-button @click="emit('open-asset', { kind: 'block-bg', blockId: selectedBlock.id })"
                >从素材库选择</a-button
              >
            </div>
          </a-form-item>

          <template v-if="isImageBlock">
            <a-divider orientation="left">图片参数</a-divider>
            <a-row :gutter="10">
              <a-col :span="12">
                <a-form-item label="圆角">
                  <a-input-number
                    v-model:value="selectedBlock.imageRadius"
                    :min="0"
                    :max="32"
                    style="width: 100%"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="填充方式">
                  <a-select
                    v-model:value="selectedBlock.imageFit"
                    :options="[
                      { label: '填满裁切', value: 'cover' },
                      { label: '完整显示', value: 'contain' },
                    ]"
                  />
                </a-form-item>
              </a-col>
            </a-row>
            <a-form-item label="图片组配置">
              <div class="decor-v2-image-list">
                <div v-for="img in selectedBlock.images" :key="img.key" class="decor-v2-image-item">
                  <div class="decor-v2-image-head">
                    <strong>{{ img.key }}</strong>
                    <a-button
                      type="link"
                      size="small"
                      @click="
                        emit('open-asset', {
                          kind: 'block-image',
                          blockId: selectedBlock.id,
                          imageKey: img.key,
                        })
                      "
                    >
                      选择素材
                    </a-button>
                  </div>
                  <div class="decor-v2-image-url">{{ img.url || '未选择素材' }}</div>
                  <a-input v-model:value="img.link" placeholder="图片跳转链接" />
                  <a-input v-model:value="img.trackCode" placeholder="埋点标识(可选)" />
                </div>
              </div>
            </a-form-item>
          </template>

          <template v-if="isProductBlock">
            <a-divider orientation="left">商品策略</a-divider>
            <a-form-item label="数据源">
              <a-radio-group v-model:value="selectedBlock.dataSource">
                <a-radio value="manual">手动选品</a-radio>
                <a-radio value="rule">规则选品</a-radio>
              </a-radio-group>
            </a-form-item>
            <a-form-item label="排序规则">
              <a-segmented
                v-model:value="selectedBlock.sortBy"
                :options="[
                  { label: '销量', value: 'sales' },
                  { label: '利润', value: 'profit' },
                  { label: '上新', value: 'newest' },
                ]"
              />
            </a-form-item>
            <a-row :gutter="10">
              <a-col :span="12">
                <a-form-item label="展示数量">
                  <a-input-number
                    v-model:value="selectedBlock.productCount"
                    :min="1"
                    :max="30"
                    style="width: 100%"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="每行列数">
                  <a-select
                    v-model:value="selectedBlock.productColumns"
                    :options="[
                      { label: '1列', value: 1 },
                      { label: '2列', value: 2 },
                      { label: '3列', value: 3 },
                      { label: '4列', value: 4 },
                    ]"
                  />
                </a-form-item>
              </a-col>
            </a-row>
            <a-form-item label="价格与标签">
              <a-space wrap>
                <a-checkbox v-model:checked="selectedBlock.showOriginalPrice">显示原价</a-checkbox>
                <a-checkbox v-model:checked="selectedBlock.showMemberPrice">显示会员价</a-checkbox>
                <a-checkbox v-model:checked="selectedBlock.showTagNew">新品</a-checkbox>
                <a-checkbox v-model:checked="selectedBlock.showTagHot">爆款</a-checkbox>
                <a-checkbox v-model:checked="selectedBlock.showTagLimit">限时</a-checkbox>
              </a-space>
            </a-form-item>
          </template>

          <template v-if="isCouponBlock">
            <a-divider orientation="left">优惠券展示</a-divider>
            <a-form-item label="券池">
              <a-input v-model:value="selectedBlock.couponPool" placeholder="请输入券池名称" />
            </a-form-item>
            <a-row :gutter="10">
              <a-col :span="12">
                <a-form-item label="展示数量">
                  <a-input-number
                    v-model:value="selectedBlock.couponCount"
                    :min="1"
                    :max="20"
                    style="width: 100%"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="按钮文案">
                  <a-input v-model:value="selectedBlock.couponButtonText" />
                </a-form-item>
              </a-col>
            </a-row>
          </template>

          <template v-if="isNavBlock">
            <a-divider orientation="left">导航配置</a-divider>
            <a-form-item label="标签项">
              <a-select
                v-model:value="selectedBlock.navItems"
                mode="tags"
                :max-tag-count="4"
                placeholder="输入后回车新增"
                style="width: 100%"
              />
            </a-form-item>
            <a-row :gutter="10">
              <a-col :span="12">
                <a-form-item label="激活色">
                  <div class="decor-v2-color-row">
                    <input v-model="selectedBlock.navActiveColor" type="color" />
                    <a-input v-model:value="selectedBlock.navActiveColor" />
                  </div>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="未激活色">
                  <div class="decor-v2-color-row">
                    <input v-model="selectedBlock.navInactiveColor" type="color" />
                    <a-input v-model:value="selectedBlock.navInactiveColor" />
                  </div>
                </a-form-item>
              </a-col>
            </a-row>
            <a-form-item label="悬浮配置">
              <a-space direction="vertical" style="width: 100%">
                <a-switch
                  v-model:checked="selectedBlock.floatingEnabled"
                  checked-children="开启"
                  un-checked-children="关闭"
                />
                <a-row :gutter="10">
                  <a-col :span="12">
                    <a-input-number
                      v-model:value="selectedBlock.floatingOffsetX"
                      :min="-200"
                      :max="200"
                      style="width: 100%"
                    />
                  </a-col>
                  <a-col :span="12">
                    <a-input-number
                      v-model:value="selectedBlock.floatingOffsetY"
                      :min="-300"
                      :max="300"
                      style="width: 100%"
                    />
                  </a-col>
                </a-row>
              </a-space>
            </a-form-item>
          </template>
        </a-form>
      </a-tab-pane>

      <a-tab-pane key="page" tab="页面配置">
        <a-form layout="vertical" class="decor-v2-form">
          <a-form-item label="页面名称">
            <a-input v-model:value="pageConfig.name" />
          </a-form-item>
          <a-form-item label="页面背景色">
            <div class="decor-v2-color-row">
              <input v-model="pageConfig.backgroundColor" type="color" />
              <a-input v-model:value="pageConfig.backgroundColor" />
            </div>
          </a-form-item>
          <a-form-item label="页面背景图">
            <div class="decor-v2-asset-row">
              <div class="decor-v2-asset-thumb">
                <img
                  v-if="pageConfig.backgroundImage"
                  :src="pageConfig.backgroundImage"
                  alt="page-bg"
                />
                <span v-else>未选择</span>
              </div>
              <a-button @click="emit('open-asset', { kind: 'page-bg' })">从素材库选择</a-button>
            </div>
          </a-form-item>
          <a-divider orientation="left">导航样式</a-divider>
          <a-row :gutter="10">
            <a-col :span="12">
              <a-form-item label="标签背景色">
                <div class="decor-v2-color-row">
                  <input v-model="pageConfig.navBgColor" type="color" />
                  <a-input v-model:value="pageConfig.navBgColor" />
                </div>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="标签文字色">
                <div class="decor-v2-color-row">
                  <input v-model="pageConfig.navTextColor" type="color" />
                  <a-input v-model:value="pageConfig.navTextColor" />
                </div>
              </a-form-item>
            </a-col>
          </a-row>
          <a-form-item label="导航背景图">
            <div class="decor-v2-asset-row">
              <div class="decor-v2-asset-thumb">
                <img v-if="pageConfig.navBgImage" :src="pageConfig.navBgImage" alt="nav-bg" />
                <span v-else>未选择</span>
              </div>
              <a-button @click="emit('open-asset', { kind: 'page-nav-bg' })">从素材库选择</a-button>
            </div>
          </a-form-item>
          <a-divider orientation="left">悬浮定位</a-divider>
          <a-form-item label="启用悬浮导航">
            <a-switch v-model:checked="pageConfig.floatingEnabled" />
          </a-form-item>
          <a-row :gutter="10">
            <a-col :span="12">
              <a-form-item label="定位背景色">
                <div class="decor-v2-color-row">
                  <input v-model="pageConfig.locBgColor" type="color" />
                  <a-input v-model:value="pageConfig.locBgColor" />
                </div>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="定位文字色">
                <div class="decor-v2-color-row">
                  <input v-model="pageConfig.locTextColor" type="color" />
                  <a-input v-model:value="pageConfig.locTextColor" />
                </div>
              </a-form-item>
            </a-col>
          </a-row>
          <a-form-item label="悬浮图标">
            <div class="decor-v2-asset-row">
              <div class="decor-v2-asset-thumb">
                <img
                  v-if="pageConfig.floatingImage"
                  :src="pageConfig.floatingImage"
                  alt="floating"
                />
                <span v-else>未选择</span>
              </div>
              <a-button @click="emit('open-asset', { kind: 'page-float' })">从素材库选择</a-button>
            </div>
          </a-form-item>
        </a-form>
      </a-tab-pane>

      <a-tab-pane key="layers" tab="楼层列表">
        <div class="decor-v2-layer-list">
          <div v-for="(block, idx) in blocks" :key="block.id" class="decor-v2-layer-item">
            <div>
              <div class="decor-v2-layer-title">
                <span>{{ block.title }}</span>
                <a-tag>{{ groupLabel(block.group) }}</a-tag>
              </div>
              <div class="decor-v2-layer-sub">{{ block.type }}</div>
            </div>
            <a-space size="small">
              <a-switch :checked="block.visible" @change="emit('toggle-visible', block.id)" />
              <a-button size="small" @click="emit('move-up', idx)">上移</a-button>
              <a-button size="small" @click="emit('move-down', idx)">下移</a-button>
            </a-space>
          </div>
        </div>
      </a-tab-pane>
    </a-tabs>
  </a-card>
</template>

<script setup lang="ts">
/* eslint-disable vue/no-mutating-props */
import { computed, ref } from 'vue'
import type { DecorBlockBase, DecorConfigAssetTarget, DecorPageConfig } from '../../types/decor'

const props = defineProps<{
  selectedBlock: DecorBlockBase | null
  pageConfig: DecorPageConfig
  blocks: DecorBlockBase[]
}>()

const emit = defineEmits<{
  (e: 'open-asset', target: DecorConfigAssetTarget): void
  (e: 'move-up', index: number): void
  (e: 'move-down', index: number): void
  (e: 'toggle-visible', id: string): void
}>()

const activeTab = ref<'block' | 'page' | 'layers'>('block')

const isImageBlock = computed(() => {
  const type = props.selectedBlock?.type
  if (!type) return false
  return (
    type.startsWith('banner') ||
    type === 'carousel' ||
    type === 'event-entry' ||
    type === 'brand-wall' ||
    type === 'video-floor'
  )
})
const isProductBlock = computed(() => props.selectedBlock?.type.startsWith('product') ?? false)
const isCouponBlock = computed(() => props.selectedBlock?.type.startsWith('coupon') ?? false)
const isNavBlock = computed(() => props.selectedBlock?.type.startsWith('nav') ?? false)

const onAnchorChange = (checked: boolean) => {
  if (!props.selectedBlock) return
  props.selectedBlock.anchorName = checked ? props.selectedBlock.title : ''
}

const groupLabel = (group: DecorBlockBase['group']) => {
  const map: Record<DecorBlockBase['group'], string> = {
    basic: '基础',
    category: '分类',
    ad: '广告',
    product: '商品',
    activity: '活动',
    coupon: '优惠券',
    nav: '导航',
    'home-only': '首页',
  }
  return map[group]
}
</script>
