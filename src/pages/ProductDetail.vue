<template>
  <div class="product-detail-page">
    <a-breadcrumb class="page-breadcrumb">
      <a-breadcrumb-item>首页</a-breadcrumb-item>
      <a-breadcrumb-item>商品管理</a-breadcrumb-item>
      <a-breadcrumb-item>商品列表</a-breadcrumb-item>
      <a-breadcrumb-item>商品详情</a-breadcrumb-item>
    </a-breadcrumb>

    <div class="pd-head">
      <div>
        <div class="page-title">商品详情</div>
        <div class="pd-subtitle">叙事化详情视图：快速判断商品健康度并定位可执行动作</div>
      </div>
      <a-space>
        <a-button @click="openSection('logs')">查看日志</a-button>
        <a-button type="primary" @click="goEdit">编辑商品</a-button>
      </a-space>
    </div>

    <ProductHero
      :product="product"
      :metrics="heroMetrics"
      @edit="goEdit"
      @copy="copyProductId"
      @toggle-status="toggleStatus"
    />

    <div class="pd-nav-sticky">
      <SectionNav :items="sections" :active-key="activeSection" @select="openSection" />
    </div>
    <div class="pd-mobile-nav">
      <a-button @click="mobileNavOpen = true">目录导航</a-button>
    </div>

    <a-drawer v-model:open="mobileNavOpen" title="目录导航" placement="left" width="240">
      <SectionNav vertical :items="sections" :active-key="activeSection" @select="onMobileSelect" />
    </a-drawer>

    <div class="pd-layout">
      <div class="pd-main">
        <a-card
          id="section-overview"
          class="pd-overview-card pd-fade-in"
          :body-style="{ padding: '14px' }"
        >
          <div class="pd-overview-grid">
            <div class="pd-overview-item">
              <div class="label">价格带</div>
              <div class="value">¥{{ heroMetrics.priceRange }}</div>
            </div>
            <div class="pd-overview-item">
              <div class="label">利润带</div>
              <div class="value good">{{ heroMetrics.profitRange }}</div>
            </div>
            <div class="pd-overview-item">
              <div class="label">素材完整度</div>
              <div class="value">{{ mediaCompleteness }}%</div>
            </div>
            <div class="pd-overview-item">
              <div class="label">健康分</div>
              <div class="value good">{{ heroMetrics.healthScore }}</div>
            </div>
            <div class="pd-overview-item">
              <div class="label">低库存 SKU</div>
              <div class="value warn">{{ lowStockSkuCount }}</div>
            </div>
            <div class="pd-overview-item">
              <div class="label">日志总量</div>
              <div class="value">{{ product.logs.length }}</div>
            </div>
          </div>
        </a-card>

        <a-card id="section-basic" title="基础信息" class="pd-section-card pd-fade-in">
          <div class="pd-info-grid">
            <div class="pd-info-group">
              <h4 class="pd-section-title">身份信息</h4>
              <a-descriptions :column="1" size="small">
                <a-descriptions-item label="商品编号"
                  ><span class="mono">{{ product.id }}</span></a-descriptions-item
                >
                <a-descriptions-item label="品牌">{{ product.brand }}</a-descriptions-item>
                <a-descriptions-item label="类目">{{ product.category }}</a-descriptions-item>
                <a-descriptions-item label="SPU"
                  ><span class="mono">{{ product.spu }}</span></a-descriptions-item
                >
              </a-descriptions>
            </div>
            <div class="pd-info-group">
              <h4 class="pd-section-title">供应链信息</h4>
              <a-descriptions :column="1" size="small">
                <a-descriptions-item label="供应商">{{ product.supplier }}</a-descriptions-item>
                <a-descriptions-item label="发货地">{{ product.origin }}</a-descriptions-item>
                <a-descriptions-item label="关键词">{{ product.keywords }}</a-descriptions-item>
              </a-descriptions>
            </div>
            <div class="pd-info-group">
              <h4 class="pd-section-title">时间信息</h4>
              <a-descriptions :column="1" size="small">
                <a-descriptions-item label="创建时间">{{ product.createdAt }}</a-descriptions-item>
                <a-descriptions-item label="更新时间">{{ product.updatedAt }}</a-descriptions-item>
                <a-descriptions-item label="上架状态">{{ product.status }}</a-descriptions-item>
              </a-descriptions>
            </div>
            <div class="pd-info-group">
              <h4 class="pd-section-title">日志分类统计</h4>
              <a-space wrap>
                <a-tag v-for="(count, key) in logCountByType" :key="key" color="blue"
                  >{{ key }} {{ count }}</a-tag
                >
              </a-space>
            </div>
          </div>
        </a-card>

        <MediaGallery :media="product.media" :highlighted-sku-image="hoveredSkuImage" />

        <SkuProfitTable
          :skus="product.skus"
          @hover-image="hoveredSkuImage = $event"
          @edit-sku="goEditSku"
        />

        <a-card id="section-desc" title="商品详情文案" class="pd-section-card pd-fade-in">
          <a-alert
            type="info"
            show-icon
            message="建议突出材质、规格、售后和安装说明，减少咨询成本"
          />
          <a-typography-paragraph class="pd-doc-paragraph">{{
            product.detail
          }}</a-typography-paragraph>
          <div class="pd-detail-tags">
            <a-tag color="geekblue">材质：剑麻+密度板</a-tag>
            <a-tag color="geekblue">适用猫型：小型/中大型</a-tag>
            <a-tag color="geekblue">安装方式：模块化组装</a-tag>
            <a-tag color="green">售后：7天无理由</a-tag>
          </div>
        </a-card>

        <a-card id="section-logistics" title="物流与服务" class="pd-section-card pd-fade-in">
          <a-descriptions :column="2" size="small">
            <a-descriptions-item label="运费模板">{{
              product.logistics.shipping
            }}</a-descriptions-item>
            <a-descriptions-item label="税码">{{ product.logistics.tax }}</a-descriptions-item>
            <a-descriptions-item label="汇率">{{ product.logistics.exchange }}</a-descriptions-item>
            <a-descriptions-item label="上架时间">{{
              product.logistics.publish
            }}</a-descriptions-item>
          </a-descriptions>
          <div class="pd-logistics-tags">
            <a-tag v-for="item in product.logistics.services" :key="item" color="blue">{{
              item
            }}</a-tag>
          </div>
        </a-card>
      </div>

      <div class="pd-side">
        <a-card class="pd-actions-card pd-fade-in">
          <template #title>运营建议</template>
          <ul class="pd-advice-list">
            <li>
              低库存 SKU <strong>{{ lowStockSkuCount }}</strong> 个，建议优先补货。
            </li>
            <li>
              素材完整度 <strong>{{ mediaCompleteness }}%</strong>，建议补充 1 条场景视频。
            </li>
            <li>退款率 {{ product.refundRate }}%，建议在详情中补充安装与清洁说明。</li>
          </ul>
        </a-card>
        <OperationTimeline :logs="product.logs" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import ProductHero from '../components/product-detail/ProductHero.vue'
import SectionNav from '../components/product-detail/SectionNav.vue'
import MediaGallery from '../components/product-detail/MediaGallery.vue'
import SkuProfitTable from '../components/product-detail/SkuProfitTable.vue'
import OperationTimeline from '../components/product-detail/OperationTimeline.vue'
import type { ProductDetailViewModel, ProductSkuItem, SectionKey } from '../types/productDetail'
import '../styles/product-detail.css'

const LOW_STOCK_THRESHOLD = 20

const route = useRoute()
const router = useRouter()

const product = ref<ProductDetailViewModel>({
  id: (route.params.id as string) ?? 'P-10021',
  name: '猫爬架四层大型豪华猫玩具',
  subtitle: '豪华加粗剑麻柱，稳固不晃，多层跳台',
  brand: '小鸭',
  category: '宠物生活 / 猫狗玩具 / 猫玩具',
  spu: 'SPU-889112',
  supplier: '济南三胖子牛羊肉修改0511有限公司',
  origin: '山东 济南',
  createdAt: '2025-10-12 14:32',
  updatedAt: '2026-01-30 16:04',
  keywords: '猫爬架,猫抓板,猫玩具',
  status: '上架中',
  tagList: ['主推', '直营'],
  stock: 268,
  monthSales: 1260,
  rating: 4.8,
  refundRate: 1.3,
  detail:
    '猫爬架四层大型豪华猫玩具，采用优质剑麻材质，耐磨耐抓。多层设计满足跳跃攀爬需求，顶部猫窝舒适透气，稳固底座防止倾倒。建议每周进行一次表面清洁，并定期检查连接件松动情况。',
  cover:
    'https://ceshimall.sdykt.com.cn/uploadfiles/img/goods/MT00000905/76a71e2c1bd244e2a655428660e69273.jpg',
  media: [
    {
      id: 'm1',
      type: 'image',
      name: '主图',
      url: 'https://ceshimall.sdykt.com.cn/uploadfiles/img/goods/MT00000905/76a71e2c1bd244e2a655428660e69273.jpg',
      isMain: true,
    },
    {
      id: 'm2',
      type: 'image',
      name: '细节图1',
      url: 'https://ceshimall.sdykt.com.cn/uploadfiles/img/goods/MT00000905/4d565337854d421296d705ca13aabf45.jpg',
    },
    {
      id: 'm3',
      type: 'image',
      name: '细节图2',
      url: 'https://ceshimall.sdykt.com.cn/uploadfiles/img/goods/MT00000905/d07b922db6ea46ab8402c5b619fb23e4.jpg',
    },
    {
      id: 'm4',
      type: 'video',
      name: '商品主图视频',
      url: '//ceshi2.sdykt.com.cn/etonmallio/video/MT00000905/2021/02/26/40e0cbeba1be4c278b4413623f11dc1d.mp4',
      cover: 'https://picsum.photos/id/237/400/240',
      duration: '00:42',
    },
    {
      id: 'm5',
      type: 'video',
      name: '商品详情视频',
      url: '//ceshi2.sdykt.com.cn/etonmallio/video/MT00000905/2021/02/26/ca1a16a9320b4efaa34d95f3f2c60fc6.mp4',
      cover: 'https://picsum.photos/id/169/400/240',
      duration: '00:58',
    },
  ],
  skus: [
    {
      id: 'sku-1',
      combo: '红色 / 200 / 大',
      image:
        'https://ceshimall.sdykt.com.cn/uploadfiles/img/goods/MT00000905/08500b1f4f164a4eb077933c54581d09.jpg',
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
      image:
        'https://ceshimall.sdykt.com.cn/uploadfiles/img/goods/MT00000905/e2c12453f6af422da92cab9ea07f3ccc.jpg',
      barcode: 'SKU-002',
      customCode: 'ZJ-002',
      price: 25,
      originalPrice: 32,
      cost: 16,
      stock: 17,
    },
    {
      id: 'sku-3',
      combo: '蓝色 / 100 / 小',
      image:
        'https://ceshimall.sdykt.com.cn/uploadfiles/img/goods/MT00000905/d9d5916dd9474542b289f019c538f794.jpg',
      barcode: 'SKU-003',
      customCode: 'ZJ-003',
      price: 23,
      originalPrice: 29,
      cost: 16,
      stock: 11,
    },
  ],
  logistics: {
    shipping: '指定地区运费设置',
    tax: '13% 增值税',
    exchange: '7.2',
    publish: '立即上架',
    services: ['7天无理由退换', '正品保障', '全国联保'],
  },
  logs: [
    {
      id: 'log-1',
      user: '管理员',
      action: '修改售价',
      time: '2026-02-27 10:16:22',
      detail: 'SKU 红色/200/大 售价从 ¥26 调整为 ¥28',
      category: '价格',
    },
    {
      id: 'log-2',
      user: '运营专员',
      action: '补充素材',
      time: '2026-02-26 17:04:10',
      detail: '上传详情视频并设置封面图',
      category: '素材',
    },
    {
      id: 'log-3',
      user: '仓管-王宁',
      action: '库存调整',
      time: '2026-02-25 14:20:09',
      detail: 'SKU 蓝色/100/小 库存 +20',
      category: '库存',
    },
    {
      id: 'log-4',
      user: '管理员',
      action: '上架商品',
      time: '2026-02-21 09:11:00',
      detail: '商品状态从草稿改为上架中',
      category: '上架',
    },
  ],
})

const calcProfit = (record: ProductSkuItem) => record.price - record.cost
const calcProfitRate = (record: ProductSkuItem) =>
  record.price ? calcProfit(record) / record.price : 0

const heroMetrics = computed(() => {
  const prices = product.value.skus.map((item) => item.price)
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  const rates = product.value.skus.map((item) => calcProfitRate(item) * 100)
  const minRate = Math.min(...rates)
  const maxRate = Math.max(...rates)
  const healthScore = Math.max(
    60,
    Math.min(
      99,
      Math.round(
        100 -
          product.value.refundRate * 8 -
          lowStockSkuCount.value * 3 +
          product.value.rating * 4 +
          mediaCompleteness.value / 10
      )
    )
  )
  return {
    priceRange: `${minPrice} - ${maxPrice}`,
    profitRange: `${minRate.toFixed(1)}% - ${maxRate.toFixed(1)}%`,
    healthScore,
  }
})

const lowStockSkuCount = computed(
  () => product.value.skus.filter((item) => item.stock <= LOW_STOCK_THRESHOLD).length
)

const mediaCompleteness = computed(() => {
  const imageCount = product.value.media.filter((item) => item.type === 'image').length
  const videoCount = product.value.media.filter((item) => item.type === 'video').length
  const imageScore = Math.min(70, (imageCount / 6) * 70)
  const videoScore = Math.min(30, (videoCount / 2) * 30)
  return Math.round(imageScore + videoScore)
})

const logCountByType = computed(() => {
  return product.value.logs.reduce<Record<string, number>>((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1
    return acc
  }, {})
})

const sections: Array<{ key: SectionKey; label: string }> = [
  { key: 'overview', label: '商品概览' },
  { key: 'basic', label: '基础信息' },
  { key: 'media', label: '媒体素材' },
  { key: 'sku', label: 'SKU 与利润' },
  { key: 'desc', label: '商品详情文案' },
  { key: 'logistics', label: '物流与服务' },
  { key: 'logs', label: '操作日志' },
]

const activeSection = ref<SectionKey>('overview')
const mobileNavOpen = ref(false)
const hoveredSkuImage = ref('')

const openSection = (key: SectionKey) => {
  const el = document.getElementById(`section-${key}`)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    activeSection.value = key
  }
}

const onMobileSelect = (key: SectionKey) => {
  mobileNavOpen.value = false
  openSection(key)
}

const syncActiveSection = () => {
  const offset = 132
  const current = sections.find((section) => {
    const el = document.getElementById(`section-${section.key}`)
    if (!el) return false
    const rect = el.getBoundingClientRect()
    return rect.top - offset <= 20 && rect.bottom - offset >= 20
  })
  if (current) activeSection.value = current.key
}

onMounted(() => {
  window.addEventListener('scroll', syncActiveSection, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', syncActiveSection)
})

const goEdit = () => {
  router.push('/products/create')
}

const goEditSku = (_skuId: string) => {
  router.push('/products/create')
}

const copyProductId = async () => {
  try {
    await navigator.clipboard.writeText(product.value.id)
    message.success('商品编号已复制')
  } catch {
    message.warning('复制失败，请手动复制')
  }
}

const toggleStatus = () => {
  product.value.status = product.value.status === '上架中' ? '已下架' : '上架中'
  message.success(`商品已${product.value.status === '上架中' ? '上架' : '下架'}`)
}
</script>
