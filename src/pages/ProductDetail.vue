<template>
  <div>
    <a-breadcrumb class="page-breadcrumb">
      <a-breadcrumb-item>首页</a-breadcrumb-item>
      <a-breadcrumb-item>商品管理</a-breadcrumb-item>
      <a-breadcrumb-item>商品列表</a-breadcrumb-item>
      <a-breadcrumb-item>商品详情</a-breadcrumb-item>
    </a-breadcrumb>

    <div class="page-head">
      <div>
        <div class="page-title">商品详情</div>
        <div class="page-subtitle">查看商品的基础信息、规格与库存、物流服务等内容</div>
      </div>
      <a-space>
        <a-button>复制商品</a-button>
        <a-button type="primary">编辑商品</a-button>
      </a-space>
    </div>

    <a-row :gutter="24">
      <a-col :xs="24" :lg="16">
        <div class="masonry">
          <a-card class="masonry-card masonry-full overview-card">
            <div class="overview">
              <div class="overview-media">
                <a-image :src="product.cover" :width="220" :height="220" class="cover-image" />
              </div>
              <div class="overview-content">
                <div class="overview-title">
                  <span>{{ product.name }}</span>
                  <div class="overview-tags">
                    <a-tag color="green">上架中</a-tag>
                    <a-tag color="blue">主推</a-tag>
                    <a-tag color="purple">直营</a-tag>
                  </div>
                </div>
                <div class="overview-subtitle">{{ product.subtitle }}</div>
                <div class="overview-meta">
                  <span class="meta-item">商品编号：<strong class="mono">{{ product.id }}</strong></span>
                  <span class="meta-item">品牌：<strong>{{ product.brand }}</strong></span>
                  <span class="meta-item">类目：<strong>{{ product.category }}</strong></span>
                </div>
                <div class="overview-stats">
                  <a-statistic title="售价" :value="skus[0].price" prefix="¥" />
                  <a-statistic title="库存" :value="product.stock" />
                  <a-statistic title="月销量" :value="product.monthSales" />
                  <a-statistic title="评分" :value="product.rating" suffix="/5" />
                  <a-statistic title="退款率" :value="product.refundRate" suffix="%" />
                </div>
              </div>
            </div>
          </a-card>

          <a-card title="基础信息" class="masonry-card">
            <a-descriptions :column="2" class="basic-desc">
              <a-descriptions-item label="商品编号">
                <span class="mono">{{ product.id }}</span>
              </a-descriptions-item>
              <a-descriptions-item label="品牌">{{ product.brand }}</a-descriptions-item>
              <a-descriptions-item label="类目">{{ product.category }}</a-descriptions-item>
              <a-descriptions-item label="SPU">
                <span class="mono">{{ product.spu }}</span>
              </a-descriptions-item>
              <a-descriptions-item label="供应商">{{ product.supplier }}</a-descriptions-item>
              <a-descriptions-item label="发货地">{{ product.origin }}</a-descriptions-item>
              <a-descriptions-item label="创建时间">{{ product.createdAt }}</a-descriptions-item>
              <a-descriptions-item label="更新时间">{{ product.updatedAt }}</a-descriptions-item>
              <a-descriptions-item label="关键词" :span="2">{{ product.keywords }}</a-descriptions-item>
            </a-descriptions>
          </a-card>

          <a-card title="媒体素材" class="masonry-card media-card">
            <div class="media-images">
              <a-image-preview-group>
                <div class="media-grid">
                  <div v-for="(img, index) in product.images" :key="img" class="media-item">
                    <a-image :src="img" :width="120" :height="120" />
                    <a-tag v-if="index === 0" color="blue" class="media-main">主图</a-tag>
                  </div>
                </div>
              </a-image-preview-group>
            </div>
            <div class="media-divider"></div>
            <div class="media-videos">
              <div class="media-video" v-for="video in product.videos" :key="video.url">
                <div class="media-video-thumb">
                  <img :src="video.cover" alt="视频封面" />
                  <div class="media-video-badge">视频</div>
                </div>
                <div class="media-video-info">
                  <div class="media-video-title">{{ video.name }}</div>
                  <div class="media-video-sub">{{ video.url }}</div>
                </div>
              </div>
            </div>
          </a-card>

          <a-card title="规格与SKU" class="masonry-card masonry-full">
            <div class="sku-summary">
              <div class="sku-summary-item">
                <div class="sku-summary-label">SKU数量</div>
                <div class="sku-summary-value">{{ skuCount }}</div>
              </div>
              <div class="sku-summary-item">
                <div class="sku-summary-label">总库存</div>
                <div class="sku-summary-value">{{ totalSkuStock }}</div>
              </div>
              <div class="sku-summary-item">
                <div class="sku-summary-label">最低价</div>
                <div class="sku-summary-value price">¥{{ minPrice }}</div>
              </div>
              <div class="sku-summary-item">
                <div class="sku-summary-label">最高价</div>
                <div class="sku-summary-value price">¥{{ maxPrice }}</div>
              </div>
              <div class="sku-summary-item">
                <div class="sku-summary-label">平均利润率</div>
                <div class="sku-summary-value">{{ avgProfitRate }}%</div>
              </div>
            </div>
            <div class="spec-row">
              <div class="spec-label">规格</div>
              <div class="spec-tags">
                <a-tag v-for="tag in specs.size" :key="tag" color="blue">{{ tag }}</a-tag>
              </div>
            </div>
            <div class="spec-row">
              <div class="spec-label">颜色</div>
              <div class="spec-tags">
                <a-tag v-for="tag in specs.color" :key="tag" color="blue">{{ tag }}</a-tag>
              </div>
            </div>
            <div class="spec-row">
              <div class="spec-label">属性</div>
              <div class="spec-tags">
                <a-tag v-for="tag in specs.attr" :key="tag" color="blue">{{ tag }}</a-tag>
              </div>
            </div>

            <a-table :columns="skuColumns" :data-source="skus" :pagination="false" row-key="id" :scroll="{ x: 980 }">
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'image'">
                  <a-image :src="record.image" :width="48" :height="48" class="sku-image" />
                </template>
                <template v-else-if="column.key === 'price'">
                  <span class="price-highlight">¥{{ record.price }}</span>
                </template>
                <template v-else-if="column.key === 'originalPrice'">
                  <span class="origin-price">¥{{ record.originalPrice }}</span>
                </template>
                <template v-else-if="column.key === 'profit'">
                  <div class="profit-cell">
                    <span class="profit-value">¥{{ calcProfit(record).toFixed(2) }}</span>
                    <a-tag :color="calcProfitRate(record) >= 0.3 ? 'green' : 'orange'">
                      {{ (calcProfitRate(record) * 100).toFixed(1) }}%
                    </a-tag>
                  </div>
                </template>
              </template>
            </a-table>
          </a-card>

          <a-card title="商品详情" class="masonry-card">
            <a-alert
              type="info"
              show-icon
              message="建议在详情中突出材质、使用说明与售后保障，提升转化率"
              class="detail-tip"
            />
            <a-typography-paragraph class="detail-text">{{ product.detail }}</a-typography-paragraph>
          </a-card>

          <a-card title="物流与服务" class="masonry-card">
            <a-descriptions :column="2">
              <a-descriptions-item label="运费模板">{{ logistics.shipping }}</a-descriptions-item>
              <a-descriptions-item label="税码">{{ logistics.tax }}</a-descriptions-item>
              <a-descriptions-item label="汇率">{{ logistics.exchange }}</a-descriptions-item>
              <a-descriptions-item label="上架时间">{{ logistics.publish }}</a-descriptions-item>
              <a-descriptions-item label="服务保障" :span="2">
                <a-tag v-for="item in logistics.services" :key="item" color="blue">{{ item }}</a-tag>
              </a-descriptions-item>
            </a-descriptions>
          </a-card>
        </div>
      </a-col>

      <a-col :xs="24" :lg="8">
        <div class="side-stack">
          <a-card title="操作日志" class="log-card">
            <a-list :data-source="logs">
              <template #renderItem="{ item }">
                <a-list-item>
                  <a-list-item-meta :title="item.action" :description="item.detail" />
                  <div class="log-meta">
                    <span>{{ item.user }}</span>
                    <span>{{ item.time }}</span>
                  </div>
                </a-list-item>
              </template>
            </a-list>
          </a-card>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const product = {
  id: (route.params.id as string) ?? 'P-10021',
  name: '猫爬架四层大型豪华猫玩具',
  subtitle: '豪华加粗剑麻柱，稳固不晃，多层跳台',
  brand: '小鸭',
  category: '宠物生活 / 猫狗玩具 / 猫玩具',
  price: '¥28.00',
  stock: 268,
  monthSales: 1260,
  rating: 4.8,
  refundRate: 1.3,
  spu: 'SPU-889112',
  supplier: '济南三胖子牛羊肉修改0511有限公司',
  origin: '山东 济南',
  createdAt: '2025-10-12 14:32',
  updatedAt: '2026-01-30 16:04',
  keywords: '猫爬架,猫抓板,猫玩具',
  cover: 'https://ceshimall.sdykt.com.cn/uploadfiles/img/goods/MT00000905/76a71e2c1bd244e2a655428660e69273.jpg',
  images: [
    'https://ceshimall.sdykt.com.cn/uploadfiles/img/goods/MT00000905/76a71e2c1bd244e2a655428660e69273.jpg',
    'https://ceshimall.sdykt.com.cn/uploadfiles/img/goods/MT00000905/4d565337854d421296d705ca13aabf45.jpg',
    'https://ceshimall.sdykt.com.cn/uploadfiles/img/goods/MT00000905/d07b922db6ea46ab8402c5b619fb23e4.jpg',
  ],
  videos: [
    {
      name: '商品主图视频',
      cover: 'https://picsum.photos/id/237/400/240',
      url: '//ceshi2.sdykt.com.cn/etonmallio/video/MT00000905/2021/02/26/40e0cbeba1be4c278b4413623f11dc1d.mp4',
    },
    {
      name: '商品详情视频',
      cover: 'https://picsum.photos/id/169/400/240',
      url: '//ceshi2.sdykt.com.cn/etonmallio/video/MT00000905/2021/02/26/ca1a16a9320b4efaa34d95f3f2c60fc6.mp4',
    },
  ],
  detail:
    '猫爬架四层大型豪华猫玩具，采用优质剑麻材质，耐磨耐抓。多层设计满足跳跃攀爬需求，顶部猫窝舒适透气。',
}

const specs = {
  size: ['100', '200'],
  color: ['红色', '蓝色'],
  attr: ['大', '小'],
}

const skus = [
  {
    id: 'sku-1',
    combo: '红色 / 200 / 大',
    image: 'https://ceshimall.sdykt.com.cn/uploadfiles/img/goods/MT00000905/08500b1f4f164a4eb077933c54581d09.jpg',
    barcode: 'SKU-001',
    customCode: 'ZJ-001',
    price: 28,
    originalPrice: 37,
    cost: 18,
    stock: 120,
  },
  {
    id: 'sku-2',
    combo: '红色 / 200 / 小',
    image: 'https://ceshimall.sdykt.com.cn/uploadfiles/img/goods/MT00000905/e2c12453f6af422da92cab9ea07f3ccc.jpg',
    barcode: 'SKU-002',
    customCode: 'ZJ-002',
    price: 25,
    originalPrice: 32,
    cost: 16,
    stock: 90,
  },
]

const skuColumns = [
  { title: '图片', dataIndex: 'image', key: 'image' },
  { title: '规格组合', dataIndex: 'combo', key: 'combo' },
  { title: '条形码', dataIndex: 'barcode', key: 'barcode' },
  { title: '自建码', dataIndex: 'customCode', key: 'customCode' },
  { title: '售价', dataIndex: 'price', key: 'price' },
  { title: '原价', dataIndex: 'originalPrice', key: 'originalPrice' },
  { title: '成本价', dataIndex: 'cost', key: 'cost' },
  { title: '库存', dataIndex: 'stock', key: 'stock' },
  { title: '利润/利润率', key: 'profit', dataIndex: 'profit' },
]

const calcProfit = (record: { price: number; cost: number }) => record.price - record.cost
const calcProfitRate = (record: { price: number; cost: number }) => {
  if (!record.price) return 0
  return calcProfit(record) / record.price
}

const skuCount = computed(() => skus.length)
const totalSkuStock = computed(() => skus.reduce((sum, item) => sum + item.stock, 0))
const minPrice = computed(() => Math.min(...skus.map((item) => item.price)))
const maxPrice = computed(() => Math.max(...skus.map((item) => item.price)))
const avgProfitRate = computed(() => {
  if (!skus.length) return 0
  const rate = skus.reduce((sum, item) => sum + calcProfitRate(item), 0) / skus.length
  return Number((rate * 100).toFixed(1))
})

const logistics = {
  shipping: '指定地区运费设置',
  tax: '13% 增值税',
  exchange: '7.2',
  publish: '立即上架',
  services: ['7天无理由退换', '正品保障', '全国联保'],
}

const logs = [
  {
    id: 'log-1',
    user: '管理员',
    action: '编辑商品',
    time: '2025-12-25 14:30:22',
    detail: '修改了商品价格，将售价从25元调整为28元',
  },
  {
    id: 'log-2',
    user: '运营专员',
    action: '上传图片',
    time: '2025-12-24 09:15:45',
    detail: '上传了4张商品图片，设置第一张为主图',
  },
]
</script>

<style scoped>
.page-breadcrumb {
  margin-bottom: 8px;
}

.page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.page-subtitle {
  color: var(--text-secondary);
}

.masonry {
  column-count: 2;
  column-gap: 16px;
}

.masonry-card {
  break-inside: avoid;
  margin-bottom: 16px;
}

.masonry-full {
  column-span: all;
}

.cover-image :deep(img) {
  border-radius: 12px;
}

.overview-card :deep(.ant-card-body) {
  padding: 18px;
}

.overview {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 20px;
  align-items: start;
}

.overview-media {
  display: flex;
  flex-direction: column;
  gap: 12px;
}


.overview-title {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  font-weight: 700;
  font-size: 18px;
  color: var(--text-primary);
}

.overview-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.overview-subtitle {
  color: var(--text-secondary);
  margin-top: 6px;
}

.overview-meta {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-top: 10px;
  color: var(--text-secondary);
  font-size: 12px;
}

.meta-item strong {
  color: var(--text-primary);
  font-weight: 600;
}

.overview-stats {
  margin-top: 14px;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
}

.overview-stats :deep(.ant-statistic-title) {
  font-size: 12px;
  color: var(--text-secondary);
}

.overview-stats :deep(.ant-statistic-content) {
  font-size: 16px;
  font-weight: 600;
}

.status-badges {
  margin-top: 8px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.basic-desc :deep(.ant-descriptions-item-label) {
  color: var(--text-secondary);
  font-size: 12px;
}

.basic-desc :deep(.ant-descriptions-item-content) {
  font-weight: 600;
  color: var(--text-primary);
}

.media-images {
  margin-bottom: 6px;
}

.media-card :deep(.ant-card-body) {
  min-height: 238px;
  display: flex;
  flex-direction: column;
  padding: 16px;
}

.media-divider {
  height: 1px;
  background: var(--border-color);
  margin: 6px 0;
}

.media-videos {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin-top: auto;
}

.media-video {
  display: flex;
  gap: 10px;
  padding: 8px;
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: #fff;
  align-items: center;
}

.media-video-thumb {
  width: 76px;
  height: 56px;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  background: #e2e8f0;
  flex-shrink: 0;
}

.media-video-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.media-video-badge {
  position: absolute;
  bottom: 6px;
  right: 6px;
  background: rgba(15, 23, 42, 0.75);
  color: #fff;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 10px;
}

.media-video-title {
  font-weight: 600;
  font-size: 13px;
  color: var(--text-primary);
}

.media-video-sub {
  color: var(--text-secondary);
  font-size: 11px;
  margin-top: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 180px;
}

.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 8px;
}

.media-item {
  position: relative;
}

.media-main {
  position: absolute;
  top: 8px;
  left: 8px;
}

.mono {
  font-family: ui-monospace, SFMono-Regular, SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace;
}

.spec-row {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
}

.spec-label {
  width: 60px;
  color: var(--text-secondary);
}

.spec-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.price-highlight {
  color: #1f6feb;
  font-weight: 600;
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

.sku-summary {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
  background: linear-gradient(180deg, #f8fafc, #eef2ff);
  border: 1px solid rgba(99, 102, 241, 0.2);
  margin-bottom: 12px;
}

.sku-summary-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sku-summary-label {
  color: var(--text-secondary);
  font-size: 12px;
}

.sku-summary-value {
  font-weight: 700;
  font-size: 16px;
  color: var(--text-primary);
}

.sku-summary-value.price {
  color: #ef4444;
}

.detail-tip {
  margin-bottom: 12px;
}

.detail-text {
  color: var(--text-secondary);
}

.side-stack {
  width: 100%;
  position: sticky;
  top: 88px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.log-card :deep(.ant-card-body) {
  padding: 0 12px 12px;
}

.sku-image :deep(img) {
  border-radius: 8px;
}

.origin-price {
  color: var(--text-secondary);
  text-decoration: line-through;
  font-size: 12px;
}

.log-card :deep(.ant-list-item) {
  padding: 12px 0;
}

.log-card :deep(.ant-list-item-meta-title) {
  font-weight: 600;
  font-size: 13px;
}

.log-card :deep(.ant-list-item-meta-description) {
  font-size: 12px;
  color: var(--text-secondary);
}

.log-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: var(--text-secondary);
}

@media (max-width: 992px) {
  .masonry {
    column-count: 1;
  }

  .overview {
    grid-template-columns: 1fr;
  }

  .overview-stats,
  .sku-summary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .media-videos {
    grid-template-columns: 1fr;
  }

  .side-stack {
    position: static;
  }
}
</style>
