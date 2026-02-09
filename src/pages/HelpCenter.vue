<template>
  <div>
    <div class="page-title">帮助中心</div>
    <a-row :gutter="16">
      <a-col :xs="24" :lg="16">
        <a-card title="常见问题" class="card-section">
          <a-collapse accordion>
            <a-collapse-panel v-for="item in faqs" :key="item.title" :header="item.title">
              <p class="faq-text">{{ item.answer }}</p>
            </a-collapse-panel>
          </a-collapse>
        </a-card>

        <a-card title="操作指引" class="card-section">
          <a-list :data-source="guides">
            <template #renderItem="{ item }">
              <a-list-item>
                <a-list-item-meta :title="item.title" :description="item.desc" />
                <a-button type="link">查看详情</a-button>
              </a-list-item>
            </template>
          </a-list>
        </a-card>
      </a-col>

      <a-col :xs="24" :lg="8">
        <a-card title="客服支持" class="card-section">
          <a-descriptions :column="1">
            <a-descriptions-item label="客服电话">400-800-9900</a-descriptions-item>
            <a-descriptions-item label="服务时间">09:00 - 21:00</a-descriptions-item>
            <a-descriptions-item label="工单邮箱">support@merchant.com</a-descriptions-item>
          </a-descriptions>
          <a-divider />
          <a-button type="primary" block>提交工单</a-button>
        </a-card>

        <a-card title="系统状态" class="card-section">
          <a-list :data-source="status" size="small">
            <template #renderItem="{ item }">
              <a-list-item>
                <a-list-item-meta :title="item.name" :description="item.desc" />
                <a-tag :color="item.color">{{ item.state }}</a-tag>
              </a-list-item>
            </template>
          </a-list>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
const faqs = [
  { title: '如何创建新商品？', answer: '在商品管理中点击“新增商品”，填写基础信息、规格与库存后保存即可。' },
  { title: '如何批量上架商品？', answer: '在商品列表勾选商品后，点击“批量上架”完成操作。' },
  { title: '优惠券核销异常怎么办？', answer: '可前往营销中心查看核销明细，若有异常请提交工单。' },
]

const guides = [
  { title: '商品上架流程', desc: '包含商品信息、库存、物流等完整步骤说明。' },
  { title: '营销活动配置', desc: '如何配置满减、折扣券与活动复盘。' },
  { title: '财务结算说明', desc: '账单周期、结算方式与常见问题。' },
]

const status = [
  { name: '商品服务', desc: '运行正常', state: '正常', color: 'green' },
  { name: '订单服务', desc: '运行正常', state: '正常', color: 'green' },
  { name: '营销服务', desc: '维护中', state: '维护', color: 'orange' },
]
</script>

<style scoped>
.faq-text {
  color: var(--text-secondary);
  line-height: 1.6;
}
</style>
