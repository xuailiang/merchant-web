<template>
  <a-drawer :open="open" width="860" title="消息设置中心" @close="$emit('update:open', false)">
    <div class="mc-settings-switch">
      <a-segmented v-model:value="mode" :options="modeOptions" />
    </div>

    <template v-if="mode === 'templates'">
      <div class="mc-settings-toolbar">
        <a-button type="primary" @click="openTemplateModal()">新增模板</a-button>
      </div>
      <a-table :columns="templateColumns" :data-source="templates" row-key="id" :pagination="false">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'enabled'">
            <a-switch :checked="record.enabled" @change="$emit('toggle-template', record.id)" />
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" @click="openTemplateModal(record)">编辑</a-button>
              <a-button type="link" danger @click="$emit('remove-template', record.id)"
                >删除</a-button
              >
            </a-space>
          </template>
        </template>
      </a-table>
    </template>

    <template v-else-if="mode === 'rules'">
      <div class="mc-settings-toolbar">
        <a-button type="primary" @click="openRuleModal()">新增规则</a-button>
      </div>
      <a-table :columns="ruleColumns" :data-source="rules" row-key="id" :pagination="false">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'enabled'">
            <a-switch :checked="record.enabled" @change="$emit('toggle-rule', record.id)" />
          </template>
          <template v-else-if="column.key === 'cooldown'">
            <span>{{ record.throttleMinutes }} 分钟</span>
            <div class="hint">最近触发：{{ record.lastTriggeredAt || '-' }}</div>
          </template>
          <template v-else-if="column.key === 'hitEstimate24h'">
            <span>{{ record.hitEstimate24h ?? 0 }}</span>
            <div class="hint">近24小时命中</div>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" @click="openRuleModal(record)">编辑</a-button>
              <a-button type="link" danger @click="$emit('remove-rule', record.id)">删除</a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </template>

    <template v-else>
      <a-row :gutter="16">
        <a-col :xs="24" :xl="8">
          <a-card size="small" title="回执总览">
            <a-descriptions :column="1" size="small">
              <a-descriptions-item label="发送总量">{{ stats.total }}</a-descriptions-item>
              <a-descriptions-item label="已读">{{ stats.read }}</a-descriptions-item>
              <a-descriptions-item label="未读">{{ stats.unread }}</a-descriptions-item>
              <a-descriptions-item label="失败">{{ stats.failed }}</a-descriptions-item>
              <a-descriptions-item label="回执率">{{ stats.readRate }}%</a-descriptions-item>
            </a-descriptions>
          </a-card>
        </a-col>
        <a-col :xs="24" :xl="16">
          <a-card size="small" title="最近回执">
            <a-table
              :columns="receiptColumns"
              :data-source="receipts"
              row-key="id"
              :pagination="{ pageSize: 6 }"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'status'">
                  <a-tag
                    :color="
                      record.status === 'read'
                        ? 'green'
                        : record.status === 'failed'
                          ? 'red'
                          : record.status === 'success'
                            ? 'blue'
                            : 'orange'
                    "
                  >
                    {{
                      record.status === 'read'
                        ? '已读'
                        : record.status === 'failed'
                          ? '失败'
                          : record.status === 'success'
                            ? '已发送'
                            : '处理中'
                    }}
                  </a-tag>
                </template>
                <template v-else-if="column.key === 'sentAt'">
                  {{ record.sentAt || '-' }}
                </template>
                <template v-else-if="column.key === 'readAt'">
                  {{ record.readAt || '-' }}
                </template>
              </template>
            </a-table>
          </a-card>
        </a-col>
      </a-row>
    </template>

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
          <a-select v-model:value="templateForm.type" :options="typeOptions" />
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
          <a-select v-model:value="ruleForm.type" :options="typeOptions" />
        </a-form-item>
        <a-form-item label="订阅角色">
          <a-select v-model:value="ruleForm.targetRole" :options="roleOptions" />
        </a-form-item>
        <a-form-item label="节流(分钟)">
          <a-input-number v-model:value="ruleForm.throttleMinutes" :min="1" />
        </a-form-item>
      </a-form>
    </a-modal>
  </a-drawer>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import type {
  MessageCenterStats,
  MessageRecord,
  MessageTemplate,
  SubscriptionRule,
} from '../../types/message-center'

defineProps<{
  open: boolean
  templates: MessageTemplate[]
  rules: SubscriptionRule[]
  stats: MessageCenterStats
  receipts: MessageRecord[]
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'save-template', payload: Omit<MessageTemplate, 'createdAt'>): void
  (e: 'save-rule', payload: Omit<SubscriptionRule, 'createdAt'>): void
  (e: 'toggle-template', id: string): void
  (e: 'remove-template', id: string): void
  (e: 'toggle-rule', id: string): void
  (e: 'remove-rule', id: string): void
}>()

const modeOptions = [
  { label: '通知模板', value: 'templates' },
  { label: '订阅规则', value: 'rules' },
  { label: '回执统计', value: 'receipts' },
]
const mode = ref<'templates' | 'rules' | 'receipts'>('templates')

const templateColumns = [
  { title: '模板名称', dataIndex: 'name', key: 'name', width: 160 },
  { title: '类型', dataIndex: 'type', key: 'type', width: 100 },
  { title: '标题模板', dataIndex: 'titleTemplate', key: 'titleTemplate' },
  { title: '重试上限', dataIndex: 'maxRetry', key: 'maxRetry', width: 100 },
  { title: '启用', key: 'enabled', width: 100 },
  { title: '操作', key: 'action', width: 140 },
]

const ruleColumns = [
  { title: '规则名称', dataIndex: 'name', key: 'name', width: 160 },
  { title: '事件编码', dataIndex: 'eventCode', key: 'eventCode', width: 220 },
  { title: '类型', dataIndex: 'type', key: 'type', width: 100 },
  { title: '命中', key: 'hitEstimate24h', width: 120 },
  { title: '节流', key: 'cooldown', width: 170 },
  { title: '启用', key: 'enabled', width: 100 },
  { title: '操作', key: 'action', width: 140 },
]

const receiptColumns = [
  { title: '标题', dataIndex: 'title', key: 'title' },
  { title: '接收人', dataIndex: 'recipient', key: 'recipient', width: 120 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 120 },
  { title: '发送时间', dataIndex: 'sentAt', key: 'sentAt', width: 170 },
  { title: '已读时间', dataIndex: 'readAt', key: 'readAt', width: 170 },
]

const typeOptions = [
  { label: '交易', value: '交易' },
  { label: '系统', value: '系统' },
  { label: '营销', value: '营销' },
  { label: '审批', value: '审批' },
]

const roleOptions = [
  { label: '全部角色', value: 'all' },
  { label: '管理员', value: 'admin' },
  { label: '运营', value: 'operator' },
  { label: '财务', value: 'finance' },
]

const templateModalOpen = ref(false)
const ruleModalOpen = ref(false)

const templateForm = ref({
  id: '',
  name: '',
  type: '系统' as MessageTemplate['type'],
  titleTemplate: '',
  contentTemplate: '',
  maxRetry: 2,
})

const ruleForm = ref({
  id: '',
  name: '',
  eventCode: '',
  type: '系统' as SubscriptionRule['type'],
  targetRole: 'all' as SubscriptionRule['targetRole'],
  throttleMinutes: 30,
  enabled: true,
  hitEstimate24h: 0,
  lastTriggeredAt: '',
})

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
  emit('save-template', {
    id: templateForm.value.id || `tpl-${Date.now()}`,
    name: templateForm.value.name,
    type: templateForm.value.type,
    titleTemplate: templateForm.value.titleTemplate,
    contentTemplate: templateForm.value.contentTemplate,
    maxRetry: Number(templateForm.value.maxRetry || 0),
    enabled: true,
  })
  templateModalOpen.value = false
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
      enabled: record.enabled,
      hitEstimate24h: record.hitEstimate24h ?? 0,
      lastTriggeredAt: record.lastTriggeredAt || '',
    }
  } else {
    ruleForm.value = {
      id: '',
      name: '',
      eventCode: '',
      type: '系统',
      targetRole: 'all',
      throttleMinutes: 30,
      enabled: true,
      hitEstimate24h: 0,
      lastTriggeredAt: '',
    }
  }
  ruleModalOpen.value = true
}

const submitRule = () => {
  if (!ruleForm.value.name || !ruleForm.value.eventCode) {
    message.warning('请补全规则信息')
    return
  }
  emit('save-rule', {
    id: ruleForm.value.id || `rule-${Date.now()}`,
    name: ruleForm.value.name,
    eventCode: ruleForm.value.eventCode,
    type: ruleForm.value.type,
    targetRole: ruleForm.value.targetRole,
    throttleMinutes: Number(ruleForm.value.throttleMinutes || 1),
    enabled: true,
    hitEstimate24h: ruleForm.value.hitEstimate24h,
    lastTriggeredAt: ruleForm.value.lastTriggeredAt,
  })
  ruleModalOpen.value = false
}
</script>
