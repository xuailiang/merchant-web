<template>
  <div class="product-stack">
    <div class="thumbs">
      <img
        v-for="(item, index) in previewItems"
        :key="`${index}-${item.image}`"
        :src="item.image"
        alt="商品"
      />
      <a-popover v-if="remainCount > 0" trigger="hover" placement="rightTop">
        <template #content>
          <div class="popover-list">
            <div v-for="(item, index) in items" :key="`all-${index}`" class="popover-item">
              <img :src="item.image" alt="商品" />
              <div>
                <div class="popover-name">{{ item.name }}</div>
                <div class="popover-spec">{{ item.spec }}</div>
              </div>
            </div>
          </div>
        </template>
        <span class="more-tag">+{{ remainCount }}</span>
      </a-popover>
    </div>
    <div class="summary">
      <div class="title">{{ items[0]?.name ?? fallbackName }}</div>
      <div class="spec">
        {{ items[0]?.spec ?? fallbackSpec }}
      </div>
      <div class="meta">共 {{ items.length || 1 }} 件商品</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type StackItem = {
  name: string
  spec: string
  image: string
}

const props = defineProps<{
  items: StackItem[]
  fallbackName: string
  fallbackSpec: string
}>()

const previewItems = computed(() => props.items.slice(0, 2))
const remainCount = computed(() => Math.max(0, props.items.length - 2))
</script>

<style scoped>
.product-stack {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.thumbs {
  display: flex;
  align-items: center;
  gap: 6px;
}

.thumbs img {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  object-fit: cover;
  border: 1px solid rgba(148, 163, 184, 0.26);
}

.more-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  color: #1d4ed8;
  background: rgba(37, 99, 235, 0.1);
  cursor: pointer;
}

.summary {
  min-width: 0;
}

.title {
  font-weight: 600;
  color: #0f172a;
  line-height: 1.4;
}

.spec {
  font-size: 12px;
  color: #64748b;
  margin-top: 2px;
}

.meta {
  margin-top: 4px;
  font-size: 12px;
  color: #475569;
}

.popover-list {
  width: 260px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.popover-item {
  display: grid;
  grid-template-columns: 40px 1fr;
  gap: 8px;
  align-items: center;
}

.popover-item img {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  object-fit: cover;
}

.popover-name {
  font-size: 12px;
  font-weight: 600;
  color: #0f172a;
}

.popover-spec {
  font-size: 11px;
  color: #64748b;
}
</style>
