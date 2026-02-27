<template>
  <div>
    <div class="page-title">商户信息</div>

    <a-row :gutter="16">
      <a-col :xs="24" :lg="12">
        <a-card class="card-section">
          <div class="section-title">经营者信息编辑</div>
          <a-form layout="vertical">
            <a-card class="inner-card" size="small">
              <a-row :gutter="16">
                <a-col :xs="24" :lg="16">
                  <a-form-item label="营业执照上传" required>
                    <a-upload
                      list-type="picture-card"
                      :file-list="licenseFiles"
                      :before-upload="() => false"
                    >
                      <div v-if="licenseFiles.length < 1">
                        <PlusOutlined />
                        <div style="margin-top: 8px">上传</div>
                      </div>
                    </a-upload>
                    <div class="help-text">
                      最多支持1张,须原件拍照上传，附件仅支持jpg、jpeg、png、bmp图片格式
                    </div>
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :lg="8">
                  <div class="info-panel">
                    <div class="info-title">资质提醒</div>
                    <div class="info-text">请确保上传清晰证件照片，避免信息遮挡。</div>
                    <div class="info-text">证件信息将用于商户资质审核。</div>
                  </div>
                </a-col>
              </a-row>

              <a-row :gutter="16">
                <a-col :xs="24" :md="6">
                  <a-form-item label="统一信用代码">
                    <a-input v-model:value="operator.creditCode" />
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :md="10">
                  <a-form-item label="市场主体">
                    <a-input v-model:value="operator.entity" />
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :md="8">
                  <a-form-item label="登记类型">
                    <a-select
                      v-model:value="operator.registerType"
                      :options="registerTypeOptions"
                      placeholder="请选择"
                    />
                  </a-form-item>
                </a-col>
              </a-row>

              <a-row :gutter="16">
                <a-col :xs="24" :md="6">
                  <a-form-item label="法人代表/负责人">
                    <a-input v-model:value="operator.legalPerson" />
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :md="6">
                  <a-form-item label="注册资本">
                    <a-input v-model:value="operator.capital" addon-after="元" />
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :md="6">
                  <a-form-item label="货币单位">
                    <a-select
                      v-model:value="operator.currency"
                      :options="currencyOptions"
                      placeholder="请选择"
                    />
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :md="6">
                  <a-form-item label="登记状态">
                    <a-select
                      v-model:value="operator.registerStatus"
                      :options="statusOptions"
                      placeholder="请选择"
                    />
                  </a-form-item>
                </a-col>
              </a-row>

              <a-row :gutter="16">
                <a-col :xs="24" :md="6">
                  <a-form-item label="成立日期">
                    <a-date-picker v-model:value="operator.establishedAt" style="width: 100%" />
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :md="12">
                  <a-form-item label="营业期限">
                    <a-range-picker v-model:value="operator.businessRange" style="width: 100%" />
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :md="6">
                  <a-form-item label="核准日期">
                    <a-date-picker v-model:value="operator.approvedAt" style="width: 100%" />
                  </a-form-item>
                </a-col>
              </a-row>

              <a-row :gutter="16">
                <a-col :xs="24" :md="14">
                  <a-form-item label="住所(经营场所)">
                    <a-input v-model:value="operator.address" />
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :md="10">
                  <a-form-item label="登记机关">
                    <a-input v-model:value="operator.authority" />
                  </a-form-item>
                </a-col>
              </a-row>

              <a-row :gutter="16">
                <a-col :xs="24" :md="14">
                  <a-form-item label="经营场所行政区">
                    <a-space>
                      <a-select
                        v-model:value="operator.province"
                        :options="provinceOptions"
                        placeholder="省"
                      />
                      <a-select
                        v-model:value="operator.city"
                        :options="cityOptions"
                        placeholder="市"
                      />
                      <a-select
                        v-model:value="operator.district"
                        :options="districtOptions"
                        placeholder="区"
                      />
                    </a-space>
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :md="10">
                  <a-form-item label="市场主体类型">
                    <a-select
                      v-model:value="operator.entityType"
                      :options="entityTypeOptions"
                      placeholder="请选择"
                    />
                  </a-form-item>
                </a-col>
              </a-row>

              <a-row :gutter="16">
                <a-col :xs="24" :md="12">
                  <a-form-item label="经营类目">
                    <a-select
                      v-model:value="operator.categories"
                      mode="multiple"
                      :options="categoryOptions"
                    />
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :md="12">
                  <a-form-item label="法人证件号">
                    <a-input v-model:value="operator.legalId" />
                  </a-form-item>
                </a-col>
              </a-row>

              <a-row :gutter="16">
                <a-col :xs="24" :md="12">
                  <a-form-item label="身份证" required>
                    <a-upload
                      list-type="picture-card"
                      :file-list="idFiles"
                      :before-upload="() => false"
                    >
                      <div v-if="idFiles.length < 2">
                        <PlusOutlined />
                        <div style="margin-top: 8px">上传</div>
                      </div>
                    </a-upload>
                    <div class="help-text">
                      最多支持2张,须原件拍照上传，附件仅支持jpg、jpeg、png、bmp图片格式（依次上传正反面）
                    </div>
                  </a-form-item>
                </a-col>
              </a-row>

              <a-row :gutter="16">
                <a-col :xs="24" :md="12">
                  <a-form-item label="经营范围">
                    <a-textarea
                      v-model:value="operator.scope"
                      :rows="3"
                      placeholder="请输入经营范围"
                    />
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :md="12">
                  <a-form-item label="免于市场主体登记自我声明信息(非必填)">
                    <a-textarea
                      v-model:value="operator.declare"
                      :rows="3"
                      placeholder="请输入声明信息"
                    />
                  </a-form-item>
                </a-col>
              </a-row>
            </a-card>
          </a-form>
        </a-card>
      </a-col>

      <a-col :xs="24" :lg="12">
        <a-card class="card-section">
          <div class="section-title">店铺基本信息</div>
          <a-form layout="vertical">
            <a-card class="inner-card" size="small">
              <a-row :gutter="16">
                <a-col :xs="24" :md="8">
                  <a-form-item label="店铺名称" required>
                    <a-input v-model:value="store.name" />
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :md="8">
                  <a-form-item label="电子商务类型">
                    <a-select
                      v-model:value="store.ecomType"
                      :options="ecomOptions"
                      placeholder="请选择"
                    />
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :md="8">
                  <a-form-item label="负责人/联系人">
                    <a-input v-model:value="store.owner" />
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :md="8">
                  <a-form-item label="职务">
                    <a-input v-model:value="store.position" placeholder="如电商运营专员" />
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :md="8">
                  <a-form-item label="联系电话">
                    <a-input v-model:value="store.phone" />
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :md="8">
                  <a-form-item label="客服电话">
                    <a-input v-model:value="store.servicePhone" />
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :md="8">
                  <a-form-item label="店铺类型">
                    <a-select
                      v-model:value="store.type"
                      :options="storeTypeOptions"
                      placeholder="请选择"
                    />
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :md="8">
                  <a-form-item label="开店时间">
                    <a-date-picker v-model:value="store.openAt" style="width: 100%" />
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :md="8">
                  <a-form-item label="常用发货地">
                    <a-input v-model:value="store.shipLocation" />
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :md="8">
                  <a-form-item label="店铺所在地">
                    <a-input v-model:value="store.location" />
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :md="8">
                  <a-form-item label="店铺经纬度">
                    <a-input v-model:value="store.geo" />
                    <div class="help-text">
                      1、百度搜索经纬度查询；2、输入地址得到百度地图经纬度信息。例：103.85,36.04
                    </div>
                  </a-form-item>
                </a-col>
              </a-row>

              <a-form-item label="店铺Logo" required>
                <a-upload
                  list-type="picture-card"
                  :file-list="logoFiles"
                  :before-upload="() => false"
                >
                  <div v-if="logoFiles.length < 1">
                    <PlusOutlined />
                    <div style="margin-top: 8px">上传</div>
                  </div>
                </a-upload>
                <div class="help-text">
                  最多支持1张,须原件拍照上传，附件仅支持jpg、jpeg、png、bmp图片格式
                </div>
              </a-form-item>
            </a-card>
          </a-form>
        </a-card>

        <a-card class="card-section">
          <div class="section-title">账户信息</div>
          <a-form layout="vertical">
            <a-card class="inner-card" size="small">
              <a-row :gutter="16">
                <a-col :xs="24" :md="8">
                  <a-form-item label="开户银行">
                    <a-input v-model:value="account.bank" />
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :md="16">
                  <a-form-item label="开户行名称">
                    <a-input
                      v-model:value="account.bankName"
                      placeholder="例如：中国工商银行山东省大明湖支行"
                    />
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :md="8">
                  <a-form-item label="开户行联行号">
                    <a-input v-model:value="account.bankCode" />
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :md="8">
                  <a-form-item label="收款人名称">
                    <a-input v-model:value="account.payee" />
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :md="8">
                  <a-form-item label="收款人账号">
                    <a-input v-model:value="account.payeeAccount" />
                    <div class="help-text">此项将影响收银款项打款，请务必填写正确</div>
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :md="8">
                  <a-form-item label="对公对私">
                    <a-radio-group v-model:value="account.publicType">
                      <a-radio value="public">对公</a-radio>
                      <a-radio value="private">对私</a-radio>
                    </a-radio-group>
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :md="8">
                  <a-form-item label="结算方式">
                    <a-select
                      v-model:value="account.settlement"
                      :options="settlementOptions"
                      placeholder="请选择"
                    />
                  </a-form-item>
                </a-col>
              </a-row>
            </a-card>
          </a-form>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { PlusOutlined } from '@ant-design/icons-vue'

const licenseFiles = ref([
  { uid: '1', name: 'license.png', status: 'done', url: 'https://picsum.photos/id/101/120/120' },
])
const idFiles = ref([
  { uid: '1', name: 'id-front.png', status: 'done', url: 'https://picsum.photos/id/102/120/120' },
  { uid: '2', name: 'id-back.png', status: 'done', url: 'https://picsum.photos/id/103/120/120' },
])
const logoFiles = ref([
  { uid: '1', name: 'logo.png', status: 'done', url: 'https://picsum.photos/id/104/120/120' },
])

const operator = reactive({
  creditCode: '00000000000000001',
  entity: '山东京宝淘东有限公司',
  registerType: '',
  legalPerson: '余心几',
  capital: '',
  currency: '',
  establishedAt: null as any,
  businessRange: [] as any[],
  approvedAt: null as any,
  address: '山东省济南市历下区新泺大街888号',
  authority: '',
  registerStatus: '',
  province: '',
  city: '',
  district: '',
  categories: ['宠物生活', '手机数码'],
  scope: '',
  declare: '',
  entityType: '',
  legalId: '370323199909091888',
})

const store = reactive({
  name: '拼京宝旗舰店',
  ecomType: '',
  owner: '余心几',
  position: '',
  phone: '13567546709',
  servicePhone: '13567546709',
  type: '',
  openAt: null as any,
  shipLocation: '',
  location: '山东',
  geo: '',
})

const account = reactive({
  bank: '中国银行',
  bankName: '中国银行',
  bankCode: '333333333333',
  payee: '余心几',
  payeeAccount: '444444444444444444',
  publicType: 'public',
  settlement: '',
})

const registerTypeOptions = [
  { label: '有限责任公司', value: '有限责任公司' },
  { label: '个体工商户', value: '个体工商户' },
]

const currencyOptions = [
  { label: '人民币', value: '人民币' },
  { label: '美元', value: '美元' },
]

const statusOptions = [
  { label: '存续', value: '存续' },
  { label: '注销', value: '注销' },
]

const provinceOptions = [{ label: '山东', value: '山东' }]
const cityOptions = [{ label: '济南', value: '济南' }]
const districtOptions = [{ label: '历下区', value: '历下区' }]

const categoryOptions = [
  { label: '宠物生活', value: '宠物生活' },
  { label: '手机数码', value: '手机数码' },
]

const entityTypeOptions = [
  { label: '企业', value: '企业' },
  { label: '个体户', value: '个体户' },
]

const ecomOptions = [
  { label: '自营电商', value: '自营电商' },
  { label: '平台店铺', value: '平台店铺' },
]

const storeTypeOptions = [
  { label: '旗舰店', value: '旗舰店' },
  { label: '专营店', value: '专营店' },
]

const settlementOptions = [
  { label: 'T+1', value: 'T+1' },
  { label: 'T+7', value: 'T+7' },
  { label: '月结', value: '月结' },
]
</script>

<style scoped>
.section-title {
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--text-primary);
}

.info-panel {
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 12px;
  background: #f8fafc;
  height: 100%;
}

.info-title {
  font-weight: 600;
  margin-bottom: 8px;
}

.info-text {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.6;
}

.inner-card {
  background: #f9fafb;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  margin-bottom: 12px;
}

.help-text {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 6px;
}
</style>
