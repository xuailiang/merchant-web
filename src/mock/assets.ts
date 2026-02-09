export type AssetItem = {
  key: string
  name: string
  type: 'image' | 'video'
  folder: string
  size: number
  tags: string[]
  used: boolean
  updatedAt: string
  cover: string
  url: string
  resolution: string
  owner: string
  usage: string[]
}

export const ASSETS: AssetItem[] = [
  {
    key: 'a1',
    name: '首页轮播_春季上新',
    type: 'image',
    folder: '首页装修',
    size: 1.2,
    tags: ['轮播', '活动'],
    used: true,
    updatedAt: '2026-02-04 10:22',
    cover: 'https://picsum.photos/seed/asset1/400/300',
    url: 'https://picsum.photos/seed/asset1/1200/800',
    resolution: '1920x1080',
    owner: '运营专员',
    usage: ['店铺首页装修', '活动页Banner'],
  },
  {
    key: 'a2',
    name: '新品手机海报',
    type: 'image',
    folder: '商品素材',
    size: 0.8,
    tags: ['商品', '海报'],
    used: false,
    updatedAt: '2026-02-03 14:18',
    cover: 'https://picsum.photos/seed/asset2/400/300',
    url: 'https://picsum.photos/seed/asset2/1200/1600',
    resolution: '1200x1600',
    owner: '商品运营',
    usage: [],
  },
  {
    key: 'a3',
    name: '品牌故事视频',
    type: 'video',
    folder: '短视频',
    size: 28.6,
    tags: ['视频', '品牌'],
    used: true,
    updatedAt: '2026-02-01 09:30',
    cover: 'https://picsum.photos/seed/asset3/400/300',
    url: 'https://example.com/video/brand-story.mp4',
    resolution: '1080x1920',
    owner: '内容团队',
    usage: ['商品详情页', '活动页'],
  },
  {
    key: 'a4',
    name: '活动主视觉',
    type: 'image',
    folder: '活动素材',
    size: 1.5,
    tags: ['活动'],
    used: true,
    updatedAt: '2026-01-28 17:40',
    cover: 'https://picsum.photos/seed/asset4/400/300',
    url: 'https://picsum.photos/seed/asset4/1500/800',
    resolution: '1500x800',
    owner: '设计师',
    usage: ['优惠券页面'],
  },
  {
    key: 'a5',
    name: '店铺横幅',
    type: 'image',
    folder: '默认',
    size: 0.6,
    tags: ['装修'],
    used: false,
    updatedAt: '2026-01-26 12:22',
    cover: 'https://picsum.photos/seed/asset5/400/300',
    url: 'https://picsum.photos/seed/asset5/1280/720',
    resolution: '1280x720',
    owner: '运营专员',
    usage: [],
  },
  {
    key: 'a6',
    name: '手机测评视频',
    type: 'video',
    folder: '短视频',
    size: 32.1,
    tags: ['视频', '测评'],
    used: true,
    updatedAt: '2026-01-24 08:50',
    cover: 'https://picsum.photos/seed/asset6/400/300',
    url: 'https://example.com/video/review.mp4',
    resolution: '1920x1080',
    owner: '内容团队',
    usage: ['商品详情页'],
  },
]

export const getAssetFolders = () => Array.from(new Set(ASSETS.map((item) => item.folder)))
