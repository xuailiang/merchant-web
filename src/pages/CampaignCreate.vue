<template>
  <div class="campaign-create">
    <div class="page-title">创建活动</div>

    <div class="toolbar">
      <div class="toolbar-info">
        <div class="toolbar-title">活动配置</div>
        <div class="toolbar-meta">秒杀 / 满减 / 组合优惠 / 会员专享等多种玩法</div>
      </div>
      <a-space>
        <a-button>保存草稿</a-button>
        <a-button type="primary">提交审核</a-button>
      </a-space>
    </div>

    <div class="builder">
      <div class="form-panel">
        <a-form layout="vertical">
          <a-card class="card-section" title="基础信息">
            <a-row :gutter="16">
              <a-col :xs="24" :lg="12">
                <a-form-item label="活动名称">
                  <a-input v-model:value="form.name" placeholder="例如：春季上新秒杀" />
                </a-form-item>
              </a-col>
              <a-col :xs="24" :lg="12">
                <a-form-item label="活动类型">
                  <a-select
                    v-model:value="form.type"
                    :options="typeOptions"
                    :get-popup-container="getPopupContainer"
                  />
                </a-form-item>
              </a-col>
              <a-col :xs="24" :lg="8">
                <a-form-item label="活动标签">
                  <a-select v-model:value="form.tags" mode="multiple" placeholder="选择标签">
                    <a-select-option value="限时">限时</a-select-option>
                    <a-select-option value="爆款">爆款</a-select-option>
                    <a-select-option value="会员专享">会员专享</a-select-option>
                    <a-select-option value="节日活动">节日活动</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :xs="24" :lg="8">
                <a-form-item label="活动渠道">
                  <a-select
                    v-model:value="form.channel"
                    :options="channelOptions"
                    :get-popup-container="getPopupContainer"
                  />
                </a-form-item>
              </a-col>
              <a-col :xs="24" :lg="8">
                <a-form-item label="活动负责人">
                  <a-input v-model:value="form.owner" placeholder="负责人姓名" />
                </a-form-item>
              </a-col>
              <a-col :xs="24">
                <a-form-item label="活动说明">
                  <a-textarea
                    v-model:value="form.description"
                    :rows="3"
                    placeholder="简要描述活动亮点"
                  />
                </a-form-item>
              </a-col>
            </a-row>
          </a-card>

          <a-card class="card-section" title="活动规则">
            <a-row :gutter="16">
              <a-col v-if="form.type === '秒杀活动'" :xs="24" :lg="8">
                <a-form-item label="秒杀价格">
                  <a-input-number v-model:value="form.flashPrice" :min="1" style="width: 100%" />
                </a-form-item>
              </a-col>
              <a-col v-if="form.type === '秒杀活动'" :xs="24" :lg="8">
                <a-form-item label="限购数量">
                  <a-input-number v-model:value="form.flashLimit" :min="1" style="width: 100%" />
                </a-form-item>
              </a-col>
              <a-col v-if="form.type === '满减活动'" :xs="24" :lg="8">
                <a-form-item label="满减门槛">
                  <a-input-number v-model:value="form.fullThreshold" :min="1" style="width: 100%" />
                </a-form-item>
              </a-col>
              <a-col v-if="form.type === '满减活动'" :xs="24" :lg="8">
                <a-form-item label="减免金额">
                  <a-input-number v-model:value="form.fullDiscount" :min="1" style="width: 100%" />
                </a-form-item>
              </a-col>
              <a-col v-if="form.type === '满赠活动'" :xs="24" :lg="8">
                <a-form-item label="满赠门槛">
                  <a-input-number v-model:value="form.giftThreshold" :min="1" style="width: 100%" />
                </a-form-item>
              </a-col>
              <a-col v-if="form.type === '满赠活动'" :xs="24" :lg="8">
                <a-form-item label="赠品名称">
                  <a-input v-model:value="form.giftName" placeholder="例如：定制礼盒" />
                </a-form-item>
              </a-col>
              <a-col v-if="form.type === '会员专享'" :xs="24" :lg="8">
                <a-form-item label="会员等级">
                  <a-select
                    v-model:value="form.memberLevel"
                    :options="memberOptions"
                    :get-popup-container="getPopupContainer"
                  />
                </a-form-item>
              </a-col>
              <a-col v-if="form.type === '组合优惠'" :xs="24" :lg="8">
                <a-form-item label="组合折扣">
                  <a-input-number
                    v-model:value="form.bundleRate"
                    :min="1"
                    :max="99"
                    style="width: 100%"
                  />
                </a-form-item>
              </a-col>
              <a-col :xs="24" :lg="8">
                <a-form-item label="活动库存">
                  <a-input-number v-model:value="form.stock" :min="1" style="width: 100%" />
                </a-form-item>
              </a-col>
              <a-col :xs="24" :lg="8">
                <a-form-item label="叠加优惠">
                  <a-radio-group v-model:value="form.stackable">
                    <a-radio value="允许">允许</a-radio>
                    <a-radio value="不允许">不允许</a-radio>
                  </a-radio-group>
                </a-form-item>
              </a-col>
            </a-row>
          </a-card>

          <a-card class="card-section" title="时间与范围">
            <a-row :gutter="16">
              <a-col :xs="24" :lg="12">
                <a-form-item label="活动时间">
                  <a-range-picker
                    v-model:value="form.dateRange"
                    style="width: 100%"
                    :get-popup-container="getPopupContainer"
                  />
                </a-form-item>
              </a-col>
              <a-col :xs="24" :lg="12">
                <a-form-item label="适用范围">
                  <a-radio-group v-model:value="form.scope">
                    <a-radio value="全店">全店</a-radio>
                    <a-radio value="指定分类">指定分类</a-radio>
                    <a-radio value="指定商品">指定商品</a-radio>
                  </a-radio-group>
                </a-form-item>
              </a-col>
              <a-col v-if="form.scope === '指定分类'" :xs="24" :lg="12">
                <a-form-item label="选择分类">
                  <a-select
                    v-model:value="form.categories"
                    mode="multiple"
                    placeholder="请选择分类"
                  >
                    <a-select-option value="宠物生活">宠物生活</a-select-option>
                    <a-select-option value="数码电器">数码电器</a-select-option>
                    <a-select-option value="家居家装">家居家装</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col v-if="form.scope === '指定商品'" :xs="24" :lg="12">
                <a-form-item label="选择商品">
                  <a-select v-model:value="form.products" mode="multiple" placeholder="请选择商品">
                    <a-select-option value="猫爬架">猫爬架</a-select-option>
                    <a-select-option value="智能手环">智能手环</a-select-option>
                    <a-select-option value="儿童推车">儿童推车</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
            </a-row>
          </a-card>
        </a-form>
      </div>

      <div class="preview-panel">
        <a-card class="preview-card" title="活动预览">
          <div class="preview-title">{{ form.name || '活动名称' }}</div>
          <a-tag color="volcano">{{ form.type }}</a-tag>
          <div class="preview-value">{{ previewHighlight }}</div>
          <div class="preview-meta">渠道：{{ form.channel }}</div>
          <div class="preview-meta">库存：{{ form.stock }}</div>
          <div class="preview-tags">
            <a-tag v-for="tag in form.tags" :key="tag" color="geekblue">{{ tag }}</a-tag>
          </div>
          <a-divider />
          <div class="preview-meta">叠加优惠：{{ form.stackable }}</div>
          <div class="preview-meta">范围：{{ form.scope }}</div>
        </a-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'

const typeOptions = ['秒杀活动', '满减活动', '满赠活动', '组合优惠', '会员专享'].map((value) => ({
  label: value,
  value,
}))
const channelOptions = ['线上活动', '线下门店', '会员专区', '直播间'].map((value) => ({
  label: value,
  value,
}))
const memberOptions = ['普通会员', '银卡会员', '金卡会员', '黑金会员'].map((value) => ({
  label: value,
  value,
}))

const form = reactive({
  name: '',
  type: '秒杀活动',
  tags: ['限时'],
  channel: '线上活动',
  owner: '余心几',
  description: '',
  flashPrice: 99,
  flashLimit: 1,
  fullThreshold: 299,
  fullDiscount: 30,
  giftThreshold: 199,
  giftName: '定制礼盒',
  memberLevel: '银卡会员',
  bundleRate: 85,
  stock: 2000,
  stackable: '不允许',
  dateRange: null,
  scope: '全店',
  categories: [],
  products: [],
})

const previewHighlight = computed(() => {
  if (form.type === '秒杀活动') return `秒杀价 ¥${form.flashPrice}`
  if (form.type === '满减活动') return `满${form.fullThreshold}减${form.fullDiscount}`
  if (form.type === '满赠活动') return `满${form.giftThreshold}赠${form.giftName}`
  if (form.type === '组合优惠') return `组合折扣 ${form.bundleRate}折`
  return `会员等级：${form.memberLevel}`
})

const getPopupContainer = (trigger: HTMLElement) => trigger?.parentNode || document.body
</script>

<style scoped>
.campaign-create {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  padding: 16px 20px;
  border-radius: 12px;
  background: #fff;
  border: 1px solid var(--border-color);
}

.toolbar-title {
  font-weight: 600;
  font-size: 16px;
}

.toolbar-meta {
  margin-top: 4px;
  font-size: 12px;
  color: var(--text-secondary);
}

.builder {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 16px;
}

.card-section {
  margin-bottom: 16px;
}

.preview-panel {
  position: sticky;
  top: 88px;
  align-self: flex-start;
}

.preview-card {
  background: linear-gradient(135deg, #fff7ed, #ffffff);
}

.preview-title {
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 8px;
}

.preview-value {
  font-size: 22px;
  font-weight: 700;
  color: #f97316;
  margin: 12px 0;
}

.preview-meta {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 6px;
}

.preview-tags {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

@media (max-width: 1200px) {
  .builder {
    grid-template-columns: 1fr;
  }

  .preview-panel {
    position: static;
  }
}
</style>
