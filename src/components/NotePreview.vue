<script setup lang="ts">
import { formatRelativeTime, sanitizeHtml } from '@/utils'
import { Paperclip, EditPen, ChatDotSquare } from '@element-plus/icons-vue'

const props = defineProps<{
  modelValue: boolean
  note: {
    title: string
    content: string
    cover?: string
    tags: string[]
    status?: string
    relatedTitle?: string
    updatedAt: number
  } | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  edit: []
}>()

/** 关闭预览弹窗 */
function handleClose() {
  emit('update:modelValue', false)
}
</script>

<template>
  <ElDialog
    :model-value="modelValue && note !== null"
    :title="note?.title ?? ''"
    width="700px"
    @close="handleClose"
  >
    <template v-if="note">
      <!-- 封面 -->
      <img
        v-if="note.cover"
        :src="note.cover"
        alt="封面"
        class="mb-4 w-full rounded-lg object-cover"
        style="max-height: 240px"
      />

      <!-- 元信息 -->
      <div class="mb-4 flex flex-wrap items-center gap-2 text-sm text-gray-400">
        <span>{{ formatRelativeTime(note.updatedAt) }}</span>
        <span
          v-if="note.status === 'draft'"
          class="inline-flex items-center gap-1 rounded bg-yellow-50 px-1.5 py-0.5 text-xs text-yellow-600"
        >
          <el-icon :size="12">
            <EditPen />
          </el-icon>
          草稿
        </span>
        <ElTag v-for="tag in note.tags" :key="tag" size="small">{{ tag }}</ElTag>
        <ElTag v-if="note.relatedTitle" type="info" size="small" class="inline-flex items-center gap-1">
          <el-icon :size="12">
            <Paperclip />
          </el-icon>
          {{ note.relatedTitle }}
        </ElTag>
      </div>

      <!-- 渲染 HTML 内容（已消毒） -->
      <div class="prose prose-sm max-w-none text-gray-700" v-html="sanitizeHtml(note.content)"></div>
    </template>

    <template #footer>
      <ElButton @click="handleClose">关闭</ElButton>
      <ElButton type="primary" @click="emit('edit')">编辑</ElButton>
    </template>
  </ElDialog>
</template>

<style scoped>
.prose {
  line-height: 1.7;
}
.prose :deep(h1),
.prose :deep(h2),
.prose :deep(h3) {
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  font-weight: 600;
  color: #111827;
}
.prose :deep(p) {
  margin-bottom: 1em;
}
.prose :deep(ul),
.prose :deep(ol) {
  padding-left: 1.5em;
  margin-bottom: 1em;
}
.prose :deep(li) {
  margin-bottom: 0.25em;
}
.prose :deep(code) {
  background-color: #f3f4f6;
  padding: 0.2em 0.4em;
  border-radius: 4px;
  font-size: 0.9em;
}
.prose :deep(pre) {
  background-color: #1f2937;
  color: #f3f4f6;
  padding: 1em;
  border-radius: 8px;
  overflow-x: auto;
  margin-bottom: 1em;
}
.prose :deep(pre code) {
  background: none;
  color: inherit;
  padding: 0;
}
.prose :deep(blockquote) {
  border-left: 4px solid #e5e7eb;
  padding-left: 1em;
  color: #6b7280;
  margin-bottom: 1em;
}
.prose :deep(img) {
  max-width: 100%;
  border-radius: 8px;
  margin: 1em 0;
}
.prose :deep(a) {
  color: #3b82f6;
  text-decoration: underline;
}
</style>

