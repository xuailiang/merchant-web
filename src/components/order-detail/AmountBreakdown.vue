<template>
  <a-card id="section-amount" title="金额与优惠" class="od-section-card od-fade-in">
    <div class="od-amount-flow">
      <div class="flow-item">
        <span class="label">商品总额</span>
        <span class="value">¥{{ amount.goodsTotal }}</span>
      </div>
      <div class="arrow">+</div>
      <div class="flow-item">
        <span class="label">运费</span>
        <span class="value">¥{{ amount.freight }}</span>
      </div>
      <div class="arrow">-</div>
      <div class="flow-item discount">
        <span class="label">优惠合计</span>
        <span class="value">¥{{ totalDiscount }}</span>
      </div>
      <div class="arrow">=</div>
      <div class="flow-item total">
        <span class="label">实付金额</span>
        <span class="value">¥{{ amount.payAmount }}</span>
      </div>
    </div>

    <a-row :gutter="12" class="od-amount-grid">
      <a-col :xs="24" :md="12">
        <div class="od-amount-box">
          <div class="box-title">优惠拆分</div>
          <div class="od-amount-row">
            <span>平台券</span><strong>-¥{{ amount.platformCoupon }}</strong>
          </div>
          <div class="od-amount-row">
            <span>店铺券</span><strong>-¥{{ amount.storeCoupon }}</strong>
          </div>
          <div class="od-amount-row">
            <span>活动优惠</span><strong>-¥{{ amount.campaignDiscount }}</strong>
          </div>
          <div class="od-amount-row">
            <span>运费券</span><strong>-¥{{ amount.shippingCoupon }}</strong>
          </div>
          <div class="od-amount-row">
            <span>其他优惠</span><strong>-¥{{ amount.otherDiscount }}</strong>
          </div>
          <div class="od-amount-row">
            <span>积分抵扣</span><strong>-¥{{ amount.pointDiscount }}</strong>
          </div>
        </div>
      </a-col>
      <a-col :xs="24" :md="12">
        <div class="od-amount-box">
          <div class="box-title">支付信息</div>
          <div class="od-amount-row">
            <span>支付方式</span><strong>{{ payMethod }}</strong>
          </div>
          <div class="od-amount-row">
            <span>支付时间</span><strong>{{ payTime }}</strong>
          </div>
          <div class="od-amount-row">
            <span>支付订单号</span><strong class="mono">{{ payId }}</strong>
          </div>
          <div class="od-amount-row">
            <span>订单总额</span><strong>¥{{ amount.orderTotal }}</strong>
          </div>
        </div>
      </a-col>
    </a-row>
  </a-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { OrderAmountBreakdown } from '../../types/orderDetail'

const props = defineProps<{
  amount: OrderAmountBreakdown
  payMethod: string
  payTime: string
  payId: string
}>()

const totalDiscount = computed(() => {
  return (
    props.amount.platformCoupon +
    props.amount.storeCoupon +
    props.amount.campaignDiscount +
    props.amount.shippingCoupon +
    props.amount.otherDiscount +
    props.amount.pointDiscount
  )
})
</script>
