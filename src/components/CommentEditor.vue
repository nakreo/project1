<script setup lang="ts">
/**
 * 评论输入框组件
 * - 输入评论内容
 * - 按 Enter 发送（Shift+Enter 换行）
 * - 或点击按钮发送
 */
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const emit = defineEmits<{
  submit: [content: string]
}>()

const authStore = useAuthStore()
const router = useRouter()
const content = ref('')
const submitting = ref(false)

function handleSubmit() {
  if (!authStore.isLoggedIn) {
    ElMessage.warning('请先登录后评论')
    router.push('/login')
    return
  }

  const text = content.value.trim()
  if (!text) return

  submitting.value = true
  emit('submit', text)
  content.value = ''
  submitting.value = false
}

function handleKeydown(e: KeyboardEvent) {
  // Enter 发送，Shift+Enter 换行
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSubmit()
  }
}
</script>

<template>
  <div class="flex gap-3">
    <ElInput
      v-model="content"
      type="textarea"
      :rows="2"
      placeholder="写下你的评论...（Enter 发送，Shift+Enter 换行）"
      class="flex-1"
      @keydown="handleKeydown"
    />
    <ElButton
      type="primary"
      :disabled="!content.trim()"
      :loading="submitting"
      class="self-end"
      @click="handleSubmit"
    >
      发送
    </ElButton>
  </div>
</template>
