<script setup lang="ts">
/**
 * 评论列表组件
 * - 展示评论列表（含用户头像、昵称、时间、内容）
 * - 每条评论可点赞
 * - 作者可删除自己的评论
 * - 笔记作者可删除任何评论
 * - 支持折叠/展开
 */
import { ref, computed } from 'vue'
import type { Comment } from '@/types'
import { formatRelativeTime } from '@/utils'
import { useSocialStore } from '@/stores/social'
import { useAuthStore } from '@/stores/auth'
import { ElMessage, ElMessageBox } from 'element-plus'
import UserAvatar from './UserAvatar.vue'
import LikeButton from './LikeButton.vue'

const props = defineProps<{
  publicNoteId: string
  comments: Comment[]
}>()

const socialStore = useSocialStore()
const authStore = useAuthStore()
const collapsed = ref(true)

const visibleComments = computed(() => {
  if (collapsed.value && props.comments.length > 3) {
    return props.comments.slice(0, 3)
  }
  return props.comments
})

async function handleDelete(commentId: string) {
  try {
    await ElMessageBox.confirm('确定要删除这条评论吗？', '确认删除', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      buttonSize: 'small',
    })
    const success = await socialStore.deleteComment(commentId)
    if (success) {
      ElMessage.success('评论已删除')
    }
  } catch { /* 用户取消 */ }
}
</script>

<template>
  <div class="space-y-4">
    <!-- 评论列表 -->
    <div v-if="comments.length > 0" class="space-y-3">
      <div
        v-for="comment in visibleComments"
        :key="comment.id"
        class="flex gap-3 rounded-lg bg-gray-50 p-3"
      >
        <UserAvatar
          :nickname="comment.nickname"
          :avatar-url="comment.avatarUrl"
          :size="28"
        />
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2 text-xs text-gray-500">
            <span class="font-medium text-gray-700">{{ comment.nickname }}</span>
            <span>{{ formatRelativeTime(comment.createdAt) }}</span>
            <button
              v-if="comment.userId === authStore.username"
              class="ml-auto text-gray-400 hover:text-red-500"
              @click="handleDelete(comment.id)"
            >
              删除
            </button>
          </div>
          <p class="mt-1 whitespace-pre-wrap text-sm text-gray-700">{{ comment.content }}</p>
          <div class="mt-1">
            <LikeButton
              :target-id="comment.id"
              target-type="comment"
              size="small"
            />
          </div>
        </div>
      </div>

      <!-- 展开/收起 -->
      <button
        v-if="comments.length > 3"
        class="text-sm text-blue-500 hover:text-blue-700"
        @click="collapsed = !collapsed"
      >
        {{ collapsed ? `查看全部 ${comments.length} 条评论` : '收起评论' }}
      </button>
    </div>

    <!-- 无评论 -->
    <p v-else class="text-sm text-gray-400">暂无评论，来说点什么吧～</p>
  </div>
</template>
