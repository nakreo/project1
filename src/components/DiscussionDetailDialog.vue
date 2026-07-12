<script setup lang="ts">
/**
 * 讨论区笔记详情弹窗
 * - 显示笔记完整内容、封面、标签、关联题目
 * - 显示点赞 + 评论互动区域
 * - 内联评论区（评论编辑器 + 评论列表）
 */
import { ref, watch, computed, nextTick } from 'vue'
import type { PublicNote } from '@/types'
import { formatRelativeTime } from '@/utils'
import { sanitizeHtml } from '@/utils'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useSocialStore } from '@/stores/social'
import { useAuthStore } from '@/stores/auth'
import { ChatDotSquare, Paperclip } from '@element-plus/icons-vue'
import UserAvatar from './UserAvatar.vue'
import LikeButton from './LikeButton.vue'
import CommentEditor from './CommentEditor.vue'
import CommentList from './CommentList.vue'

const props = defineProps<{
  modelValue: boolean
  noteId: string | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'note-deleted': [noteId: string]
}>()

const socialStore = useSocialStore()
const authStore = useAuthStore()

const note = ref<PublicNote | null>(null)

watch(
  () => [props.modelValue, props.noteId],
  async () => {
    if (props.modelValue && props.noteId) {
      // 等待弹窗渲染完成后加载数据
      await nextTick()
      note.value = socialStore.getPublicNoteById(props.noteId) || null
      // 加载评论列表
      await socialStore.fetchComments(props.noteId)
      // 加载点赞状态（笔记 + 已有评论）
      const comments = socialStore.getComments(props.noteId)
      await socialStore.fetchLikeStatus([
        { targetId: props.noteId, targetType: 'note' },
        ...comments.map((c) => ({ targetId: c.id, targetType: 'comment' as const })),
      ])
    }
  },
)

const isMyNote = computed(() => {
  if (!note.value) return false
  return note.value.userId === authStore.username
})

function handleClose() {
  emit('update:modelValue', false)
}

async function handleAddComment(content: string) {
  if (!note.value) return
  const comment = await socialStore.addComment(note.value.id, content)
  if (comment) {
    ElMessage.success('评论发表成功')
  }
}

async function handleUnpublish() {
  if (!note.value) return
  try {
    await ElMessageBox.confirm('确定要从讨论区删除这篇笔记吗？', '确认删除', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      buttonSize: 'small',
    })
    const success = await socialStore.unpublishNote(note.value!.id)
    if (success) {
      ElMessage.success('已从讨论区删除')
      const deletedId = note.value!.id
      handleClose()
      emit('note-deleted', deletedId)
    }
  } catch { /* 用户取消 */ }
}

async function handleSync() {
  if (!note.value) return
  const success = await socialStore.updatePublicNote(note.value.id)
  if (success) {
    ElMessage.success('笔记内容已同步更新')
    note.value = socialStore.getPublicNoteById(note.value.id) || null
  } else {
    ElMessage.warning('同步失败，只能同步自己发布的笔记')
  }
}
</script>

<template>
  <ElDialog
    :model-value="modelValue"
    :title="note?.title || ''"
    width="720px"
    top="4vh"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div v-if="note" class="space-y-5">
      <!-- 封面 -->
      <div
        v-if="note.cover"
        class="overflow-hidden rounded-lg bg-gray-100"
      >
        <img
          :src="note.cover"
          :alt="note.title"
          class="max-h-64 w-full object-cover"
        />
      </div>

      <!-- 作者信息 + 操作 -->
      <div class="flex items-start justify-between">
        <div class="flex items-center gap-3">
          <UserAvatar
            :nickname="note.nickname"
            :avatar-url="note.avatarUrl"
            :size="36"
          />
          <div>
            <p class="text-sm font-medium text-gray-900">{{ note.nickname }}</p>
            <p class="text-xs text-gray-400">
              {{ formatRelativeTime(note.createdAt) }}
              <span v-if="note.updatedAt > note.createdAt" class="ml-1">· 已编辑</span>
            </p>
          </div>
        </div>

        <!-- 操作按钮（仅作者可见） -->
        <div v-if="isMyNote" class="flex gap-1">
          <ElButton text size="small" @click="handleSync">同步</ElButton>
          <ElButton text size="small" type="danger" @click="handleUnpublish">删除</ElButton>
        </div>
      </div>

      <!-- 笔记内容（已消毒） -->
      <div
        class="prose prose-sm max-w-none text-sm leading-relaxed text-gray-700"
        v-html="sanitizeHtml(note.content)"
      ></div>

      <!-- 标签 + 关联题目 -->
      <div class="flex flex-wrap items-center gap-2">
        <ElTag
          v-for="tag in note.tags"
          :key="tag"
          size="small"
          effect="plain"
        >
          {{ tag }}
        </ElTag>
        <router-link
          v-if="note.relatedQuestionId"
          :to="`/questions/${note.relatedQuestionId}`"
          class="inline-flex items-center gap-1"
        >
          <ElTag size="small" type="info" effect="plain" class="cursor-pointer">
            <el-icon :size="12">
              <Paperclip />
            </el-icon>
            {{ note.relatedQuestionTitle || '查看题目' }}
          </ElTag>
        </router-link>
      </div>

      <!-- 互动区域 -->
      <div class="flex items-center gap-4 border-t border-gray-100 pt-4">
        <LikeButton :target-id="note.id" target-type="note" />
        <span class="inline-flex items-center gap-1 text-sm text-gray-400">
          <el-icon :size="16">
            <ChatDotSquare />
          </el-icon>
          {{ socialStore.commentCountMap[note.id] || 0 }} 评论
        </span>
      </div>

      <!-- 评论区 -->
      <div class="space-y-4 border-t border-gray-100 pt-4">
        <CommentEditor
          :key="'editor-' + note.id"
          @submit="(content) => handleAddComment(content)"
        />
        <CommentList
          :key="'list-' + note.id + '-' + socialStore.getComments(note.id).length"
          :public-note-id="note.id"
          :comments="socialStore.getComments(note.id)"
        />
      </div>
    </div>

    <div v-else class="py-10 text-center text-gray-400">
      笔记加载失败或已被删除
    </div>
  </ElDialog>
</template>