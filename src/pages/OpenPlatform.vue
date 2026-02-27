<template>
  <div class="open-platform-page">
    <div class="page-title">开放平台</div>

    <a-row :gutter="16" class="kpi-row">
      <a-col :xs="24" :md="12" :xl="6">
        <a-card class="kpi-card">
          <div class="kpi-label">启用 Webhook</div>
          <div class="kpi-value">{{ kpis.enabledWebhooks }}</div>
          <div class="kpi-sub">总 {{ store.webhooks.length }} 个</div>
        </a-card>
      </a-col>
      <a-col :xs="24" :md="12" :xl="6">
        <a-card class="kpi-card">
          <div class="kpi-label">活跃 API Key</div>
          <div class="kpi-value">{{ kpis.activeApiKeys }}</div>
          <div class="kpi-sub">总 {{ store.apiKeys.length }} 个</div>
        </a-card>
      </a-col>
      <a-col :xs="24" :md="12" :xl="6">
        <a-card class="kpi-card">
          <div class="kpi-label">已接入系统</div>
          <div class="kpi-value">{{ kpis.connectedIntegrations }}</div>
          <div class="kpi-sub">ERP/WMS 共 {{ store.integrations.length }} 个</div>
        </a-card>
      </a-col>
      <a-col :xs="24" :md="12" :xl="6">
        <a-card class="kpi-card">
          <div class="kpi-label">24h 推送成功率</div>
          <div class="kpi-value success">{{ kpis.successRate }}%</div>
          <div class="kpi-sub">Webhook + 对接同步</div>
        </a-card>
      </a-col>
    </a-row>

    <a-card>
      <a-tabs v-model:activeKey="activeTab">
        <a-tab-pane key="webhooks" tab="Webhook" />
        <a-tab-pane key="api-keys" tab="开放 API Key" />
        <a-tab-pane key="integrations" tab="第三方 ERP/WMS 对接" />
      </a-tabs>

      <div v-if="activeTab === 'webhooks'">
        <div class="toolbar">
          <a-space>
            <a-button type="primary" @click="openWebhookModal()">新增 Webhook</a-button>
            <a-button @click="message.info('已执行一次全量健康检查')">健康检查</a-button>
          </a-space>
        </div>
        <a-table
          :columns="webhookColumns"
          :data-source="store.webhooks"
          row-key="id"
          :pagination="false"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'events'">
              <a-space wrap>
                <a-tag v-for="evt in record.events" :key="evt" color="blue">{{ evt }}</a-tag>
              </a-space>
            </template>
            <template v-else-if="column.key === 'enabled'">
              <a-switch :checked="record.enabled" @change="toggleWebhook(record.id)" />
            </template>
            <template v-else-if="column.key === 'rate'">
              <a-progress :percent="record.successRate" size="small" />
            </template>
            <template v-else-if="column.key === 'action'">
              <a-space>
                <a-button type="link" @click="testWebhook(record.id)">测试推送</a-button>
                <a-button type="link" @click="openWebhookModal(record)">编辑</a-button>
                <a-button type="link" danger @click="removeWebhook(record.id)">删除</a-button>
              </a-space>
            </template>
          </template>
        </a-table>
      </div>

      <div v-else-if="activeTab === 'api-keys'">
        <div class="toolbar">
          <a-space>
            <a-button type="primary" @click="openApiKeyModal()">创建 API Key</a-button>
            <a-button @click="message.info('已导出密钥审计记录')">导出审计</a-button>
          </a-space>
        </div>
        <a-alert
          v-if="latestSecret"
          type="success"
          show-icon
          banner
          :message="`新密钥已生成（仅展示一次）：${latestSecret}`"
          closable
          @close="latestSecret = ''"
          style="margin-bottom: 12px"
        />
        <a-table
          :columns="apiKeyColumns"
          :data-source="store.apiKeys"
          row-key="id"
          :pagination="false"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'scopes'">
              <a-space wrap>
                <a-tag v-for="scope in record.scopes" :key="scope" color="purple">{{
                  scope
                }}</a-tag>
              </a-space>
            </template>
            <template v-else-if="column.key === 'status'">
              <a-tag
                :color="
                  record.status === '启用'
                    ? 'green'
                    : record.status === '禁用'
                      ? 'orange'
                      : 'default'
                "
              >
                {{ record.status }}
              </a-tag>
            </template>
            <template v-else-if="column.key === 'action'">
              <a-space>
                <a-button type="link" @click="rotateApiKey(record.id)">轮换</a-button>
                <a-button type="link" @click="toggleApiKey(record.id)">
                  {{ record.status === '启用' ? '禁用' : '启用' }}
                </a-button>
                <a-button type="link" danger @click="revokeApiKey(record.id)">吊销</a-button>
              </a-space>
            </template>
          </template>
        </a-table>
      </div>

      <div v-else>
        <a-row :gutter="16">
          <a-col :xs="24" :xl="15">
            <a-table
              :columns="integrationColumns"
              :data-source="store.integrations"
              row-key="id"
              :pagination="false"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'status'">
                  <a-tag
                    :color="
                      record.status === '已连接'
                        ? 'green'
                        : record.status === '同步异常'
                          ? 'red'
                          : 'default'
                    "
                  >
                    {{ record.status }}
                  </a-tag>
                </template>
                <template v-else-if="column.key === 'rate'">
                  <a-progress :percent="record.successRate" size="small" />
                </template>
                <template v-else-if="column.key === 'action'">
                  <a-space>
                    <a-button type="link" @click="openIntegrationDrawer(record)">配置</a-button>
                    <a-button type="link" @click="syncIntegration(record.id)">立即同步</a-button>
                    <a-button type="link" @click="viewIntegrationLogs(record.id)">日志</a-button>
                  </a-space>
                </template>
              </template>
            </a-table>
          </a-col>
          <a-col :xs="24" :xl="9">
            <a-card title="同步日志" size="small" class="log-card">
              <a-table
                :columns="logColumns"
                :data-source="filteredLogs"
                row-key="id"
                :pagination="{ pageSize: 5 }"
                size="small"
              >
                <template #bodyCell="{ column, record }">
                  <template v-if="column.key === 'status'">
                    <a-tag :color="record.status === '成功' ? 'green' : 'red'">{{
                      record.status
                    }}</a-tag>
                  </template>
                </template>
              </a-table>
            </a-card>
          </a-col>
        </a-row>
      </div>
    </a-card>

    <a-modal
      v-model:open="webhookModalOpen"
      :title="webhookForm.id ? '编辑 Webhook' : '新增 Webhook'"
      @ok="submitWebhook"
    >
      <a-form layout="vertical">
        <a-form-item label="名称" required>
          <a-input v-model:value="webhookForm.name" />
        </a-form-item>
        <a-form-item label="回调地址" required>
          <a-input v-model:value="webhookForm.url" placeholder="https://example.com/webhook" />
        </a-form-item>
        <a-form-item label="事件订阅" required>
          <a-select
            v-model:value="webhookForm.events"
            mode="multiple"
            :options="eventOptions"
            :get-popup-container="getPopupContainer"
          />
        </a-form-item>
        <a-row :gutter="12">
          <a-col :span="12">
            <a-form-item label="超时(秒)">
              <a-input-number v-model:value="webhookForm.timeoutSec" :min="1" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="失败重试次数">
              <a-input-number v-model:value="webhookForm.retryLimit" :min="0" style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>

    <a-modal v-model:open="apiKeyModalOpen" title="创建 API Key" @ok="submitApiKey">
      <a-form layout="vertical">
        <a-form-item label="应用名称" required>
          <a-input v-model:value="apiKeyForm.appName" />
        </a-form-item>
        <a-form-item label="权限范围" required>
          <a-select
            v-model:value="apiKeyForm.scopes"
            mode="multiple"
            :options="scopeOptions"
            :get-popup-container="getPopupContainer"
          />
        </a-form-item>
        <a-form-item label="IP 白名单">
          <a-input v-model:value="apiKeyForm.ipWhitelist" placeholder="多个 IP 用逗号分隔" />
        </a-form-item>
        <a-form-item label="过期日期">
          <a-date-picker
            v-model:value="apiKeyExpire"
            style="width: 100%"
            :get-popup-container="getPopupContainer"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-drawer
      v-model:open="integrationDrawerOpen"
      title="对接配置"
      width="560"
      :destroy-on-close="true"
    >
      <a-form layout="vertical">
        <a-form-item label="系统名称">
          <a-input v-model:value="integrationForm.name" />
        </a-form-item>
        <a-form-item label="对接分类">
          <a-select
            v-model:value="integrationForm.category"
            :options="integrationCategoryOptions"
            :get-popup-container="getPopupContainer"
          />
        </a-form-item>
        <a-form-item label="同步模式">
          <a-radio-group v-model:value="integrationForm.syncMode">
            <a-radio-button value="推送">推送</a-radio-button>
            <a-radio-button value="拉取">拉取</a-radio-button>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="接口地址">
          <a-input v-model:value="integrationForm.endpoint" />
        </a-form-item>
        <a-form-item label="AppKey">
          <a-input v-model:value="integrationForm.appKey" />
        </a-form-item>
        <a-form-item label="仓库映射">
          <a-textarea v-model:value="integrationForm.warehouseMapping" :rows="3" />
        </a-form-item>
      </a-form>
      <template #footer>
        <a-space>
          <a-button @click="integrationDrawerOpen = false">取消</a-button>
          <a-button type="primary" @click="saveIntegrationConfig">保存配置</a-button>
        </a-space>
      </template>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import dayjs, { type Dayjs } from 'dayjs'
import { message } from 'ant-design-vue'
import {
  getOpenPlatformStore,
  updateOpenPlatformStore,
  type ApiKeyItem,
  type IntegrationItem,
  type WebhookEndpoint,
} from '../utils/openPlatform'

const activeTab = ref('webhooks')
const store = ref(getOpenPlatformStore())
const selectedIntegrationId = ref<string | null>(null)
const latestSecret = ref('')

const reloadStore = () => {
  store.value = getOpenPlatformStore()
}

onMounted(() => {
  window.addEventListener('open-platform-update', reloadStore)
})

onUnmounted(() => {
  window.removeEventListener('open-platform-update', reloadStore)
})

const kpis = computed(() => {
  const enabledWebhooks = store.value.webhooks.filter((item) => item.enabled).length
  const activeApiKeys = store.value.apiKeys.filter((item) => item.status === '启用').length
  const connectedIntegrations = store.value.integrations.filter(
    (item) => item.status === '已连接'
  ).length
  const rateSource = [
    ...store.value.webhooks.map((i) => i.successRate),
    ...store.value.integrations.filter((i) => i.status !== '未连接').map((i) => i.successRate),
  ]
  const successRate = rateSource.length
    ? Number((rateSource.reduce((sum, val) => sum + val, 0) / rateSource.length).toFixed(1))
    : 0
  return { enabledWebhooks, activeApiKeys, connectedIntegrations, successRate }
})

const webhookColumns = [
  { title: '名称', dataIndex: 'name', key: 'name', width: 160 },
  { title: '回调地址', dataIndex: 'url', key: 'url' },
  { title: '订阅事件', key: 'events', width: 250 },
  { title: '启用', key: 'enabled', width: 100 },
  { title: '上次推送', dataIndex: 'lastPushAt', key: 'lastPushAt', width: 170 },
  { title: '成功率', key: 'rate', width: 140 },
  { title: '操作', key: 'action', width: 220 },
]

const apiKeyColumns = [
  { title: '应用名称', dataIndex: 'appName', key: 'appName', width: 180 },
  { title: 'Key 前缀', dataIndex: 'keyPrefix', key: 'keyPrefix', width: 140 },
  { title: 'Secret', dataIndex: 'secretMask', key: 'secretMask', width: 170 },
  { title: '权限范围', key: 'scopes', width: 260 },
  { title: '状态', key: 'status', width: 100 },
  { title: 'IP 白名单', dataIndex: 'ipWhitelist', key: 'ipWhitelist', width: 160 },
  { title: '最近使用', dataIndex: 'lastUsedAt', key: 'lastUsedAt', width: 170 },
  { title: '过期时间', dataIndex: 'expireAt', key: 'expireAt', width: 120 },
  { title: '操作', key: 'action', width: 220 },
]

const integrationColumns = [
  { title: '系统', dataIndex: 'name', key: 'name', width: 160 },
  { title: '类型', dataIndex: 'category', key: 'category', width: 90 },
  { title: '状态', key: 'status', width: 110 },
  { title: '同步模式', dataIndex: 'syncMode', key: 'syncMode', width: 110 },
  { title: '接口地址', dataIndex: 'endpoint', key: 'endpoint' },
  { title: '最近同步', dataIndex: 'lastSyncAt', key: 'lastSyncAt', width: 170 },
  { title: '成功率', key: 'rate', width: 130 },
  { title: '操作', key: 'action', width: 220 },
]

const logColumns = [
  { title: '开始时间', dataIndex: 'startedAt', key: 'startedAt', width: 140 },
  { title: '耗时(ms)', dataIndex: 'durationMs', key: 'durationMs', width: 90 },
  { title: '状态', key: 'status', width: 70 },
  { title: '结果', dataIndex: 'message', key: 'message' },
]

const filteredLogs = computed(() => {
  if (!selectedIntegrationId.value) return store.value.logs
  return store.value.logs.filter((item) => item.integrationId === selectedIntegrationId.value)
})

const eventOptions = [
  { label: 'order.created', value: 'order.created' },
  { label: 'order.shipped', value: 'order.shipped' },
  { label: 'refund.completed', value: 'refund.completed' },
  { label: 'inventory.changed', value: 'inventory.changed' },
  { label: 'inventory.locked', value: 'inventory.locked' },
]

const scopeOptions = [
  { label: 'orders:read', value: 'orders:read' },
  { label: 'orders:write', value: 'orders:write' },
  { label: 'inventory:read', value: 'inventory:read' },
  { label: 'inventory:write', value: 'inventory:write' },
  { label: 'shipping:write', value: 'shipping:write' },
  { label: 'settlement:read', value: 'settlement:read' },
]

const integrationCategoryOptions = [
  { label: 'ERP', value: 'ERP' },
  { label: 'WMS', value: 'WMS' },
]

const webhookModalOpen = ref(false)
const webhookForm = ref({
  id: '',
  name: '',
  url: '',
  events: [] as string[],
  timeoutSec: 5,
  retryLimit: 3,
})

const openWebhookModal = (record?: WebhookEndpoint) => {
  if (record) {
    webhookForm.value = {
      id: record.id,
      name: record.name,
      url: record.url,
      events: [...record.events],
      timeoutSec: record.timeoutSec,
      retryLimit: record.retryLimit,
    }
  } else {
    webhookForm.value = {
      id: '',
      name: '',
      url: '',
      events: [],
      timeoutSec: 5,
      retryLimit: 3,
    }
  }
  webhookModalOpen.value = true
}

const submitWebhook = () => {
  if (!webhookForm.value.name || !webhookForm.value.url || webhookForm.value.events.length === 0) {
    message.warning('请补全 Webhook 配置')
    return
  }
  updateOpenPlatformStore((current) => {
    const now = dayjs().format('YYYY-MM-DD HH:mm:ss')
    if (webhookForm.value.id) {
      return {
        ...current,
        webhooks: current.webhooks.map((item) =>
          item.id === webhookForm.value.id
            ? {
                ...item,
                name: webhookForm.value.name,
                url: webhookForm.value.url,
                events: [...webhookForm.value.events],
                timeoutSec: Number(webhookForm.value.timeoutSec || 5),
                retryLimit: Number(webhookForm.value.retryLimit || 0),
              }
            : item
        ),
      }
    }
    return {
      ...current,
      webhooks: [
        {
          id: `wh_${Date.now()}`,
          name: webhookForm.value.name,
          url: webhookForm.value.url,
          events: [...webhookForm.value.events],
          enabled: true,
          signSecret: `whsec_${Math.random().toString(36).slice(2, 12)}`,
          timeoutSec: Number(webhookForm.value.timeoutSec || 5),
          retryLimit: Number(webhookForm.value.retryLimit || 0),
          lastPushAt: now,
          successRate: 100,
        },
        ...current.webhooks,
      ],
    }
  })
  webhookModalOpen.value = false
}

const toggleWebhook = (id: string) => {
  updateOpenPlatformStore((current) => ({
    ...current,
    webhooks: current.webhooks.map((item) =>
      item.id === id ? { ...item, enabled: !item.enabled } : item
    ),
  }))
}

const testWebhook = (id: string) => {
  updateOpenPlatformStore((current) => {
    const now = dayjs().format('YYYY-MM-DD HH:mm:ss')
    return {
      ...current,
      webhooks: current.webhooks.map((item) =>
        item.id === id
          ? { ...item, lastPushAt: now, successRate: Math.min(100, item.successRate + 0.2) }
          : item
      ),
    }
  })
  message.success('测试回调已发送')
}

const removeWebhook = (id: string) => {
  updateOpenPlatformStore((current) => ({
    ...current,
    webhooks: current.webhooks.filter((item) => item.id !== id),
  }))
}

const apiKeyModalOpen = ref(false)
const apiKeyExpire = ref<Dayjs | null>(dayjs().add(180, 'day'))
const apiKeyForm = ref({
  appName: '',
  scopes: ['orders:read'] as string[],
  ipWhitelist: '',
})

const openApiKeyModal = () => {
  apiKeyForm.value = {
    appName: '',
    scopes: ['orders:read'],
    ipWhitelist: '',
  }
  apiKeyExpire.value = dayjs().add(180, 'day')
  apiKeyModalOpen.value = true
}

const randomToken = (len: number) => {
  const seed = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'
  let str = ''
  for (let i = 0; i < len; i += 1) {
    str += seed[Math.floor(Math.random() * seed.length)]
  }
  return str
}

const submitApiKey = () => {
  if (!apiKeyForm.value.appName || apiKeyForm.value.scopes.length === 0) {
    message.warning('请填写应用名称和权限范围')
    return
  }
  const keyPrefix = `ak_live_${randomToken(6)}`
  const secret = `sk_${randomToken(24)}`
  latestSecret.value = secret
  updateOpenPlatformStore((current) => ({
    ...current,
    apiKeys: [
      {
        id: `ak_${Date.now()}`,
        appName: apiKeyForm.value.appName,
        keyPrefix,
        secretMask: `${'*'.repeat(12)}${secret.slice(-4)}`,
        scopes: [...apiKeyForm.value.scopes],
        status: '启用',
        ipWhitelist: apiKeyForm.value.ipWhitelist || '-',
        expireAt: (apiKeyExpire.value ?? dayjs().add(180, 'day')).format('YYYY-MM-DD'),
        createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      } as ApiKeyItem,
      ...current.apiKeys,
    ],
  }))
  apiKeyModalOpen.value = false
}

const rotateApiKey = (id: string) => {
  const secret = `sk_${randomToken(24)}`
  latestSecret.value = secret
  updateOpenPlatformStore((current) => ({
    ...current,
    apiKeys: current.apiKeys.map((item) =>
      item.id === id
        ? {
            ...item,
            secretMask: `${'*'.repeat(12)}${secret.slice(-4)}`,
            lastUsedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          }
        : item
    ),
  }))
  message.success('API Key 已轮换')
}

const toggleApiKey = (id: string) => {
  updateOpenPlatformStore((current) => ({
    ...current,
    apiKeys: current.apiKeys.map((item) =>
      item.id === id ? { ...item, status: item.status === '启用' ? '禁用' : '启用' } : item
    ),
  }))
}

const revokeApiKey = (id: string) => {
  updateOpenPlatformStore((current) => ({
    ...current,
    apiKeys: current.apiKeys.map((item) => (item.id === id ? { ...item, status: '已吊销' } : item)),
  }))
}

const integrationDrawerOpen = ref(false)
const integrationForm = ref({
  id: '',
  name: '',
  category: 'ERP',
  syncMode: '推送',
  endpoint: '',
  appKey: '',
  warehouseMapping: '',
})

const openIntegrationDrawer = (record: IntegrationItem) => {
  integrationForm.value = {
    id: record.id,
    name: record.name,
    category: record.category,
    syncMode: record.syncMode,
    endpoint: record.endpoint,
    appKey: record.appKey,
    warehouseMapping: record.warehouseMapping,
  }
  integrationDrawerOpen.value = true
}

const saveIntegrationConfig = () => {
  updateOpenPlatformStore((current) => ({
    ...current,
    integrations: current.integrations.map((item) =>
      item.id === integrationForm.value.id
        ? {
            ...item,
            name: integrationForm.value.name,
            category: integrationForm.value.category as IntegrationItem['category'],
            syncMode: integrationForm.value.syncMode as IntegrationItem['syncMode'],
            endpoint: integrationForm.value.endpoint,
            appKey: integrationForm.value.appKey,
            warehouseMapping: integrationForm.value.warehouseMapping,
            status: integrationForm.value.endpoint ? '已连接' : '未连接',
          }
        : item
    ),
  }))
  integrationDrawerOpen.value = false
  message.success('对接配置已保存')
}

const syncIntegration = (id: string) => {
  const now = dayjs().format('YYYY-MM-DD HH:mm:ss')
  updateOpenPlatformStore((current) => {
    const failed = id.includes('wms') && Math.random() > 0.5
    return {
      ...current,
      integrations: current.integrations.map((item) =>
        item.id === id
          ? {
              ...item,
              lastSyncAt: now,
              status: failed ? '同步异常' : '已连接',
              successRate: failed
                ? Math.max(60, item.successRate - 3)
                : Math.min(100, item.successRate + 1),
            }
          : item
      ),
      logs: [
        {
          id: `log_${Date.now()}`,
          integrationId: id,
          startedAt: now,
          durationMs: Math.floor(600 + Math.random() * 4000),
          status: failed ? '失败' : '成功',
          message: failed ? '第三方接口返回 500，建议稍后重试' : '同步完成，增量数据已入库',
        },
        ...current.logs,
      ],
    }
  })
  message.success('同步任务已提交')
}

const viewIntegrationLogs = (id: string) => {
  selectedIntegrationId.value = id
}

const getPopupContainer = (trigger?: HTMLElement) => trigger?.ownerDocument?.body ?? document.body
</script>

<style scoped>
.open-platform-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.kpi-row {
  margin-bottom: 4px;
}

.kpi-card {
  border-radius: 12px;
}

.kpi-label {
  color: var(--text-secondary);
  font-size: 12px;
}

.kpi-value {
  margin-top: 6px;
  font-size: 26px;
  font-weight: 700;
  color: var(--text-primary);
}

.kpi-value.success {
  color: var(--success-color);
}

.kpi-sub {
  margin-top: 4px;
  color: var(--text-muted);
  font-size: 12px;
}

.toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
}

.log-card {
  height: 100%;
}
</style>
