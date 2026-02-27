<template>
  <div class="message-center-v2">
    <div class="page-head">
      <div>
        <div class="page-title">消息中心</div>
        <div class="page-sub">双栏分诊：左侧批处理，右侧详情与动作闭环。</div>
      </div>
      <a-space>
        <a-switch
          v-model:checked="autoMarkReadOnJump"
          checked-children="跳转自动已读"
          un-checked-children="手动已读"
        />
        <a-button @click="openSettingDrawer = true">消息设置</a-button>
      </a-space>
    </div>

    <MessageKpiBar
      :cards="kpiCards"
      :chips="chips"
      :active-chips="activeChips"
      @toggle-chip="toggleChip"
    />

    <section class="mc-main">
      <div class="mc-left">
        <div class="mc-list-tools">
          <a-input
            v-model:value="filters.keyword"
            placeholder="搜索标题/内容/业务号"
            allow-clear
            style="width: 220px"
          />
          <a-select
            v-model:value="filters.type"
            :options="typeOptions"
            allow-clear
            placeholder="类型"
            style="width: 110px"
          />
          <a-select
            v-model:value="filters.status"
            :options="statusOptions"
            allow-clear
            placeholder="状态"
            style="width: 120px"
          />
          <a-select
            v-model:value="filters.priority"
            :options="priorityOptions"
            allow-clear
            placeholder="优先级"
            style="width: 120px"
          />
          <a-button @click="resetFilters">重置</a-button>
        </div>

        <MessageQueueList
          title="待处理"
          :items="pendingMessages"
          :selected-id="selectedId"
          :selected-ids="selectedIds"
          @select="selectMessage"
          @toggle-check="toggleCheck"
        />
        <MessageQueueList
          title="最近已读"
          :items="recentReadMessages"
          :selected-id="selectedId"
          :selected-ids="selectedIds"
          @select="selectMessage"
          @toggle-check="toggleCheck"
        />
        <MessageQueueList
          title="系统广播"
          :items="broadcastMessages"
          :selected-id="selectedId"
          :selected-ids="selectedIds"
          @select="selectMessage"
          @toggle-check="toggleCheck"
        />

        <MessageBatchBar :selected-count="selectedIds.length" @action="onBatchAction" />
      </div>

      <div class="mc-right">
        <MessageDetailPane
          :record="selectedRecord"
          @mark-read="markRead"
          @retry="retryOne"
          @go-biz="goBiz"
        />
      </div>
    </section>

    <TemplateRuleDrawer
      v-model:open="openSettingDrawer"
      :templates="store.templates"
      :rules="store.rules"
      :stats="stats"
      :receipts="receiptRows"
      @save-template="saveTemplate"
      @save-rule="saveRule"
      @toggle-template="toggleTemplate"
      @remove-template="removeTemplate"
      @toggle-rule="toggleRule"
      @remove-rule="removeRule"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import MessageKpiBar from '../components/message-center/MessageKpiBar.vue'
import MessageQueueList from '../components/message-center/MessageQueueList.vue'
import MessageDetailPane from '../components/message-center/MessageDetailPane.vue'
import MessageBatchBar from '../components/message-center/MessageBatchBar.vue'
import TemplateRuleDrawer from '../components/message-center/TemplateRuleDrawer.vue'
import '../styles/message-center-v2.css'
import {
  filterMessages,
  getMessageCenterStats,
  getMessageCenterStore,
  handleBatchAction,
  markMessageRead,
  retryMessage,
  sortMessages,
  updateMessageCenterStore,
} from '../utils/messageCenter'
import type {
  MessageBatchAction,
  MessageCenterStats,
  MessageRecord,
  MessageTemplate,
  MessageViewFilter,
  SubscriptionRule,
} from '../types/message-center'

const router = useRouter()
const store = ref(getMessageCenterStore())
const selectedId = ref('')
const selectedIds = ref<string[]>([])
const openSettingDrawer = ref(false)
const activeChips = ref<string[]>([])
const autoMarkReadOnJump = ref(true)

const filters = ref<MessageViewFilter>({
  keyword: '',
  type: undefined,
  status: undefined,
  priority: undefined,
  onlyUnread: false,
  bizNo: '',
  dateRange: null,
})

const chips = [
  { key: 'unread', label: '仅未读' },
  { key: 'failed', label: '仅失败' },
  { key: 'high', label: '仅高优先' },
]

const typeOptions = [
  { label: '交易', value: '交易' },
  { label: '系统', value: '系统' },
  { label: '营销', value: '营销' },
  { label: '审批', value: '审批' },
]

const statusOptions = [
  { label: '排队中', value: 'queued' },
  { label: '发送中', value: 'sending' },
  { label: '发送成功', value: 'success' },
  { label: '发送失败', value: 'failed' },
  { label: '已读', value: 'read' },
]

const priorityOptions = [
  { label: '高优先', value: '高' },
  { label: '中优先', value: '中' },
  { label: '低优先', value: '低' },
]

const syncStore = () => {
  store.value = getMessageCenterStore()
}

const sortedRecords = computed(() => sortMessages(store.value.records))

const effectiveFilter = computed<MessageViewFilter>(() => ({
  ...filters.value,
  onlyUnread: activeChips.value.includes('unread') || filters.value.onlyUnread,
  status: activeChips.value.includes('failed') ? 'failed' : filters.value.status,
  priority: activeChips.value.includes('high') ? '高' : filters.value.priority,
}))

const filteredRecords = computed(() => filterMessages(sortedRecords.value, effectiveFilter.value))

const pendingMessages = computed(() =>
  filteredRecords.value.filter((item) => item.status !== 'read' || item.status === 'failed')
)
const recentReadMessages = computed(() =>
  filteredRecords.value.filter((item) => item.status === 'read').slice(0, 20)
)
const broadcastMessages = computed(() =>
  filteredRecords.value.filter((item) => item.type === '系统' && item.priority !== '高')
)

const selectedRecord = computed(
  () =>
    filteredRecords.value.find((item) => item.id === selectedId.value) ?? filteredRecords.value[0]
)

watch(
  filteredRecords,
  (list) => {
    if (!list.length) {
      selectedId.value = ''
      return
    }
    if (!list.some((item) => item.id === selectedId.value)) {
      selectedId.value = list[0].id
    }
    selectedIds.value = selectedIds.value.filter((id) => list.some((item) => item.id === id))
  },
  { immediate: true }
)

const stats = computed<MessageCenterStats>(() => getMessageCenterStats(store.value.records))

const kpiCards = computed(() => [
  {
    key: 'total',
    title: '发送总量',
    value: `${stats.value.total}`,
    subtitle: '近7天消息总数',
    tone: 'info' as const,
  },
  {
    key: 'failed',
    title: '失败待重试',
    value: `${stats.value.failed}`,
    subtitle: '超上限将自动禁用',
    tone: stats.value.failed > 0 ? ('danger' as const) : ('success' as const),
  },
  {
    key: 'unread',
    title: '未读消息',
    value: `${stats.value.unread}`,
    subtitle: '建议先处理高优先',
    tone: stats.value.unread > 0 ? ('warning' as const) : ('success' as const),
  },
  {
    key: 'readRate',
    title: '24h回执率',
    value: `${stats.value.readRate}%`,
    subtitle: `高优先 ${stats.value.highPriority} 条`,
    tone: stats.value.readRate >= 85 ? ('success' as const) : ('warning' as const),
  },
])

const receiptRows = computed(() =>
  [...sortedRecords.value].map((item) => ({
    ...item,
    status: item.status === 'read' ? '已读' : item.status === 'failed' ? '失败' : '未读',
    sentAt: item.sentAt || '-',
    readAt: item.readAt || '-',
  }))
)

const selectMessage = (id: string) => {
  selectedId.value = id
}

const toggleCheck = (id: string) => {
  if (selectedIds.value.includes(id)) {
    selectedIds.value = selectedIds.value.filter((item) => item !== id)
    return
  }
  selectedIds.value = [...selectedIds.value, id]
}

const toggleChip = (key: string) => {
  if (activeChips.value.includes(key)) {
    activeChips.value = activeChips.value.filter((item) => item !== key)
  } else {
    activeChips.value = [...activeChips.value, key]
  }
}

const resetFilters = () => {
  filters.value = {
    keyword: '',
    type: undefined,
    status: undefined,
    priority: undefined,
    onlyUnread: false,
    bizNo: '',
    dateRange: null,
  }
  activeChips.value = []
}

const markRead = (id: string) => {
  markMessageRead(id)
  syncStore()
}

const retryOne = (id: string) => {
  retryMessage(id)
  syncStore()
}

const onBatchAction = (action: MessageBatchAction) => {
  const ids = selectedIds.value
  if (!ids.length) return
  if (action === 'retry') {
    const failedIds = filteredRecords.value
      .filter(
        (item) =>
          ids.includes(item.id) && item.status === 'failed' && item.retryCount < item.maxRetry
      )
      .map((item) => item.id)
    handleBatchAction('retry', failedIds)
    message.success(`已触发 ${failedIds.length} 条失败重试`)
  } else {
    handleBatchAction(action, ids)
    message.success('批量操作已执行')
  }
  selectedIds.value = []
  syncStore()
}

const buildRoute = (record: MessageRecord) => {
  const route = record.route
  if (!route) return ''
  const hasQuery = route.includes('?')
  const fromPart = 'from=message-center'
  const highlightPart = record.bizNo ? `highlight=${encodeURIComponent(record.bizNo)}` : ''
  const append = [highlightPart, fromPart].filter(Boolean).join('&')
  return `${route}${hasQuery ? '&' : '?'}${append}`
}

const goBiz = (record: MessageRecord) => {
  const target = buildRoute(record)
  if (!target) {
    message.info('该消息未关联业务页面')
    return
  }
  if (autoMarkReadOnJump.value) markRead(record.id)
  router.push(target)
}

const saveTemplate = (payload: Omit<MessageTemplate, 'createdAt'>) => {
  updateMessageCenterStore((current) => {
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ')
    const exists = current.templates.some((item) => item.id === payload.id)
    if (exists) {
      return {
        ...current,
        templates: current.templates.map((item) =>
          item.id === payload.id ? { ...item, ...payload } : item
        ),
      }
    }
    return { ...current, templates: [{ ...payload, createdAt: now }, ...current.templates] }
  })
  syncStore()
}

const saveRule = (payload: Omit<SubscriptionRule, 'createdAt'>) => {
  updateMessageCenterStore((current) => {
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ')
    const exists = current.rules.some((item) => item.id === payload.id)
    if (exists) {
      return {
        ...current,
        rules: current.rules.map((item) =>
          item.id === payload.id ? { ...item, ...payload } : item
        ),
      }
    }
    return { ...current, rules: [{ ...payload, createdAt: now }, ...current.rules] }
  })
  syncStore()
}

const toggleTemplate = (id: string) => {
  updateMessageCenterStore((current) => ({
    ...current,
    templates: current.templates.map((item) =>
      item.id === id ? { ...item, enabled: !item.enabled } : item
    ),
  }))
  syncStore()
}

const removeTemplate = (id: string) => {
  updateMessageCenterStore((current) => ({
    ...current,
    templates: current.templates.filter((item) => item.id !== id),
  }))
  syncStore()
}

const toggleRule = (id: string) => {
  updateMessageCenterStore((current) => ({
    ...current,
    rules: current.rules.map((item) =>
      item.id === id ? { ...item, enabled: !item.enabled } : item
    ),
  }))
  syncStore()
}

const removeRule = (id: string) => {
  updateMessageCenterStore((current) => ({
    ...current,
    rules: current.rules.filter((item) => item.id !== id),
  }))
  syncStore()
}

const onKeyboard = (event: KeyboardEvent) => {
  const target = event.target as HTMLElement | null
  const tag = target?.tagName?.toLowerCase()
  if (tag === 'input' || tag === 'textarea') return
  if (!filteredRecords.value.length) return
  const index = filteredRecords.value.findIndex((item) => item.id === selectedId.value)
  if (event.key.toLowerCase() === 'j') {
    const nextIndex = Math.min(filteredRecords.value.length - 1, Math.max(0, index + 1))
    selectedId.value = filteredRecords.value[nextIndex].id
  } else if (event.key.toLowerCase() === 'k') {
    const prevIndex = Math.max(0, index - 1)
    selectedId.value = filteredRecords.value[prevIndex].id
  } else if (event.key.toLowerCase() === 'r' && selectedRecord.value) {
    retryOne(selectedRecord.value.id)
  } else if (event.key.toLowerCase() === 'm' && selectedRecord.value) {
    markRead(selectedRecord.value.id)
  }
}

onMounted(() => {
  window.addEventListener('message-center-update', syncStore)
  window.addEventListener('keydown', onKeyboard)
})

onUnmounted(() => {
  window.removeEventListener('message-center-update', syncStore)
  window.removeEventListener('keydown', onKeyboard)
})
</script>
