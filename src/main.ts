import { createApp } from 'vue'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
import './styles.css'
import App from './App.vue'
import router from './router'
import { applyTheme } from './utils/theme'

applyTheme()

const removeAppLoading = () => {
  const loading = document.getElementById('app-loading')
  if (loading) loading.remove()
}

const bootstrap = async () => {
  if (import.meta.env.VITE_USE_MSW === 'true') {
    const { worker } = await import('./mocks/browser')
    await worker.start({
      onUnhandledRequest: 'bypass',
    })
  }

  createApp(App).use(router).use(Antd).mount('#app')
  removeAppLoading()
}

setTimeout(removeAppLoading, 8000)
void bootstrap()
