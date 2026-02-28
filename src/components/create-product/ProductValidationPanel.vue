<template>
  <a-card class="validation-panel-card" title="校验摘要">
    <template v-if="globalErrors.length">
      <div class="validation-summary warning">待处理问题 {{ globalErrors.length }} 项</div>
      <a-space direction="vertical" size="small" style="width: 100%">
        <a-button
          v-for="(item, index) in issues"
          :key="`${item.step}-${index}`"
          block
          class="validation-issue-btn"
          @click="emit('jump', item.step)"
        >
          <span class="issue-step">{{ stepLabelMap[item.step] }}</span>
          <span class="issue-text">{{ item.message }}</span>
        </a-button>
      </a-space>
    </template>
    <template v-else>
      <div class="validation-summary success">当前配置通过校验，可提交审核</div>
    </template>
  </a-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CreateProductStepKey, StepValidationResult } from '../../types/create-product'

const props = defineProps<{
  stepErrors: StepValidationResult
  globalErrors: string[]
}>()

const emit = defineEmits<{
  (event: 'jump', step: CreateProductStepKey): void
}>()

const stepLabelMap: Record<CreateProductStepKey, string> = {
  basic: '基础信息',
  media: '素材信息',
  sku: 'SKU与价格',
  logistics: '物流服务',
  review: '提交审核',
}

const issues = computed(() => {
  const list: Array<{ step: CreateProductStepKey; message: string }> = []
  ;(Object.keys(props.stepErrors) as CreateProductStepKey[]).forEach((step) => {
    if (step === 'review') return
    props.stepErrors[step].forEach((message) => list.push({ step, message }))
  })
  return list
})
</script>
