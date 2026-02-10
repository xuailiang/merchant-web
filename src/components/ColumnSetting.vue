<template>
  <a-dropdown :trigger="['click']" placement="bottomRight">
    <a-button type="dashed" size="small">列配置</a-button>
    <template #overlay>
      <div class="col-setting">
        <div class="col-setting-header">
          <div class="col-setting-title">显示字段</div>
          <a-button type="link" size="small" @click.stop="onReset">重置</a-button>
        </div>
        <a-checkbox-group v-model:value="innerValue">
          <div class="col-setting-list">
            <a-checkbox v-for="col in columns" :key="col.key" :value="col.key">
              {{ col.title }}
            </a-checkbox>
          </div>
        </a-checkbox-group>
      </div>
    </template>
  </a-dropdown>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  columns: Array<{ key: string; title: string }>
  modelValue: string[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void
  (e: 'reset'): void
}>()

const innerValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const onReset = () => emit('reset')
</script>

<style scoped>
.col-setting {
  width: 220px;
  padding: 12px;
  background: #fff;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
}

.col-setting-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.col-setting-title {
  font-size: 12px;
  color: var(--text-secondary);
}

.col-setting-list {
  display: grid;
  gap: 6px;
}
</style>
