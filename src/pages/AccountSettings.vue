<template>
  <div>
    <div class="page-title">账户设置</div>
    <a-row :gutter="16">
      <a-col :xs="24" :lg="16">
        <a-card title="基础信息" class="card-section">
          <a-form layout="vertical">
            <a-row :gutter="16">
              <a-col :xs="24" :md="12">
                <a-form-item label="登录账号">
                  <a-input v-model:value="form.username" disabled />
                </a-form-item>
              </a-col>
              <a-col :xs="24" :md="12">
                <a-form-item label="角色">
                  <a-input v-model:value="form.role" disabled />
                </a-form-item>
              </a-col>
              <a-col :xs="24" :md="12">
                <a-form-item label="姓名">
                  <a-input v-model:value="form.name" />
                </a-form-item>
              </a-col>
              <a-col :xs="24" :md="12">
                <a-form-item label="手机号">
                  <a-input v-model:value="form.phone" />
                </a-form-item>
              </a-col>
              <a-col :xs="24" :md="12">
                <a-form-item label="邮箱">
                  <a-input v-model:value="form.email" />
                </a-form-item>
              </a-col>
            </a-row>
            <a-button type="primary">保存信息</a-button>
          </a-form>
        </a-card>

        <a-card title="安全设置" class="card-section">
          <a-form layout="vertical">
            <a-row :gutter="16">
              <a-col :xs="24" :md="12">
                <a-form-item label="当前密码">
                  <a-input-password v-model:value="security.current" />
                </a-form-item>
              </a-col>
              <a-col :xs="24" :md="12">
                <a-form-item label="新密码">
                  <a-input-password v-model:value="security.next" />
                </a-form-item>
              </a-col>
              <a-col :xs="24" :md="12">
                <a-form-item label="确认新密码">
                  <a-input-password v-model:value="security.confirm" />
                </a-form-item>
              </a-col>
            </a-row>
            <a-button type="primary">更新密码</a-button>
          </a-form>
        </a-card>
      </a-col>

      <a-col :xs="24" :lg="8">
        <a-card title="头像与偏好" class="card-section">
          <div class="profile-box">
            <a-avatar size="large">管</a-avatar>
            <div>
              <div class="profile-name">{{ form.name }}</div>
              <div class="profile-role">{{ form.role }}</div>
            </div>
          </div>
          <a-divider />
          <a-form layout="vertical">
            <a-form-item label="通知方式">
              <a-checkbox-group v-model:value="preferences.notice" :options="noticeOptions" />
            </a-form-item>
            <a-form-item label="语言">
              <a-select v-model:value="preferences.language" :options="languageOptions" />
            </a-form-item>
            <a-button type="primary">保存偏好</a-button>
          </a-form>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

const form = reactive({
  username: 'admin',
  role: '管理员',
  name: '张晓晨',
  phone: '138-0000-8899',
  email: 'admin@merchant.com',
})

const security = reactive({
  current: '',
  next: '',
  confirm: '',
})

const preferences = reactive({
  notice: ['站内信', '短信'],
  language: 'zh-CN',
})

const noticeOptions = ['站内信', '短信', '邮件']
const languageOptions = [
  { label: '中文', value: 'zh-CN' },
  { label: 'English', value: 'en-US' },
]
</script>

<style scoped>
.profile-box {
  display: flex;
  gap: 12px;
  align-items: center;
}

.profile-name {
  font-weight: 600;
}

.profile-role {
  font-size: 12px;
  color: var(--text-secondary);
}
</style>
