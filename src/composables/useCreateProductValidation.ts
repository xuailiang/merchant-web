import { computed, reactive, type Ref } from 'vue'
import type {
  CreateProductFormState,
  CreateProductStepKey,
  MediaUploadItem,
  ProductVideoDraft,
  SkuDraftItem,
  SpecGroupItem,
  StepValidationResult,
} from '../types/create-product'
import { CREATE_PRODUCT_STEPS } from './useCreateProductWizard'

type ValidationOptions = {
  form: CreateProductFormState
  images: Ref<MediaUploadItem[]>
  mainVideo: Ref<ProductVideoDraft>
  detailVideo: Ref<ProductVideoDraft>
  specGroups: Ref<SpecGroupItem[]>
  skus: Ref<SkuDraftItem[]>
}

const buildInitialErrors = (): StepValidationResult => ({
  basic: [],
  media: [],
  sku: [],
  logistics: [],
  review: [],
})

export const useCreateProductValidation = (options: ValidationOptions) => {
  const stepErrors = reactive<StepValidationResult>(buildInitialErrors())

  const validateBasic = () => {
    const errors: string[] = []
    if (!options.form.name.trim()) errors.push('请填写商品名称')
    if (!options.form.brand) errors.push('请选择品牌')
    if (!options.form.category) errors.push('请选择商品分类')
    return errors
  }

  const validateMedia = () => {
    const errors: string[] = []
    if (options.images.value.length === 0) errors.push('请至少上传 1 张商品图片')
    if (options.images.value.length > 8) errors.push('商品图片最多 8 张')
    if (!options.mainVideo.value.url && !options.detailVideo.value.url) {
      errors.push('建议至少配置一个商品视频素材')
    }
    return errors
  }

  const validateSku = () => {
    const errors: string[] = []
    if (!options.specGroups.value.every((group) => group.tags.length > 0)) {
      errors.push('请补齐每个规格组的规格值')
    }
    if (options.skus.value.length === 0) errors.push('请生成 SKU 列表')
    if (options.skus.value.some((sku) => !sku.price || sku.price <= 0))
      errors.push('请填写 SKU 售价')
    if (options.skus.value.some((sku) => sku.stock < 0)) errors.push('SKU 库存不能小于 0')
    if (options.skus.value.some((sku) => sku.cost > sku.price)) {
      errors.push('存在成本价高于售价的 SKU，请检查利润设置')
    }
    return errors
  }

  const validateLogistics = () => {
    const errors: string[] = []
    if (!options.form.shipping) errors.push('请选择运费模板')
    if (!options.form.exchange || options.form.exchange <= 0) errors.push('请填写有效汇率')
    if (!options.form.tax) errors.push('请选择税码')
    if (options.form.publishType === 'schedule' && !options.form.publishAt) {
      errors.push('请选择定时上架时间')
    }
    return errors
  }

  const validators: Record<CreateProductStepKey, () => string[]> = {
    basic: validateBasic,
    media: validateMedia,
    sku: validateSku,
    logistics: validateLogistics,
    review: () => [],
  }

  const validateStep = (step: CreateProductStepKey) => {
    const errors = validators[step]()
    stepErrors[step] = errors
    return errors
  }

  const validateAll = () => {
    CREATE_PRODUCT_STEPS.forEach((step) => {
      if (step.key !== 'review') validateStep(step.key)
    })
    const globalErrors = Object.values(stepErrors).flat()
    stepErrors.review = globalErrors
    return {
      valid: globalErrors.length === 0,
      stepErrors,
      globalErrors,
    }
  }

  const globalErrors = computed(() => Object.values(stepErrors).flat())

  const firstErrorStep = computed<CreateProductStepKey | null>(() => {
    const target = CREATE_PRODUCT_STEPS.find(
      (step) => step.key !== 'review' && stepErrors[step.key].length > 0
    )
    return target?.key ?? null
  })

  const hasStepError = (step: CreateProductStepKey) => stepErrors[step].length > 0

  return {
    stepErrors,
    globalErrors,
    firstErrorStep,
    validateStep,
    validateAll,
    hasStepError,
  }
}
