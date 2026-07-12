<script setup lang="ts">
import { ref } from 'vue'
import { useAI } from '@/composables/useAI'
import { categoryLabels } from '@/data/questions'
import { Monitor, Aim } from '@element-plus/icons-vue'

const { messages, isLoading, startInterview, sendMessage } = useAI()

// 当前是否已经开始面试
const hasStarted = ref(false)

// 用户输入框的内容
const inputText = ref('')

// 选中的面试方向
const selectedCategory = ref<string>('')

// 可选的面试方向
const categories = Object.entries(categoryLabels).map(([key, label]) => ({
  key,
  label,
}))

/** 开始面试 */
function handleStart() {
  if (!selectedCategory.value) return
  hasStarted.value = true
  startInterview(selectedCategory.value)
}

/** 发送消息 */
function handleSend() {
  const text = inputText.value.trim()
  if (!text || isLoading.value) return
  inputText.value = ''
  sendMessage(text, selectedCategory.value)
}

/** 按回车发送 */
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}
</script>

<template>
  <div class="flex h-[calc(100vh-4rem)] flex-col">
    <!-- 标题 -->
    <h1 class="mb-4 flex items-center gap-2 text-2xl font-bold text-gray-900">
      <el-icon :size="24">
        <Monitor />
      </el-icon>
      AI 模拟面试
    </h1>
    <!-- 未开始：选择面试方向 -->
    <div v-if="!hasStarted" class="flex flex-1 items-center justify-center">
      <div class="w-full max-w-lg space-y-6 text-center">
        <div class="space-y-2">
          <el-icon :size="48" :color="'#3b82f6'">
            <Aim />
          </el-icon>
          <h2 class="text-xl font-semibold text-gray-900">选择面试方向</h2>
          <p class="text-sm text-gray-500">让 AI 扮演面试官，帮你模拟真实面试场景</p>
        </div>

        <!-- 方向选择 -->
        <div class="flex flex-wrap justify-center gap-3">
          <button
            v-for="cat in categories"
            :key="cat.key"
            @click="selectedCategory = cat.key"
            class="rounded-lg border-2 px-6 py-3 text-sm font-medium transition"
            :class="selectedCategory === cat.key
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'"
          >
            {{ cat.label }}
      </button>
    </div>

        <!-- 开始按钮 -->
        <el-button
          type="primary"
          size="large"
          :disabled="!selectedCategory"
          @click="handleStart"
        >
          开始面试
        </el-button>
  </div>
    </div>

    <!-- 已开始：对话界面 -->
    <div v-else class="flex flex-1 flex-col overflow-hidden">
      <!-- 对话消息区 -->
      <div class="flex-1 space-y-4 overflow-y-auto rounded-xl border border-gray-200 bg-white p-6">
        <!-- 加载中的占位 -->
        <div v-if="messages.length === 0" class="flex items-center justify-center py-12">
          <p class="text-sm text-gray-400">正在准备面试问题...</p>
        </div>

        <!-- 消息列表 -->
        <div
          v-for="msg in messages"
          :key="msg.id"
          class="flex"
          :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
        >
          <div
            class="max-w-[80%] rounded-2xl px-4 py-3 text-sm"
            :class="msg.role === 'user'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-800'"
          >
            <p class="whitespace-pre-wrap">{{ msg.content }}</p>
          </div>
        </div>

        <!-- AI 正在输入 -->
        <div v-if="isLoading" class="flex justify-start">
          <div class="rounded-2xl bg-gray-100 px-4 py-3 text-sm text-gray-500">
            <span class="animate-pulse">AI 正在思考...</span>
          </div>
        </div>
      </div>

      <!-- 输入框 -->
      <div class="mt-4 flex gap-3">
        <el-input
          v-model="inputText"
          :rows="2"
          type="textarea"
          placeholder="输入你的回答..."
          @keydown="onKeydown"
        />
        <el-button
          type="primary"
          :disabled="!inputText.trim() || isLoading"
          @click="handleSend"
        >
          发送
        </el-button>
      </div>
    </div>
  </div>
</template>

