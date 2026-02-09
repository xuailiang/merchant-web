<template>
  <div class="ship-page">
    <div class="page-title">订单发货</div>

    <div class="ship-layout">
      <div class="ship-main">
        <a-card class="card-section" title="订单信息">
          <a-descriptions :column="2" size="small">
            <a-descriptions-item label="订单编号">{{ order.id }}</a-descriptions-item>
            <a-descriptions-item label="下单时间">{{ order.orderTime }}</a-descriptions-item>
            <a-descriptions-item label="收件人">{{ order.receiver }}</a-descriptions-item>
            <a-descriptions-item label="联系电话">{{ order.phone }}</a-descriptions-item>
            <a-descriptions-item label="收货地址" :span="2">{{ order.address }}</a-descriptions-item>
            <a-descriptions-item label="订单状态">{{ order.status }}</a-descriptions-item>
            <a-descriptions-item label="支付方式">{{ order.payMethod }}</a-descriptions-item>
          </a-descriptions>
        </a-card>

        <a-card class="card-section" title="商品清单">
          <a-table :columns="itemColumns" :data-source="order.items" :pagination="false" size="small">
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'product'">
                <div class="product-cell">
                  <img :src="record.image" alt="商品" />
                  <div>
                    <div class="product-title">{{ record.name }}</div>
                    <div class="product-meta">{{ record.sku }}</div>
                  </div>
                </div>
              </template>
            </template>
          </a-table>
        </a-card>

        <a-card class="card-section" title="发货信息">
          <a-form layout="vertical">
            <a-row :gutter="16">
              <a-col :xs="24" :lg="12">
                <a-form-item label="发货方式">
                  <a-radio-group v-model:value="deliveryType">
                    <a-radio value="快递发货">快递发货</a-radio>
                    <a-radio value="同城配送">同城配送</a-radio>
                    <a-radio value="门店自提">门店自提</a-radio>
                  </a-radio-group>
                </a-form-item>
              </a-col>
              <a-col :xs="24" :lg="12">
                <a-form-item label="运费承担">
                  <a-select v-model:value="freight" :options="freightOptions" :get-popup-container="getPopupContainer" />
                </a-form-item>
              </a-col>
            </a-row>

            <div class="shipment-header">
              <div class="shipment-title">包裹列表（支持一单多包裹）</div>
              <a-button type="primary" ghost @click="addShipment">新增包裹</a-button>
            </div>

            <div class="shipment-list">
              <a-card v-for="(ship, index) in shipments" :key="ship.id" class="shipment-card">
                <div class="shipment-card-header">
                  <div>包裹 {{ index + 1 }}</div>
                  <a-button type="link" danger @click="removeShipment(index)" v-if="shipments.length > 1">删除</a-button>
                </div>
                <a-row :gutter="16">
                  <a-col :xs="24" :lg="12">
                    <a-form-item label="物流公司">
                      <a-select v-model:value="ship.carrier" :options="carrierOptions" :get-popup-container="getPopupContainer" />
                    </a-form-item>
                  </a-col>
                  <a-col :xs="24" :lg="12">
                    <a-form-item label="物流单号">
                      <a-input v-model:value="ship.tracking" placeholder="请输入物流单号" />
                    </a-form-item>
                  </a-col>
                  <a-col :xs="24" :lg="12">
                    <a-form-item label="预计到达">
                      <a-date-picker v-model:value="ship.eta" style="width: 100%" :get-popup-container="getPopupContainer" />
                    </a-form-item>
                  </a-col>
                  <a-col :xs="24" :lg="6">
                    <a-form-item label="包裹数量">
                      <a-input-number v-model:value="ship.packages" :min="1" style="width: 100%" />
                    </a-form-item>
                  </a-col>
                  <a-col :xs="24" :lg="6">
                    <a-form-item label="包裹重量(kg)">
                      <a-input-number v-model:value="ship.weight" :min="0" style="width: 100%" />
                    </a-form-item>
                  </a-col>
                  <a-col :xs="24">
                    <a-form-item label="包裹商品">
                      <a-checkbox-group v-model:value="ship.itemKeys" class="item-picker">
                        <a-checkbox v-for="item in order.items" :key="item.key" :value="item.key">
                          {{ item.name }} × {{ item.qty }}
                        </a-checkbox>
                      </a-checkbox-group>
                    </a-form-item>
                  </a-col>
                  <a-col :xs="24">
                    <a-form-item label="包裹备注">
                      <a-textarea v-model:value="ship.note" :rows="2" placeholder="填写包裹备注" />
                    </a-form-item>
                  </a-col>
                </a-row>
              </a-card>
            </div>

            <a-form-item label="整体发货备注">
              <a-textarea v-model:value="note" :rows="3" placeholder="填写发货备注" />
            </a-form-item>
          </a-form>
        </a-card>
      </div>

      <div class="ship-side">
        <a-card title="发货操作" class="card-section">
          <div class="side-summary">
            <div>
              <div class="side-label">实付金额</div>
              <div class="side-value">{{ order.paidAmount }}</div>
            </div>
            <div>
              <div class="side-label">商品件数</div>
              <div class="side-value">{{ order.items.length }}</div>
            </div>
            <div>
              <div class="side-label">包裹数量</div>
              <div class="side-value">{{ shipments.length }}</div>
            </div>
            <div>
              <div class="side-label">发货方式</div>
              <div class="side-value">{{ deliveryType }}</div>
            </div>
          </div>
          <a-divider />
          <a-space direction="vertical" style="width: 100%">
            <a-button type="primary" block @click="submit">确认发货</a-button>
            <a-button block>打印面单</a-button>
            <a-button block>返回订单</a-button>
          </a-space>
        </a-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { message } from 'ant-design-vue'

const order = reactive({
  id: 'DD2026020417142',
  orderTime: '2026-02-04 17:14',
  receiver: 'admin',
  phone: '13567546709',
  address: '山东省济南市历下区新泺大街888号',
  status: '待发货',
  payMethod: '微信支付',
  paidAmount: '¥7,511',
  items: [
    {
      key: 'p1',
      name: 'Apple iPhone 16 Pro 颜色 黄色 内存 4G 容量规格 128GB',
      sku: '颜色：黄色 / 4G / 128GB',
      qty: 1,
      price: '¥7,499',
      image: 'https://picsum.photos/seed/ship1/80/80',
    },
    {
      key: 'p2',
      name: '官方保护壳（赠品）',
      sku: '黑色 / 软壳',
      qty: 1,
      price: '¥0',
      image: 'https://picsum.photos/seed/ship2/80/80',
    },
  ],
})

const itemColumns = [
  { title: '商品', key: 'product' },
  { title: '数量', dataIndex: 'qty', key: 'qty', width: 80 },
  { title: '单价', dataIndex: 'price', key: 'price', width: 120 },
]

const carrierOptions = [
  { label: '顺丰速运', value: '顺丰速运' },
  { label: '京东物流', value: '京东物流' },
  { label: '中通快递', value: '中通快递' },
  { label: '圆通速递', value: '圆通速递' },
]

const freightOptions = [
  { label: '商家承担', value: '商家承担' },
  { label: '客户承担', value: '客户承担' },
]

const deliveryType = ref('快递发货')
const freight = ref('商家承担')
const note = ref('')

const createShipment = () => ({
  id: `ship-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  carrier: '顺丰速运',
  tracking: '',
  eta: null as any,
  packages: 1,
  weight: 1,
  itemKeys: [order.items[0]?.key].filter(Boolean),
  note: '',
})

const shipments = reactive([createShipment()])

const addShipment = () => {
  shipments.push(createShipment())
}

const removeShipment = (index: number) => {
  shipments.splice(index, 1)
}

const submit = () => {
  const invalid = shipments.some((ship) => !ship.tracking)
  if (deliveryType.value === '快递发货' && invalid) {
    message.error('请填写所有包裹的物流单号')
    return
  }
  message.success('发货信息已提交，物流单号将同步给买家')
}

const getPopupContainer = (trigger: HTMLElement) => trigger?.parentNode || document.body
</script>

<style scoped>
.ship-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ship-layout {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 16px;
}

.card-section {
  margin-bottom: 16px;
}

.product-cell {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.product-cell img {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  object-fit: cover;
}

.product-title {
  font-weight: 600;
}

.product-meta {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 2px;
}

.shipment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 12px 0;
}

.shipment-title {
  font-weight: 600;
}

.shipment-list {
  display: grid;
  gap: 12px;
  margin-bottom: 12px;
}

.shipment-card {
  background: #f8fafc;
  border: 1px solid var(--border-color);
}

.shipment-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-weight: 600;
}

.item-picker {
  display: grid;
  gap: 6px;
}

.ship-side {
  position: sticky;
  top: 88px;
  align-self: flex-start;
}

.side-summary {
  display: grid;
  gap: 12px;
}

.side-label {
  font-size: 12px;
  color: var(--text-secondary);
}

.side-value {
  font-weight: 600;
  font-size: 16px;
}

@media (max-width: 1200px) {
  .ship-layout {
    grid-template-columns: 1fr;
  }

  .ship-side {
    position: static;
  }
}
</style>
