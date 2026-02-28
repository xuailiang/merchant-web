<template>
  <a-card title="物流与服务" class="wizard-section-card">
    <a-form layout="vertical">
      <a-row :gutter="16">
        <a-col :xs="24" :md="8">
          <a-form-item label="运费模板" required>
            <a-select
              :value="form.shipping"
              :options="shippingOptions"
              @update:value="(val) => updateField('shipping', val)"
            />
          </a-form-item>
        </a-col>
        <a-col :xs="24" :md="8">
          <a-form-item label="汇率" required>
            <a-input-number
              :value="form.exchange"
              style="width: 100%"
              @update:value="(val) => updateField('exchange', val)"
            />
          </a-form-item>
        </a-col>
        <a-col :xs="24" :md="8">
          <a-form-item label="税码" required>
            <a-select
              :value="form.tax"
              :options="taxOptions"
              @update:value="(val) => updateField('tax', val)"
            />
          </a-form-item>
        </a-col>
      </a-row>

      <a-form-item label="上架时间" required>
        <a-radio-group
          :value="form.publishType"
          @update:value="(val) => updateField('publishType', val)"
        >
          <a-radio value="now">立即上架</a-radio>
          <a-radio value="schedule">定时上架</a-radio>
        </a-radio-group>
        <a-date-picker
          v-if="form.publishType === 'schedule'"
          :value="publishAtProxy"
          show-time
          style="margin-top: 8px"
          value-format="YYYY-MM-DD HH:mm:ss"
          @update:value="(val) => (publishAtProxy = val)"
        />
      </a-form-item>

      <a-form-item label="服务保障">
        <a-checkbox-group
          :value="form.services"
          :options="serviceOptions"
          @update:value="(val) => updateField('services', val)"
        />
      </a-form-item>

      <a-form-item label="退换货说明">
        <a-textarea
          :value="form.returnPolicy"
          :rows="4"
          placeholder="请输入退换货政策说明"
          @update:value="(val) => updateField('returnPolicy', val)"
        />
      </a-form-item>
    </a-form>
  </a-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CreateProductFormState } from '../../types/create-product'

const props = defineProps<{
  form: CreateProductFormState
  shippingOptions: Array<{ label: string; value: string }>
  taxOptions: Array<{ label: string; value: string }>
  serviceOptions: string[]
}>()

const emit = defineEmits<{
  (event: 'update:form', value: CreateProductFormState): void
}>()

const updateField = <K extends keyof CreateProductFormState>(
  key: K,
  value: CreateProductFormState[K]
) => {
  emit('update:form', { ...props.form, [key]: value })
}

const publishAtProxy = computed<string | null>({
  get: () => props.form.publishAt,
  set: (value) => {
    updateField('publishAt', value)
  },
})
</script>
