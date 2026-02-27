<template>
  <a-layout class="layout-root">
    <a-layout-sider
      v-model:collapsed="collapsed"
      collapsible
      width="240"
      :collapsedWidth="0"
      breakpoint="lg"
      @breakpoint="(broken: boolean) => (collapsed = broken)"
      class="layout-sider"
    >
      <div class="brand">
        <img class="brand-logo-img" src="/yc-logo.png" alt="一卡通" />
        <div class="brand-text" v-if="!collapsed">一卡通商户后台</div>
      </div>
      <div class="side-menu">
        <div v-for="item in visibleMenuItems" :key="item.key" class="side-group">
          <div
            class="side-root"
            :class="{ active: menuOpenKeys.includes(item.key) }"
            @click="toggleRoot(item.key)"
          >
            <component v-if="item.icon" :is="item.icon" class="side-icon" />
            <span v-if="!collapsed" class="side-label">{{ item.label }}</span>
            <RightOutlined
              v-if="item.children?.length && !collapsed"
              class="side-caret"
              :class="{ open: menuOpenKeys.includes(item.key) }"
            />
          </div>
          <div
            v-if="item.children?.length && menuOpenKeys.includes(item.key) && !collapsed"
            class="side-children"
          >
            <div
              v-for="child in item.children"
              :key="child.key"
              class="side-child"
              :class="{ active: safeSelectedKey === child.key }"
              @click.stop="handleMenuClick(child.key)"
            >
              <component v-if="child.icon" :is="child.icon" class="side-icon" />
              <span class="side-label">{{ child.label }}</span>
            </div>
          </div>
        </div>
      </div>
    </a-layout-sider>

    <a-layout>
      <a-layout-header class="layout-header">
        <div class="header-left">
          <a-button type="text" class="collapse-btn" @click="collapsed = !collapsed">
            <MenuUnfoldOutlined v-if="collapsed" />
            <MenuFoldOutlined v-else />
          </a-button>
          <span class="header-title">今日概览</span>
          <a-tag color="green">营业中</a-tag>
        </div>
        <div class="header-right">
          <a-space size="middle">
            <a-space size="small">
              <span class="theme-label">主题</span>
              <a-switch v-model:checked="isDark" checked-children="暗" un-checked-children="亮" />
            </a-space>

            <a-dropdown :getPopupContainer="getPopupContainer">
              <a-badge :count="unreadCount" :offset="[4, -2]">
                <BellOutlined class="header-icon" />
              </a-badge>
              <template #overlay>
                <a-menu>
                  <a-menu-item
                    v-for="item in inboxPreview"
                    :key="item.id"
                    @click="openMessage(item)"
                  >
                    <div class="notice-item">
                      <div class="notice-title">{{ item.title }}</div>
                      <div class="notice-desc">{{ item.desc }}</div>
                    </div>
                  </a-menu-item>
                  <a-menu-divider />
                  <a-menu-item @click="goMessageCenter">查看全部站内信</a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>

            <a-dropdown :getPopupContainer="getPopupContainer">
              <a-space class="user-entry">
                <a-avatar size="small" class="header-avatar">店</a-avatar>
                <div class="header-user">
                  <div class="header-merchant">{{ merchantName }}</div>
                  <div class="header-role">{{ roleLabel }}</div>
                </div>
                <DownOutlined class="user-caret" />
              </a-space>
              <template #overlay>
                <a-menu>
                  <a-menu-item @click="router.push('/account/settings')">账户设置</a-menu-item>
                  <a-menu-item @click="router.push('/account/store')">门店信息</a-menu-item>
                  <a-menu-item @click="router.push('/help')">帮助中心</a-menu-item>
                  <a-menu-divider />
                  <a-menu-item @click="onLogout">退出登录</a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </a-space>
        </div>
      </a-layout-header>

      <div class="tabs-bar">
        <a-tabs
          type="editable-card"
          hide-add
          v-model:activeKey="activeTabKey"
          @change="onTabChange"
          @edit="onTabEdit"
        >
          <a-tab-pane v-for="tab in tabs" :key="tab.key" :closable="tab.closable">
            <template #tab>
              <a-dropdown
                trigger="contextmenu"
                :menu="{ items: tabMenuItems, onClick: onTabMenuClick }"
              >
                <span class="tab-label" @contextmenu.prevent="setTabContext(tab.key)">{{
                  tab.title
                }}</span>
              </a-dropdown>
            </template>
          </a-tab-pane>
        </a-tabs>
      </div>

      <a-layout-content class="layout-content">
        <RouterView v-slot="{ Component, route }">
          <keep-alive>
            <component :is="Component" :key="route.fullPath" />
          </keep-alive>
        </RouterView>
      </a-layout-content>
    </a-layout>
  </a-layout>

  <a-drawer v-model:open="openInbox" title="站内信" width="720" :destroy-on-close="true">
    <div class="inbox-toolbar">
      <a-input
        v-model:value="inboxKeyword"
        placeholder="搜索标题/内容"
        allow-clear
        style="width: 220px"
      />
      <a-segmented v-model:value="inboxType" :options="inboxTypes" />
      <a-switch v-model:checked="onlyUnread" checked-children="未读" un-checked-children="全部" />
    </div>
    <div class="inbox-actions">
      <a-space>
        <a-button size="small" @click="markAllRead">全部标记已读</a-button>
        <a-button size="small" @click="bulkMarkRead" :disabled="selectedIds.length === 0"
          >批量已读</a-button
        >
        <a-button size="small" danger @click="bulkDelete" :disabled="selectedIds.length === 0"
          >批量删除</a-button
        >
      </a-space>
      <div class="inbox-meta">共 {{ filteredInbox.length }} 条</div>
    </div>

    <a-list :data-source="filteredInbox" item-layout="horizontal" class="inbox-list">
      <template #renderItem="{ item }">
        <a-list-item>
          <div class="inbox-item">
            <a-checkbox v-model:checked="item.checked" />
            <div class="inbox-content" @click="openMessage(item)">
              <div class="inbox-title">
                <span v-if="item.unread" class="inbox-dot"></span>
                {{ item.title }}
                <a-tag v-if="item.priority === '高'" color="red">高</a-tag>
                <a-tag v-else-if="item.priority === '中'" color="orange">中</a-tag>
                <a-tag v-else color="blue">低</a-tag>
                <a-tag class="type-tag">{{ item.type }}</a-tag>
              </div>
              <div class="inbox-desc">{{ item.desc }}</div>
              <div class="inbox-time">{{ item.time }}</div>
            </div>
            <div class="inbox-ops">
              <a-button type="link" size="small" @click="handleAction(item)">去处理</a-button>
              <a-button type="link" size="small" @click="markRead(item)">已读</a-button>
              <a-button type="link" size="small" danger @click="removeMessage(item.id)"
                >删除</a-button
              >
            </div>
          </div>
        </a-list-item>
      </template>
    </a-list>
  </a-drawer>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  DashboardOutlined,
  ShoppingCartOutlined,
  RocketOutlined,
  AppstoreOutlined,
  TeamOutlined,
  GiftOutlined,
  WalletOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  DownOutlined,
  RightOutlined,
} from '@ant-design/icons-vue'
import { clearAuth, getName, getRole } from '../utils/auth'
import { setThemeMode, themeMode } from '../utils/theme'
import { hasPermission } from '../utils/permissions'
import { getInboxMessages, updateInboxMessages } from '../utils/inbox'
import type { InboxItem } from '../utils/inbox'

const getPopupContainer = (trigger?: HTMLElement): HTMLElement =>
  trigger?.ownerDocument?.body ?? document.body
const collapsed = ref(false)
const router = useRouter()
const route = useRoute()

const role = ref(getRole() ?? 'operator')

type MenuNode = {
  key: string
  label: string
  icon?: any
  perm?: string
  children?: MenuNode[]
}

const menuItems: MenuNode[] = [
  {
    key: 'dashboard',
    icon: DashboardOutlined,
    label: '仪表盘',
    perm: 'dashboard:view',
  },
  {
    key: 'orders-root',
    icon: ShoppingCartOutlined,
    label: '订单管理',
    perm: 'orders:view',
    children: [
      { key: 'orders', label: '订单列表' },
      { key: 'orders-detail', label: '订单详情' },
      { key: 'orders-ship', label: '订单发货' },
      { key: 'orders-after-sales', label: '售后/退款中心' },
    ],
  },
  {
    key: 'shipping-root',
    icon: RocketOutlined,
    label: '发货中心',
    perm: 'shipping:center',
    children: [
      { key: 'shipping-center', label: '订单发货' },
      { key: 'shipping-fee', label: '运费管理' },
    ],
  },
  {
    key: 'supply-root',
    icon: AppstoreOutlined,
    label: '供货管理',
    perm: 'supply:view',
    children: [
      { key: 'supplier-management', label: '供货商管理' },
      { key: 'purchase-inbound', label: '采购入库' },
      { key: 'reconciliation', label: '对账单' },
    ],
  },
  {
    key: 'products-root',
    icon: AppstoreOutlined,
    label: '商品管理',
    perm: 'products:view',
    children: [
      { key: 'products', label: '商品列表' },
      { key: 'products-inventory', label: '库存中心', perm: 'inventory:view' },
      { key: 'products-brands', label: '品牌管理', perm: 'brands:view' },
      { key: 'products-review', label: '商品审核', perm: 'products:review' },
      { key: 'products-create', label: '创建商品' },
      { key: 'products-detail', label: '商品详情' },
    ],
  },
  {
    key: 'customers-root',
    icon: TeamOutlined,
    label: '客户管理',
    perm: 'customers:view',
    children: [
      { key: 'customers', label: '客户列表' },
      { key: 'customers-detail', label: '客户详情' },
      { key: 'customers-membership', label: '会员体系' },
    ],
  },
  {
    key: 'marketing-root',
    icon: GiftOutlined,
    label: '营销中心',
    perm: 'marketing:view',
    children: [
      { key: 'marketing', label: '活动总览' },
      { key: 'marketing-attribution', label: '营销归因', perm: 'marketing:attribution' },
      { key: 'marketing-coupons', label: '优惠券管理' },
      { key: 'marketing-coupons-create', label: '创建优惠券' },
      { key: 'marketing-campaigns-create', label: '创建活动' },
    ],
  },
  {
    key: 'ops-root',
    icon: AppstoreOutlined,
    label: '运营中心',
    perm: 'ops:view',
    children: [
      { key: 'ops-alerts', label: '异常提醒', perm: 'ops:alerts' },
      { key: 'ops-messages', label: '消息中心', perm: 'ops:messages' },
      { key: 'ops-tasks', label: '待办任务', perm: 'ops:tasks' },
      { key: 'ops-logs', label: '操作日志', perm: 'ops:logs' },
      { key: 'exports-center', label: '下载中心', perm: 'ops:view' },
    ],
  },
  {
    key: 'finance-root',
    icon: WalletOutlined,
    label: '财务中心',
    perm: 'finance:view',
    children: [
      { key: 'finance', label: '财务概览' },
      { key: 'finance-closure', label: '资金闭环', perm: 'finance:closure' },
      { key: 'finance-settlements', label: '结算管理' },
      { key: 'finance-invoices', label: '发票管理' },
    ],
  },
  {
    key: 'settings-root',
    icon: SettingOutlined,
    label: '系统设置',
    perm: 'settings:view',
    children: [
      { key: 'settings', label: '店铺设置' },
      { key: 'settings-merchant', label: '商户信息' },
      { key: 'settings-open-platform', label: '开放平台', perm: 'open_platform:view' },
      { key: 'settings-assets', label: '资源管理', perm: 'assets:view' },
      { key: 'settings-roles', label: '角色权限' },
      { key: 'settings-permissions', label: '权限矩阵' },
    ],
  },
  {
    key: 'decor-root',
    icon: AppstoreOutlined,
    label: '店铺装修',
    perm: 'decor:view',
    children: [
      { key: 'decor-home', label: '首页装修' },
      { key: 'decor-page', label: '页面装修' },
    ],
  },
]

const filterMenu = (items: MenuNode[]): MenuNode[] => {
  return (items ?? [])
    .map((item) => {
      if (!item) return item
      const canView = !item.perm || hasPermission(item.perm as any)
      if (!canView) return null
      if (item.children) {
        const children = filterMenu(item.children)
        return { ...item, children }
      }
      return item
    })
    .filter((item) => {
      if (!item) return false
      if (item.children && item.children.length === 0) return false
      return true
    }) as MenuNode[]
}

const visibleMenuItems = computed(() => {
  const currentRole = role.value
  const roleFiltered = menuItems
    ?.map((item) => {
      if (!item) return item
      if (item.key === 'finance-root' && currentRole !== 'admin' && currentRole !== 'finance') {
        return null
      }
      if (item.key === 'settings-root' && currentRole !== 'admin') {
        return null
      }
      return item
    })
    .filter(Boolean) as MenuNode[]
  return filterMenu(roleFiltered)
})

const selectedKey = computed(() => {
  const matched = [...route.matched].reverse().find((item) => item.meta?.key)
  return (matched?.meta?.key as string | undefined) ?? 'dashboard'
})

const flattenMenuKeys = (items: MenuNode[], keys: Set<string> = new Set()) => {
  const list = Array.isArray(items) ? items : []
  list.forEach((item) => {
    if (!item) return
    if (item.key) keys.add(String(item.key))
    if (item.children) flattenMenuKeys(item.children, keys)
  })
  return keys
}

const menuKeySet = computed(() => flattenMenuKeys(visibleMenuItems.value))
const rootMenuKeys = computed(() =>
  (visibleMenuItems.value ?? []).map((item) => (item ? String(item.key) : '')).filter(Boolean)
)

const menuParentMap = computed(() => {
  const map: Record<string, string> = {}
  const walk = (items: MenuNode[], parent?: string) => {
    const list = Array.isArray(items) ? items : []
    list.forEach((item) => {
      if (!item) return
      const key = String(item.key)
      if (parent) map[key] = parent
      if (item.children) walk(item.children, key)
    })
  }
  walk(visibleMenuItems.value ?? [])
  return map
})

const safeSelectedKey = computed(() => {
  if (menuKeySet.value.has(selectedKey.value)) return selectedKey.value
  const parentKey = (route.meta?.parentKey as string | undefined) ?? selectedKey.value
  if (parentKey && menuKeySet.value.has(parentKey)) return parentKey
  return selectedKey.value ?? 'dashboard'
})

const menuOpenKeys = ref<string[]>([])
const TABS_STORAGE_KEY = 'layout-tabs'

const syncOpenKeys = () => {
  const parentKey = (route.meta?.parentKey as string | undefined) ?? selectedKey.value
  if (parentKey && rootMenuKeys.value.includes(parentKey)) {
    menuOpenKeys.value = [parentKey]
  }
}

watch(
  () => [route.meta?.parentKey, selectedKey.value, menuKeySet.value],
  () => syncOpenKeys(),
  { immediate: true }
)

const handleMenuClick = (key: string) => {
  const keyStr = String(key)
  const parentKey = menuParentMap.value[keyStr] ?? keyStr
  if (rootMenuKeys.value.includes(parentKey)) {
    menuOpenKeys.value = [parentKey]
  }
  const map: Record<string, string> = {
    dashboard: '/dashboard',
    orders: '/orders',
    'orders-detail': '/orders/O-20260203-8812',
    'orders-ship': '/orders/ship/DD2026020417142',
    'orders-after-sales': '/orders/after-sales',
    'shipping-center': '/shipping',
    'shipping-fee': '/shipping/fee',
    'supply-manage': '/supply/suppliers',
    'supplier-management': '/supply/suppliers',
    'purchase-inbound': '/supply/purchase',
    reconciliation: '/supply/reconciliation',
    products: '/products',
    'products-inventory': '/products/inventory',
    'products-detail': '/products/P-10021',
    'products-brands': '/products/brands',
    'products-create': '/products/create',
    'products-review': '/products/review',
    customers: '/customers',
    'customers-detail': '/customers/C-20088',
    'customers-membership': '/customers/membership',
    marketing: '/marketing',
    'marketing-attribution': '/marketing/attribution',
    'marketing-coupons': '/marketing/coupons',
    'marketing-coupons-create': '/marketing/coupons/create',
    'marketing-campaigns-create': '/marketing/campaigns/create',
    'ops-center': '/ops/alerts',
    'ops-alerts': '/ops/alerts',
    'ops-messages': '/ops/messages',
    'ops-tasks': '/ops/tasks',
    'ops-logs': '/ops/logs',
    'exports-center': '/exports',
    finance: '/finance',
    'finance-closure': '/finance/closure',
    'finance-settlements': '/finance/settlements',
    'finance-invoices': '/finance/invoices',
    settings: '/settings',
    'settings-merchant': '/settings/merchant',
    'settings-open-platform': '/settings/open-platform',
    'settings-roles': '/settings/roles',
    'settings-permissions': '/settings/permissions',
    'settings-assets': '/settings/assets',
    decor: '/decor/home',
    'decor-home': '/decor/home',
    'decor-page': '/decor/page',
  }
  router.push(map[key as string] ?? '/dashboard')
}

const toggleRoot = (key: string) => {
  if (!rootMenuKeys.value.includes(key)) return
  menuOpenKeys.value = menuOpenKeys.value[0] === key ? [] : [key]
}

const merchantName = ref(getName())
const isDark = computed({
  get: () => themeMode.value === 'dark',
  set: (value) => setThemeMode(value ? 'dark' : 'light'),
})
const roleLabel = computed(() => {
  const currentRole = role.value
  if (currentRole === 'admin') return '管理员'
  if (currentRole === 'finance') return '财务'
  return '运营'
})

type TabItem = {
  key: string
  title: string
  path: string
  closable: boolean
}

const tabs = ref<TabItem[]>([])
const activeTabKey = ref('dashboard')

const getTabInfo = () => {
  const matched = [...route.matched].reverse().find((item) => item.meta?.key)
  const key = String((matched?.meta?.key as string | undefined) ?? route.path)
  const title = String((matched?.meta?.title as string | undefined) ?? '页面')
  const path = route.fullPath
  const closable = key !== 'dashboard'
  return { key, title, path, closable }
}

const ensureTab = () => {
  const info = getTabInfo()
  const exists = tabs.value.find((tab) => tab.key === info.key)
  if (!exists) {
    tabs.value.push(info)
  } else {
    exists.path = info.path
    exists.title = info.title
  }
  activeTabKey.value = info.key
  localStorage.setItem(TABS_STORAGE_KEY, JSON.stringify(tabs.value))
}

const onTabChange = (key: string) => {
  const target = tabs.value.find((tab) => tab.key === key)
  if (target) router.push(target.path)
}

const tabContextKey = ref<string | null>(null)
const tabMenuItems = [
  { key: 'close-others', label: '关闭其它' },
  { key: 'close-all', label: '关闭全部' },
]

const setTabContext = (key: string) => {
  tabContextKey.value = key
}

const onTabMenuClick = ({ key }: { key: string }) => {
  if (key === 'close-others' && tabContextKey.value) closeOthers(tabContextKey.value)
  if (key === 'close-all') closeAll()
}

const onTabEdit = (key: string | MouseEvent, action: 'add' | 'remove') => {
  if (action !== 'remove') return
  const targetKey = String(key)
  const index = tabs.value.findIndex((tab) => tab.key === targetKey)
  if (index === -1) return
  const removed = tabs.value.splice(index, 1)[0]
  if (activeTabKey.value === removed.key) {
    const next = tabs.value[index - 1] ?? tabs.value[0]
    if (next) {
      router.push(next.path)
    } else {
      router.push('/dashboard')
    }
  }
  localStorage.setItem(TABS_STORAGE_KEY, JSON.stringify(tabs.value))
}

watch(
  () => route.fullPath,
  () => ensureTab(),
  { immediate: true }
)

const closeOthers = (key: string) => {
  const target = tabs.value.find((tab) => tab.key === key)
  if (!target) return
  tabs.value = tabs.value.filter((tab) => tab.key === key || tab.key === 'dashboard')
  activeTabKey.value = key
  localStorage.setItem(TABS_STORAGE_KEY, JSON.stringify(tabs.value))
}

const closeAll = () => {
  tabs.value = tabs.value.filter((tab) => tab.key === 'dashboard')
  activeTabKey.value = 'dashboard'
  localStorage.setItem(TABS_STORAGE_KEY, JSON.stringify(tabs.value))
  router.push('/dashboard')
}

onMounted(() => {
  const raw = localStorage.getItem(TABS_STORAGE_KEY)
  if (raw) {
    try {
      tabs.value = JSON.parse(raw) as TabItem[]
    } catch {
      tabs.value = []
    }
  }
  ensureTab()
})

const onLogout = () => {
  clearAuth()
  router.replace('/login')
}

const goMessageCenter = () => {
  openInbox.value = false
  router.push('/ops/messages')
}

const openInbox = ref(false)
const inboxTypes = ['全部', '交易', '系统', '营销', '审批']
const inboxType = ref('全部')
const inboxKeyword = ref('')
const onlyUnread = ref(false)

const inboxMessages = ref<InboxItem[]>(getInboxMessages())
const syncInbox = () => {
  inboxMessages.value = getInboxMessages()
}

const unreadCount = computed(() => inboxMessages.value.filter((item) => item.unread).length)
const inboxPreview = computed(() => inboxMessages.value.slice(0, 3))

const filteredInbox = computed(() => {
  return inboxMessages.value.filter((item) => {
    const typeMatch = inboxType.value === '全部' || item.type === inboxType.value
    const unreadMatch = !onlyUnread.value || item.unread
    const keywordMatch =
      !inboxKeyword.value ||
      item.title.includes(inboxKeyword.value) ||
      item.desc.includes(inboxKeyword.value)
    return typeMatch && unreadMatch && keywordMatch
  })
})

const selectedIds = computed(() =>
  inboxMessages.value.filter((item) => item.checked).map((item) => item.id)
)

const markRead = (item: InboxItem) => {
  updateInboxMessages((items) =>
    items.map((it) => (it.id === item.id ? { ...it, unread: false } : it))
  )
  syncInbox()
}

const markAllRead = () => {
  updateInboxMessages((items) => items.map((it) => ({ ...it, unread: false })))
  syncInbox()
}

const bulkMarkRead = () => {
  updateInboxMessages((items) => items.map((it) => (it.checked ? { ...it, unread: false } : it)))
  syncInbox()
}

const removeMessage = (id: string) => {
  updateInboxMessages((items) => items.filter((it) => it.id !== id))
  syncInbox()
}

const bulkDelete = () => {
  updateInboxMessages((items) => items.filter((it) => !it.checked))
  syncInbox()
}

const handleAction = (item: InboxItem) => {
  if (item.route) router.push(item.route)
  markRead(item)
}

const openMessage = (item: InboxItem) => {
  markRead(item)
  if (item.route) {
    openInbox.value = false
    router.push(item.route)
    return
  }
  openInbox.value = true
}

onMounted(() => {
  window.addEventListener('inbox-update', syncInbox)
})

onUnmounted(() => {
  window.removeEventListener('inbox-update', syncInbox)
})
</script>

<style scoped>
.layout-root {
  min-height: 100vh;
}

.layout-sider {
  box-shadow: 2px 0 6px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  height: 100vh;
}

.layout-sider :deep(.ant-layout-sider-zero-width-trigger) {
  display: none;
}

.side-menu {
  padding: 6px 0 16px;
  color: rgba(255, 255, 255, 0.85);
}

.side-group + .side-group {
  margin-top: 4px;
}

.side-root {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 44px;
  padding: 0 20px;
  cursor: pointer;
  border-radius: 10px;
  margin: 0 12px;
  transition: background 0.2s ease;
}

.side-root:hover {
  background: rgba(255, 255, 255, 0.08);
}

.side-root.active {
  background: rgba(255, 255, 255, 0.16);
}

.side-icon {
  font-size: 16px;
}

.side-label {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
}

.side-caret {
  font-size: 12px;
  transition: transform 0.2s ease;
  opacity: 0.7;
}

.side-caret.open {
  transform: rotate(90deg);
}

.side-children {
  margin: 4px 0 8px 36px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.side-child {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 38px;
  padding: 0 14px;
  border-radius: 8px;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.78);
  transition:
    background 0.2s ease,
    color 0.2s ease;
}

.side-child:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}

.side-child.active {
  background: #1677ff;
  color: #fff;
}

.brand {
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  gap: 12px;
  color: #fff;
}

.brand-logo-img {
  width: 64px;
  height: 34px;
  object-fit: contain;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.18);
  padding: 4px 6px;
}

.brand-text {
  font-size: 15px;
  font-weight: 600;
}

.layout-header {
  background: var(--card-bg);
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-color);
}

.tabs-bar {
  background: var(--card-bg);
  border-bottom: 1px solid var(--border-color);
  padding: 0 12px;
}

.tabs-bar :deep(.ant-tabs) {
  margin-bottom: 0;
}

.tabs-bar :deep(.ant-tabs-nav) {
  margin: 0;
}

.tabs-bar :deep(.ant-tabs-tab) {
  border-radius: 8px 8px 0 0;
  padding: 8px 16px;
}

.tab-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.tabs-bar :deep(.ant-tabs-tab-active) {
  background: #f8fafc;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-title {
  font-weight: 600;
  font-size: 16px;
  color: var(--text-primary);
}

.collapse-btn {
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-entry {
  cursor: pointer;
}

.user-caret {
  font-size: 12px;
  color: var(--text-secondary);
}

.notice-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 4px 0;
}

.notice-title {
  font-weight: 600;
  font-size: 13px;
}

.notice-desc {
  font-size: 12px;
  color: var(--text-secondary);
}

.inbox-toolbar {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.inbox-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.inbox-meta {
  font-size: 12px;
  color: var(--text-secondary);
}

.inbox-list :deep(.ant-list-item) {
  padding: 12px 0;
}

.inbox-item {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 12px;
  align-items: flex-start;
  width: 100%;
}

.inbox-content {
  cursor: pointer;
}

.inbox-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  margin-bottom: 4px;
}

.inbox-desc {
  color: var(--text-secondary);
  font-size: 12px;
  margin-bottom: 4px;
}

.inbox-time {
  font-size: 12px;
  color: #94a3b8;
}

.inbox-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #3b82f6;
}

.type-tag {
  margin-left: 4px;
}

.inbox-ops {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.theme-label {
  font-size: 12px;
  color: #6b7280;
}

.header-icon {
  font-size: 18px;
  color: var(--text-primary);
}

.header-avatar {
  background: #1f1f1f;
}

.header-merchant {
  font-weight: 500;
  color: var(--text-primary);
}

.header-user {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}

.header-role {
  font-size: 12px;
  color: #8c8c8c;
}

.layout-content {
  padding: 24px;
  background: var(--app-bg);
  min-height: calc(100vh - 110px);
}

@media (max-width: 992px) {
  .layout-header {
    flex-wrap: wrap;
    gap: 12px;
    height: auto;
    padding: 12px 16px;
  }

  .header-left {
    width: 100%;
    justify-content: space-between;
  }

  .header-right {
    width: 100%;
    justify-content: flex-end;
  }

  .layout-content {
    padding: 16px;
    min-height: calc(100vh - 120px);
  }
}
</style>
