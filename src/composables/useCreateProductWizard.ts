import { computed, ref, watch } from 'vue'
import type { CreateProductStep, CreateProductStepKey } from '../types/create-product'

const STEP_STORAGE_KEY = 'create-product:last-active-step'

export const CREATE_PRODUCT_STEPS: CreateProductStep[] = [
  { key: 'basic', title: '基础信息', description: '名称/品牌/分类' },
  { key: 'media', title: '素材', description: '图片/视频' },
  { key: 'sku', title: 'SKU与价格', description: '规格/库存/利润' },
  { key: 'logistics', title: '物流服务', description: '运费/税码/上架时间' },
  { key: 'review', title: '提交审核', description: '汇总/校验/提交' },
]

const isStepKey = (value: string): value is CreateProductStepKey =>
  CREATE_PRODUCT_STEPS.some((step) => step.key === value)

export const useCreateProductWizard = () => {
  const currentStep = ref<CreateProductStepKey>('basic')
  const restored = localStorage.getItem(STEP_STORAGE_KEY)
  if (restored && isStepKey(restored)) {
    currentStep.value = restored
  }

  watch(currentStep, (value) => {
    localStorage.setItem(STEP_STORAGE_KEY, value)
  })

  const currentIndex = computed(() =>
    Math.max(
      0,
      CREATE_PRODUCT_STEPS.findIndex((step) => step.key === currentStep.value)
    )
  )

  const progress = computed(() =>
    Math.round(((currentIndex.value + 1) / CREATE_PRODUCT_STEPS.length) * 100)
  )

  const canPrev = computed(() => currentIndex.value > 0)
  const canNext = computed(() => currentIndex.value < CREATE_PRODUCT_STEPS.length - 1)

  const goStep = (step: CreateProductStepKey) => {
    currentStep.value = step
  }

  const next = () => {
    if (!canNext.value) return
    currentStep.value = CREATE_PRODUCT_STEPS[currentIndex.value + 1].key
  }

  const prev = () => {
    if (!canPrev.value) return
    currentStep.value = CREATE_PRODUCT_STEPS[currentIndex.value - 1].key
  }

  return {
    steps: CREATE_PRODUCT_STEPS,
    currentStep,
    currentIndex,
    progress,
    canPrev,
    canNext,
    goStep,
    next,
    prev,
  }
}
