import axios from 'axios'
import { message } from 'ant-design-vue'
import { getToken, clearAuth } from './auth'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
})

request.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

request.interceptors.response.use(
  (response) => {
    const res = response.data
    // Check if the response matches a standard { code, data, message } wrapper
    if (res && typeof res === 'object' && 'code' in res && res.code !== 0) {
      message.error(res.message || '请求异常')
      return Promise.reject(new Error(res.message || 'Error'))
    }
    return res.data !== undefined ? res.data : res
  },
  (error) => {
    if (error.response) {
      const status = error.response.status
      if (status === 401) {
        clearAuth()
        message.error('登录状态已过期，请重新登录')
        setTimeout(() => {
          window.location.href = '/login'
        }, 1500)
      } else if (status === 403) {
        message.error('没有该操作权限')
      } else {
        message.error(error.response.data?.message || '请求失败，请稍后重试')
      }
    } else {
      message.error('网络连接异常，请检查网络设定')
    }
    return Promise.reject(error)
  }
)

export default request
