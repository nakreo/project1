<script setup lang="ts">
import type { Note } from '@/types'
import { formatRelativeTime, stripHtml } from '@/utils'
import { Paperclip, ChatDotSquare, EditPen } from '@element-plus/icons-vue'

// 笔记卡片组件，展示标题、封面、状态标识（草稿/已发布）、标签和关联题目
// emits: preview（点击预览）、edit（编辑）、delete（删除）、publish（发布到讨论区）

const props = defineProps<{
  note: Note & { relatedTitle?: string }
  isPublished?: boolean
}>()

const emit = defineEmits<{
  preview: []
  edit: []
  delete: []
  publish: []
}>()
</script>

<template>
  <div
    class="group cursor-pointer rounded-xl border border-gray-200 bg-white p-5 transition hover:border-blue-200 hover:shadow-sm"
    @click="emit('preview')"
  >
    <div class="flex items-start justify-between">
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2">
          <h3 class="font-semibold text-gray-900 truncate">{{ note.title }}</h3>
          <!-- 状态标识 -->
          <span
            v-if="note.status === 'draft'"
            class="inline-flex items-center gap-1 rounded bg-yellow-50 px-1.5 py-0.5 text-xs text-yellow-600 shrink-0"
          >
          <el-icon :size="12">
              <EditPen />
          </el-icon>
            草稿
        </span>
          <span
            v-if="isPublished"
            class="inline-flex items-center gap-1 rounded bg-green-50 px-1.5 py-0.5 text-xs text-green-600 shrink-0"
          >
          <el-icon :size="12">
              <ChatDotSquare />
          </el-icon>
            已发布
          </span>
    </div>
        <!-- 封面预览 -->
        <img
          v-if="note.cover"
          :src="note.cover"
          alt="封面"
          class="mt-2 h-28 w-full rounded-lg object-cover"
        />
        <!-- 内容摘要 -->
        <p class="mt-1 line-clamp-2 text-sm text-gray-500">{{ stripHtml(note.content, 120) }}</p>
  </div>

      <div class="ml-4 flex shrink-0 gap-1 opacity-0 transition group-hover:opacity-100" @click.stop>
        <ElButton v-if="!isPublished" text size="small" @click="emit('publish')">
          发布
        </ElButton>
        <ElButton text size="small" @click="emit('edit')">编辑</ElButton>
        <ElButton text size="small" type="danger" @click="emit('delete')">删除</ElButton>
      </div>
    </div>

    <div class="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-400">
      <span>{{ formatRelativeTime(note.updatedAt) }}</span>
      <ElTag v-for="tag in note.tags" :key="tag" size="small" effect="plain">
        {{ tag }}
      </ElTag>
      <ElTag v-if="note.relatedQuestionId" size="small" type="info" effect="plain">
        <router-link :to="`/questions/${note.relatedQuestionId}`" @click.stop class="inline-flex items-center gap-1">
          <el-icon :size="12">
            <Paperclip />
          </el-icon>
          {{ note.relatedTitle || '查看题目' }}
        </router-link>
      </ElTag>
    </div>
  </div>
</template>

