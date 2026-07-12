<script setup lang="ts">
/**
 * 讨论区卡片组件（概览卡片）
 * - 展示封面、用户头像、标题
 * - 点击卡片触发详情弹窗，通过 emit('view') 通知父组件
 * - 配合 ElRow/ElCol 实现一行两列布局
 */
import { formatRelativeTime } from '@/utils'
import { useAuthStore } from '@/stores/auth'
import { useSocialStore } from '@/stores/social'
import { ElMessageBox, ElMessage } from 'element-plus'
import type { PublicNote } from '@/types'
import UserAvatar from './UserAvatar.vue'

const props = defineProps<{
  note: PublicNote
}>()

const emit = defineEmits<{
  view: [noteId: string]
  unpublish: [noteId: string]
  sync: [noteId: string]
}>()

const authStore = useAuthStore()
const socialStore = useSocialStore()

const isMyNote = props.note.userId === authStore.username

function handleClick() {
  emit('view', props.note.id)
}

async function handleUnpublish(e: MouseEvent) {
  e.stopPropagation()
  try {
    await ElMessageBox.confirm('确定要从讨论区删除这篇笔记吗？', '确认删除', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      buttonSize: 'small',
    })
    const success = await socialStore.unpublishNote(props.note.id)
    if (success) {
      ElMessage.success('已从讨论区删除')
      emit('unpublish', props.note.id)
    }
  } catch { /* 用户取消 */ }
}

async function handleSync(e: MouseEvent) {
  e.stopPropagation()
  const success = await socialStore.updatePublicNote(props.note.id)
  if (success) {
    ElMessage.success('笔记内容已同步更新')
    emit('sync', props.note.id)
  } else {
    ElMessage.warning('同步失败，只能同步自己发布的笔记')
  }
}
</script>

<template>
  <div
    class="group flex h-full cursor-pointer flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition hover:border-blue-300 hover:shadow-md"
    @click="handleClick"
  >
    <!-- 封面 -->
    <div
      v-if="note.cover"
      class="h-44 shrink-0 overflow-hidden bg-gray-100"
    >
      <img
        :src="note.cover"
        :alt="note.title"
        class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
      />
    </div>
    <div
      v-else
      class="flex h-32 shrink-0 items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100"
    >
      <span class="text-3xl font-bold text-blue-300">
        {{ note.title.charAt(0) || '?' }}
      </span>
    </div>

    <!-- 信息区域 -->
    <div class="flex flex-1 flex-col p-4">
      <!-- 作者信息 -->
      <div class="mb-2 flex items-center justify-between gap-2">
        <div class="flex items-center gap-2">
          <UserAvatar
            :nickname="note.nickname"
            :avatar-url="note.avatarUrl"
            :size="28"
          />
          <div class="min-w-0">
            <p class="truncate text-xs font-medium text-gray-700">
              {{ note.nickname }}
            </p>
            <p class="text-[11px] text-gray-400">
              {{ formatRelativeTime(note.createdAt) }}
            </p>
          </div>
        </div>

        <!-- 作者操作（hover 显示） -->
        <div
          v-if="isMyNote"
          class="flex shrink-0 gap-0.5 opacity-0 transition group-hover:opacity-100"
          @click.stop
        >
          <ElButton text size="small" @click="handleSync">同步</ElButton>
          <ElButton text size="small" type="danger" @click="handleUnpublish">删除</ElButton>
        </div>
      </div>

      <!-- 标题 -->
      <h3 class="line-clamp-2 text-sm font-semibold leading-snug text-gray-900">
        {{ note.title }}
      </h3>

      <!-- 互动数据（底部） -->
      <div class="mt-auto flex items-center gap-3 pt-3 text-xs text-gray-400">
        <span class="inline-flex items-center gap-1">
          <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          {{ socialStore.likeCountMap[note.id] || 0 }}
        </span>
        <span class="inline-flex items-center gap-1">
          <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          {{ socialStore.commentCountMap[note.id] || 0 }}
        </span>
        <span
          v-for="tag in note.tags.slice(0, 2)"
          :key="tag"
          class="ml-auto rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500"
        >
          {{ tag }}
        </span>
        <span v-if="note.tags.length > 2" class="text-[10px] text-gray-400">+{{ note.tags.length - 2 }}</span>
      </div>
    </div>
  </div>
</template>