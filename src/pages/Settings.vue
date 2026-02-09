<template>
  <div>
    <div class="page-title">系统设置</div>
    <a-card>
      <a-form layout="vertical">
        <a-row :gutter="16">
          <a-col :xs="24" :md="12">
            <a-form-item label="店铺名称">
              <a-input v-model:value="form.name" placeholder="请输入店铺名称" />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :md="12">
            <a-form-item label="客服电话">
              <a-input v-model:value="form.phone" placeholder="请输入客服电话" />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :md="12">
            <a-form-item label="发货仓库">
              <a-select v-model:value="form.warehouse" :options="warehouses" />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :md="12">
            <a-form-item label="默认物流">
              <a-select v-model:value="form.logistics" :options="logistics" />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :md="12">
            <a-form-item label="自动发货">
              <a-switch v-model:checked="form.autoShip" />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :md="12">
            <a-form-item label="短信通知">
              <a-switch v-model:checked="form.sms" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-button type="primary">保存设置</a-button>
      </a-form>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

const form = reactive({
  name: '星辰数码旗舰店',
  phone: '400-800-9900',
  warehouse: '华东仓',
  logistics: '顺丰速运',
  autoShip: true,
  sms: true,
})

const warehouses = [
  { label: '华东仓', value: '华东仓' },
  { label: '华南仓', value: '华南仓' },
  { label: '华北仓', value: '华北仓' },
]

const logistics = [
  { label: '顺丰速运', value: '顺丰速运' },
  { label: '京东物流', value: '京东物流' },
  { label: '中通快递', value: '中通快递' },
]
</script>
