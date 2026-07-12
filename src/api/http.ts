/**
 * HTTP 请求守卫
 * 
 * 所有 API 请求都经过这个函数，统一处理：
 * - 请求前：自动加鉴权（后端用 JWT、外部 API 用 API Key）
 * - 返回后：统一处理错误码、解析数据
 * - 401 自动跳转登录
 */

import { useAuthStore } from '@/stores/auth'
import router from '@/router'

// ===== 后端和外部 API 的基础配置 =====
export const API_CONFIG = {
  /** 后端服务地址 */
  backend: {
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
  },
  /** DeepSeek 外部 API */
  deepseek: {
    baseURL: 'https://api.deepseek.com/v1/chat/completions',
    apiKey: import.meta.env.VITE_DEEPSEEK_API_KEY,
  },
}

// ===== 请求目标类型 =====
export type ApiTarget = 'backend' | 'deepseek'

/** 单次请求的配置 */
export interface RequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  url: string
  body?: unknown
  headers?: Record<string, string>
  /** 请求目标，默认 'backend' */
  target?: ApiTarget
}

/** 统一返回格式 */
export interface ApiResult<T = unknown> {
  success: boolean
  data: T | null
  error?: string
}

/**
 * 统一请求守卫
 * 
 * 所有 fetch 请求都必须通过这个函数
 * 自动区分后端 API 和外部 API 的处理逻辑
 */
export async function request<T>(config: RequestConfig): Promise<ApiResult<T>> {
  const { method, url, body, headers = {}, target = 'backend' } = config

  try {
    // ===== 构建完整 URL 和请求头 =====
    let fullURL: string
    const reqHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    }

    if (target === 'backend') {
      // 后端 API：拼接 baseURL + JWT 鉴权
      fullURL = `${API_CONFIG.backend.baseURL}${url}`

      const authStore = useAuthStore()
      if (authStore.token) {
        reqHeaders['Authorization'] = `Bearer ${authStore.token}`
      } else {
        // 未登录时，如果是需要登录的接口则跳转
        if (!url.startsWith('/auth/')) {
          router.push('/login')
          return { success: false, data: null, error: '未登录' }
        }
      }
    } else {
      // 外部 API（DeepSeek）：校验 API Key
      fullURL = url

      const apiKey = API_CONFIG.deepseek.apiKey
      if (!apiKey) {
        return {
          success: false,
          data: null,
          error: '未配置 API Key，请在 .env.local 中设置 VITE_DEEPSEEK_API_KEY',
        }
      }
      reqHeaders['Authorization'] = `Bearer ${apiKey}`
    }

    // ===== 发送请求 =====
    const response = await fetch(fullURL, {
      method,
      headers: reqHeaders,
      body: body ? JSON.stringify(body) : undefined,
    })

    // ===== 统一处理 HTTP 错误 =====
    if (!response.ok) {
      let errMsg = `请求失败 (${response.status})`

      if (target === 'backend') {
        // 后端错误：尝试解析业务错误码
        try {
          const errBody = await response.json()
          errMsg = errBody.message || errMsg
        } catch { /* 忽略解析失败 */ }

        if (response.status === 401 && !url.startsWith('/auth/')) {
          // token 过期或无效，跳转登录
          const authStore = useAuthStore()
          authStore.logout()
          router.push('/login')
          errMsg = '登录已过期，请重新登录'
        }
      } else {
        // DeepSeek 外部 API 错误
        if (response.status === 401) {
          errMsg = 'API Key 无效，请检查 VITE_DEEPSEEK_API_KEY'
        } else if (response.status === 429) {
          errMsg = '请求过于频繁，请稍后再试'
        } else if (response.status >= 500) {
          errMsg = 'AI 服务暂不可用，请稍后再试'
        }
      }

      return { success: false, data: null, error: errMsg }
    }

    // ===== 统一解析 JSON =====
    const data: T = await response.json()

    // 后端 API 额外校验业务状态码
    if (target === 'backend') {
      const backendData = data as { code?: number; message?: string; data?: unknown }
      if (backendData.code !== undefined && backendData.code !== 0) {
        return { success: false, data: null, error: backendData.message || '操作失败' }
      }
      return { success: true, data: (backendData.data ?? backendData) as T }
    }

    return { success: true, data }

  } catch (err) {
    return {
      success: false,
      data: null,
      error: err instanceof Error ? `网络错误：${err.message}` : '网络请求失败',
    }
  }
}

/**
 * 将 ApiResult 转换为元组 [data, error]
 */
async function asTuple<T>(promise: Promise<ApiResult<T>>): Promise<[T | null, string | null]> {
  const result = await promise
  return [result.data, result.error || null]
}

// ===== 便捷方法（返回 [data, error] 元组） =====
export const api = {
  get: <T>(url: string, target?: ApiTarget) =>
    asTuple(request<T>({ method: 'GET', url, target })),
  post: <T>(url: string, body?: unknown, target?: ApiTarget) =>
    asTuple(request<T>({ method: 'POST', url, body, target })),
  put: <T>(url: string, body?: unknown, target?: ApiTarget) =>
    asTuple(request<T>({ method: 'PUT', url, body, target })),
  del: <T>(url: string, target?: ApiTarget) =>
    asTuple(request<T>({ method: 'DELETE', url, target })),
}
