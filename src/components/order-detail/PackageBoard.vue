<template>
  <a-card
    :id="mode === 'items' ? 'section-items' : 'section-logistics'"
    :title="mode === 'items' ? '商品与包裹' : '物流轨迹'"
    class="od-section-card od-fade-in"
  >
    <template v-if="packages.length > 0">
      <div
        v-for="pkg in packages"
        :key="pkg.id"
        class="od-package-card"
        :class="{ risk: isRiskPackage(pkg) }"
      >
        <div class="od-package-head">
          <div>
            <strong>包裹 {{ pkg.id }}</strong>
            <span class="muted"> {{ pkg.carrier }} · {{ pkg.tracking }}</span>
          </div>
          <div class="od-package-meta">
            <a-tag
              :color="isRiskPackage(pkg) ? 'red' : pkg.status === '已签收' ? 'green' : 'blue'"
              >{{ pkg.status }}</a-tag
            >
            <a-button type="link" size="small" @click="$emit('copyTracking', pkg.tracking)"
              >复制单号</a-button
            >
          </div>
        </div>

        <template v-if="mode === 'items'">
          <a-table
            :columns="itemColumns"
            :data-source="getPackageItems(pkg.id)"
            :pagination="false"
            size="small"
            row-key="key"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'product'">
                <div class="od-product-cell">
                  <img :src="record.image" alt="商品图" />
                  <div>
                    <div class="name">{{ record.name }}</div>
                    <div class="sku">{{ record.sku }}</div>
                  </div>
                </div>
              </template>
              <template v-else-if="column.key === 'amount'">¥{{ record.paid }}</template>
            </template>
          </a-table>
        </template>

        <template v-else>
          <div class="od-trace-list">
            <div
              v-for="(trace, index) in getVisibleTraces(pkg)"
              :key="`${pkg.id}-${index}`"
              class="od-trace-item"
            >
              <div class="desc">{{ trace.desc }}</div>
              <div class="time">{{ trace.time }}</div>
            </div>
            <a-button
              v-if="pkg.traces.length > 3"
              type="link"
              size="small"
              @click="toggleExpand(pkg.id)"
            >
              {{ expandedPackages.has(pkg.id) ? '收起轨迹' : '展开全部轨迹' }}
            </a-button>
          </div>
        </template>
      </div>
    </template>
    <a-empty v-else description="暂无包裹信息" />
  </a-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { OrderLineItem, OrderPackage } from '../../types/orderDetail'

const props = defineProps<{
  mode: 'items' | 'logistics'
  packages: OrderPackage[]
  items: OrderLineItem[]
}>()

defineEmits<{
  (e: 'copyTracking', tracking: string): void
}>()

const expandedPackages = ref(new Set<string>())

const itemColumns = [
  { title: '商品', key: 'product' },
  { title: '数量', dataIndex: 'qty', key: 'qty', width: 90 },
  { title: '单价', dataIndex: 'price', key: 'price', width: 100 },
  { title: '实付', dataIndex: 'amount', key: 'amount', width: 110 },
]

const getPackageItems = (packageId: string) =>
  props.items.filter((item) => item.packageId === packageId)

const isRiskPackage = (pkg: OrderPackage) =>
  pkg.status.includes('异常') || pkg.status.includes('退回') || pkg.status.includes('拦截')

const getVisibleTraces = (pkg: OrderPackage) => {
  if (expandedPackages.value.has(pkg.id)) return pkg.traces
  return pkg.traces.slice(0, 3)
}

const toggleExpand = (packageId: string) => {
  const next = new Set(expandedPackages.value)
  if (next.has(packageId)) next.delete(packageId)
  else next.add(packageId)
  expandedPackages.value = next
}
</script>
