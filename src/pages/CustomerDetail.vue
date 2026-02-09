<template>
  <div>
    <div class="page-title">客户详情</div>
    <a-card class="card-section">
      <a-descriptions title="客户概览" :column="2" bordered>
        <a-descriptions-item label="客户编号">{{ customer.id }}</a-descriptions-item>
        <a-descriptions-item label="会员等级">{{ customer.level }}</a-descriptions-item>
        <a-descriptions-item label="最近购买">{{ customer.recent }}</a-descriptions-item>
        <a-descriptions-item label="累计消费">{{ customer.spend }}</a-descriptions-item>
        <a-descriptions-item label="标签" :span="2">
          <a-tag color="gold">高价值</a-tag>
          <a-tag color="blue">活跃</a-tag>
        </a-descriptions-item>
      </a-descriptions>
    </a-card>

    <a-card title="购买记录">
      <a-table :columns="columns" :data-source="orders" :pagination="false" />
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()

const customer = {
  id: (route.params.id as string) ?? 'C-20088',
  level: 'VIP',
  recent: '星曜Pro 智能手机 256G',
  spend: '¥18,600',
}

const orders = [
  { key: 'o1', id: 'O-20260203-8812', amount: '¥1,268', time: '2026-02-03 10:21' },
  { key: 'o2', id: 'O-20260128-8212', amount: '¥3,499', time: '2026-01-28 14:10' },
]

const columns = [
  { title: '订单号', dataIndex: 'id', key: 'id' },
  { title: '金额', dataIndex: 'amount', key: 'amount' },
  { title: '下单时间', dataIndex: 'time', key: 'time' },
]
</script>
