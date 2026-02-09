<template>
  <div>
    <div class="page-title">权限矩阵</div>

    <a-card class="card-section">
      <div class="matrix-toolbar">
        <div class="matrix-hint">提示：切换权限仅影响前端演示展示。</div>
        <a-space>
          <a-button @click="resetMatrix">恢复默认</a-button>
          <a-button type="primary" @click="saveMatrix">保存配置</a-button>
        </a-space>
      </div>
    </a-card>

    <a-card>
      <a-table :columns="columns" :data-source="rows" :pagination="false" :scroll="{ x: 900 }">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'admin'">
            <a-checkbox v-model:checked="record.roles.admin" />
          </template>
          <template v-else-if="column.key === 'operator'">
            <a-checkbox v-model:checked="record.roles.operator" />
          </template>
          <template v-else-if="column.key === 'finance'">
            <a-checkbox v-model:checked="record.roles.finance" />
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { message } from 'ant-design-vue'
import { PERMISSION_GROUPS, getPermissionMatrix, setPermissionMatrix } from '../utils/permissions'

const columns = [
  { title: '权限项', dataIndex: 'label', key: 'label', width: 300 },
  { title: '管理员', key: 'admin', width: 120 },
  { title: '运营', key: 'operator', width: 120 },
  { title: '财务', key: 'finance', width: 120 },
]

const matrix = getPermissionMatrix()

const rows = reactive(
  PERMISSION_GROUPS.flatMap((group) =>
    group.keys.map((key) => ({
      key,
      label: `${group.group} · ${key}`,
      roles: {
        admin: matrix.admin.includes(key),
        operator: matrix.operator.includes(key),
        finance: matrix.finance.includes(key),
      },
    }))
  )
)

const saveMatrix = () => {
  const next = { admin: [], operator: [], finance: [] } as any
  rows.forEach((row) => {
    if (row.roles.admin) next.admin.push(row.key)
    if (row.roles.operator) next.operator.push(row.key)
    if (row.roles.finance) next.finance.push(row.key)
  })
  setPermissionMatrix(next)
  message.success('权限矩阵已保存')
}

const resetMatrix = () => {
  localStorage.removeItem('permission-matrix')
  message.success('已恢复默认权限')
  window.location.reload()
}
</script>

<style scoped>
.card-section {
  margin-bottom: 16px;
}

.matrix-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.matrix-hint {
  color: var(--text-secondary);
}
</style>
