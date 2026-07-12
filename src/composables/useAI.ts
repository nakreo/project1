import { ref } from 'vue'
import type { AiMessage } from '@/types'
import { interviewChat } from '@/api'
import { idGen } from '@/utils'

export function useAI() {
  const messages = ref<AiMessage[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  /** 发送消息到 DeepSeek 并获取回复 */
  async function sendMessage(content: string, category: string = '前端综合') {
    // 把用户消息加入列表
    const userMessage: AiMessage = {
      id: idGen.generate('msg'),
      role: 'user',
      content,
      timestamp: Date.now(),
    }
    messages.value.push(userMessage)

    // 开始请求
    isLoading.value = true
    error.value = null

    // 只取最近 6 条消息（约 3 轮对话），避免对话历史越滚越大浪费 token
    const recentMessages = messages.value.slice(-6)
    const history = recentMessages.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }))

    // 调用 DeepSeek API（错误已在守卫层统一处理，这里直接看结果）
    const result = await interviewChat(history, category)

    if (result.success) {
      // 成功：把 AI 回复加入列表
      messages.value.push({
        id: idGen.generate('msg'),
        role: 'assistant',
        content: result.data!,
        timestamp: Date.now(),
      })
    } else {
      // 失败：显示错误信息
      error.value = result.error ?? '未知错误'
      messages.value.push({
        id: idGen.generate('msg'),
        role: 'assistant',
        content: `[错误] ${error.value}`,
        timestamp: Date.now(),
      })
    }

    isLoading.value = false
  }

  /** 开始新的面试 */
  function startInterview(category: string) {
    messages.value = []
    error.value = null
    sendMessage('你好，我准备好了，请开始面试。', category)
  }

  /** 清空对话 */
  function clearMessages() {
    messages.value = []
    error.value = null
  }

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    startInterview,
    clearMessages,
  }
}

