<template>
  <div>
    <div class="page-title">会员体系</div>

    <a-row :gutter="16" class="card-section">
      <a-col :xs="24" :lg="6">
        <a-card>
          <a-statistic title="会员总数" value="128,400" />
          <a-tag color="green">本月 +6.2%</a-tag>
        </a-card>
      </a-col>
      <a-col :xs="24" :lg="6">
        <a-card>
          <a-statistic title="活跃会员" value="42,180" />
          <a-tag color="blue">近30天</a-tag>
        </a-card>
      </a-col>
      <a-col :xs="24" :lg="6">
        <a-card>
          <a-statistic title="累计积分" value="9,820,000" />
          <a-tag color="orange">可用 68%</a-tag>
        </a-card>
      </a-col>
      <a-col :xs="24" :lg="6">
        <a-card>
          <a-statistic title="金豆余额" value="3,280,000" />
          <a-tag color="purple">近7天 +4%</a-tag>
        </a-card>
      </a-col>
    </a-row>

    <a-card class="card-section" title="会员等级">
      <div class="section-toolbar">
        <a-button type="primary">新增等级</a-button>
        <a-button>导入配置</a-button>
      </div>
      <a-table :columns="levelColumns" :data-source="levelData" :pagination="false">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'benefits'">
            <a-space wrap>
              <a-tag v-for="benefit in record.benefits" :key="benefit" color="geekblue">{{ benefit }}</a-tag>
            </a-space>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link">编辑</a-button>
              <a-button type="link">配置权益</a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <a-row :gutter="16" class="card-section">
      <a-col :xs="24" :lg="12">
        <a-card title="积分规则">
          <a-list :data-source="pointsRules">
            <template #renderItem="{ item }">
              <a-list-item>
                <a-list-item-meta :title="item.title" :description="item.desc" />
                <div class="rule-value">{{ item.value }}</div>
              </a-list-item>
            </template>
          </a-list>
        </a-card>
      </a-col>
      <a-col :xs="24" :lg="12">
        <a-card title="金豆体系">
          <a-list :data-source="beanRules">
            <template #renderItem="{ item }">
              <a-list-item>
                <a-list-item-meta :title="item.title" :description="item.desc" />
                <div class="rule-value">{{ item.value }}</div>
              </a-list-item>
            </template>
          </a-list>
        </a-card>
      </a-col>
    </a-row>

    <a-card class="card-section" title="积分兑换">
      <div class="section-toolbar">
        <a-space>
          <a-select v-model:value="filters.exchangeType" :options="exchangeOptions" placeholder="兑换类型" :get-popup-container="getPopupContainer" />
          <a-input v-model:value="filters.exchangeKeyword" placeholder="搜索兑换商品" allow-clear />
        </a-space>
        <a-button type="primary">新增兑换商品</a-button>
      </div>
      <a-table :columns="exchangeColumns" :data-source="exchangeData" :pagination="{ pageSize: 6 }" :scroll="{ x: 900 }">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'stock'">
            <a-progress :percent="record.stockRate" size="small" />
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link">编辑</a-button>
              <a-button type="link">下架</a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <a-card class="card-section" title="会员价格">
      <a-table :columns="priceColumns" :data-source="priceData" :pagination="{ pageSize: 5 }" :scroll="{ x: 900 }">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'price'">
            <div class="price-cell">¥{{ record.memberPrice }}</div>
            <div class="price-sub">原价 ¥{{ record.originalPrice }}</div>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link">设置会员价</a-button>
              <a-button type="link">同步库存</a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

const levelColumns = [
  { title: '等级', dataIndex: 'level', key: 'level', width: 100 },
  { title: '名称', dataIndex: 'name', key: 'name', width: 140 },
  { title: '成长值区间', dataIndex: 'growth', key: 'growth', width: 160 },
  { title: '折扣', dataIndex: 'discount', key: 'discount', width: 100 },
  { title: '权益', key: 'benefits' },
  { title: '操作', key: 'action', width: 160 },
]

const levelData = [
  { key: 'l1', level: 'V1', name: '青铜会员', growth: '0-999', discount: '98折', benefits: ['新人券', '积分加速'] },
  { key: 'l2', level: 'V2', name: '白银会员', growth: '1000-4999', discount: '95折', benefits: ['包邮券', '生日礼'] },
  { key: 'l3', level: 'V3', name: '黄金会员', growth: '5000-9999', discount: '9折', benefits: ['专属客服', '新品试用'] },
  { key: 'l4', level: 'V4', name: '钻石会员', growth: '10000+', discount: '88折', benefits: ['专属折扣', '优先发货'] },
]

const pointsRules = [
  { title: '消费积分', desc: '每消费 1 元获得 1 积分', value: '1:1' },
  { title: '评价奖励', desc: '完成评价 +20 积分', value: '20 积分' },
  { title: '签到奖励', desc: '连续签到最高 50 积分', value: '5~50 积分' },
]

const beanRules = [
  { title: '金豆获取', desc: '每消费 10 元获得 1 金豆', value: '10:1' },
  { title: '金豆抵扣', desc: '1 金豆可抵扣 0.1 元', value: '0.1 元' },
  { title: '金豆有效期', desc: '发放后 365 天内有效', value: '365 天' },
]

const exchangeColumns = [
  { title: '兑换商品', dataIndex: 'name', key: 'name', width: 180 },
  { title: '兑换类型', dataIndex: 'type', key: 'type', width: 120 },
  { title: '积分消耗', dataIndex: 'points', key: 'points', width: 120 },
  { title: '库存/上限', key: 'stock', width: 200 },
  { title: '已兑换', dataIndex: 'used', key: 'used', width: 120 },
  { title: '操作', key: 'action', width: 140 },
]

const exchangeData = [
  { key: 'e1', name: '运费抵扣券', type: '权益券', points: 200, stockRate: 68, used: 1280 },
  { key: 'e2', name: '会员礼盒', type: '实物商品', points: 1200, stockRate: 42, used: 320 },
  { key: 'e3', name: '新品试用资格', type: '活动权益', points: 500, stockRate: 80, used: 640 },
]

const priceColumns = [
  { title: '商品名称', dataIndex: 'name', key: 'name', width: 220 },
  { title: '会员等级', dataIndex: 'level', key: 'level', width: 120 },
  { title: '会员价', key: 'price', width: 140 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 120 },
  { title: '操作', key: 'action', width: 160 },
]

const priceData = [
  { key: 'p1', name: '猫爬架四层大型豪华猫玩具', level: '黄金会员', memberPrice: 199, originalPrice: 239, status: '生效中' },
  { key: 'p2', name: '智能手环 Pro', level: '白银会员', memberPrice: 899, originalPrice: 999, status: '生效中' },
  { key: 'p3', name: '空气净化器 Pro', level: '钻石会员', memberPrice: 2680, originalPrice: 2999, status: '待生效' },
]

const filters = reactive({
  exchangeType: '',
  exchangeKeyword: '',
})

const exchangeOptions = [
  { label: '全部类型', value: '' },
  { label: '权益券', value: '权益券' },
  { label: '实物商品', value: '实物商品' },
  { label: '活动权益', value: '活动权益' },
]

const getPopupContainer = (trigger: HTMLElement) => trigger?.parentNode || document.body
</script>

<style scoped>
.card-section {
  margin-bottom: 16px;
}

.section-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  gap: 12px;
  flex-wrap: wrap;
}

.rule-value {
  color: #1d4ed8;
  font-weight: 600;
}

.price-cell {
  font-weight: 600;
  color: #ef4444;
}

.price-sub {
  color: var(--text-secondary);
  font-size: 12px;
}
</style>
