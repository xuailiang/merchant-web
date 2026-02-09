<template>
  <div>
    <div class="page-title">角色权限</div>
    <a-row :gutter="16">
      <a-col :xs="24" :lg="12">
        <a-card title="角色列表">
          <a-list :data-source="roles">
            <template #renderItem="{ item }">
              <a-list-item>
                <a-list-item-meta :title="item.name" :description="item.desc" />
                <a-tag color="blue">{{ item.users }} 人</a-tag>
              </a-list-item>
            </template>
          </a-list>
        </a-card>
      </a-col>
      <a-col :xs="24" :lg="12">
        <a-card title="权限矩阵">
          <a-table :columns="columns" :data-source="permissions" :pagination="false" size="small" />
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
const roles = [
  { key: 'r1', name: '管理员', desc: '全站管理与权限分配', users: 3 },
  { key: 'r2', name: '运营', desc: '订单/商品/营销管理', users: 6 },
  { key: 'r3', name: '财务', desc: '结算、退款与资金对账', users: 2 },
]

const columns = [
  { title: '模块', dataIndex: 'module', key: 'module' },
  { title: '管理员', dataIndex: 'admin', key: 'admin' },
  { title: '运营', dataIndex: 'operator', key: 'operator' },
  { title: '财务', dataIndex: 'finance', key: 'finance' },
]

const permissions = [
  { key: 'p1', module: '仪表盘', admin: '可查看', operator: '可查看', finance: '可查看' },
  { key: 'p2', module: '订单管理', admin: '可管理', operator: '可管理', finance: '只读' },
  { key: 'p3', module: '商品管理', admin: '可管理', operator: '可管理', finance: '无权限' },
  { key: 'p4', module: '营销中心', admin: '可管理', operator: '可管理', finance: '无权限' },
  { key: 'p5', module: '财务中心', admin: '可管理', operator: '无权限', finance: '可管理' },
  { key: 'p6', module: '系统设置', admin: '可管理', operator: '无权限', finance: '无权限' },
]
</script>
