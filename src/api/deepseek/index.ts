/**
 * DeepSeek API 模块
 * 
 * 和 DeepSeek 相关的 API 都在这里
 * 以后如果要加其他功能（比如流式输出），也加在这个文件夹
 */

import { request } from '@/api/http'
import type { ApiResult } from '@/api/http'
import { getInterviewPrompt } from './prompts'

// DeepSeek API 地址
const BASE_URL = 'https://api.deepseek.com/v1/chat/completions'

/** 发送给 API 的单条消息 */
interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

/** API 返回的数据结构 */
interface ChatResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

/**
 * 面试场景：发送消息（自动附带面试官提示词）
 * 
 * @returns 统一返回格式，调用方直接看 success 和 error
 */
export async function interviewChat(
  history: Array<{ role: 'user' | 'assistant'; content: string }>,
  category: string,
): Promise<ApiResult<string>> {
  const messages: ChatMessage[] = [
    { role: 'system', content: getInterviewPrompt(category) },
    ...history,
  ]

  // 调用统一守卫（错误已在守卫层处理）
  const result = await request<ChatResponse>({
    method: 'POST',
    url: BASE_URL,
    body: {
      model: 'deepseek-chat',
      messages,
      temperature: 0.1,       // 从 0.7 降到 0.1：输出更稳定，减少跑偏
      max_tokens: 1024,        // 从 2048 降到 1024：每次回复更短，省 token
      top_p: 0.1,              // 新增：进一步抑制随机性
    },
  })

  // 守卫已经处理了错误，这里只需判断成功还是失败
  if (!result.success) {
    return { success: false, data: null, error: result.error }
  }

  // 取 AI 回复
  const reply = result.data!.choices[0]?.message?.content
  if (!reply) {
    return { success: false, data: null, error: 'AI 返回了空内容' }
  }

  return { success: true, data: reply }
}

