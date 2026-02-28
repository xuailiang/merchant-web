<template>
  <a-card class="wizard-header-card">
    <div class="wizard-header-top">
      <div>
        <div class="wizard-title">创建商品</div>
        <div class="wizard-subtitle">分步完成商品信息，系统将自动保存草稿</div>
      </div>
      <div class="wizard-progress">
        <div class="wizard-progress-text">完成度 {{ progress }}%</div>
        <a-progress :percent="progress" :show-info="false" size="small" />
      </div>
    </div>

    <div class="wizard-steps">
      <button
        v-for="(step, index) in steps"
        :key="step.key"
        class="wizard-step-btn"
        :class="{
          active: step.key === currentStep,
          done: index < currentIndex,
          error: hasStepError(step.key),
        }"
        type="button"
        @click="emit('select', step.key)"
      >
        <span class="step-index">{{ index + 1 }}</span>
        <span class="step-title">{{ step.title }}</span>
        <span class="step-desc">{{ step.description }}</span>
      </button>
    </div>
  </a-card>
</template>

<script setup lang="ts">
import type {
  CreateProductStep,
  CreateProductStepKey,
  StepValidationResult,
} from '../../types/create-product'

const props = defineProps<{
  steps: CreateProductStep[]
  currentStep: CreateProductStepKey
  currentIndex: number
  progress: number
  stepErrors: StepValidationResult
}>()

const emit = defineEmits<{
  (event: 'select', step: CreateProductStepKey): void
}>()

const hasStepError = (step: CreateProductStepKey) => props.stepErrors[step].length > 0
</script>
