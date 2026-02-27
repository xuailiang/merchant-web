export type WebhookEndpoint = {
  id: string
  name: string
  url: string
  events: string[]
  enabled: boolean
  signSecret: string
  timeoutSec: number
  retryLimit: number
  lastPushAt?: string
  successRate: number
}

export type ApiKeyItem = {
  id: string
  appName: string
  keyPrefix: string
  secretMask: string
  scopes: string[]
  status: '启用' | '禁用' | '已吊销'
  ipWhitelist: string
  expireAt: string
  lastUsedAt?: string
  createdAt: string
}

export type IntegrationItem = {
  id: string
  name: string
  category: 'ERP' | 'WMS'
  status: '已连接' | '同步异常' | '未连接'
  syncMode: '推送' | '拉取'
  endpoint: string
  appKey: string
  warehouseMapping: string
  lastSyncAt?: string
  successRate: number
}

export type IntegrationLog = {
  id: string
  integrationId: string
  startedAt: string
  durationMs: number
  status: '成功' | '失败'
  message: string
}

export type OpenPlatformStore = {
  webhooks: WebhookEndpoint[]
  apiKeys: ApiKeyItem[]
  integrations: IntegrationItem[]
  logs: IntegrationLog[]
}

const STORAGE_KEY = 'open-platform-store'

const DEFAULT_STORE: OpenPlatformStore = {
  webhooks: [
    {
      id: 'wh_1001',
      name: '订单与退款回调',
      url: 'https://erp-demo.example.com/webhook/order',
      events: ['order.created', 'order.shipped', 'refund.completed'],
      enabled: true,
      signSecret: 'whsec_98fca0fcb8d',
      timeoutSec: 5,
      retryLimit: 3,
      lastPushAt: '2026-02-27 11:05:32',
      successRate: 98.6,
    },
    {
      id: 'wh_1002',
      name: '库存异动回调',
      url: 'https://wms-demo.example.com/hook/stock',
      events: ['inventory.changed', 'inventory.locked'],
      enabled: true,
      signSecret: 'whsec_11aa8e9c20f',
      timeoutSec: 5,
      retryLimit: 3,
      lastPushAt: '2026-02-27 10:44:02',
      successRate: 96.2,
    },
  ],
  apiKeys: [
    {
      id: 'ak_1001',
      appName: '金蝶云星空连接器',
      keyPrefix: 'ak_live_b19',
      secretMask: '************9xJ2',
      scopes: ['orders:read', 'inventory:read', 'inventory:write'],
      status: '启用',
      ipWhitelist: '10.10.0.0/24',
      expireAt: '2026-12-31',
      lastUsedAt: '2026-02-27 10:58:14',
      createdAt: '2026-01-20 09:10:00',
    },
    {
      id: 'ak_1002',
      appName: '聚水潭同步服务',
      keyPrefix: 'ak_live_4f2',
      secretMask: '************8dT6',
      scopes: ['orders:read', 'shipping:write'],
      status: '启用',
      ipWhitelist: '172.18.20.21',
      expireAt: '2026-10-20',
      lastUsedAt: '2026-02-27 10:31:09',
      createdAt: '2026-01-29 17:22:10',
    },
  ],
  integrations: [
    {
      id: 'int_erp_1',
      name: '金蝶云星空',
      category: 'ERP',
      status: '已连接',
      syncMode: '推送',
      endpoint: 'https://erp-demo.example.com/openapi',
      appKey: 'kd-open-merchant',
      warehouseMapping: '济南一仓=>KD_A1；济南二仓=>KD_A2',
      lastSyncAt: '2026-02-27 11:03:01',
      successRate: 97.8,
    },
    {
      id: 'int_wms_1',
      name: '旺店通',
      category: 'WMS',
      status: '同步异常',
      syncMode: '拉取',
      endpoint: 'https://wms-demo.example.com/api',
      appKey: 'wdt-merchant-001',
      warehouseMapping: '华北中转仓=>WDT_MAIN',
      lastSyncAt: '2026-02-27 10:40:14',
      successRate: 85.1,
    },
    {
      id: 'int_custom_1',
      name: '自定义 ERP',
      category: 'ERP',
      status: '未连接',
      syncMode: '推送',
      endpoint: '',
      appKey: '',
      warehouseMapping: '',
      successRate: 0,
    },
  ],
  logs: [
    {
      id: 'log_9001',
      integrationId: 'int_erp_1',
      startedAt: '2026-02-27 11:03:01',
      durationMs: 1130,
      status: '成功',
      message: '同步订单 36 条，库存 24 条',
    },
    {
      id: 'log_9002',
      integrationId: 'int_wms_1',
      startedAt: '2026-02-27 10:40:14',
      durationMs: 5800,
      status: '失败',
      message: '鉴权失败：签名不一致',
    },
  ],
}

const cloneStore = (store: OpenPlatformStore): OpenPlatformStore =>
  JSON.parse(JSON.stringify(store)) as OpenPlatformStore

const emitUpdate = () => {
  window.dispatchEvent(new CustomEvent('open-platform-update'))
}

const readStore = (): OpenPlatformStore => {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_STORE))
    return cloneStore(DEFAULT_STORE)
  }
  try {
    const parsed = JSON.parse(raw) as OpenPlatformStore
    return {
      webhooks: Array.isArray(parsed.webhooks) ? parsed.webhooks : [],
      apiKeys: Array.isArray(parsed.apiKeys) ? parsed.apiKeys : [],
      integrations: Array.isArray(parsed.integrations) ? parsed.integrations : [],
      logs: Array.isArray(parsed.logs) ? parsed.logs : [],
    }
  } catch {
    return cloneStore(DEFAULT_STORE)
  }
}

const writeStore = (store: OpenPlatformStore) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  emitUpdate()
}

export const getOpenPlatformStore = (): OpenPlatformStore => readStore()

export const updateOpenPlatformStore = (
  updater: (store: OpenPlatformStore) => OpenPlatformStore
) => {
  const next = updater(readStore())
  writeStore(next)
}
