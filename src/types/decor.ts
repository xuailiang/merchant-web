export type DecorBuilderMode = 'home' | 'page'

export type DecorBlockType =
  | 'carousel'
  | 'banner-1'
  | 'banner-2'
  | 'banner-3'
  | 'event-entry'
  | 'brand-wall'
  | 'category-grid-4'
  | 'category-grid-8'
  | 'category-list'
  | 'product-1x2'
  | 'product-1x4'
  | 'product-tab'
  | 'product-rank'
  | 'coupon-row'
  | 'coupon-grid'
  | 'nav-tabs'
  | 'nav-float'
  | 'notice'
  | 'search'
  | 'richtext'
  | 'video-floor'
  | 'store-header'

export type DecorBlockGroup =
  | 'basic'
  | 'category'
  | 'ad'
  | 'product'
  | 'activity'
  | 'coupon'
  | 'nav'
  | 'home-only'

export type DecorImageItem = {
  key: string
  url: string
  link: string
  trackCode: string
  alt?: string
}

export type DecorBlockBase = {
  id: string
  type: DecorBlockType
  title: string
  group: DecorBlockGroup
  required?: boolean
  locked?: boolean
  visible: boolean
  anchorName: string
  jumpLink: string
  padding: number
  marginBottom: number
  backgroundColor: string
  backgroundImage: string
  imageRadius: number
  imageAspectRatio: '16:9' | '3:1' | '1:1' | '4:3'
  imageFit: 'cover' | 'contain'
  images: DecorImageItem[]
  dataSource: 'manual' | 'rule'
  sortBy: 'sales' | 'profit' | 'newest'
  productCount: number
  productColumns: 1 | 2 | 3 | 4
  showOriginalPrice: boolean
  showMemberPrice: boolean
  showTagNew: boolean
  showTagHot: boolean
  showTagLimit: boolean
  couponPool: string
  couponCount: number
  couponButtonText: string
  navItems: string[]
  navActiveColor: string
  navInactiveColor: string
  floatingEnabled: boolean
  floatingOffsetX: number
  floatingOffsetY: number
}

export type DecorPageConfig = {
  name: string
  version: string
  backgroundColor: string
  backgroundImage: string
  navBgColor: string
  navTextColor: string
  navBgImage: string
  locBgColor: string
  locTextColor: string
  floatingEnabled: boolean
  floatingImage: string
}

export type DecorValidationIssue = {
  level: 'error' | 'warning'
  code: string
  message: string
  blockId?: string
}

export type DecorComponentMeta = {
  type: DecorBlockType
  title: string
  desc: string
  group: DecorBlockGroup
  thumbClass: string
  badge?: '新增' | '常用' | '高级'
}

export type DecorBuilderState = {
  blocks: DecorBlockBase[]
  pageConfig: DecorPageConfig
}

export type DecorConfigAssetTarget =
  | { kind: 'block-bg'; blockId: string }
  | { kind: 'block-image'; blockId: string; imageKey: string }
  | { kind: 'page-bg' }
  | { kind: 'page-nav-bg' }
  | { kind: 'page-float' }

export type DecorBlockConfigMap = {
  base: Pick<
    DecorBlockBase,
    | 'title'
    | 'visible'
    | 'padding'
    | 'marginBottom'
    | 'backgroundColor'
    | 'backgroundImage'
    | 'anchorName'
    | 'jumpLink'
  >
  image: Pick<DecorBlockBase, 'images' | 'imageRadius' | 'imageAspectRatio' | 'imageFit'>
  product: Pick<
    DecorBlockBase,
    | 'dataSource'
    | 'sortBy'
    | 'productCount'
    | 'productColumns'
    | 'showOriginalPrice'
    | 'showMemberPrice'
    | 'showTagNew'
    | 'showTagHot'
    | 'showTagLimit'
  >
  coupon: Pick<DecorBlockBase, 'couponPool' | 'couponCount' | 'couponButtonText'>
  nav: Pick<
    DecorBlockBase,
    | 'navItems'
    | 'navActiveColor'
    | 'navInactiveColor'
    | 'floatingEnabled'
    | 'floatingOffsetX'
    | 'floatingOffsetY'
  >
}
