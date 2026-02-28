export type CreateProductStepKey = 'basic' | 'media' | 'sku' | 'logistics' | 'review'

export type CreateProductStep = {
  key: CreateProductStepKey
  title: string
  description: string
}

export type CreateProductFormState = {
  name: string
  subtitle: string
  brand: string
  category: string
  supplier: string
  keywords: string
  detail: string
  shipping: string
  exchange: number
  tax: string
  publishType: 'now' | 'schedule'
  publishAt: string | null
  services: string[]
  returnPolicy: string
}

export type MediaUploadItem = {
  uid: string
  name: string
  status?: string
  url: string
}

export type ProductVideoDraft = {
  name: string
  url: string
  cover: string
  duration?: string
  source?: string
}

export type SpecGroupItem = {
  key: string
  label: string
  tags: string[]
  input: string
}

export type SkuDraftItem = {
  id: string
  combo: string
  code: string
  image: string
  barcode: string
  customCode: string
  price: number
  original: number
  cost: number
  stock: number
}

export type StepValidationResult = Record<CreateProductStepKey, string[]>

export type DraftPayloadV2 = {
  version: 2
  id: string
  title: string
  updatedAt: string
  data: {
    form: CreateProductFormState
    imageList: MediaUploadItem[]
    mainVideo: ProductVideoDraft
    detailVideo: ProductVideoDraft
    specGroups: SpecGroupItem[]
    batch: {
      cost: number
      original: number
      price: number
      stock: number
    }
    skus: SkuDraftItem[]
  }
}

export type CreateProductDraftDto = DraftPayloadV2

export type CreateProductSubmitDto = {
  form: CreateProductFormState
  imageList: MediaUploadItem[]
  mainVideo: ProductVideoDraft
  detailVideo: ProductVideoDraft
  specGroups: SpecGroupItem[]
  skus: SkuDraftItem[]
}

export type CreateProductValidateResultDto = {
  valid: boolean
  stepErrors: StepValidationResult
  globalErrors: string[]
}
