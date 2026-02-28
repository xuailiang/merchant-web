<template>
  <div class="product-filter-panel">
    <a-form layout="inline" class="filter-row filter-row-main">
      <a-form-item label="商品名称">
        <a-input
          :value="filters.name"
          placeholder="请输入商品名称"
          allow-clear
          @update:value="updateField('name', $event)"
        />
      </a-form-item>
      <a-form-item label="商品编码">
        <a-input
          :value="filters.code"
          placeholder="请输入商品编码"
          allow-clear
          @update:value="updateField('code', $event)"
        />
      </a-form-item>
      <a-form-item label="商品分类">
        <a-select
          :value="filters.category || undefined"
          :options="categoryOptions"
          allow-clear
          placeholder="请选择"
          style="width: 180px"
          @update:value="updateField('category', $event ?? '')"
        />
      </a-form-item>
      <a-form-item label="品牌名称">
        <a-input
          :value="filters.brand"
          placeholder="请输入品牌名称"
          allow-clear
          @update:value="updateField('brand', $event)"
        />
      </a-form-item>
      <a-form-item label="商品状态">
        <a-select
          :value="filters.statuses"
          :options="statusOptions"
          mode="multiple"
          allow-clear
          placeholder="请选择"
          style="min-width: 180px"
          @update:value="updateField('statuses', $event ?? [])"
        />
      </a-form-item>
      <a-form-item label="首次上架">
        <a-range-picker :value="rangeValue" @update:value="onDateChange" />
      </a-form-item>
    </a-form>

    <a-collapse v-model:activeKey="collapseKey" ghost class="filter-advanced-collapse">
      <a-collapse-panel key="advanced" header="高级筛选">
        <a-form layout="inline" class="filter-row">
          <a-form-item label="售价区间">
            <a-input-number
              :value="filters.priceMin ?? undefined"
              placeholder="最低价"
              @update:value="updateField('priceMin', $event ?? null)"
            />
            <span class="range-split">-</span>
            <a-input-number
              :value="filters.priceMax ?? undefined"
              placeholder="最高价"
              @update:value="updateField('priceMax', $event ?? null)"
            />
          </a-form-item>
          <a-form-item label="库存区间">
            <a-input-number
              :value="filters.stockMin ?? undefined"
              placeholder="最低库存"
              @update:value="updateField('stockMin', $event ?? null)"
            />
            <span class="range-split">-</span>
            <a-input-number
              :value="filters.stockMax ?? undefined"
              placeholder="最高库存"
              @update:value="updateField('stockMax', $event ?? null)"
            />
          </a-form-item>
          <a-form-item label="利润率区间(%)">
            <a-input-number
              :value="filters.profitMin ?? undefined"
              placeholder="最低"
              @update:value="updateField('profitMin', $event ?? null)"
            />
            <span class="range-split">-</span>
            <a-input-number
              :value="filters.profitMax ?? undefined"
              placeholder="最高"
              @update:value="updateField('profitMax', $event ?? null)"
            />
          </a-form-item>
          <a-form-item label="渠道">
            <a-select
              :value="filters.channel || undefined"
              :options="channelOptions"
              allow-clear
              placeholder="全部渠道"
              style="width: 140px"
              @update:value="updateField('channel', $event ?? '')"
            />
          </a-form-item>
          <a-form-item label="店铺">
            <a-select
              :value="filters.shop || undefined"
              :options="shopOptions"
              allow-clear
              placeholder="全部店铺"
              style="width: 160px"
              @update:value="updateField('shop', $event ?? '')"
            />
          </a-form-item>
          <a-form-item label="库存预警">
            <a-switch
              :checked="filters.warningOnly"
              checked-children="是"
              un-checked-children="否"
              @update:checked="updateField('warningOnly', $event)"
            />
          </a-form-item>
        </a-form>
      </a-collapse-panel>
    </a-collapse>

    <div class="filter-toolbar">
      <a-space wrap>
        <a-button type="primary" @click="emit('query')">查询</a-button>
        <a-button @click="emit('reset')">重置</a-button>
        <a-button type="dashed" @click="toggleAdvanced">
          {{ isAdvancedOpen ? '收起高级筛选' : '展开高级筛选' }}
        </a-button>
      </a-space>
      <a-space wrap>
        <a-select
          :value="activePresetId || undefined"
          :options="presetOptions"
          allow-clear
          placeholder="最近使用筛选"
          style="width: 200px"
          @update:value="emit('applyPreset', String($event || ''))"
        />
        <a-button @click="emit('savePreset')">保存视图</a-button>
      </a-space>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import dayjs, { type Dayjs } from 'dayjs'
import type { ProductFilterModel, ProductViewPreset } from '../../types/product-list'

const props = defineProps<{
  filters: ProductFilterModel
  statusOptions: Array<{ label: string; value: string }>
  categoryOptions: Array<{ label: string; value: string }>
  channelOptions: Array<{ label: string; value: string }>
  shopOptions: Array<{ label: string; value: string }>
  isAdvancedOpen: boolean
  activePresetId: string
  presets: ProductViewPreset[]
}>()

const emit = defineEmits<{
  (event: 'update:filters', value: ProductFilterModel): void
  (event: 'update:isAdvancedOpen', value: boolean): void
  (event: 'query'): void
  (event: 'reset'): void
  (event: 'savePreset'): void
  (event: 'applyPreset', presetId: string): void
}>()

const collapseKey = computed<string[]>({
  get: () => (props.isAdvancedOpen ? ['advanced'] : []),
  set: (value) => emit('update:isAdvancedOpen', value.includes('advanced')),
})

const rangeValue = computed<[Dayjs, Dayjs] | null>(() => {
  if (props.filters.dateRange.length !== 2) return null
  return [dayjs(props.filters.dateRange[0]), dayjs(props.filters.dateRange[1])]
})

const presetOptions = computed(() =>
  props.presets.map((item) => ({ label: item.name, value: item.id }))
)

const updateField = <K extends keyof ProductFilterModel>(key: K, value: ProductFilterModel[K]) => {
  emit('update:filters', { ...props.filters, [key]: value })
}

const onDateChange = (value: [Dayjs, Dayjs] | null) => {
  if (!value || value.length !== 2) {
    updateField('dateRange', [])
    return
  }
  updateField('dateRange', [value[0].format('YYYY-MM-DD'), value[1].format('YYYY-MM-DD')])
}

const toggleAdvanced = () => emit('update:isAdvancedOpen', !props.isAdvancedOpen)
</script>
