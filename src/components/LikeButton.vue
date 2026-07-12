<script setup lang="ts">
/**
 * 点赞按钮组件
 * - 显示点赞数 + 图标
 * - 点击切换点赞状态
 * - 未登录时提示
 */
import { ElMessage } from 'element-plus'
import { useSocialStore } from '@/stores/social'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const props = defineProps<{
  targetId: string
  targetType: 'note' | 'comment'
  size?: 'small' | 'default'
}>()

const emit = defineEmits<{
  toggle: [liked: boolean]
}>()

const socialStore = useSocialStore()
const authStore = useAuthStore()
const router = useRouter()

async function handleToggle() {
  if (!authStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }

  const liked = await socialStore.toggleLike(props.targetId, props.targetType)
  emit('toggle', liked)
}
</script>

<template>
  <button
    class="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm transition hover:bg-gray-100"
    :class="[
      socialStore.isLiked(targetId, targetType)
        ? 'text-red-500'
        : 'text-gray-400',
      size === 'small' ? 'text-xs' : '',
    ]"
    @click="handleToggle"
  >
    <svg
      class="transition"
      :class="[size === 'small' ? 'h-3.5 w-3.5' : 'h-4 w-4']"
      :fill="socialStore.isLiked(targetId, targetType) ? 'currentColor' : 'none'"
      viewBox="0 0 24 24"
      stroke="currentColor"
      stroke-width="2"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
      />
    </svg>
    <span>{{ socialStore.getLikeCount(targetId, targetType) || '点赞' }}</span>
  </button>
</template>
