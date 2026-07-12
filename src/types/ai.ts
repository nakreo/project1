/** AI 对话消息 */
export interface AiMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

/** AI 面试会话 */
export interface AiInterviewSession {
  id: string
  category: string       // 面试方向
  messages: AiMessage[]
  startedAt: number
  endedAt: number | null
  summary?: string       // 面试总结
}

/** AI 请求配置 */
export interface AiConfig {
  apiKey: string
  model: string
  baseUrl: string
}
