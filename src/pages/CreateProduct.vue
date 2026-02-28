<template>
  <div class="create-product-v2">
    <ProductStepHeader
      :steps="steps"
      :current-step="currentStep"
      :current-index="currentIndex"
      :progress="progress"
      :step-errors="stepErrors"
      @select="onSelectStep"
    />

    <div class="create-top-actions">
      <a-space>
        <a-tag :color="syncStateColor">{{ syncStateText }}</a-tag>
        <span class="create-top-meta" v-if="lastSavedAt">最近自动保存 {{ lastSavedAt }}</span>
      </a-space>
      <a-space wrap>
        <a-button :disabled="!canPrev" @click="prevStep">上一步</a-button>
        <a-button type="primary" :disabled="!canNext" @click="nextStep">下一步</a-button>
        <a-button @click="saveDraftManually">保存草稿</a-button>
        <a-button type="primary" @click="submitProduct">提交审核</a-button>
        <a-button v-if="isMobile" class="mobile-side-trigger" @click="openSideDrawer = true">
          预览与校验
        </a-button>
      </a-space>
    </div>

    <a-row :gutter="16" class="wizard-layout-row">
      <a-col :xs="24" :lg="16" class="wizard-main-col">
        <StepBasicInfo
          v-if="currentStep === 'basic'"
          :form="form"
          :brand-options="brandOptions"
          :category-options="categoryOptions"
          @update:form="(val) => Object.assign(form, val)"
        />

        <StepMediaAssets
          v-else-if="currentStep === 'media'"
          :image-list="imageList"
          :main-video="mainVideo"
          :detail-video="detailVideo"
          @preview-image="onPreviewImage"
          @remove-image="onRemoveImage"
          @open-asset-picker="openAssetPicker"
          @remove-video="removeVideo"
          @sync-video="syncVideo"
        />

        <StepSkuPricing
          v-else-if="currentStep === 'sku'"
          :spec-groups="specGroups"
          :batch="batch"
          :skus="skus"
          :sku-columns="skuColumns"
          :currency-formatter="currencyFormatter"
          :currency-parser="currencyParser"
          :calc-profit="calcProfit"
          :calc-profit-rate="calcProfitRate"
          @add-spec="addSpec"
          @remove-spec="removeSpec"
          @apply-batch="applyBatch"
          @generate-sku="generateSku"
          @remove-sku="removeSku"
          @select-sku-image="updatePreviewImage"
          @update:batch="(val) => Object.assign(batch, val)"
          @update:skus="(val) => (skus = val)"
        />

        <StepLogisticsService
          v-else-if="currentStep === 'logistics'"
          :form="form"
          :shipping-options="shippingOptions"
          :tax-options="taxOptions"
          :service-options="serviceOptions"
          @update:form="(val) => Object.assign(form, val)"
        />

        <StepSubmitReview
          v-else
          :form="form"
          :images-count="imageList.length"
          :sku-count="skus.length"
          :skus="skus"
          :errors="globalErrors"
          @jump-to-error="jumpToFirstErrorStep"
        />

        <div class="wizard-footer">
          <a-space wrap>
            <a-button @click="goBackList">返回列表</a-button>
            <a-button @click="saveDraftManually">保存草稿</a-button>
            <a-button type="primary" @click="submitProduct">提交审核</a-button>
          </a-space>
        </div>
      </a-col>

      <a-col v-if="!isMobile" :xs="24" :lg="8" class="wizard-side-col">
        <div class="wizard-side-stack">
          <ProductLivePreview
            :collapsed="previewCollapsed"
            :preview="previewData"
            @toggle="togglePreview"
          />
          <ProductValidationPanel
            :step-errors="stepErrors"
            :global-errors="globalErrors"
            @jump="goStep"
          />
          <a-card title="操作日志" class="wizard-section-card">
            <a-list :data-source="logs" item-layout="vertical">
              <template #renderItem="{ item }">
                <a-list-item>
                  <a-list-item-meta :title="item.action" :description="item.detail" />
                  <div class="create-top-meta">
                    <span>{{ item.user }}</span>
                    <span>{{ item.time }}</span>
                    <span>{{ item.ip }}</span>
                  </div>
                </a-list-item>
              </template>
            </a-list>
          </a-card>
        </div>
      </a-col>
    </a-row>

    <a-drawer
      v-if="isMobile"
      :open="openSideDrawer"
      title="预览与校验"
      placement="bottom"
      height="72vh"
      @close="openSideDrawer = false"
    >
      <a-space direction="vertical" style="width: 100%" size="middle">
        <ProductLivePreview
          :collapsed="previewCollapsed"
          :preview="previewData"
          @toggle="togglePreview"
        />
        <ProductValidationPanel
          :step-errors="stepErrors"
          :global-errors="globalErrors"
          @jump="goStep"
        />
      </a-space>
    </a-drawer>

    <AssetPicker
      v-model:open="assetPickerOpen"
      :type="assetPickerType"
      :multiple="assetPickerType === 'image'"
      @select="addAssets"
    />

    <ProductDraftRecoverModal
      :open="recoverModalOpen"
      :draft-title="recoverDraftTitle"
      :updated-at="recoverDraftUpdatedAt"
      @recover="recoverLatestDraft"
      @discard="discardLatestDraft"
      @cancel="recoverModalOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import dayjs from 'dayjs'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import AssetPicker from '../components/AssetPicker.vue'
import ProductDraftRecoverModal from '../components/create-product/ProductDraftRecoverModal.vue'
import ProductLivePreview from '../components/create-product/ProductLivePreview.vue'
import ProductStepHeader from '../components/create-product/ProductStepHeader.vue'
import ProductValidationPanel from '../components/create-product/ProductValidationPanel.vue'
import StepBasicInfo from '../components/create-product/StepBasicInfo.vue'
import StepLogisticsService from '../components/create-product/StepLogisticsService.vue'
import StepMediaAssets from '../components/create-product/StepMediaAssets.vue'
import StepSkuPricing from '../components/create-product/StepSkuPricing.vue'
import StepSubmitReview from '../components/create-product/StepSubmitReview.vue'
import { useCreateProductAutoSave } from '../composables/useCreateProductAutoSave'
import { useCreateProductValidation } from '../composables/useCreateProductValidation'
import { useCreateProductWizard } from '../composables/useCreateProductWizard'
import type {
  CreateProductFormState,
  CreateProductStepKey,
  DraftPayloadV2,
  MediaUploadItem,
  ProductVideoDraft,
  SkuDraftItem,
  SpecGroupItem,
} from '../types/create-product'
import type { AssetItem } from '../mock/assets'
import { useDirtyGuard } from '../utils/useDirtyGuard'
import { useIsMobile } from '../utils/useIsMobile'
import '../styles/create-product-v2.css'

const router = useRouter()
const route = useRoute()
const isMobile = useIsMobile(992)

const form = reactive<CreateProductFormState>({
  name: '',
  subtitle: '',
  brand: '小鸭',
  category: '宠物生活 / 猫狗玩具 / 猫玩具',
  supplier: '济南三胖子牛羊肉修改0511有限公司',
  keywords: '',
  detail: '### 商品介绍\n猫爬架四层大型豪华猫玩具，采用优质剑麻材质，耐磨耐抓。',
  shipping: '指定地区运费设置',
  exchange: 7.2,
  tax: '13% 增值税',
  publishType: 'now',
  publishAt: null,
  services: ['正品保障'],
  returnPolicy: '',
})

const imageList = ref<MediaUploadItem[]>([
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

const mainVideo = ref<ProductVideoDraft>({
  name: 'banner_video.mp4',
  url: '//ceshi2.sdykt.com.cn/etonmallio/video/MT00000905/2021/02/26/40e0cbeba1be4c278b4413623f11dc1d.mp4',
  cover: 'https://picsum.photos/id/237/800/450',
  source: '素材库',
  duration: '00:24',
})

const detailVideo = ref<ProductVideoDraft>({
  name: 'detail_video.mp4',
  url: '//ceshi2.sdykt.com.cn/etonmallio/video/MT00000905/2021/02/26/ca1a16a9320b4efaa34d95f3f2c60fc6.mp4',
  cover: 'https://picsum.photos/id/169/800/450',
  source: '素材库',
  duration: '00:18',
})

const specGroups = ref<SpecGroupItem[]>([
  { key: 'size', label: '规格', tags: ['100', '200'], input: '' },
  { key: 'color', label: '颜色', tags: ['红色'], input: '' },
  { key: 'attr', label: '属性', tags: ['大', '小'], input: '' },
])

const batch = reactive({
  cost: 0,
  original: 0,
  price: 0,
  stock: 0,
})

const skus = ref<SkuDraftItem[]>([
  {
    id: 'sku-1',
    combo: '红色 / 200 / 大',
    code: 'GG422-200-SX-D-YS442',
    image:
      'https://ceshimall.sdykt.com.cn/uploadfiles/img/goods/MT00000905/08500b1f4f164a4eb077933c54581d09.jpg',
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
    image:
      'https://ceshimall.sdykt.com.cn/uploadfiles/img/goods/MT00000905/e2c12453f6af422da92cab9ea07f3ccc.jpg',
    barcode: '',
    customCode: '',
    price: 10,
    original: 12,
    cost: 5,
    stock: 100,
  },
])

const previewImage = ref(imageList.value[0]?.url ?? 'https://picsum.photos/id/20/600/600')
const previewCollapsed = ref(false)
const openSideDrawer = ref(false)
const recoverModalOpen = ref(false)
const recoverDraftTitle = ref('')
const recoverDraftUpdatedAt = ref('')

const assetPickerOpen = ref(false)
const assetPickerType = ref<'image' | 'video'>('image')
const assetPickerTarget = ref<'main' | 'detail' | null>(null)
const draftId = ref<string | null>(null)

const brandOptions = [
  { label: '小鸭', value: '小鸭' },
  { label: '其他品牌', value: '其他品牌' },
]

const categoryOptions = [
  { label: '宠物生活 / 猫狗玩具 / 猫玩具', value: '宠物生活 / 猫狗玩具 / 猫玩具' },
  { label: '宠物生活 / 猫狗用品 / 猫窝', value: '宠物生活 / 猫狗用品 / 猫窝' },
  { label: '宠物生活 / 清洁用品', value: '宠物生活 / 清洁用品' },
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
]

const { steps, currentStep, currentIndex, progress, canNext, canPrev, goStep, next, prev } =
  useCreateProductWizard()

const { stepErrors, globalErrors, firstErrorStep, validateAll, validateStep } =
  useCreateProductValidation({
    form,
    images: imageList,
    mainVideo,
    detailVideo,
    specGroups,
    skus,
  })

const DRAFT_STORAGE_KEY = 'product-drafts'

const buildSnapshot = () =>
  JSON.stringify({
    form: { ...form },
    imageList: imageList.value,
    mainVideo: mainVideo.value,
    detailVideo: detailVideo.value,
    specGroups: specGroups.value,
    batch: { ...batch },
    skus: skus.value,
  })

const createDraftPayload = (id: string): DraftPayloadV2 => ({
  version: 2,
  id,
  title: form.name || '未命名商品',
  updatedAt: new Date().toISOString(),
  data: {
    form: { ...form },
    imageList: imageList.value,
    mainVideo: mainVideo.value,
    detailVideo: detailVideo.value,
    specGroups: specGroups.value,
    batch: { ...batch },
    skus: skus.value,
  },
})

const {
  dirty,
  syncState,
  lastSavedAt,
  markSaved,
  saveNow,
  loadDraftById,
  latestDraftInfo,
  refreshLatestDraftInfo,
} = useCreateProductAutoSave({
  draftId,
  snapshot: buildSnapshot,
  createPayload: createDraftPayload,
  storageKey: DRAFT_STORAGE_KEY,
  delayMs: 5000,
})

useDirtyGuard(dirty, { message: '商品信息未保存，确认离开吗？' })

const syncStateText = computed(() => {
  if (syncState.value === 'saving') return '自动保存中'
  if (syncState.value === 'dirty') return '未同步'
  return '已同步'
})

const syncStateColor = computed(() => {
  if (syncState.value === 'saving') return 'processing'
  if (syncState.value === 'dirty') return 'orange'
  return 'green'
})

const previewData = computed(() => {
  const firstSku = skus.value[0]
  const videoScore = Number(Boolean(mainVideo.value.url || detailVideo.value.url))
  const mediaCompleteness = Math.min(
    100,
    Math.round((imageList.value.length / 8) * 80 + videoScore * 20)
  )
  return {
    title: form.name || '商品标题',
    subtitle: form.subtitle || '商品副标题',
    price: firstSku ? firstSku.price.toFixed(2) : '0.00',
    original: firstSku ? firstSku.original.toFixed(2) : '0.00',
    detail: (form.detail || '').replace(/[#*`|]/g, '').slice(0, 120),
    spec:
      specGroups.value
        .map((group) => group.tags[0])
        .filter(Boolean)
        .join(' / ') || '未设置',
    image: previewImage.value,
    imageCount: imageList.value.length,
    mediaCompleteness,
  }
})

const skuColumns = [
  { title: '图片', key: 'image', width: 80 },
  { title: '规格组合', key: 'combo', width: 240 },
  { title: '条形码/自建码', key: 'barcode', width: 190 },
  { title: '价格信息', key: 'prices', width: 300 },
  { title: '库存', key: 'stock', width: 90 },
  { title: '利润/利润率', key: 'profit', width: 170 },
  { title: '操作', key: 'action', width: 80 },
]

const calcProfit = (record: SkuDraftItem) => (record.price || 0) - (record.cost || 0)
const calcProfitRate = (record: SkuDraftItem) => {
  if (!record.price) return 0
  return calcProfit(record) / record.price
}

const currencyFormatter = (value?: number) => `¥ ${value ?? 0}`
const currencyParser = (value: string) => Number(value.replace(/[¥\\s]/g, ''))

const goBackList = () => router.push('/products')

const togglePreview = (value: boolean) => {
  previewCollapsed.value = value
}

const onSelectStep = (step: CreateProductStepKey) => {
  if (step === currentStep.value) return
  const targetIndex = steps.findIndex((item) => item.key === step)
  if (targetIndex > currentIndex.value) {
    const errors = validateStep(currentStep.value)
    if (errors.length) {
      message.warning(errors[0])
      return
    }
  }
  goStep(step)
}

const prevStep = () => {
  if (!canPrev.value) return
  prev()
}

const nextStep = () => {
  const errors = validateStep(currentStep.value)
  if (errors.length) {
    message.warning(errors[0])
    return
  }
  next()
}

const jumpToFirstErrorStep = () => {
  if (firstErrorStep.value) goStep(firstErrorStep.value)
}

const onPreviewImage = (file: MediaUploadItem) => {
  previewImage.value = file.url
}

const onRemoveImage = (file: MediaUploadItem) => {
  const index = imageList.value.findIndex((item) => item.uid === file.uid)
  if (index >= 0) imageList.value.splice(index, 1)
  if (!imageList.value.length) {
    previewImage.value = 'https://picsum.photos/id/20/600/600'
  } else if (previewImage.value === file.url) {
    previewImage.value = imageList.value[0].url
  }
  return true
}

const openAssetPicker = (type: 'image' | 'video', target: 'main' | 'detail' | null) => {
  assetPickerType.value = type
  assetPickerTarget.value = target
  assetPickerOpen.value = true
}

const addAssets = (assets: AssetItem[]) => {
  if (assetPickerType.value === 'video') {
    const asset = assets[0]
    if (!asset) return
    const nextVideo: ProductVideoDraft = {
      name: asset.name,
      url: asset.url,
      cover: asset.cover,
      duration: '00:20',
      source: asset.folder,
    }
    if (assetPickerTarget.value === 'detail') detailVideo.value = nextVideo
    else mainVideo.value = nextVideo
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
  if (imageList.value.length) previewImage.value = imageList.value[0].url
}

const removeVideo = (type: 'main' | 'detail') => {
  if (type === 'main') mainVideo.value = { ...mainVideo.value, url: '' }
  if (type === 'detail') detailVideo.value = { ...detailVideo.value, url: '' }
}

const syncVideo = () => {
  detailVideo.value = { ...mainVideo.value }
}

const addSpec = (key: string) => {
  const group = specGroups.value.find((item) => item.key === key)
  if (!group || !group.input.trim()) return
  const value = group.input.trim()
  if (group.tags.includes(value)) {
    message.warning('规格值已存在')
    return
  }
  group.tags.push(value)
  group.input = ''
}

const removeSpec = (key: string, tag: string) => {
  const group = specGroups.value.find((item) => item.key === key)
  if (!group) return
  group.tags = group.tags.filter((item) => item !== tag)
}

const applyBatch = () => {
  skus.value = skus.value.map((sku) => ({
    ...sku,
    cost: batch.cost || sku.cost,
    original: batch.original || sku.original,
    price: batch.price || sku.price,
    stock: batch.stock || sku.stock,
  }))
}

const generateSku = () => {
  const groups = specGroups.value.map((group) => group.tags).filter((tags) => tags.length)
  if (!groups.length || groups.length !== specGroups.value.length) {
    message.warning('请先补齐所有规格组的规格值')
    return
  }
  const combos = groups.reduce<string[][]>((acc, tags) => {
    if (!acc.length) return tags.map((tag) => [tag])
    return acc.flatMap((prefix) => tags.map((tag) => [...prefix, tag]))
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
  skus.value = skus.value.filter((item) => item.id !== id)
}

const updatePreviewImage = (url: string) => {
  previewImage.value = url
}

const normalizeDraft = (draft: any): DraftPayloadV2 | null => {
  if (!draft) return null
  if (draft.version === 2 && draft.data) return draft as DraftPayloadV2
  if (!draft.data) return null
  return {
    version: 2,
    id: String(draft.id ?? `draft-${Date.now()}`),
    title: String(draft.title ?? '未命名商品'),
    updatedAt: String(draft.updatedAt ?? new Date().toISOString()),
    data: {
      form: {
        ...form,
        ...(draft.data.form ?? {}),
      },
      imageList: Array.isArray(draft.data.imageList) ? draft.data.imageList : [],
      mainVideo: draft.data.mainVideo ?? mainVideo.value,
      detailVideo: draft.data.detailVideo ?? detailVideo.value,
      specGroups: Array.isArray(draft.data.specGroups) ? draft.data.specGroups : specGroups.value,
      batch: draft.data.batch ?? { ...batch },
      skus: Array.isArray(draft.data.skus) ? draft.data.skus : [],
    },
  }
}

const applyDraftPayload = (payload: DraftPayloadV2) => {
  draftId.value = payload.id
  Object.assign(form, payload.data.form)
  imageList.value = payload.data.imageList
  mainVideo.value = payload.data.mainVideo
  detailVideo.value = payload.data.detailVideo
  specGroups.value = payload.data.specGroups
  batch.cost = payload.data.batch.cost ?? 0
  batch.original = payload.data.batch.original ?? 0
  batch.price = payload.data.batch.price ?? 0
  batch.stock = payload.data.batch.stock ?? 0
  skus.value = payload.data.skus
  previewImage.value = imageList.value[0]?.url ?? 'https://picsum.photos/id/20/600/600'
  markSaved()
}

const loadDraftFromRoute = () => {
  const draftQuery = route.query.draft as string | undefined
  if (!draftQuery) return false
  const raw = loadDraftById(draftQuery)
  const payload = normalizeDraft(raw)
  if (!payload) return false
  applyDraftPayload(payload)
  return true
}

const saveDraftManually = () => {
  saveNow()
  message.success('草稿已保存')
}

const recoverLatestDraft = () => {
  const info = latestDraftInfo.value
  if (!info) {
    recoverModalOpen.value = false
    return
  }
  const raw = loadDraftById(info.id)
  const payload = normalizeDraft(raw)
  if (!payload) return
  applyDraftPayload(payload)
  recoverModalOpen.value = false
  message.success('草稿已恢复')
}

const discardLatestDraft = () => {
  recoverModalOpen.value = false
}

const submitProduct = () => {
  const result = validateAll()
  if (!result.valid) {
    const step = firstErrorStep.value
    if (step) goStep(step)
    message.warning(result.globalErrors[0])
    return
  }
  saveNow()
  message.success('商品已提交审核')
  markSaved()
}

onMounted(() => {
  const loadedByRoute = loadDraftFromRoute()
  if (loadedByRoute) return
  refreshLatestDraftInfo()
  const info = latestDraftInfo.value
  if (!info) return
  recoverDraftTitle.value = info.title
  recoverDraftUpdatedAt.value = dayjs(info.updatedAt).format('YYYY-MM-DD HH:mm:ss')
  recoverModalOpen.value = true
})
</script>
