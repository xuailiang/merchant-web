<template>
  <div>
    <div class="page-title">运费管理</div>

    <a-row :gutter="16" class="card-section">
      <a-col :xs="24" :lg="6">
        <a-card class="stat-card">
          <div class="stat-title">模板总数</div>
          <div class="stat-value">{{ templates.length }}</div>
          <div class="stat-meta">正在使用 {{ templates.filter((t) => t.status === '启用').length }}</div>
        </a-card>
      </a-col>
      <a-col :xs="24" :lg="6">
        <a-card class="stat-card">
          <div class="stat-title">按件计费</div>
          <div class="stat-value">{{ templates.filter((t) => t.chargeType === '按件').length }}</div>
          <div class="stat-meta">含限制地区 {{ templates.filter((t) => t.regionRules.length).length }}</div>
        </a-card>
      </a-col>
      <a-col :xs="24" :lg="6">
        <a-card class="stat-card">
          <div class="stat-title">包邮模板</div>
          <div class="stat-value">{{ templates.filter((t) => t.freeShipping).length }}</div>
          <div class="stat-meta">近30天更新 {{ recentUpdates }}</div>
        </a-card>
      </a-col>
      <a-col :xs="24" :lg="6">
        <a-card class="stat-card">
          <div class="stat-title">不配送地区</div>
          <div class="stat-value">{{ excludedCount }}</div>
          <div class="stat-meta">覆盖 {{ regionCount }} 个省市</div>
        </a-card>
      </a-col>
    </a-row>

    <a-card class="card-section">
      <a-form layout="inline" class="filter-bar">
        <a-form-item label="模板状态">
          <a-select
            v-model:value="filters.status"
            :options="statusOptions"
            allow-clear
            placeholder="全部"
            :get-popup-container="getPopupContainer"
            style="min-width: 140px"
          />
        </a-form-item>
        <a-form-item label="模板名称">
          <a-input v-model:value="filters.keyword" placeholder="请输入模板名称" allow-clear />
        </a-form-item>
        <a-form-item label="计费方式">
          <a-select
            v-model:value="filters.chargeType"
            :options="chargeOptions"
            allow-clear
            placeholder="全部"
            :get-popup-container="getPopupContainer"
            style="min-width: 140px"
          />
        </a-form-item>
        <a-space>
          <a-button type="primary">搜索</a-button>
          <a-button @click="resetFilters">重置</a-button>
        </a-space>
      </a-form>

      <div class="actions-row">
        <a-button type="primary" @click="openCreate">新增模板</a-button>
        <a-button type="dashed">批量导出</a-button>
      </div>

      <a-table
        :columns="columns"
        :data-source="filteredTemplates"
        :pagination="{ pageSize: 6 }"
        :scroll="{ x: 1200 }"
        class="fee-table"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'name'">
            <div class="fee-name">
              <div class="fee-title">{{ record.name }}</div>
              <div class="fee-meta">所属店铺：{{ record.store }}</div>
            </div>
          </template>
          <template v-else-if="column.key === 'freeShipping'">
            <a-tag :color="record.freeShipping ? 'green' : 'default'">{{ record.freeShipping ? '包邮' : '不包邮' }}</a-tag>
          </template>
          <template v-else-if="column.key === 'charge'">
            <div class="fee-meta">{{ record.chargeType }}</div>
            <div class="fee-meta">首件 {{ record.firstQty }} 件 / ¥{{ record.firstFee }}</div>
            <div class="fee-meta">续件 {{ record.addQty }} 件 / ¥{{ record.addFee }}</div>
          </template>
          <template v-else-if="column.key === 'region'">
            <div class="fee-meta">限制地区 {{ record.regionRules.length }} 条</div>
            <a-tag v-if="record.hasExcluded" color="red">含不配送</a-tag>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="record.status === '启用' ? 'green' : 'default'">{{ record.status }}</a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" @click="openDetail(record)">查看</a-button>
              <a-button type="link" @click="openEdit(record)">编辑</a-button>
              <a-button type="link">复制</a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <a-modal v-model:open="formOpen" :title="formMode === 'create' ? '新建运费模板' : '编辑运费模板'" width="920px" :footer="null">
      <a-form layout="vertical" class="fee-form">
        <a-row :gutter="16">
          <a-col :xs="24" :md="12">
            <a-form-item label="模板名称" required>
              <a-input v-model:value="form.name" placeholder="请输入模板名称" />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :md="12">
            <a-form-item label="所属店铺" required>
              <a-select v-model:value="form.store" :options="storeOptions" placeholder="请选择店铺" :get-popup-container="getPopupContainer" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :xs="24" :md="8">
            <a-form-item label="运输方式" required>
              <a-radio-group v-model:value="form.shipType">
                <a-radio value="快递">快递</a-radio>
                <a-radio value="同城配送">同城配送</a-radio>
              </a-radio-group>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :md="8">
            <a-form-item label="是否包邮" required>
              <a-radio-group v-model:value="form.freeShipping">
                <a-radio :value="true">是</a-radio>
                <a-radio :value="false">否</a-radio>
              </a-radio-group>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :md="8">
            <a-form-item label="计费方式" required>
              <a-radio-group v-model:value="form.chargeType">
                <a-radio value="按件">按件</a-radio>
                <a-radio value="按重量">按重量</a-radio>
              </a-radio-group>
            </a-form-item>
          </a-col>
        </a-row>

        <a-card class="inner-card" title="默认运费">
          <a-row :gutter="12">
            <a-col :xs="24" :md="6">
              <a-form-item label="首件/首重" required>
                <a-input-number v-model:value="form.firstQty" :min="1" style="width: 100%" />
              </a-form-item>
            </a-col>
            <a-col :xs="24" :md="6">
              <a-form-item label="首费(元)" required>
                <a-input-number v-model:value="form.firstFee" :min="0" style="width: 100%" />
              </a-form-item>
            </a-col>
            <a-col :xs="24" :md="6">
              <a-form-item label="续件/续重" required>
                <a-input-number v-model:value="form.addQty" :min="1" style="width: 100%" />
              </a-form-item>
            </a-col>
            <a-col :xs="24" :md="6">
              <a-form-item label="续费(元)" required>
                <a-input-number v-model:value="form.addFee" :min="0" style="width: 100%" />
              </a-form-item>
            </a-col>
          </a-row>
        </a-card>

        <a-card class="inner-card" title="指定地区运费">
          <a-space direction="vertical" style="width: 100%">
            <a-checkbox v-model:checked="form.enableRegion">启用指定地区运费</a-checkbox>
            <a-table
              :columns="regionColumns"
              :data-source="form.regionRules"
              :pagination="false"
              size="small"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'regions'">
                  <a-select
                    v-model:value="record.regions"
                    mode="multiple"
                    :options="regionOptions"
                    placeholder="选择省市"
                    :get-popup-container="getPopupContainer"
                  />
                </template>
                <template v-else-if="column.key === 'first'">
                  <a-input-number v-model:value="record.first" :min="1" />
                </template>
                <template v-else-if="column.key === 'firstFee'">
                  <a-input-number v-model:value="record.firstFee" :min="0" />
                </template>
                <template v-else-if="column.key === 'add'">
                  <a-input-number v-model:value="record.add" :min="1" />
                </template>
                <template v-else-if="column.key === 'addFee'">
                  <a-input-number v-model:value="record.addFee" :min="0" />
                </template>
                <template v-else-if="column.key === 'action'">
                  <a-button type="link" danger @click="removeRegionRule(record.key)">删除</a-button>
                </template>
              </template>
            </a-table>
            <a-button type="dashed" @click="addRegionRule">添加指定地区运费</a-button>
          </a-space>
        </a-card>

        <a-card class="inner-card" title="不配送地区">
          <a-checkbox-group v-model:value="form.excludedRegions" :options="regionOptions" />
        </a-card>

        <div class="form-actions">
          <a-button @click="formOpen = false">取消</a-button>
          <a-button type="primary" @click="submitForm">保存模板</a-button>
        </div>
      </a-form>
    </a-modal>

    <a-drawer v-model:open="detailOpen" title="运费模板详情" width="720" :destroy-on-close="true">
      <template v-if="currentTemplate">
        <a-card class="detail-card">
          <div class="detail-title">{{ currentTemplate.name }}</div>
          <div class="detail-meta">所属店铺：{{ currentTemplate.store }}</div>
          <div class="detail-meta">计费方式：{{ currentTemplate.chargeType }}</div>
          <div class="detail-meta">默认运费：首件 {{ currentTemplate.firstQty }} 件 / ¥{{ currentTemplate.firstFee }}</div>
          <div class="detail-meta">续件 {{ currentTemplate.addQty }} 件 / ¥{{ currentTemplate.addFee }}</div>
        </a-card>
        <a-card class="detail-card" title="指定地区运费">
          <a-table :columns="regionColumnsView" :data-source="currentTemplate.regionRules" :pagination="false" size="small" />
        </a-card>
        <a-card class="detail-card" title="不配送地区">
          <a-tag v-for="region in currentTemplate.excludedRegions" :key="region" color="red">{{ region }}</a-tag>
          <div v-if="currentTemplate.excludedRegions.length === 0" class="detail-meta">无不配送地区</div>
        </a-card>
      </template>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'

type RegionRule = {
  key: string
  regions: string[]
  first: number
  firstFee: number
  add: number
  addFee: number
}

type TemplateItem = {
  key: string
  name: string
  store: string
  status: string
  freeShipping: boolean
  chargeType: string
  firstQty: number
  firstFee: number
  addQty: number
  addFee: number
  regionRules: RegionRule[]
  excludedRegions: string[]
  hasExcluded: boolean
}

const templates = ref<TemplateItem[]>([
  {
    key: 't1',
    name: '山东省不包邮',
    store: '拼京宝旗舰店',
    status: '启用',
    freeShipping: false,
    chargeType: '按件',
    firstQty: 3,
    firstFee: 12,
    addQty: 1,
    addFee: 2,
    regionRules: [
      { key: 'r1', regions: ['山东'], first: 3, firstFee: 12, add: 1, addFee: 2 },
    ],
    excludedRegions: ['青海', '西藏'],
    hasExcluded: true,
  },
  {
    key: 't2',
    name: '包邮模板',
    store: '拼京宝旗舰店',
    status: '启用',
    freeShipping: true,
    chargeType: '按件',
    firstQty: 0,
    firstFee: 0,
    addQty: 0,
    addFee: 0,
    regionRules: [],
    excludedRegions: [],
    hasExcluded: false,
  },
  {
    key: 't3',
    name: '指定地区运费设置',
    store: '拼京宝旗舰店',
    status: '停用',
    freeShipping: false,
    chargeType: '按件',
    firstQty: 5,
    firstFee: 5,
    addQty: 1,
    addFee: 1,
    regionRules: [
      { key: 'r1', regions: ['宁夏', '内蒙古'], first: 2, firstFee: 6, add: 1, addFee: 2 },
      { key: 'r2', regions: ['新疆'], first: 1, firstFee: 12, add: 1, addFee: 4 },
    ],
    excludedRegions: ['西藏'],
    hasExcluded: true,
  },
])

const filters = reactive({
  status: '',
  keyword: '',
  chargeType: '',
})

const statusOptions = [
  { label: '启用', value: '启用' },
  { label: '停用', value: '停用' },
]

const chargeOptions = [
  { label: '按件', value: '按件' },
  { label: '按重量', value: '按重量' },
]

const storeOptions = [
  { label: '拼京宝旗舰店', value: '拼京宝旗舰店' },
  { label: '星辰旗舰店', value: '星辰旗舰店' },
]

const regionOptions = [
  { label: '山东', value: '山东' },
  { label: '宁夏', value: '宁夏' },
  { label: '内蒙古', value: '内蒙古' },
  { label: '新疆', value: '新疆' },
  { label: '青海', value: '青海' },
  { label: '西藏', value: '西藏' },
  { label: '广东', value: '广东' },
  { label: '四川', value: '四川' },
]

const filteredTemplates = computed(() => {
  return templates.value.filter((item) => {
    const statusMatch = !filters.status || item.status === filters.status
    const keywordMatch = !filters.keyword || item.name.includes(filters.keyword)
    const chargeMatch = !filters.chargeType || item.chargeType === filters.chargeType
    return statusMatch && keywordMatch && chargeMatch
  })
})

const columns = [
  { title: '模板名称', key: 'name', width: 220 },
  { title: '所属店铺', dataIndex: 'store', key: 'store', width: 160 },
  { title: '是否包邮', dataIndex: 'freeShipping', key: 'freeShipping', width: 120 },
  { title: '计费规则', key: 'charge', width: 220 },
  { title: '限制地区', key: 'region', width: 160 },
  { title: '状态', key: 'status', width: 120 },
  { title: '操作', key: 'action', width: 160, fixed: 'right' },
]

const regionColumns = [
  { title: '配送地区', key: 'regions' },
  { title: '首件/首重', key: 'first', width: 120 },
  { title: '首费(元)', key: 'firstFee', width: 120 },
  { title: '续件/续重', key: 'add', width: 120 },
  { title: '续费(元)', key: 'addFee', width: 120 },
  { title: '操作', key: 'action', width: 100 },
]

const regionColumnsView = [
  { title: '配送地区', dataIndex: 'regions', key: 'regions' },
  { title: '首件/首重', dataIndex: 'first', key: 'first', width: 120 },
  { title: '首费(元)', dataIndex: 'firstFee', key: 'firstFee', width: 120 },
  { title: '续件/续重', dataIndex: 'add', key: 'add', width: 120 },
  { title: '续费(元)', dataIndex: 'addFee', key: 'addFee', width: 120 },
]

const formOpen = ref(false)
const detailOpen = ref(false)
const formMode = ref<'create' | 'edit'>('create')
const currentTemplate = ref<TemplateItem | null>(null)

const form = reactive({
  name: '',
  store: '',
  shipType: '快递',
  freeShipping: false,
  chargeType: '按件',
  firstQty: 1,
  firstFee: 8,
  addQty: 1,
  addFee: 2,
  enableRegion: false,
  regionRules: [] as RegionRule[],
  excludedRegions: [] as string[],
})

const openCreate = () => {
  formMode.value = 'create'
  Object.assign(form, {
    name: '',
    store: '',
    shipType: '快递',
    freeShipping: false,
    chargeType: '按件',
    firstQty: 1,
    firstFee: 8,
    addQty: 1,
    addFee: 2,
    enableRegion: false,
    regionRules: [],
    excludedRegions: [],
  })
  formOpen.value = true
}

const openEdit = (record: TemplateItem) => {
  formMode.value = 'edit'
  Object.assign(form, {
    name: record.name,
    store: record.store,
    shipType: '快递',
    freeShipping: record.freeShipping,
    chargeType: record.chargeType,
    firstQty: record.firstQty,
    firstFee: record.firstFee,
    addQty: record.addQty,
    addFee: record.addFee,
    enableRegion: record.regionRules.length > 0,
    regionRules: record.regionRules.map((rule) => ({ ...rule })),
    excludedRegions: [...record.excludedRegions],
  })
  formOpen.value = true
}

const openDetail = (record: TemplateItem) => {
  currentTemplate.value = record
  detailOpen.value = true
}

const addRegionRule = () => {
  form.regionRules.push({
    key: `r-${Date.now()}`,
    regions: [],
    first: 1,
    firstFee: 5,
    add: 1,
    addFee: 2,
  })
}

const removeRegionRule = (key: string) => {
  form.regionRules = form.regionRules.filter((rule) => rule.key !== key)
}

const submitForm = () => {
  if (!form.name || !form.store) {
    message.warning('请填写模板名称和所属店铺')
    return
  }
  message.success(formMode.value === 'create' ? '运费模板已创建' : '运费模板已更新')
  formOpen.value = false
}

const resetFilters = () => {
  filters.status = ''
  filters.keyword = ''
  filters.chargeType = ''
}

const getPopupContainer = (trigger: HTMLElement) => trigger?.parentNode || document.body

const recentUpdates = 3
const excludedCount = computed(() => templates.value.filter((t) => t.excludedRegions.length).length)
const regionCount = computed(() => new Set(templates.value.flatMap((t) => t.excludedRegions)).size)
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

.fee-name {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.fee-title {
  font-weight: 600;
}

.fee-meta {
  font-size: 12px;
  color: var(--text-secondary);
}

.inner-card {
  margin-bottom: 16px;
  background: #f9fafb;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.detail-card {
  margin-bottom: 12px;
}

.detail-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 8px;
}

.fee-table :deep(.ant-table-cell) {
  vertical-align: top;
}
</style>
