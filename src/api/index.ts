/**
 * API 统一出口
 *
 * 所有 API 请求都从这里导出，按业务模块分组
 * 其他地方引用时从 '@/api' 统一引入
 */

export { api, request } from './http'
export type { ApiResult, ApiTarget } from './http'
export { authApi } from './auth'
export { questionsApi } from './questions'
export { notesApi } from './notes'
export { socialApi } from './social'
export { interviewChat } from './deepseek'
