<template>
  <div>
    <div class="page-title">营销中心</div>
    <a-row :gutter="16" class="card-section">
      <a-col :xs="24" :sm="12" :lg="6">
        <a-card>
          <a-statistic title="本周活动曝光" value="128,400" />
          <a-tag color="green">环比 +12%</a-tag>
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="12" :lg="6">
        <a-card>
          <a-statistic title="转化订单" value="3,842" />
          <a-tag color="blue">转化率 3.1%</a-tag>
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="12" :lg="6">
        <a-card>
          <a-statistic title="优惠券消耗" value="6,240" />
          <a-tag color="orange">核销率 42%</a-tag>
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="12" :lg="6">
        <a-card>
          <a-statistic title="新增会员" value="1,206" />
          <a-tag color="purple">活动贡献 58%</a-tag>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="16">
      <a-col :xs="24" :lg="14">
        <a-card title="活动列表" :extra="campaignExtra">
          <a-table :columns="columns" :data-source="campaigns" :pagination="{ pageSize: 5 }">
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'status'">
                <a-tag
                  :color="
                    record.status === '进行中'
                      ? 'green'
                      : record.status === '筹备中'
                        ? 'blue'
                        : 'default'
                  "
                >
                  {{ record.status }}
                </a-tag>
              </template>
              <template v-else-if="column.key === 'action'">
                <a-space>
                  <a-button type="link">详情</a-button>
                  <a-button type="link">复盘</a-button>
                </a-space>
              </template>
            </template>
          </a-table>
        </a-card>
      </a-col>
      <a-col :xs="24" :lg="10">
        <a-card title="优惠配置">
          <a-list :data-source="coupons">
            <template #renderItem="{ item }">
              <a-list-item>
                <a-list-item-meta :title="item.title" :description="item.desc" />
                <a-tag color="blue">{{ item.value }}</a-tag>
              </a-list-item>
            </template>
          </a-list>
        </a-card>

        <a-card title="重点推广渠道" class="card-section">
          <a-list :data-source="channels" size="small">
            <template #renderItem="{ item }">
              <a-list-item>
                <a-list-item-meta :title="item.name" :description="item.note" />
                <a-tag :color="item.color">{{ item.roi }}</a-tag>
              </a-list-item>
            </template>
          </a-list>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { h } from 'vue'
import { RouterLink } from 'vue-router'

const campaignExtra = h('div', { style: 'display:flex;gap:12px;' }, [
  h(RouterLink, { to: '/marketing/attribution' }, { default: () => '效果归因' }),
  h(RouterLink, { to: '/marketing/coupons' }, { default: () => '管理优惠券' }),
])
const columns = [
  { title: '活动名称', dataIndex: 'name', key: 'name' },
  { title: '时间', dataIndex: 'time', key: 'time' },
  { title: '触达用户', dataIndex: 'reach', key: 'reach' },
  { title: '预算', dataIndex: 'budget', key: 'budget' },
  { title: '状态', dataIndex: 'status', key: 'status' },
  { title: '操作', key: 'action' },
]

const campaigns = [
  {
    key: 'm1',
    name: '新年开门红满减',
    time: '2026-02-01 至 2026-02-07',
    reach: '18,400 人',
    budget: '¥28,000',
    status: '进行中',
  },
  {
    key: 'm2',
    name: '会员专享积分翻倍',
    time: '2026-02-05 至 2026-02-10',
    reach: '6,200 人',
    budget: '¥8,000',
    status: '筹备中',
  },
  {
    key: 'm3',
    name: '旗舰新品直播预售',
    time: '2026-02-08 至 2026-02-09',
    reach: '12,800 人',
    budget: '¥12,000',
    status: '筹备中',
  },
  {
    key: 'm4',
    name: '情人节礼盒专区',
    time: '2026-02-10 至 2026-02-14',
    reach: '9,600 人',
    budget: '¥9,500',
    status: '未开始',
  },
]

const coupons = [
  { title: '满 500 减 50', desc: '适用于手机/平板类目', value: '8,200 张' },
  { title: '满 200 减 20', desc: '适用于耳机/配件类目', value: '12,400 张' },
  { title: '新人券', desc: '首单立减 30 元', value: '3,600 张' },
]

const channels = [
  { name: '短信触达', note: '今日发送 3,200 条', roi: 'ROI 3.2', color: 'green' },
  { name: '社群裂变', note: '裂变订单 320 单', roi: 'ROI 2.4', color: 'blue' },
  { name: '直播预热', note: '预约用户 1,280 人', roi: 'ROI 2.9', color: 'purple' },
]
</script>
