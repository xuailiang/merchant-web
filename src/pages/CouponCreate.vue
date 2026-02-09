<template>
  <div class="coupon-create">
    <div class="page-title">创建优惠券</div>

    <div class="toolbar">
      <div class="toolbar-info">
        <div class="toolbar-title">优惠券基础配置</div>
        <div class="toolbar-meta">支持满减 / 折扣 / 无门槛类型，创建后可在优惠券管理查看</div>
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
              <a-form-item label="券名称">
                <a-input v-model:value="form.name" placeholder="例如：新客首单立减券" />
              </a-form-item>
            </a-col>
            <a-col :xs="24" :lg="12">
              <a-form-item label="券类型">
                <a-radio-group v-model:value="form.type">
                  <a-radio value="满减券">满减券</a-radio>
                  <a-radio value="折扣券">折扣券</a-radio>
                  <a-radio value="无门槛券">无门槛券</a-radio>
                </a-radio-group>
              </a-form-item>
            </a-col>
            <a-col :xs="24" :lg="12">
              <a-form-item label="优惠券标签">
                <a-select v-model:value="form.tags" mode="multiple" placeholder="选择标签" :get-popup-container="getPopupContainer">
                  <a-select-option value="新人专享">新人专享</a-select-option>
                  <a-select-option value="会员专享">会员专享</a-select-option>
                  <a-select-option value="限时优惠">限时优惠</a-select-option>
                  <a-select-option value="大促预热">大促预热</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :xs="24" :lg="12">
              <a-form-item label="券码前缀">
                <a-input-group compact>
                  <a-input v-model:value="form.codePrefix" style="width: calc(100% - 88px)" placeholder="例如 SDYC" />
                  <a-button @click="generatePrefix">生成</a-button>
                </a-input-group>
              </a-form-item>
            </a-col>
            <a-col :xs="24">
              <a-form-item label="使用说明">
                <a-textarea v-model:value="form.description" :rows="3" placeholder="填写券使用范围、注意事项" />
              </a-form-item>
            </a-col>
          </a-row>
        </a-card>

        <a-card class="card-section" title="优惠规则">
          <a-row :gutter="16">
            <a-col v-if="form.type === '满减券'" :xs="24" :lg="8">
              <a-form-item label="使用门槛">
                <a-input-number v-model:value="form.threshold" :min="0" style="width: 100%" placeholder="满多少可用" />
              </a-form-item>
            </a-col>
            <a-col v-if="form.type === '满减券'" :xs="24" :lg="8">
              <a-form-item label="减免金额">
                <a-input-number v-model:value="form.discount" :min="0" style="width: 100%" placeholder="减多少" />
              </a-form-item>
            </a-col>
            <a-col v-if="form.type === '无门槛券'" :xs="24" :lg="8">
              <a-form-item label="立减金额">
                <a-input-number v-model:value="form.instant" :min="0" style="width: 100%" placeholder="立减金额" />
              </a-form-item>
            </a-col>
            <a-col v-if="form.type === '折扣券'" :xs="24" :lg="8">
              <a-form-item label="折扣力度">
                <a-input-number v-model:value="form.rate" :min="1" :max="99" style="width: 100%" placeholder="例如 9.5 折" />
              </a-form-item>
            </a-col>
            <a-col v-if="form.type === '折扣券'" :xs="24" :lg="8">
              <a-form-item label="最高优惠">
                <a-input-number v-model:value="form.maxReduce" :min="0" style="width: 100%" placeholder="最高减免金额" />
              </a-form-item>
            </a-col>
            <a-col :xs="24" :lg="8">
              <a-form-item label="叠加使用">
                <a-radio-group v-model:value="form.stackable">
                  <a-radio value="允许">允许</a-radio>
                  <a-radio value="不允许">不允许</a-radio>
                </a-radio-group>
              </a-form-item>
            </a-col>
          </a-row>
        </a-card>

        <a-card class="card-section" title="适用范围">
          <a-row :gutter="16">
            <a-col :xs="24" :lg="8">
              <a-form-item label="适用范围">
                <a-radio-group v-model:value="form.scope">
                  <a-radio value="全店通用">全店通用</a-radio>
                  <a-radio value="指定分类">指定分类</a-radio>
                  <a-radio value="指定商品">指定商品</a-radio>
                </a-radio-group>
              </a-form-item>
            </a-col>
            <a-col v-if="form.scope === '指定分类'" :xs="24" :lg="8">
              <a-form-item label="选择分类">
                <a-select v-model:value="form.categories" mode="multiple" placeholder="请选择分类" :get-popup-container="getPopupContainer">
                  <a-select-option value="宠物生活">宠物生活</a-select-option>
                  <a-select-option value="数码电器">数码电器</a-select-option>
                  <a-select-option value="家居家装">家居家装</a-select-option>
                  <a-select-option value="母婴用品">母婴用品</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col v-if="form.scope === '指定商品'" :xs="24" :lg="8">
              <a-form-item label="指定商品">
                <a-select v-model:value="form.products" mode="multiple" placeholder="选择商品" :get-popup-container="getPopupContainer">
                  <a-select-option value="猫爬架">猫爬架</a-select-option>
                  <a-select-option value="智能手环">智能手环</a-select-option>
                  <a-select-option value="儿童推车">儿童推车</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>
        </a-card>

        <a-card class="card-section" title="发放规则">
          <a-row :gutter="16">
            <a-col :xs="24" :lg="8">
              <a-form-item label="发放总量">
                <a-input-number v-model:value="form.total" :min="1" style="width: 100%" />
              </a-form-item>
            </a-col>
            <a-col :xs="24" :lg="8">
              <a-form-item label="单人限领">
                <a-input-number v-model:value="form.limit" :min="1" style="width: 100%" />
              </a-form-item>
            </a-col>
            <a-col :xs="24" :lg="8">
              <a-form-item label="发放渠道">
                <a-select v-model:value="form.channel" placeholder="选择渠道" :get-popup-container="getPopupContainer">
                  <a-select-option value="线上领券">线上领券</a-select-option>
                  <a-select-option value="门店发放">门店发放</a-select-option>
                  <a-select-option value="会员专享">会员专享</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :xs="24" :lg="12">
              <a-form-item label="领券时间">
                <a-range-picker v-model:value="form.claimRange" style="width: 100%" :get-popup-container="getPopupContainer" />
              </a-form-item>
            </a-col>
            <a-col :xs="24" :lg="12">
              <a-form-item label="生效周期">
                <a-radio-group v-model:value="form.validType">
                  <a-radio value="固定日期">固定日期</a-radio>
                  <a-radio value="领取后生效">领取后生效</a-radio>
                </a-radio-group>
              </a-form-item>
            </a-col>
            <a-col v-if="form.validType === '固定日期'" :xs="24" :lg="12">
              <a-form-item label="使用有效期">
                <a-range-picker v-model:value="form.validRange" style="width: 100%" :get-popup-container="getPopupContainer" />
              </a-form-item>
            </a-col>
            <a-col v-else :xs="24" :lg="6">
              <a-form-item label="领取后有效天数">
                <a-input-number v-model:value="form.validDays" :min="1" style="width: 100%" />
              </a-form-item>
            </a-col>
            <a-col :xs="24" :lg="6">
              <a-form-item label="使用提醒">
                <a-switch v-model:checked="form.remind" />
              </a-form-item>
            </a-col>
          </a-row>
        </a-card>
        </a-form>
      </div>

      <div class="preview-panel">
        <a-card class="preview-card" title="优惠券预览">
          <div class="preview-header">
            <div class="preview-title">{{ form.name || '优惠券名称' }}</div>
            <a-tag color="blue">{{ form.type }}</a-tag>
          </div>
          <div class="preview-value">{{ previewValue }}</div>
          <div class="preview-rule">{{ previewRule }}</div>
          <div class="preview-scope">适用范围：{{ form.scope }}</div>
          <div class="preview-meta">
            <span>总量 {{ form.total }} 张</span>
            <span>单人限领 {{ form.limit }} 张</span>
          </div>
          <div class="preview-tags">
            <a-tag v-for="tag in form.tags" :key="tag" color="geekblue">{{ tag }}</a-tag>
          </div>
          <a-divider />
          <div class="preview-extra">
            <div>发放渠道：{{ form.channel }}</div>
            <div>叠加使用：{{ form.stackable }}</div>
          </div>
        </a-card>

        <a-card class="card-section" title="快捷动作">
          <a-space direction="vertical" style="width: 100%">
            <a-button type="primary" block>一键生成券模板</a-button>
            <a-button block>复制配置</a-button>
            <a-button block>预览领券页面</a-button>
          </a-space>
        </a-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'

const form = reactive({
  name: '',
  type: '满减券',
  tags: ['新人专享'],
  codePrefix: 'SDYC',
  description: '',
  threshold: 199,
  discount: 30,
  instant: 20,
  rate: 9.5,
  maxReduce: 50,
  stackable: '允许',
  scope: '全店通用',
  categories: [],
  products: [],
  total: 2000,
  limit: 1,
  channel: '线上领券',
  claimRange: null,
  validType: '固定日期',
  validRange: null,
  validDays: 7,
  remind: true,
})

const previewValue = computed(() => {
  if (form.type === '满减券') return `¥${form.discount}`
  if (form.type === '折扣券') return `${form.rate}折`
  return `¥${form.instant}`
})

const previewRule = computed(() => {
  if (form.type === '满减券') return `满${form.threshold}减${form.discount}`
  if (form.type === '折扣券') return `最高减免 ¥${form.maxReduce}`
  return '无门槛立减'
})

const generatePrefix = () => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  form.codePrefix = Array.from({ length: 4 })
    .map(() => letters[Math.floor(Math.random() * letters.length)])
    .join('')
}

const getPopupContainer = (trigger: HTMLElement) => trigger?.parentNode || document.body
</script>

<style scoped>
.coupon-create {
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
  display: grid;
  gap: 16px;
}

.preview-card {
  background: linear-gradient(135deg, #e0f2fe, #ffffff);
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.preview-title {
  font-weight: 600;
  font-size: 16px;
}

.preview-value {
  font-size: 28px;
  font-weight: 700;
  color: #ef4444;
}

.preview-rule {
  margin-top: 8px;
  color: var(--text-secondary);
}

.preview-scope {
  margin-top: 12px;
  font-size: 12px;
  color: var(--text-secondary);
}

.preview-meta {
  margin-top: 12px;
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--text-secondary);
}

.preview-tags {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.preview-extra {
  display: grid;
  gap: 6px;
  font-size: 12px;
  color: var(--text-secondary);
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
