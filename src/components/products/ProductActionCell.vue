<template>
  <div class="product-action-cell">
    <template v-for="action in primaryActions" :key="action.key">
      <RouterLink
        v-if="action.to"
        class="product-action-pill"
        :class="{ danger: action.danger }"
        :to="action.to(record)"
      >
        {{ action.label }}
      </RouterLink>
      <a-button
        v-else
        size="small"
        class="product-action-pill"
        :class="{ danger: action.danger }"
        @click="emit('action', action.key, record)"
      >
        {{ action.label }}
      </a-button>
    </template>
    <a-dropdown
      v-if="moreActions.length > 0"
      :menu="{
        items: moreActions.map((action) => ({
          key: action.key,
          label: action.label,
          danger: action.danger,
        })),
        onClick: onMenuClick,
      }"
      :getPopupContainer="getPopupContainer"
    >
      <a-button size="small" class="product-action-more">更多</a-button>
    </a-dropdown>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import type { ProductActionDef, ProductListItem } from '../../types/product-list'

const props = defineProps<{
  record: ProductListItem
  primaryActions: ProductActionDef[]
  moreActions: ProductActionDef[]
  getPopupContainer: (trigger?: HTMLElement) => HTMLElement
}>()

const emit = defineEmits<{
  (event: 'action', actionKey: string, record: ProductListItem): void
}>()

const onMenuClick = ({ key }: { key: string | number }) => emit('action', String(key), props.record)
</script>
