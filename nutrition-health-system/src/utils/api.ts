import { useUserStore } from '@/store'

const BASE_URL = '/api'

interface RequestOptions {
  method?: string
  headers?: Record<string, string>
  body?: unknown
}

interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

async function request<T = unknown>(url: string, options: RequestOptions = {}): Promise<T> {
  const token = useUserStore.getState().token

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${BASE_URL}${url}`, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  if (response.status === 401) {
    useUserStore.getState().logout()
    window.location.href = '/login'
    throw new Error('登录已过期，请重新登录')
  }

  const result: ApiResponse<T> = await response.json().catch(() => ({
    success: false,
    error: '请求失败',
  }))

  if (!response.ok || !result.success) {
    throw new Error(result.error || result.message || `请求错误: ${response.status}`)
  }

  return result.data as T
}

export const api = {
  get: <T = unknown>(url: string) => request<T>(url),
  post: <T = unknown>(url: string, body?: unknown) =>
    request<T>(url, { method: 'POST', body }),
  put: <T = unknown>(url: string, body?: unknown) =>
    request<T>(url, { method: 'PUT', body }),
  delete: <T = unknown>(url: string) =>
    request<T>(url, { method: 'DELETE' }),
}

export default api
