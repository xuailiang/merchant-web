<template>
  <div class="create-page">
    <a-breadcrumb class="page-breadcrumb">
      <a-breadcrumb-item>首页</a-breadcrumb-item>
      <a-breadcrumb-item>商品管理</a-breadcrumb-item>
      <a-breadcrumb-item>商品列表</a-breadcrumb-item>
      <a-breadcrumb-item>创建商品</a-breadcrumb-item>
    </a-breadcrumb>

    <div class="page-head">
      <div>
        <div class="page-title">创建商品</div>
        <div class="page-subtitle">完善商品信息，确保商品能够正常展示和销售</div>
      </div>
      <a-space>
        <a-button @click="saveDraft">保存草稿</a-button>
        <a-button type="primary" @click="submitProduct">保存并提交</a-button>
      </a-space>
    </div>

    <a-row :gutter="24">
      <a-col :xs="24" :lg="16">
        <a-space direction="vertical" size="large" class="section-stack">
          <a-card title="基础信息" class="section-card">
            <a-form layout="vertical">
              <a-form-item label="商品名称" required>
                <div class="input-with-count">
                  <a-input v-model:value="form.name" :maxlength="100" placeholder="请输入商品名称" />
                  <span class="input-count">{{ form.name.length }}/100</span>
                </div>
                <div class="help-text">请输入清晰、准确的商品名称，有助于提高搜索曝光率</div>
              </a-form-item>

              <a-row :gutter="16">
                <a-col :xs="24" :md="12">
                  <a-form-item label="副标题">
                    <a-input v-model:value="form.subtitle" placeholder="请输入副标题" />
                    <div class="help-text">补充说明商品特点，不超过50个字符</div>
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :md="12">
                  <a-form-item label="品牌" required>
                    <a-select v-model:value="form.brand" :options="brandOptions" />
                    <div class="help-text">选择商品所属品牌，无对应品牌请选择“其他品牌”</div>
                  </a-form-item>
                </a-col>
              </a-row>

              <a-row :gutter="16">
                <a-col :xs="24" :md="12">
                  <a-form-item label="商品分类" required>
                    <a-input v-model:value="form.category" readonly suffix="选择" />
                    <div class="help-text">选择正确分类有助于用户快速找到您的商品</div>
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :md="12">
                  <a-form-item label="默认供货商">
                    <a-input v-model:value="form.supplier" readonly />
                    <a-button type="link" class="link-btn">更换供货商</a-button>
                  </a-form-item>
                </a-col>
              </a-row>

              <a-form-item label="商品搜索关键词">
                <a-input v-model:value="form.keywords" placeholder="多个关键词用逗号隔开" />
                <div class="help-text">输入用户可能搜索的关键词，最多10个，有助于提高搜索排名</div>
              </a-form-item>

              <a-form-item label="商品图片" required>
                <div class="help-text">建议上传高清图片，首图将作为商品主展示图，最多上传8张</div>
                <a-upload
                  list-type="picture-card"
                  :file-list="imageList"
                  :before-upload="() => false"
                  @preview="onPreviewImage"
                  @remove="onRemoveImage"
                >
                  <div v-if="imageList.length < 8">
                    <PlusOutlined />
                    <div style="margin-top: 8px">上传图片</div>
                  </div>
                </a-upload>
                <a-button size="small" @click="openAssetPicker">从素材库选择</a-button>
                <div class="primary-tag" v-if="imageList.length">主图：第 1 张</div>
              </a-form-item>

              <a-form-item label="商品视频">
                <div class="help-text">上传视频可以更全面地展示商品特点，支持mp4格式，大小不超过100MB</div>
                <a-row :gutter="16">
                  <a-col :xs="24" :md="12">
                    <div class="video-card">
                      <div class="video-title">商品主图视频</div>
                      <div class="video-cover">
                        <img :src="mainVideo.cover" alt="视频封面" />
                        <div class="video-play">
                          <PlayCircleOutlined />
                        </div>
                        <a-button type="text" class="video-remove" @click="removeVideo('main')">
                          <CloseOutlined />
                        </a-button>
                      </div>
                      <div class="video-meta">
                        <div class="video-name">{{ mainVideo.name }}</div>
                        <div class="video-link">{{ mainVideo.url }}</div>
                      </div>
                      <a-space direction="vertical" style="width: 100%">
                        <a-button block>更换主图视频</a-button>
                        <a-button block @click="openVideoPicker('main')">从素材库选择</a-button>
                      </a-space>
                    </div>
                  </a-col>
                  <a-col :xs="24" :md="12">
                    <div class="video-card">
                      <div class="video-title">
                        商品详情视频
                        <a-button type="link" size="small" @click="syncVideo">同步主图视频</a-button>
                      </div>
                      <div class="video-cover">
                        <img :src="detailVideo.cover" alt="视频封面" />
                        <div class="video-play">
                          <PlayCircleOutlined />
                        </div>
                        <a-button type="text" class="video-remove" @click="removeVideo('detail')">
                          <CloseOutlined />
                        </a-button>
                      </div>
                      <div class="video-meta">
                        <div class="video-name">{{ detailVideo.name }}</div>
                        <div class="video-link">{{ detailVideo.url }}</div>
                      </div>
                      <a-space direction="vertical" style="width: 100%">
                        <a-button block>更换详情视频</a-button>
                        <a-button block @click="openVideoPicker('detail')">从素材库选择</a-button>
                      </a-space>
                    </div>
                  </a-col>
                </a-row>
              </a-form-item>
            </a-form>
          </a-card>

          <a-card title="商品详情" class="section-card">
            <a-alert message="完善的商品详情可以提高转化率，建议包含商品介绍、规格参数、使用说明等信息" type="info" show-icon />
            <div class="editor-toolbar">
              <a-space size="small" wrap>
                <a-button size="small">加粗</a-button>
                <a-button size="small">斜体</a-button>
                <a-button size="small">下划线</a-button>
                <a-button size="small">列表</a-button>
                <a-button size="small">插入图片</a-button>
                <a-button size="small">插入表格</a-button>
                <a-button size="small" type="primary">预览</a-button>
              </a-space>
            </div>
            <a-textarea v-model:value="form.detail" :rows="14" placeholder="请输入商品详情内容..." />
            <div class="detail-actions">
              <a-button>使用模板</a-button>
              <a-button type="primary">保存详情</a-button>
            </div>
          </a-card>

          <a-card title="价格与库存" class="section-card">
            <a-alert
              message="设置商品规格、价格和库存信息，系统将根据设置自动生成SKU"
              type="info"
              show-icon
            />

            <div class="spec-section">
              <div class="section-title">规格设置</div>
              <div v-for="group in specGroups" :key="group.key" class="spec-group">
                <div class="spec-label">{{ group.label }}</div>
                <div class="spec-tags">
                  <a-tag
                    v-for="tag in group.tags"
                    :key="tag"
                    closable
                    color="blue"
                    @close="removeSpec(group.key, tag)"
                  >
                    {{ tag }}
                  </a-tag>
                  <a-input
                    v-model:value="group.input"
                    size="small"
                    placeholder="添加"
                    class="spec-input"
                    @pressEnter="addSpec(group.key)"
                  />
                  <a-button size="small" @click="addSpec(group.key)">添加</a-button>
                </div>
              </div>
            </div>

            <a-card class="batch-card compact-card" title="批量设置">
              <a-form layout="inline" class="batch-form">
                <a-form-item label="成本价">
                  <a-input-number v-model:value="batch.cost" size="small" />
                </a-form-item>
                <a-form-item label="原价">
                  <a-input-number v-model:value="batch.original" size="small" />
                </a-form-item>
                <a-form-item label="售价">
                  <a-input-number v-model:value="batch.price" size="small" />
                </a-form-item>
                <a-form-item label="库存">
                  <a-input-number v-model:value="batch.stock" size="small" />
                </a-form-item>
                <a-button type="primary" size="small" @click="applyBatch">应用到所有SKU</a-button>
              </a-form>
            </a-card>

            <div class="sku-header">
              <div class="section-title">SKU列表</div>
              <a-button type="link" @click="generateSku">根据规格生成所有SKU</a-button>
            </div>
            <a-table :columns="skuColumns" :data-source="skus" :pagination="false" row-key="id" :scroll="{ x: 1100 }">
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'image'">
                  <a-avatar :src="record.image" shape="square" :size="40" @click="updatePreviewImage(record.image)" />
                </template>
                <template v-else-if="column.key === 'combo'">
                  <div class="sku-combo">{{ record.combo }}</div>
                  <div class="sku-code">{{ record.code }}</div>
                </template>
                <template v-else-if="column.key === 'barcode'">
                  <a-input v-model:value="record.barcode" size="small" placeholder="条形码" />
                  <a-input v-model:value="record.customCode" size="small" placeholder="自建码" />
                </template>
                <template v-else-if="column.key === 'prices'">
                  <a-space size="small">
                    <a-input-number
                      v-model:value="record.price"
                      size="small"
                      :formatter="currencyFormatter"
                      :parser="currencyParser"
                    />
                    <a-input-number
                      v-model:value="record.original"
                      size="small"
                      :formatter="currencyFormatter"
                      :parser="currencyParser"
                    />
                    <a-input-number
                      v-model:value="record.cost"
                      size="small"
                      :formatter="currencyFormatter"
                      :parser="currencyParser"
                    />
                  </a-space>
                </template>
                <template v-else-if="column.key === 'stock'">
                  <a-input-number v-model:value="record.stock" size="small" />
                </template>
                <template v-else-if="column.key === 'profit'">
                  <div class="profit-cell">
                    <span class="profit-value">¥{{ calcProfit(record).toFixed(2) }}</span>
                    <a-tag :color="calcProfitRate(record) >= 0.3 ? 'green' : 'orange'">
                      {{ (calcProfitRate(record) * 100).toFixed(1) }}%
                    </a-tag>
                  </div>
                </template>
                <template v-else-if="column.key === 'action'">
                  <a-button type="text" danger @click="removeSku(record.id)">删除</a-button>
                </template>
              </template>
            </a-table>
          </a-card>

          <a-card title="物流与服务" class="section-card">
            <a-form layout="vertical">
              <a-row :gutter="16">
                <a-col :xs="24" :md="8">
                  <a-form-item label="运费模板" required>
                    <a-select v-model:value="form.shipping" :options="shippingOptions" />
                    <div class="help-text">选择商品适用的运费计算方式</div>
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :md="8">
                  <a-form-item label="汇率" required>
                    <a-input-number v-model:value="form.exchange" style="width: 100%" />
                    <div class="help-text">当前货币兑换汇率（人民币/外币）</div>
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :md="8">
                  <a-form-item label="税码" required>
                    <a-select v-model:value="form.tax" :options="taxOptions" />
                    <div class="help-text">商品对应的税务编码及税率</div>
                  </a-form-item>
                </a-col>
              </a-row>

              <a-form-item label="上架时间" required>
                <a-radio-group v-model:value="form.publishType">
                  <a-radio value="now">立即上架</a-radio>
                  <a-radio value="schedule">定时上架</a-radio>
                </a-radio-group>
                <a-date-picker
                  v-if="form.publishType === 'schedule'"
                  v-model:value="form.publishAt"
                  show-time
                  style="margin-top: 8px"
                />
              </a-form-item>

              <a-form-item label="服务保障">
                <a-checkbox-group v-model:value="form.services" :options="serviceOptions" />
              </a-form-item>

              <a-form-item label="退换货说明">
                <a-textarea v-model:value="form.returnPolicy" :rows="3" placeholder="请输入退换货政策说明" />
                <div class="help-text">清晰的退换货说明可以减少纠纷，提升用户体验</div>
              </a-form-item>
            </a-form>
          </a-card>

        </a-space>

        <div class="footer-actions">
          <a-space wrap>
            <a-button>返回列表</a-button>
            <a-button>复制商品</a-button>
            <a-button danger>删除商品</a-button>
            <a-button type="primary" @click="submitProduct">保存并提交</a-button>
          </a-space>
        </div>
      </a-col>

      <a-col :xs="24" :lg="8">
        <a-space direction="vertical" size="large" class="side-stack">
          <a-card class="preview-card" title="商品预览">
            <div class="preview-switch">
              <a-segmented v-model:value="previewMode" :options="previewOptions" />
            </div>
            <div :class="['device-shell', previewModeClass]">
              <div class="device-top">
                <span>9:41</span>
                <div class="device-icons">●●●</div>
              </div>
              <div class="device-body">
                <div class="preview-image">
                  <img :src="previewImage" alt="主图" />
                  <div class="image-count">1/{{ imageList.length || 1 }}</div>
                </div>
                <div class="preview-info">
                  <div class="preview-price">
                    ¥{{ previewPrice }}
                    <span class="preview-original">¥{{ previewOriginal }}</span>
                  </div>
                  <div class="preview-title">{{ previewTitle }}</div>
                  <div class="preview-subtitle">{{ previewSubtitle }}</div>
                  <div class="preview-meta">
                    <span>快递: 包邮</span>
                    <span>月销 100+</span>
                    <span>山东济南</span>
                  </div>
                </div>
                <div class="preview-select">选择：{{ previewSpecs }}</div>
                <div class="preview-detail">
                  {{ previewDetail }}
                </div>
                <div class="preview-cta">
                  <a-button type="primary" ghost>加入购物车</a-button>
                  <a-button type="primary">立即购买</a-button>
                </div>
              </div>
            </div>
          </a-card>

          <a-card title="操作日志" class="section-card log-card">
            <a-list :data-source="logs" item-layout="vertical">
              <template #renderItem="{ item }">
                <a-list-item>
                  <a-list-item-meta :title="item.action" :description="item.detail" />
                  <div class="log-meta">
                    <span>{{ item.user }}</span>
                    <span>{{ item.time }}</span>
                    <span>{{ item.ip }}</span>
                  </div>
                </a-list-item>
              </template>
            </a-list>
          </a-card>
        </a-space>
      </a-col>
    </a-row>
    <AssetPicker
      v-model:open="assetPickerOpen"
      :type="assetPickerType"
      :multiple="assetPickerType === 'image'"
      @select="addAssets"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  CloseOutlined,
  PlusOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons-vue'
import AssetPicker from '../components/AssetPicker.vue'
import type { AssetItem } from '../mock/assets'

const form = reactive({
  name: '猫爬架四层大型豪华猫玩具',
  subtitle: '豪华加粗剑麻柱，稳固不晃，多层跳台',
  brand: '小鸭',
  category: '宠物生活 / 猫狗玩具 / 猫玩具',
  supplier: '济南三胖子牛羊肉修改0511有限公司',
  keywords: '',
  detail: '### 商品介绍\n猫爬架四层大型豪华猫玩具，采用优质剑麻材质，耐磨耐抓。',
  shipping: '指定地区运费设置',
  exchange: 7.2,
  tax: '13% 增值税',
  publishType: 'now',
  publishAt: null as any,
  services: ['正品保障'],
  returnPolicy: '',
})

const brandOptions = [
  { label: '小鸭', value: '小鸭' },
  { label: '其他品牌', value: '其他品牌' },
]

const shippingOptions = [
  { label: '指定地区运费设置', value: '指定地区运费设置' },
  { label: '包邮', value: '包邮' },
  { label: '山东省不包邮', value: '山东省不包邮' },
]

const taxOptions = [
  { label: '13% 增值税', value: '13% 增值税' },
  { label: '9% 增值税', value: '9% 增值税' },
  { label: '6% 增值税', value: '6% 增值税' },
  { label: '0% 增值税', value: '0% 增值税' },
]

const serviceOptions = ['7天无理由退换', '正品保障', '免费安装', '全国联保']

const imageList = ref([
  {
    uid: '1',
    name: '主图1',
    status: 'done',
    url: 'https://ceshimall.sdykt.com.cn/uploadfiles/img/goods/MT00000905/76a71e2c1bd244e2a655428660e69273.jpg',
  },
  {
    uid: '2',
    name: '主图2',
    status: 'done',
    url: 'https://ceshimall.sdykt.com.cn/uploadfiles/img/goods/MT00000905/4d565337854d421296d705ca13aabf45.jpg',
  },
])
const assetPickerOpen = ref(false)
const assetPickerType = ref<'image' | 'video'>('image')
const assetPickerTarget = ref<'main' | 'detail' | null>(null)

const previewImage = ref(imageList.value[0].url)

const onPreviewImage = (file: any) => {
  previewImage.value = file.url
}

const onRemoveImage = (file: any) => {
  const index = imageList.value.findIndex((item) => item.uid === file.uid)
  imageList.value.splice(index, 1)
  if (previewImage.value === file.url && imageList.value.length) {
    previewImage.value = imageList.value[0].url
  }
  return true
}

const openAssetPicker = () => {
  assetPickerType.value = 'image'
  assetPickerTarget.value = null
  assetPickerOpen.value = true
}

const openVideoPicker = (target: 'main' | 'detail') => {
  assetPickerType.value = 'video'
  assetPickerTarget.value = target
  assetPickerOpen.value = true
}

const addAssets = (assets: AssetItem[]) => {
  if (assetPickerType.value === 'video') {
    const asset = assets[0]
    if (!asset) return
    if (assetPickerTarget.value === 'detail') {
      detailVideo.cover = asset.cover
      detailVideo.name = asset.name
      detailVideo.url = asset.url
    } else {
      mainVideo.cover = asset.cover
      mainVideo.name = asset.name
      mainVideo.url = asset.url
    }
    return
  }
  assets.forEach((asset) => {
    if (imageList.value.length >= 8) return
    imageList.value.push({
      uid: `${Date.now()}-${asset.key}`,
      name: asset.name,
      status: 'done',
      url: asset.url,
    })
  })
  if (!previewImage.value && imageList.value.length) {
    previewImage.value = imageList.value[0].url
  }
}

watch(
  () => imageList.value.length,
  () => {
    if (!imageList.value.length) {
      previewImage.value = 'https://picsum.photos/id/20/600/600'
    }
  }
)

const mainVideo = ref({
  name: 'banner_video.mp4',
  url: '//ceshi2.sdykt.com.cn/etonmallio/video/MT00000905/2021/02/26/40e0cbeba1be4c278b4413623f11dc1d.mp4',
  cover: 'https://picsum.photos/id/237/800/450',
})

const detailVideo = ref({
  name: 'detail_video.mp4',
  url: '//ceshi2.sdykt.com.cn/etonmallio/video/MT00000905/2021/02/26/ca1a16a9320b4efaa34d95f3f2c60fc6.mp4',
  cover: 'https://picsum.photos/id/169/800/450',
})

const removeVideo = (type: 'main' | 'detail') => {
  if (type === 'main') mainVideo.value = { ...mainVideo.value, url: '' }
  if (type === 'detail') detailVideo.value = { ...detailVideo.value, url: '' }
}

const syncVideo = () => {
  detailVideo.value = { ...mainVideo.value }
}

const specGroups = reactive([
  { key: 'size', label: '规格', tags: ['100', '200'], input: '' },
  { key: 'color', label: '颜色', tags: ['红色'], input: '' },
  { key: 'attr', label: '属性', tags: ['大', '小'], input: '' },
])

const addSpec = (key: string) => {
  const group = specGroups.find((item) => item.key === key)
  if (!group || !group.input.trim()) return
  group.tags.push(group.input.trim())
  group.input = ''
}

const removeSpec = (key: string, tag: string) => {
  const group = specGroups.find((item) => item.key === key)
  if (!group) return
  group.tags = group.tags.filter((item) => item !== tag)
}


const batch = reactive({ cost: 0, original: 0, price: 0, stock: 0 })

const applyBatch = () => {
  skus.value = skus.value.map((sku) => ({
    ...sku,
    cost: batch.cost || sku.cost,
    original: batch.original || sku.original,
    price: batch.price || sku.price,
    stock: batch.stock || sku.stock,
  }))
}

const skus = ref([
  {
    id: 'sku-1',
    combo: '红色 / 200 / 大',
    code: 'GG422-200-SX-D-YS442',
    image: 'https://ceshimall.sdykt.com.cn/uploadfiles/img/goods/MT00000905/08500b1f4f164a4eb077933c54581d09.jpg',
    barcode: '',
    customCode: '',
    price: 28,
    original: 37,
    cost: 27,
    stock: 100,
  },
  {
    id: 'sku-2',
    combo: '红色 / 200 / 小',
    code: 'GG422-200-SX-X-YS442',
    image: 'https://ceshimall.sdykt.com.cn/uploadfiles/img/goods/MT00000905/e2c12453f6af422da92cab9ea07f3ccc.jpg',
    barcode: '',
    customCode: '',
    price: 10,
    original: 12,
    cost: 5,
    stock: 100,
  },
])

const skuColumns = [
  { title: '图片', key: 'image', dataIndex: 'image', width: 80 },
  { title: '规格组合', key: 'combo', dataIndex: 'combo', width: 220 },
  { title: '条形码/自建码', key: 'barcode', dataIndex: 'barcode', width: 180 },
  { title: '价格信息', key: 'prices', dataIndex: 'prices', width: 280 },
  { title: '库存', key: 'stock', dataIndex: 'stock', width: 80 },
  { title: '利润/利润率', key: 'profit', dataIndex: 'profit', width: 160 },
  { title: '操作', key: 'action', dataIndex: 'action', width: 80 },
]

const currencyFormatter = (value?: number) => `¥ ${value ?? 0}`
const currencyParser = (value: string) => Number(value.replace(/[¥\\s]/g, ''))

const calcProfit = (record: { price: number; cost: number }) => (record.price || 0) - (record.cost || 0)
const calcProfitRate = (record: { price: number; cost: number }) => {
  if (!record.price) return 0
  return calcProfit(record) / record.price
}

const generateSku = () => {
  const combos = specGroups
    .map((group) => group.tags)
    .reduce<string[][]>((acc, groupTags) => {
      if (!acc.length) return groupTags.map((tag) => [tag])
      return acc.flatMap((prefix) => groupTags.map((tag) => [...prefix, tag]))
    }, [])

  skus.value = combos.map((combo, index) => ({
    id: `sku-${index + 1}`,
    combo: combo.join(' / '),
    code: `SKU-${index + 1}-${combo.join('-').toUpperCase()}`,
    image: imageList.value[0]?.url ?? previewImage.value,
    barcode: '',
    customCode: '',
    price: batch.price || 0,
    original: batch.original || 0,
    cost: batch.cost || 0,
    stock: batch.stock || 0,
  }))
}

const removeSku = (id: string) => {
  skus.value = skus.value.filter((sku) => sku.id !== id)
}

const updatePreviewImage = (url: string) => {
  previewImage.value = url
}

const previewTitle = computed(() => form.name || '商品标题')
const previewSubtitle = computed(() => form.subtitle || '商品副标题')
const previewPrice = computed(() => skus.value[0]?.price?.toFixed(2) ?? '0.00')
const previewOriginal = computed(() => skus.value[0]?.original?.toFixed(2) ?? '0.00')
const previewDetail = computed(() =>
  (form.detail || '').replace(/[#*`|]/g, '').slice(0, 200) + '...'
)
const previewSpecs = computed(() => {
  const summary = specGroups.map((group) => group.tags[0]).filter(Boolean)
  return summary.length ? summary.join(', ') : '暂未设置规格'
})

const previewMode = ref('手机')
const previewOptions = ['手机', '平板', '桌面']
const previewModeClass = computed(() => {
  if (previewMode.value === '平板') return 'device-tablet'
  if (previewMode.value === '桌面') return 'device-desktop'
  return 'device-phone'
})

const logs = [
  {
    id: 'log-1',
    user: '管理员',
    action: '编辑商品',
    time: '2025-12-25 14:30:22',
    detail: '修改了商品价格，将售价从25元调整为28元',
    ip: '192.168.1.100',
  },
  {
    id: 'log-2',
    user: '运营专员',
    action: '上传图片',
    time: '2025-12-24 09:15:45',
    detail: '上传了4张商品图片，设置第一张为主图',
    ip: '192.168.1.101',
  },
  {
    id: 'log-3',
    user: '系统自动',
    action: '库存更新',
    time: '2025-12-23 20:05:18',
    detail: '库存自动更新，红色/200/大规格库存从99变为100',
    ip: '127.0.0.1',
  },
]

const logColumns = [
  { title: '操作人', dataIndex: 'user', key: 'user' },
  { title: '操作类型', dataIndex: 'action', key: 'action' },
  { title: '操作时间', dataIndex: 'time', key: 'time' },
  { title: '操作内容', dataIndex: 'detail', key: 'detail' },
  { title: 'IP地址', dataIndex: 'ip', key: 'ip' },
]

const route = useRoute()
const DRAFT_KEY = 'product-drafts'
const draftId = ref<string | null>(null)

const loadDraft = () => {
  const id = route.query.draft as string | undefined
  if (!id) return
  const raw = localStorage.getItem(DRAFT_KEY)
  if (!raw) return
  const drafts = JSON.parse(raw) as Array<any>
  const draft = drafts.find((item) => item.id === id)
  if (!draft?.data) return
  draftId.value = id
  Object.assign(form, draft.data.form ?? {})
  if (Array.isArray(draft.data.imageList)) {
    imageList.value = draft.data.imageList
    previewImage.value = imageList.value[0]?.url ?? previewImage.value
  }
  if (draft.data.mainVideo) mainVideo.value = draft.data.mainVideo
  if (draft.data.detailVideo) detailVideo.value = draft.data.detailVideo
  if (Array.isArray(draft.data.specGroups)) {
    specGroups.splice(0, specGroups.length, ...draft.data.specGroups)
  }
  if (draft.data.batch) {
    batch.cost = draft.data.batch.cost ?? batch.cost
    batch.original = draft.data.batch.original ?? batch.original
    batch.price = draft.data.batch.price ?? batch.price
    batch.stock = draft.data.batch.stock ?? batch.stock
  }
  if (Array.isArray(draft.data.skus)) {
    skus.value = draft.data.skus
  }
}

onMounted(loadDraft)

const saveDraft = () => {
  const raw = localStorage.getItem(DRAFT_KEY)
  const drafts = raw ? (JSON.parse(raw) as Array<any>) : []
  const id = draftId.value ?? `draft-${Date.now()}`
  const payload = {
    id,
    title: form.name || '未命名商品',
    updatedAt: new Date().toISOString(),
    data: {
      form: { ...form },
      imageList: imageList.value,
      mainVideo: mainVideo.value,
      detailVideo: detailVideo.value,
      specGroups: JSON.parse(JSON.stringify(specGroups)),
      batch: { ...batch },
      skus: skus.value,
    },
  }
  const index = drafts.findIndex((item) => item.id === id)
  if (index >= 0) {
    drafts[index] = payload
  } else {
    drafts.unshift(payload)
  }
  localStorage.setItem(DRAFT_KEY, JSON.stringify(drafts))
  draftId.value = id
  message.success('草稿已保存')
}

const validateRequired = () => {
  const errors: string[] = []
  if (!form.name.trim()) errors.push('请填写商品名称')
  if (!form.brand) errors.push('请选择品牌')
  if (!form.category) errors.push('请选择商品分类')
  if (!form.shipping) errors.push('请选择运费模板')
  if (!form.exchange || form.exchange <= 0) errors.push('请填写有效汇率')
  if (!form.tax) errors.push('请选择税码')
  if (imageList.value.length === 0) errors.push('请至少上传 1 张商品图片')
  if (skus.value.length === 0) errors.push('请生成 SKU 列表')
  if (skus.value.some((sku) => !sku.price || !sku.stock)) {
    errors.push('请填写 SKU 售价和库存')
  }
  if (form.publishType === 'schedule' && !form.publishAt) {
    errors.push('请选择定时上架时间')
  }
  return errors
}

const submitProduct = () => {
  const errors = validateRequired()
  if (errors.length) {
    message.warning(errors[0])
    return
  }
  message.success('商品已提交审核')
}
</script>

<style scoped>
.create-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-breadcrumb {
  margin-bottom: 8px;
}

.page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.page-subtitle {
  color: var(--text-secondary);
}

.section-stack {
  width: 100%;
}

.section-card :deep(.ant-card-head-title) {
  font-weight: 600;
}

.help-text {
  font-size: 12px;
  color: var(--text-secondary);
}

.input-with-count {
  position: relative;
}

.input-count {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  color: var(--text-secondary);
}

.link-btn {
  padding: 0;
}

.primary-tag {
  margin-top: 8px;
  color: #1f6feb;
  font-size: 12px;
}

.video-card {
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 12px;
  background: var(--card-bg);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.video-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 500;
}

.video-cover {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  height: 160px;
}

.video-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-play {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 32px;
  background: rgba(0, 0, 0, 0.2);
}

.video-remove {
  position: absolute;
  top: 8px;
  right: 8px;
  color: #fff;
  background: rgba(0, 0, 0, 0.45);
}

.video-meta {
  font-size: 12px;
  color: var(--text-secondary);
}

.editor-toolbar {
  margin: 12px 0;
}

.detail-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 12px;
}

.spec-section {
  margin-top: 12px;
}

.section-title {
  font-weight: 600;
  margin: 12px 0;
}

.spec-group {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.spec-label {
  width: 60px;
  color: var(--text-secondary);
}

.spec-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.spec-input {
  width: 120px;
}

.batch-card {
  margin: 16px 0 0;
  background: #f0f6ff;
}

.batch-card.compact-card :deep(.ant-card-body) {
  padding: 12px 16px;
}

.batch-card.compact-card :deep(.ant-card-head) {
  min-height: 44px;
}

.batch-form :deep(.ant-form-item) {
  margin-bottom: 0;
  margin-right: 12px;
}

.sku-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.sku-combo {
  font-weight: 500;
}

.sku-code {
  font-size: 12px;
  color: var(--text-secondary);
}

.profit-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.profit-value {
  font-weight: 600;
  color: #1f6feb;
}

.footer-actions {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.side-stack {
  width: 100%;
  position: sticky;
  top: 88px;
  max-height: calc(100vh - 120px);
  overflow: auto;
  padding-right: 4px;
}

.preview-switch {
  margin-bottom: 12px;
}

.device-shell {
  border-radius: 24px;
  border: 10px solid #1f2937;
  overflow: hidden;
  background: #111827;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.18);
}

.device-phone {
  max-width: 320px;
  margin: 0 auto;
}

.device-tablet {
  max-width: 420px;
  margin: 0 auto;
  border-radius: 18px;
}

.device-desktop {
  max-width: 520px;
  margin: 0 auto;
  border-radius: 14px;
}

.device-top {
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  color: #fff;
  font-size: 12px;
}

.device-icons {
  letter-spacing: 2px;
}

.device-body {
  background: #f8fafc;
  min-height: 420px;
}

.preview-image {
  position: relative;
  height: 220px;
  background: #e2e8f0;
}

.preview-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-count {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 12px;
}

.preview-info {
  background: #fff;
  padding: 12px;
}

.preview-price {
  color: #ef4444;
  font-size: 20px;
  font-weight: 700;
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.preview-original {
  text-decoration: line-through;
  color: #94a3b8;
  font-size: 12px;
}

.preview-title {
  font-weight: 600;
  margin-top: 6px;
}

.preview-subtitle {
  font-size: 12px;
  color: #64748b;
  margin-top: 4px;
}

.preview-meta {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #94a3b8;
  margin-top: 8px;
}

.preview-select {
  background: #fff;
  padding: 12px;
  margin-top: 8px;
  font-size: 12px;
}

.preview-detail {
  background: #fff;
  padding: 12px;
  margin-top: 8px;
  font-size: 11px;
  color: #64748b;
  min-height: 80px;
}

.preview-cta {
  background: #fff;
  padding: 12px;
  display: flex;
  gap: 8px;
}

.log-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: var(--text-secondary);
}

@media (max-width: 992px) {
  .side-stack {
    position: static;
    max-height: none;
    overflow: visible;
    padding-right: 0;
  }
}
</style>
