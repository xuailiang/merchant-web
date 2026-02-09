<template>
  <div>
    <div class="page-title">门店信息</div>
    <a-row :gutter="16">
      <a-col :xs="24" :lg="16">
        <a-card title="门店基础信息" class="card-section">
          <a-form layout="vertical">
            <a-row :gutter="16">
              <a-col :xs="24" :md="12">
                <a-form-item label="门店名称">
                  <a-input v-model:value="form.name" />
                </a-form-item>
              </a-col>
              <a-col :xs="24" :md="12">
                <a-form-item label="门店编号">
                  <a-input v-model:value="form.code" disabled />
                </a-form-item>
              </a-col>
              <a-col :xs="24" :md="12">
                <a-form-item label="门店负责人">
                  <a-input v-model:value="form.owner" />
                </a-form-item>
              </a-col>
              <a-col :xs="24" :md="12">
                <a-form-item label="联系电话">
                  <a-input v-model:value="form.phone" />
                </a-form-item>
              </a-col>
              <a-col :xs="24">
                <a-form-item label="门店地址">
                  <a-input v-model:value="form.address" />
                </a-form-item>
              </a-col>
            </a-row>
            <a-button type="primary">保存门店信息</a-button>
          </a-form>
        </a-card>

        <a-card title="营业信息" class="card-section">
          <a-row :gutter="16">
            <a-col :xs="24" :md="8">
              <a-statistic title="本月营业额" value="¥428,200" />
            </a-col>
            <a-col :xs="24" :md="8">
              <a-statistic title="订单完成率" value="96.2%" />
            </a-col>
            <a-col :xs="24" :md="8">
              <a-statistic title="平均评分" value="4.8" />
            </a-col>
          </a-row>
        </a-card>
      </a-col>

      <a-col :xs="24" :lg="8">
        <a-card title="门店资质" class="card-section">
          <a-descriptions :column="1">
            <a-descriptions-item label="营业执照">已上传</a-descriptions-item>
            <a-descriptions-item label="食品许可">2026-12-31 到期</a-descriptions-item>
            <a-descriptions-item label="法人身份证">已认证</a-descriptions-item>
          </a-descriptions>
          <a-divider />
          <a-button type="primary" block>更新资质</a-button>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

const form = reactive({
  name: '星辰数码旗舰店',
  code: 'SHOP-20260012',
  owner: '张晓晨',
  phone: '400-800-9900',
  address: '上海市浦东新区银城路 88 号',
})
</script>
