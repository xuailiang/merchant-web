<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-title">商户管理后台</div>
      <div class="login-subtitle">登录以继续管理店铺</div>
      <a-form layout="vertical" :model="form" @finish="onSubmit">
        <a-form-item label="账号" name="username" :rules="[{ required: true, message: '请输入账号' }]">
          <a-input v-model:value="form.username" placeholder="例如：admin" />
        </a-form-item>
        <a-form-item label="密码" name="password" :rules="[{ required: true, message: '请输入密码' }]">
          <a-input-password v-model:value="form.password" placeholder="任意密码即可" />
        </a-form-item>
        <a-form-item label="角色" name="role" :rules="[{ required: true, message: '请选择角色' }]">
          <a-select v-model:value="form.role" :options="roles" />
        </a-form-item>
        <a-button type="primary" html-type="submit" block>登录</a-button>
      </a-form>
      <div class="login-hint">
        提示：演示环境，账号密码不校验。
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { setName, setRole, setToken, type UserRole } from '../utils/auth'

const router = useRouter()

const form = reactive({
  username: 'admin',
  password: '123456',
  role: 'admin' as UserRole,
})

const roles = [
  { label: '管理员', value: 'admin' },
  { label: '运营', value: 'operator' },
  { label: '财务', value: 'finance' },
]

const onSubmit = () => {
  setToken(`token-${Date.now()}`)
  setRole(form.role)
  setName('星辰数码旗舰店')
  router.replace('/dashboard')
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    linear-gradient(180deg, rgba(15, 23, 42, 0.45), rgba(15, 23, 42, 0.2)),
    url('/login-bg.png') center/100% auto no-repeat;
  position: relative;
  overflow: hidden;
}

.login-page::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, rgba(255, 255, 255, 0.08), rgba(15, 23, 42, 0.35) 60%);
  opacity: 1;
  z-index: 0;
}

.login-card {
  position: relative;
  z-index: 1;
}

.login-card {
  width: min(420px, 90vw);
  padding: 36px 32px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.12);
}

.login-title {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 6px;
}

.login-subtitle {
  color: #6b7280;
  margin-bottom: 24px;
}

.login-hint {
  margin-top: 16px;
  color: #9ca3af;
  font-size: 12px;
  text-align: center;
}
</style>
