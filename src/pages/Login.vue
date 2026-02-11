<template>
  <div class="login-page">
    <div class="login-shell">
      <div class="login-brand">
        <div class="brand-badge">
          <img class="brand-logo" src="/yc-logo.png" alt="一卡通" />
          <span class="brand-name">一卡通商户后台</span>
        </div>
        <div class="brand-title">让门店经营更可控</div>
        <div class="brand-desc">
          实时掌握订单与库存，跨渠道经营数据一目了然。
          为团队提供一致的经营节奏与执行闭环。
        </div>
        <div class="brand-metrics">
          <div class="metric-item">
            <div class="metric-value">98.7%</div>
            <div class="metric-label">订单履约率</div>
          </div>
          <div class="metric-item">
            <div class="metric-value">24h</div>
            <div class="metric-label">导出任务时效</div>
          </div>
          <div class="metric-item">
            <div class="metric-value">12+</div>
            <div class="metric-label">经营模块</div>
          </div>
        </div>
        <div class="brand-tags">
          <span>资金安全</span>
          <span>库存预警</span>
          <span>多门店协同</span>
        </div>
      </div>

      <div class="login-card">
        <div class="login-title">欢迎回来</div>
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
          <a-button type="primary" html-type="submit" block class="login-action">登录</a-button>
        </a-form>
        <div class="login-hint">提示：演示环境，账号密码不校验。</div>
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
@import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@500;700&family=Source+Sans+3:wght@400;500;600&display=swap');

.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(circle at 20% 20%, rgba(212, 170, 98, 0.12), transparent 55%),
    radial-gradient(circle at 80% 10%, rgba(60, 112, 255, 0.2), transparent 50%),
    linear-gradient(135deg, #0f172a 0%, #111827 40%, #0b0f1c 100%);
  position: relative;
  overflow: hidden;
  font-family: 'Source Sans 3', "PingFang SC", "Microsoft YaHei", sans-serif;
}

.login-page::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px);
  background-size: 24px 24px;
  opacity: 0.5;
  z-index: 0;
}

.login-shell {
  position: relative;
  z-index: 1;
  width: min(1100px, 92vw);
  display: grid;
  grid-template-columns: 1.2fr 0.9fr;
  gap: 48px;
  align-items: center;
}

.login-brand {
  color: #e2e8f0;
}

.brand-badge {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  margin-bottom: 18px;
}

.brand-logo {
  width: 40px;
  height: 24px;
  object-fit: contain;
  padding: 4px 6px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.12);
}

.brand-name {
  font-size: 14px;
  letter-spacing: 0.4px;
}

.brand-title {
  font-family: 'Fraunces', serif;
  font-size: clamp(28px, 4vw, 44px);
  font-weight: 700;
  margin-bottom: 12px;
  color: #f8fafc;
}

.brand-desc {
  font-size: 16px;
  line-height: 1.6;
  color: rgba(226, 232, 240, 0.72);
  max-width: 420px;
}

.brand-metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin: 28px 0 20px;
}

.metric-item {
  padding: 16px;
  border-radius: 14px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.2);
}

.metric-value {
  font-size: 22px;
  font-weight: 600;
  color: #f8fafc;
  margin-bottom: 6px;
}

.metric-label {
  font-size: 12px;
  color: rgba(226, 232, 240, 0.6);
}

.brand-tags {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.brand-tags span {
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(148, 163, 184, 0.2);
  font-size: 12px;
  color: rgba(226, 232, 240, 0.8);
}

.login-card {
  width: min(420px, 90vw);
  padding: 36px 32px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  box-shadow:
    0 24px 60px rgba(15, 23, 42, 0.35),
    inset 0 0 0 1px rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(12px);
}

.login-title {
  font-family: 'Fraunces', serif;
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 6px;
  color: #0f172a;
}

.login-subtitle {
  color: #475569;
  margin-bottom: 24px;
}

.login-hint {
  margin-top: 16px;
  color: #94a3b8;
  font-size: 12px;
  text-align: center;
}

.login-action {
  height: 42px;
  font-weight: 600;
  border-radius: 10px;
}

@media (max-width: 960px) {
  .login-shell {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .login-brand {
    text-align: center;
  }

  .brand-desc {
    margin: 0 auto;
  }

  .brand-metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
