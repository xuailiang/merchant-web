<template>
  <a-card title="基础信息" class="wizard-section-card">
    <a-form layout="vertical">
      <a-form-item label="商品名称" required>
        <div class="field-with-count">
          <a-input
            :value="form.name"
            :maxlength="100"
            placeholder="请输入商品名称"
            @update:value="updateField('name', $event)"
          />
          <span class="count">{{ form.name.length }}/100</span>
        </div>
      </a-form-item>

      <a-row :gutter="16">
        <a-col :xs="24" :md="12">
          <a-form-item label="副标题">
            <a-input
              :value="form.subtitle"
              placeholder="请输入副标题"
              :maxlength="50"
              @update:value="updateField('subtitle', $event)"
            />
          </a-form-item>
        </a-col>
        <a-col :xs="24" :md="12">
          <a-form-item label="品牌" required>
            <a-select
              :value="form.brand"
              :options="brandOptions"
              placeholder="请选择品牌"
              @update:value="updateField('brand', $event)"
            />
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="16">
        <a-col :xs="24" :md="12">
          <a-form-item label="商品分类" required>
            <a-select
              :value="form.category"
              :options="categoryOptions"
              placeholder="请选择商品分类"
              show-search
              @update:value="updateField('category', $event)"
            />
          </a-form-item>
        </a-col>
        <a-col :xs="24" :md="12">
          <a-form-item label="默认供货商">
            <a-input :value="form.supplier" readonly />
            <a-button type="link" class="link-action">更换供货商</a-button>
          </a-form-item>
        </a-col>
      </a-row>

      <a-form-item label="商品搜索关键词">
        <a-input
          :value="form.keywords"
          placeholder="多个关键词用逗号隔开"
          @update:value="updateField('keywords', $event)"
        />
      </a-form-item>

      <a-form-item label="商品详情文案">
        <a-textarea
          :value="form.detail"
          :rows="10"
          placeholder="请输入商品详情内容..."
          @update:value="updateField('detail', $event)"
        />
      </a-form-item>
    </a-form>
  </a-card>
</template>

<script setup lang="ts">
import type { CreateProductFormState } from '../../types/create-product'

const props = defineProps<{
  form: CreateProductFormState
  brandOptions: Array<{ label: string; value: string }>
  categoryOptions: Array<{ label: string; value: string }>
}>()

const emit = defineEmits<{
  (event: 'update:form', value: CreateProductFormState): void
}>()

const updateField = <K extends keyof CreateProductFormState>(
  key: K,
  value: CreateProductFormState[K]
) => emit('update:form', { ...props.form, [key]: value })
</script>
