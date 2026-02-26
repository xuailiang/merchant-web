<template>
  <div>
    <div class="page-title">品牌管理</div>

    <a-row :gutter="16" class="card-section">
      <a-col :xs="24" :lg="6">
        <a-card class="stat-card">
          <div class="stat-title">品牌总数</div>
          <div class="stat-value">{{ brands.length }}</div>
          <div class="stat-meta">覆盖类目 {{ categoryCount }} 个</div>
        </a-card>
      </a-col>
      <a-col :xs="24" :lg="6">
        <a-card class="stat-card">
          <div class="stat-title">可用品牌</div>
          <div class="stat-value">{{ brands.filter((b) => b.status === '可用').length }}</div>
          <div class="stat-meta">近7天新增 {{ recentNew }}</div>
        </a-card>
      </a-col>
      <a-col :xs="24" :lg="6">
        <a-card class="stat-card">
          <div class="stat-title">待审核</div>
          <div class="stat-value">{{ brands.filter((b) => b.status === '待审核').length }}</div>
          <div class="stat-meta">授权到期提醒 {{ expiringSoon }}</div>
        </a-card>
      </a-col>
      <a-col :xs="24" :lg="6">
        <a-card class="stat-card">
          <div class="stat-title">品牌商品</div>
          <div class="stat-value">{{ totalProducts }}</div>
          <div class="stat-meta">平均每品牌 {{ avgProducts }} 件</div>
        </a-card>
      </a-col>
    </a-row>

    <a-card class="card-section">
      <a-form layout="inline" class="filter-bar">
        <a-form-item label="品牌名称">
          <a-input v-model:value="filters.name" placeholder="请输入品牌名称" allow-clear />
        </a-form-item>
        <a-form-item label="品牌状态">
          <a-select
            v-model:value="filters.status"
            :options="statusOptions"
            allow-clear
            placeholder="请选择"
            style="min-width: 160px"
            :get-popup-container="getPopupContainer"
          />
        </a-form-item>
        <a-form-item label="关联分类">
          <a-select
            v-model:value="filters.category"
            :options="categoryOptions"
            allow-clear
            placeholder="请选择"
            style="min-width: 180px"
            :get-popup-container="getPopupContainer"
          />
        </a-form-item>
        <a-form-item label="排序规则">
          <a-select
            v-model:value="filters.sort"
            :options="sortOptions"
            placeholder="授权日期从近到远"
            style="min-width: 200px"
            :get-popup-container="getPopupContainer"
          />
        </a-form-item>
        <a-space>
          <a-button type="primary">查询</a-button>
          <a-button @click="resetFilters">重置</a-button>
        </a-space>
      </a-form>

      <div class="actions-row">
        <a-button v-if="hasPermission('brands:create')" type="primary" @click="openAdd">新增品牌</a-button>
        <a-button type="dashed">导出</a-button>
      </div>

      <a-table
        :columns="columns"
        :data-source="filteredBrands"
        :pagination="{ pageSize: 8 }"
        :scroll="{ x: 1200 }"
        class="brands-table"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'brand'">
            <div class="brand-cell">
              <img :src="record.logo" alt="logo" class="brand-logo" />
              <div>
                <div class="brand-name">{{ record.nameCn }}</div>
                <div class="brand-meta">{{ record.nameEn }}</div>
                <div class="brand-meta">商标号：{{ record.regNo }}</div>
              </div>
            </div>
          </template>
          <template v-else-if="column.key === 'category'">
            <a-tag v-for="cat in record.categories" :key="cat" color="blue" class="brand-tag">{{ cat }}</a-tag>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="statusColor(record.status)">{{ record.status }}</a-tag>
          </template>
          <template v-else-if="column.key === 'auth'">
            <div class="brand-meta">授权方：{{ record.owner }}</div>
            <div class="brand-meta">有效期至 {{ record.authExpire }}</div>
          </template>
          <template v-else-if="column.key === 'products'">
            <div class="brand-value">{{ record.products }}</div>
            <div class="brand-meta">近30天上新 {{ record.newProducts }}</div>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button v-if="hasPermission('brands:view')" type="link" @click="openDetail(record)">查看详情</a-button>
              <a-button v-if="hasPermission('brands:edit')" type="link" @click="openEdit(record)">编辑</a-button>
              <a-button v-if="hasPermission('brands:disable')" type="link" @click="toggleStatus(record)">
                {{ record.status === '可用' ? '停用' : '启用' }}
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <a-modal v-model:open="formOpen" :title="formMode === 'add' ? '新增品牌' : '编辑品牌'" width="860px" :footer="null">
      <a-form layout="vertical" class="brand-form">
        <div class="form-section">
          <div class="section-title">商标信息</div>
          <a-row :gutter="16">
            <a-col :xs="24" :md="16">
              <a-form-item label="注册号" required>
                <a-input v-model:value="form.regNo" placeholder="请输入商标注册号" />
              </a-form-item>
            </a-col>
            <a-col :xs="24" :md="8">
              <a-form-item label="查询" required>
                <a-button block>查询</a-button>
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="16">
            <a-col :xs="24" :md="12">
              <a-form-item label="商标名称" required>
                <a-input v-model:value="form.trademarkName" placeholder="请填写商标名称" />
              </a-form-item>
            </a-col>
            <a-col :xs="24" :md="12">
              <a-form-item label="商标持有人" required>
                <a-input v-model:value="form.owner" placeholder="请填写商标持有人" />
              </a-form-item>
            </a-col>
          </a-row>
          <a-form-item label="商标文件" required>
            <a-upload
              list-type="picture-card"
              :file-list="form.trademarkFiles"
              :before-upload="preventUpload"
              @remove="(file: any) => onRemoveFile(file, 'trademarkFiles')"
            >
              <div class="upload-card">
                <div class="upload-plus">+</div>
                <div>上传文件</div>
              </div>
            </a-upload>
            <div class="upload-tip">支持 jpg/png，单张大小不超过 2MB。</div>
          </a-form-item>
        </div>

        <div class="form-section">
          <div class="section-title">品牌信息</div>
          <a-row :gutter="16">
            <a-col :xs="24" :md="12">
              <a-form-item label="品牌中文名" required>
                <a-input v-model:value="form.nameCn" placeholder="请输入中文名称" />
              </a-form-item>
            </a-col>
            <a-col :xs="24" :md="12">
              <a-form-item label="品牌英文名" required>
                <a-input v-model:value="form.nameEn" placeholder="请输入英文名称" />
              </a-form-item>
            </a-col>
            <a-col :xs="24" :md="12">
              <a-form-item label="品牌Logo" required>
                <a-upload
                  list-type="picture-card"
                  :file-list="form.logoFiles"
                  :before-upload="preventUpload"
                  @remove="(file: any) => onRemoveFile(file, 'logoFiles')"
                >
                  <div class="upload-card">
                    <div class="upload-plus">+</div>
                    <div>上传Logo</div>
                  </div>
                </a-upload>
              </a-form-item>
            </a-col>
            <a-col :xs="24" :md="12">
              <a-form-item label="关联分类" required>
                <a-select
                  v-model:value="form.categories"
                  mode="multiple"
                  :options="categoryOptions"
                  placeholder="请选择授权类目"
                  :get-popup-container="getPopupContainer"
                />
              </a-form-item>
            </a-col>
          </a-row>
        </div>

        <div class="form-section">
          <div class="section-title">品牌授权信息</div>
          <a-row :gutter="16">
            <a-col :xs="24" :md="12">
              <a-form-item label="是否品牌方" required>
                <a-radio-group v-model:value="form.isOwner">
                  <a-radio :value="true">是，商标权人为开店公司或法人</a-radio>
                  <a-radio :value="false">否，需要上传品牌方授权证明</a-radio>
                </a-radio-group>
              </a-form-item>
            </a-col>
            <a-col :xs="24" :md="12">
              <a-form-item label="授权有效期" required>
                <a-date-picker v-model:value="form.authExpire" style="width: 100%" />
              </a-form-item>
            </a-col>
          </a-row>
          <a-form-item label="品牌授权书" required>
            <a-upload
              list-type="picture-card"
              :file-list="form.authFiles"
              :before-upload="preventUpload"
              @remove="(file: any) => onRemoveFile(file, 'authFiles')"
            >
              <div class="upload-card">
                <div class="upload-plus">+</div>
                <div>上传授权</div>
              </div>
            </a-upload>
            <div class="upload-tip">授权书图片上限 10 张，建议使用扫描件。</div>
          </a-form-item>
        </div>

        <div class="form-actions">
          <a-button @click="formOpen = false">取消</a-button>
          <a-button type="primary" @click="submitForm">提交审核</a-button>
        </div>
      </a-form>
    </a-modal>

    <a-drawer v-model:open="detailOpen" title="品牌详情" width="720" :destroy-on-close="true">
      <template v-if="currentBrand">
        <a-card class="detail-card">
          <div class="detail-header">
            <img :src="currentBrand.logo" alt="logo" />
            <div>
              <div class="detail-title">{{ currentBrand.nameCn }}</div>
              <div class="detail-sub">{{ currentBrand.nameEn }}</div>
              <a-tag :color="statusColor(currentBrand.status)">{{ currentBrand.status }}</a-tag>
            </div>
          </div>
        </a-card>

        <a-card class="detail-card" title="商标信息">
          <a-descriptions :column="2" size="small">
            <a-descriptions-item label="注册号">{{ currentBrand.regNo }}</a-descriptions-item>
            <a-descriptions-item label="商标名称">{{ currentBrand.trademarkName }}</a-descriptions-item>
            <a-descriptions-item label="商标持有人">{{ currentBrand.owner }}</a-descriptions-item>
            <a-descriptions-item label="授权有效期">{{ currentBrand.authExpire }}</a-descriptions-item>
          </a-descriptions>
        </a-card>

        <a-card class="detail-card" title="品牌信息">
          <a-descriptions :column="2" size="small">
            <a-descriptions-item label="关联分类">{{ currentBrand.categories.join(' / ') }}</a-descriptions-item>
            <a-descriptions-item label="品牌国家">{{ currentBrand.country }}</a-descriptions-item>
            <a-descriptions-item label="品牌商品数">{{ currentBrand.products }}</a-descriptions-item>
            <a-descriptions-item label="近30天上新">{{ currentBrand.newProducts }}</a-descriptions-item>
          </a-descriptions>
        </a-card>

        <a-card class="detail-card" title="授权文件">
          <a-space wrap>
            <a-tag v-for="file in currentBrand.authFiles" :key="file" color="blue">{{ file }}</a-tag>
          </a-space>
        </a-card>

        <a-card class="detail-card" title="操作日志">
          <a-timeline>
            <a-timeline-item color="blue">
              <div class="log-title">运营人员【15634112533】审核通过了品牌新增申请。</div>
              <div class="log-meta">操作人：15634112533 · 2026-01-07 13:55:37</div>
            </a-timeline-item>
            <a-timeline-item color="blue">
              <div class="log-title">
                商户【Carlos】提交了品牌入驻申请，品牌名称：{{ currentBrand.nameCn }} / {{ currentBrand.nameEn }}
              </div>
              <div class="log-meta">操作人：Carlos · 2026-01-07 13:53:41</div>
            </a-timeline-item>
          </a-timeline>
        </a-card>
      </template>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import dayjs from 'dayjs'
import { message } from 'ant-design-vue'
import { hasPermission } from '../utils/permissions'

type BrandItem = {
  key: string
  nameCn: string
  nameEn: string
  logo: string
  categories: string[]
  status: string
  authExpire: string
  updatedAt: string
  products: number
  newProducts: number
  country: string
  owner: string
  regNo: string
  trademarkName: string
  authFiles: string[]
}

const brands = ref<BrandItem[]>([
  {
    key: 'b1',
    nameCn: '亮牌',
    nameEn: 'L&P',
    logo: 'https://picsum.photos/seed/brand1/80/80',
    categories: ['创意配件', '无线音箱', '手机饰品'],
    status: '可用',
    authExpire: '2027-02-18',
    updatedAt: '2026-01-07 13:55:37',
    products: 42,
    newProducts: 6,
    country: '中国',
    owner: '山东京宝淘东有限公司',
    regNo: 'TM-2023-98121',
    trademarkName: '亮牌',
    authFiles: ['brand_auth_01.jpg', 'brand_auth_02.jpg'],
  },
  {
    key: 'b2',
    nameCn: 'Aurora',
    nameEn: 'Aurora Audio',
    logo: 'https://picsum.photos/seed/brand2/80/80',
    categories: ['数码/耳机', '数码/音频'],
    status: '待审核',
    authExpire: '2026-08-12',
    updatedAt: '2026-02-02 10:22:10',
    products: 18,
    newProducts: 2,
    country: '美国',
    owner: 'Aurora Labs',
    regNo: 'US-882910',
    trademarkName: 'Aurora',
    authFiles: ['aurora_auth.pdf'],
  },
  {
    key: 'b3',
    nameCn: 'Nebula',
    nameEn: 'Nebula Gear',
    logo: 'https://picsum.photos/seed/brand3/80/80',
    categories: ['数码/外设', '数码/穿戴'],
    status: '停用',
    authExpire: '2026-05-30',
    updatedAt: '2026-01-29 09:18:20',
    products: 27,
    newProducts: 1,
    country: '德国',
    owner: 'Nebula GmbH',
    regNo: 'DE-778112',
    trademarkName: 'Nebula',
    authFiles: ['nebula_auth.jpg'],
  },
])

const filters = reactive({
  name: '',
  status: '',
  category: '',
  sort: 'authDesc',
})

const statusOptions = [
  { label: '可用', value: '可用' },
  { label: '停用', value: '停用' },
  { label: '待审核', value: '待审核' },
]

const categoryOptions = [
  { label: '创意配件', value: '创意配件' },
  { label: '无线音箱', value: '无线音箱' },
  { label: '手机饰品', value: '手机饰品' },
  { label: '数码/耳机', value: '数码/耳机' },
  { label: '数码/音频', value: '数码/音频' },
  { label: '数码/外设', value: '数码/外设' },
  { label: '数码/穿戴', value: '数码/穿戴' },
]

const sortOptions = [
  { label: '授权日期从近到远', value: 'authDesc' },
  { label: '授权日期从远到近', value: 'authAsc' },
  { label: '商品数量从高到低', value: 'productDesc' },
]

const filteredBrands = computed(() => {
  const nameMatch = (item: BrandItem) => !filters.name || item.nameCn.includes(filters.name) || item.nameEn.includes(filters.name)
  const statusMatch = (item: BrandItem) => !filters.status || item.status === filters.status
  const categoryMatch = (item: BrandItem) => !filters.category || item.categories.includes(filters.category)
  const list = brands.value.filter((item) => nameMatch(item) && statusMatch(item) && categoryMatch(item))

  if (filters.sort === 'authAsc') {
    return list.sort((a, b) => a.authExpire.localeCompare(b.authExpire))
  }
  if (filters.sort === 'productDesc') {
    return list.sort((a, b) => b.products - a.products)
  }
  return list.sort((a, b) => b.authExpire.localeCompare(a.authExpire))
})

const resetFilters = () => {
  filters.name = ''
  filters.status = ''
  filters.category = ''
  filters.sort = 'authDesc'
}

const columns = [
  { title: '品牌名称', key: 'brand', width: 260 },
  { title: '关联分类', key: 'category', width: 220 },
  { title: '品牌状态', key: 'status', width: 120 },
  { title: '品牌授权信息', key: 'auth', width: 220 },
  { title: '品牌商品', key: 'products', width: 160 },
  { title: '更新时间', dataIndex: 'updatedAt', key: 'updatedAt', width: 160 },
  { title: '操作', key: 'action', width: 180, fixed: 'right' },
]

const formOpen = ref(false)
const detailOpen = ref(false)
const formMode = ref<'add' | 'edit'>('add')
const currentBrand = ref<BrandItem | null>(null)

const form = reactive({
  regNo: '',
  trademarkName: '',
  owner: '',
  nameCn: '',
  nameEn: '',
  categories: [] as string[],
  isOwner: true,
  authExpire: null as any,
  trademarkFiles: [] as any[],
  logoFiles: [] as any[],
  authFiles: [] as any[],
})

const openAdd = () => {
  formMode.value = 'add'
  Object.assign(form, {
    regNo: '',
    trademarkName: '',
    owner: '',
    nameCn: '',
    nameEn: '',
    categories: [],
    isOwner: true,
    authExpire: null,
    trademarkFiles: [],
    logoFiles: [],
    authFiles: [],
  })
  formOpen.value = true
}

const openEdit = (record: BrandItem) => {
  formMode.value = 'edit'
  Object.assign(form, {
    regNo: record.regNo,
    trademarkName: record.trademarkName,
    owner: record.owner,
    nameCn: record.nameCn,
    nameEn: record.nameEn,
    categories: [...record.categories],
    isOwner: true,
  authExpire: dayjs(record.authExpire),
    trademarkFiles: record.authFiles.map((file, index) => ({ uid: `t-${index}`, name: file, status: 'done', url: '' })),
    logoFiles: [{ uid: 'logo', name: 'logo.png', status: 'done', url: record.logo }],
    authFiles: record.authFiles.map((file, index) => ({ uid: `a-${index}`, name: file, status: 'done', url: '' })),
  })
  formOpen.value = true
}

const openDetail = (record: BrandItem) => {
  currentBrand.value = record
  detailOpen.value = true
}

const toggleStatus = (record: BrandItem) => {
  const next = record.status === '可用' ? '停用' : '可用'
  record.status = next
  message.success(`品牌已${next === '可用' ? '启用' : '停用'}`)
}

const preventUpload = () => false

const onRemoveFile = (file: any, key: 'trademarkFiles' | 'logoFiles' | 'authFiles') => {
  form[key] = form[key].filter((item: any) => item.uid !== file.uid)
}

const submitForm = () => {
  if (!form.regNo || !form.nameCn || !form.nameEn || form.categories.length === 0) {
    message.warning('请完善必填信息')
    return
  }
  message.success(formMode.value === 'add' ? '品牌已提交审核' : '品牌信息已更新')
  formOpen.value = false
}

const getPopupContainer = (trigger: HTMLElement) => trigger?.parentNode || document.body

const statusColor = (status: string) => {
  if (status === '可用') return 'green'
  if (status === '停用') return 'default'
  return 'orange'
}

const categoryCount = computed(() => new Set(brands.value.flatMap((item) => item.categories)).size)
const totalProducts = computed(() => brands.value.reduce((sum, item) => sum + item.products, 0))
const avgProducts = computed(() => (brands.value.length ? Math.round(totalProducts.value / brands.value.length) : 0))
const recentNew = 6
const expiringSoon = 3
</script>

<style scoped>
.card-section {
  margin-bottom: 16px;
}

.stat-card {
  background: #f8fafc;
  border: 1px solid var(--border-color);
}

.stat-title {
  color: var(--text-secondary);
  font-size: 12px;
}

.stat-value {
  font-size: 22px;
  font-weight: 700;
  margin: 6px 0 4px;
}

.stat-meta {
  color: var(--text-secondary);
  font-size: 12px;
}

.filter-bar {
  row-gap: 8px;
}

.actions-row {
  margin: 12px 0 16px;
  display: flex;
  gap: 8px;
}

.brand-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-logo {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  object-fit: cover;
  border: 1px solid var(--border-color);
}

.brand-name {
  font-weight: 600;
}

.brand-meta {
  color: var(--text-secondary);
  font-size: 12px;
}

.brand-tag {
  margin-bottom: 6px;
}

.brand-value {
  font-weight: 600;
}

.brand-form .form-section {
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  background: #f9fafb;
}

.section-title {
  font-weight: 600;
  margin-bottom: 12px;
}

.upload-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
}

.upload-plus {
  font-size: 20px;
  line-height: 20px;
}

.upload-tip {
  font-size: 12px;
  color: var(--text-secondary);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.detail-card {
  margin-bottom: 12px;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.detail-header img {
  width: 72px;
  height: 72px;
  border-radius: 16px;
  object-fit: cover;
  border: 1px solid var(--border-color);
}

.detail-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 4px;
}

.detail-sub {
  color: var(--text-secondary);
  margin-bottom: 6px;
}

.log-title {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.log-meta {
  font-size: 12px;
  color: var(--text-secondary);
}

.brands-table :deep(.ant-table-cell) {
  vertical-align: top;
}
</style>
