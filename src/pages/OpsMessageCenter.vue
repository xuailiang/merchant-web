<template>
  <div class="message-center-page">
    <div class="page-title">消息中心</div>

    <a-row :gutter="16" class="kpi-row">
      <a-col :xs="24" :md="12" :xl="6">
        <a-card class="kpi-card">
          <div class="kpi-label">发送总量</div>
          <div class="kpi-value">{{ stats.total }}</div>
          <div class="kpi-sub">近7天消息总数</div>
        </a-card>
      </a-col>
      <a-col :xs="24" :md="12" :xl="6">
        <a-card class="kpi-card">
          <div class="kpi-label">失败待重试</div>
          <div class="kpi-value danger">{{ stats.failed }}</div>
          <div class="kpi-sub">重试上限以内可继续重发</div>
        </a-card>
      </a-col>
      <a-col :xs="24" :md="12" :xl="6">
        <a-card class="kpi-card">
          <div class="kpi-label">未读消息</div>
          <div class="kpi-value warning">{{ stats.unread }}</div>
          <div class="kpi-sub">需业务跟进</div>
        </a-card>
      </a-col>
      <a-col :xs="24" :md="12" :xl="6">
        <a-card class="kpi-card">
          <div class="kpi-label">已读回执率</div>
          <div class="kpi-value success">{{ stats.readRate }}%</div>
          <div class="kpi-sub">read / total</div>
        </a-card>
      </a-col>
    </a-row>

    <a-card>
      <a-tabs v-model:activeKey="activeTab">
        <a-tab-pane key="records" tab="消息记录" />
        <a-tab-pane key="templates" tab="通知模板" />
        <a-tab-pane key="rules" tab="订阅规则" />
        <a-tab-pane key="receipts" tab="已读回执统计" />
      </a-tabs>

      <div v-if="activeTab === 'records'">
        <a-form layout="inline" class="filter-bar">
          <a-form-item label="关键词">
            <a-input v-model:value="filters.keyword" placeholder="标题/业务单号" allow-clear />
          </a-form-item>
          <a-form-item label="消息类型">
            <a-select
              v-model:value="filters.type"
              :options="typeOptions"
              allow-clear
              placeholder="全部类型"
              style="width: 140px"
              :get-popup-container="getPopupContainer"
            />
          </a-form-item>
          <a-form-item label="发送状态">
            <a-select
              v-model:value="filters.status"
              :options="statusOptions"
              allow-clear
              placeholder="全部状态"
              style="width: 140px"
              :get-popup-container="getPopupContainer"
            />
          </a-form-item>
          <a-space>
            <a-button @click="resetFilters">重置</a-button>
            <a-button type="primary" @click="message.success('筛选已更新')">查询</a-button>
          </a-space>
        </a-form>

        <a-table
          :columns="recordColumns"
          :data-source="filteredRecords"
          row-key="id"
          :pagination="{ pageSize: 8 }"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'type'">
              <a-tag
                :color="
                  record.type === '交易'
                    ? 'blue'
                    : record.type === '系统'
                      ? 'purple'
                      : record.type === '营销'
                        ? 'green'
                        : 'orange'
                "
              >
                {{ record.type }}
              </a-tag>
            </template>
            <template v-else-if="column.key === 'status'">
              <a-tag :color="resolveStatusColor(record.status)">{{
                resolveStatusLabel(record.status)
              }}</a-tag>
            </template>
            <template v-else-if="column.key === 'retry'">
              {{ record.retryCount }}/{{ record.maxRetry }}
            </template>
            <template v-else-if="column.key === 'action'">
              <a-space>
                <a-button
                  type="link"
                  :disabled="record.status !== 'failed' || record.retryCount >= record.maxRetry"
                  @click="doRetry(record.id)"
                >
                  失败重试
                </a-button>
                <a-button
                  type="link"
                  :disabled="record.status === 'read'"
                  @click="markRead(record.id)"
                  >标记已读</a-button
                >
                <a-button type="link" @click="goBiz(record.route)">跳转业务</a-button>
              </a-space>
            </template>
          </template>
        </a-table>
      </div>

      <div v-else-if="activeTab === 'templates'">
        <div class="toolbar">
          <a-button type="primary" @click="openTemplateModal()">新增模板</a-button>
        </div>
        <a-table
          :columns="templateColumns"
          :data-source="store.templates"
          row-key="id"
          :pagination="false"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'enabled'">
              <a-switch :checked="record.enabled" @change="toggleTemplate(record.id)" />
            </template>
            <template v-else-if="column.key === 'action'">
              <a-space>
                <a-button type="link" @click="openTemplateModal(record)">编辑</a-button>
                <a-button type="link" danger @click="removeTemplate(record.id)">删除</a-button>
              </a-space>
            </template>
          </template>
        </a-table>
      </div>

      <div v-else-if="activeTab === 'rules'">
        <div class="toolbar">
          <a-button type="primary" @click="openRuleModal()">新增规则</a-button>
        </div>
        <a-table :columns="ruleColumns" :data-source="store.rules" row-key="id" :pagination="false">
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'enabled'">
              <a-switch :checked="record.enabled" @change="toggleRule(record.id)" />
            </template>
            <template v-else-if="column.key === 'action'">
              <a-space>
                <a-button type="link" @click="openRuleModal(record)">编辑</a-button>
                <a-button type="link" danger @click="removeRule(record.id)">删除</a-button>
              </a-space>
            </template>
          </template>
        </a-table>
      </div>

      <div v-else>
        <a-row :gutter="16">
          <a-col :xs="24" :xl="10">
            <a-card title="回执概览" size="small">
              <a-descriptions :column="1" size="small">
                <a-descriptions-item label="发送总量">{{ stats.total }}</a-descriptions-item>
                <a-descriptions-item label="已读总量">{{ stats.read }}</a-descriptions-item>
                <a-descriptions-item label="未读总量">{{ stats.unread }}</a-descriptions-item>
                <a-descriptions-item label="失败消息">{{ stats.failed }}</a-descriptions-item>
                <a-descriptions-item label="回执率">
                  <a-progress :percent="stats.readRate" :stroke-color="'#52c41a'" />
                </a-descriptions-item>
              </a-descriptions>
            </a-card>
          </a-col>
          <a-col :xs="24" :xl="14">
            <a-card title="最近消息回执" size="small">
              <a-table
                :columns="receiptColumns"
                :data-source="receiptRows"
                row-key="id"
                :pagination="{ pageSize: 6 }"
              />
            </a-card>
          </a-col>
        </a-row>
      </div>
    </a-card>

    <a-modal
      v-model:open="templateModalOpen"
      :title="templateForm.id ? '编辑通知模板' : '新增通知模板'"
      @ok="submitTemplate"
    >
      <a-form layout="vertical">
        <a-form-item label="模板名称" required>
          <a-input v-model:value="templateForm.name" />
        </a-form-item>
        <a-form-item label="消息类型" required>
          <a-select
            v-model:value="templateForm.type"
            :options="typeOptions"
            :get-popup-container="getPopupContainer"
          />
        </a-form-item>
        <a-form-item label="标题模板" required>
          <a-input v-model:value="templateForm.titleTemplate" />
        </a-form-item>
        <a-form-item label="内容模板" required>
          <a-textarea v-model:value="templateForm.contentTemplate" :rows="3" />
        </a-form-item>
        <a-form-item label="失败重试上限">
          <a-input-number v-model:value="templateForm.maxRetry" :min="0" />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal
      v-model:open="ruleModalOpen"
      :title="ruleForm.id ? '编辑订阅规则' : '新增订阅规则'"
      @ok="submitRule"
    >
      <a-form layout="vertical">
        <a-form-item label="规则名称" required>
          <a-input v-model:value="ruleForm.name" />
        </a-form-item>
        <a-form-item label="事件编码" required>
          <a-input v-model:value="ruleForm.eventCode" />
        </a-form-item>
        <a-form-item label="消息类型" required>
          <a-select
            v-model:value="ruleForm.type"
            :options="typeOptions"
            :get-popup-container="getPopupContainer"
          />
        </a-form-item>
        <a-form-item label="订阅角色">
          <a-select
            v-model:value="ruleForm.targetRole"
            :options="roleOptions"
            :get-popup-container="getPopupContainer"
          />
        </a-form-item>
        <a-form-item label="同事件节流(分钟)">
          <a-input-number v-model:value="ruleForm.throttleMinutes" :min="1" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  getMessageCenterStore,
  markMessageRead,
  retryMessage,
  updateMessageCenterStore,
  type MessageRecord,
  type MessageTemplate,
  type SubscriptionRule,
} from '../utils/messageCenter'

const router = useRouter()
const activeTab = ref('records')
const store = ref(getMessageCenterStore())

const statusLabelMap: Record<MessageRecord['status'], string> = {
  queued: '排队中',
  sending: '发送中',
  success: '发送成功',
  failed: '发送失败',
  read: '已读',
}

const statusColorMap: Record<MessageRecord['status'], string> = {
  queued: 'default',
  sending: 'blue',
  success: 'green',
  failed: 'red',
  read: 'processing',
}

const resolveStatusLabel = (status: unknown) => {
  const key = String(status) as MessageRecord['status']
  return statusLabelMap[key] ?? '未知状态'
}

const resolveStatusColor = (status: unknown) => {
  const key = String(status) as MessageRecord['status']
  return statusColorMap[key] ?? 'default'
}

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

const roleOptions = [
  { label: '全部角色', value: 'all' },
  { label: '管理员', value: 'admin' },
  { label: '运营', value: 'operator' },
  { label: '财务', value: 'finance' },
]

const filters = ref({
  keyword: '',
  type: undefined as string | undefined,
  status: undefined as MessageRecord['status'] | undefined,
})

const stats = computed(() => {
  const total = store.value.records.length
  const read = store.value.records.filter((item) => item.status === 'read').length
  const failed = store.value.records.filter((item) => item.status === 'failed').length
  const unread = total - read
  const readRate = total ? Math.round((read / total) * 100) : 0
  return { total, read, unread, failed, readRate }
})

const filteredRecords = computed(() =>
  store.value.records.filter((item) => {
    const keyword = filters.value.keyword.trim()
    const matchKeyword =
      !keyword ||
      item.title.includes(keyword) ||
      item.bizNo?.includes(keyword) ||
      item.content.includes(keyword)
    const matchType = !filters.value.type || item.type === filters.value.type
    const matchStatus = !filters.value.status || item.status === filters.value.status
    return matchKeyword && matchType && matchStatus
  })
)

const recordColumns = [
  { title: '标题', dataIndex: 'title', key: 'title', width: 240 },
  { title: '类型', dataIndex: 'type', key: 'type', width: 100 },
  { title: '接收人', dataIndex: 'recipient', key: 'recipient', width: 120 },
  { title: '发送状态', dataIndex: 'status', key: 'status', width: 120 },
  { title: '重试', key: 'retry', width: 90 },
  { title: '业务单号', dataIndex: 'bizNo', key: 'bizNo', width: 170 },
  { title: '发送时间', dataIndex: 'sentAt', key: 'sentAt', width: 170 },
  { title: '已读时间', dataIndex: 'readAt', key: 'readAt', width: 170 },
  { title: '操作', key: 'action', fixed: 'right', width: 220 },
]

const templateColumns = [
  { title: '模板名称', dataIndex: 'name', key: 'name', width: 160 },
  { title: '类型', dataIndex: 'type', key: 'type', width: 100 },
  { title: '标题模板', dataIndex: 'titleTemplate', key: 'titleTemplate' },
  { title: '重试上限', dataIndex: 'maxRetry', key: 'maxRetry', width: 100 },
  { title: '启用', key: 'enabled', width: 100 },
  { title: '操作', key: 'action', width: 140 },
]

const ruleColumns = [
  { title: '规则名称', dataIndex: 'name', key: 'name', width: 180 },
  { title: '事件编码', dataIndex: 'eventCode', key: 'eventCode', width: 220 },
  { title: '类型', dataIndex: 'type', key: 'type', width: 100 },
  { title: '订阅角色', dataIndex: 'targetRole', key: 'targetRole', width: 120 },
  { title: '节流(分钟)', dataIndex: 'throttleMinutes', key: 'throttleMinutes', width: 120 },
  { title: '启用', key: 'enabled', width: 100 },
  { title: '操作', key: 'action', width: 140 },
]

const receiptColumns = [
  { title: '消息标题', dataIndex: 'title', key: 'title' },
  { title: '接收人', dataIndex: 'recipient', key: 'recipient', width: 120 },
  { title: '状态', dataIndex: 'statusLabel', key: 'statusLabel', width: 120 },
  { title: '发送时间', dataIndex: 'sentAt', key: 'sentAt', width: 170 },
  { title: '回执时间', dataIndex: 'readAt', key: 'readAt', width: 170 },
]

const receiptRows = computed(() =>
  [...store.value.records]
    .sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1))
    .map((item) => ({
      id: item.id,
      title: item.title,
      recipient: item.recipient,
      statusLabel: statusLabelMap[item.status],
      sentAt: item.sentAt ?? '-',
      readAt: item.readAt ?? '-',
    }))
)

const templateModalOpen = ref(false)
const ruleModalOpen = ref(false)

const templateForm = ref({
  id: '',
  name: '',
  type: '系统',
  titleTemplate: '',
  contentTemplate: '',
  maxRetry: 2,
})

const ruleForm = ref({
  id: '',
  name: '',
  eventCode: '',
  type: '系统',
  targetRole: 'all',
  throttleMinutes: 30,
})

const reloadStore = () => {
  store.value = getMessageCenterStore()
}

onMounted(() => {
  window.addEventListener('message-center-update', reloadStore)
})

onUnmounted(() => {
  window.removeEventListener('message-center-update', reloadStore)
})

const getPopupContainer = (trigger?: HTMLElement) => trigger?.ownerDocument?.body ?? document.body

const resetFilters = () => {
  filters.value.keyword = ''
  filters.value.type = undefined
  filters.value.status = undefined
}

const doRetry = (id: string) => {
  retryMessage(id)
  reloadStore()
  message.success('已触发重试')
}

const markRead = (id: string) => {
  markMessageRead(id)
  reloadStore()
}

const goBiz = (route?: string) => {
  if (!route) {
    message.info('该消息未关联业务页面')
    return
  }
  router.push(route)
}

const openTemplateModal = (record?: MessageTemplate) => {
  if (record) {
    templateForm.value = {
      id: record.id,
      name: record.name,
      type: record.type,
      titleTemplate: record.titleTemplate,
      contentTemplate: record.contentTemplate,
      maxRetry: record.maxRetry,
    }
  } else {
    templateForm.value = {
      id: '',
      name: '',
      type: '系统',
      titleTemplate: '',
      contentTemplate: '',
      maxRetry: 2,
    }
  }
  templateModalOpen.value = true
}

const submitTemplate = () => {
  if (
    !templateForm.value.name ||
    !templateForm.value.titleTemplate ||
    !templateForm.value.contentTemplate
  ) {
    message.warning('请补全模板信息')
    return
  }
  updateMessageCenterStore((current) => {
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ')
    if (templateForm.value.id) {
      return {
        ...current,
        templates: current.templates.map((item) =>
          item.id === templateForm.value.id
            ? {
                ...item,
                name: templateForm.value.name,
                type: templateForm.value.type as MessageTemplate['type'],
                titleTemplate: templateForm.value.titleTemplate,
                contentTemplate: templateForm.value.contentTemplate,
                maxRetry: Number(templateForm.value.maxRetry || 0),
              }
            : item
        ),
      }
    }
    return {
      ...current,
      templates: [
        {
          id: `tpl-${Date.now()}`,
          name: templateForm.value.name,
          type: templateForm.value.type as MessageTemplate['type'],
          titleTemplate: templateForm.value.titleTemplate,
          contentTemplate: templateForm.value.contentTemplate,
          maxRetry: Number(templateForm.value.maxRetry || 0),
          enabled: true,
          createdAt: now,
        },
        ...current.templates,
      ],
    }
  })
  templateModalOpen.value = false
  reloadStore()
}

const toggleTemplate = (id: string) => {
  updateMessageCenterStore((current) => ({
    ...current,
    templates: current.templates.map((item) =>
      item.id === id ? { ...item, enabled: !item.enabled } : item
    ),
  }))
}

const removeTemplate = (id: string) => {
  updateMessageCenterStore((current) => ({
    ...current,
    templates: current.templates.filter((item) => item.id !== id),
  }))
}

const openRuleModal = (record?: SubscriptionRule) => {
  if (record) {
    ruleForm.value = {
      id: record.id,
      name: record.name,
      eventCode: record.eventCode,
      type: record.type,
      targetRole: record.targetRole,
      throttleMinutes: record.throttleMinutes,
    }
  } else {
    ruleForm.value = {
      id: '',
      name: '',
      eventCode: '',
      type: '系统',
      targetRole: 'all',
      throttleMinutes: 30,
    }
  }
  ruleModalOpen.value = true
}

const submitRule = () => {
  if (!ruleForm.value.name || !ruleForm.value.eventCode) {
    message.warning('请补全规则信息')
    return
  }
  updateMessageCenterStore((current) => {
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ')
    if (ruleForm.value.id) {
      return {
        ...current,
        rules: current.rules.map((item) =>
          item.id === ruleForm.value.id
            ? {
                ...item,
                name: ruleForm.value.name,
                eventCode: ruleForm.value.eventCode,
                type: ruleForm.value.type as SubscriptionRule['type'],
                targetRole: ruleForm.value.targetRole as SubscriptionRule['targetRole'],
                throttleMinutes: Number(ruleForm.value.throttleMinutes || 1),
              }
            : item
        ),
      }
    }
    return {
      ...current,
      rules: [
        {
          id: `rule-${Date.now()}`,
          name: ruleForm.value.name,
          eventCode: ruleForm.value.eventCode,
          type: ruleForm.value.type as SubscriptionRule['type'],
          targetRole: ruleForm.value.targetRole as SubscriptionRule['targetRole'],
          throttleMinutes: Number(ruleForm.value.throttleMinutes || 1),
          enabled: true,
          createdAt: now,
        },
        ...current.rules,
      ],
    }
  })
  ruleModalOpen.value = false
  reloadStore()
}

const toggleRule = (id: string) => {
  updateMessageCenterStore((current) => ({
    ...current,
    rules: current.rules.map((item) =>
      item.id === id ? { ...item, enabled: !item.enabled } : item
    ),
  }))
}

const removeRule = (id: string) => {
  updateMessageCenterStore((current) => ({
    ...current,
    rules: current.rules.filter((item) => item.id !== id),
  }))
}
</script>

<style scoped>
.message-center-page {
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

.kpi-value.warning {
  color: var(--warning-color);
}

.kpi-value.danger {
  color: var(--danger-color);
}

.kpi-value.success {
  color: var(--success-color);
}

.kpi-sub {
  margin-top: 4px;
  color: var(--text-muted);
  font-size: 12px;
}

.filter-bar {
  margin-bottom: 12px;
  row-gap: 8px;
}

.toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;
}
</style>
