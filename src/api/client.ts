export type ApiResponse<T> = {
  code: number
  message: string
  data: T
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

const getToken = () => localStorage.getItem('token') || ''

export const request = async <T>(path: string, options: RequestInit = {}) => {
  const token = getToken()
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  })

  if (res.status === 401) {
    localStorage.removeItem('token')
    const loginUrl = '/login'
    if (window.location.pathname !== loginUrl) {
      window.location.href = loginUrl
    }
    throw new Error('未登录或登录已过期')
  }

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `请求失败: ${res.status}`)
  }

  const json = (await res.json()) as ApiResponse<T>
  if (json.code !== 0) {
    throw new Error(json.message || '接口返回异常')
  }
  return json.data
}
