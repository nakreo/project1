<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import type { Question } from '@/types'
import { categoryLabels } from '@/data/questions'
import { ElMessage } from 'element-plus'
import { Picture, UploadFilled, Close } from '@element-plus/icons-vue'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    title?: string
    content?: string
    cover?: string
    tags?: string[]
    status?: 'draft' | 'published'
    relatedQuestionId?: string
    questions: Question[]
  }>(),
  {
    title: '',
    content: '',
    cover: '',
    tags: () => [],
    status: 'draft',
    relatedQuestionId: '',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  save: [data: {
    title: string
    content: string
    cover?: string
    tags: string[]
    status: 'draft' | 'published'
    relatedQuestionId?: string
  }]
  publish: [data: {
    title: string
    content: string
    cover?: string
    tags: string[]
    status: 'published'
    relatedQuestionId?: string
  }]
}>()

const editTitle = ref(props.title)
const editContent = ref(props.content)
const editCover = ref(props.cover)
const editTags = ref(props.tags.join(', '))
const editRelatedId = ref(props.relatedQuestionId)
const quillRef = ref<InstanceType<typeof QuillEditor> | null>(null)

// 封面图预览
const coverPreview = ref(props.cover || '')

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      editTitle.value = props.title
      editContent.value = props.content
      editCover.value = props.cover
      editTags.value = props.tags.join(', ')
      editRelatedId.value = props.relatedQuestionId
      coverPreview.value = props.cover || ''
      // 重新设置编辑器内容
      nextTick(() => {
        if (quillRef.value) {
          quillRef.value.setHTML(props.content || '')
        }
      })
    }
  },
)

/** 上传封面图片 */
function handleCoverUpload(file: File) {
  const maxSize = 2 * 1024 * 1024 // 2MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

  if (!allowedTypes.includes(file.type)) {
    ElMessage.warning('仅支持 JPG/PNG/GIF/WebP 格式')
    return false
  }

  if (file.size > maxSize) {
    ElMessage.warning('封面图片不能超过 2MB')
    return false
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    coverPreview.value = e.target?.result as string
    editCover.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
  return false
}

/** 移除封面 */
function removeCover() {
  coverPreview.value = ''
  editCover.value = ''
}

/** 保存为草稿 */
function handleSaveDraft() {
  const title = editTitle.value.trim()
  const content = quillRef.value?.getHTML() || ''
  if (!title || !content.replace(/<[^>]*>/g, '').trim()) {
    ElMessage.warning('请输入标题和内容')
    return
  }

  const tags = editTags.value
    .split(/[,，、]/)
    .map((t) => t.trim())
    .filter(Boolean)

  const relatedId = editRelatedId.value.trim() || undefined

  emit('save', {
    title,
    content,
    cover: editCover.value || undefined,
    tags,
    status: 'draft',
    relatedQuestionId: relatedId,
  })
  emit('update:modelValue', false)
}

/** 发布 */
function handlePublish() {
  const title = editTitle.value.trim()
  const content = quillRef.value?.getHTML() || ''
  if (!title || !content.replace(/<[^>]*>/g, '').trim()) {
    ElMessage.warning('请输入标题和内容')
    return
  }

  const tags = editTags.value
    .split(/[,，、]/)
    .map((t) => t.trim())
    .filter(Boolean)

  const relatedId = editRelatedId.value.trim() || undefined

  emit('publish', {
    title,
    content,
    cover: editCover.value || undefined,
    tags,
    status: 'published',
    relatedQuestionId: relatedId,
  })
  emit('update:modelValue', false)
}

/** 关闭抽屉 */
function handleClose() {
  emit('update:modelValue', false)
}

// Quill 编辑器配置
const editorConfig = {
  theme: 'snow',
  placeholder: '在这里写下你的学习心得...',
  modules: {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ header: 1 }, { header: 2 }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ script: 'sub' }, { script: 'super' }],
      [{ indent: '-1' }, { indent: '+1' }],
      [{ direction: 'rtl' }],
      [{ size: ['small', false, 'large', 'huge'] }],
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ color: [] }, { background: [] }],
      [{ font: [] }],
      [{ align: [] }],
      ['clean'],
      ['link', 'image'],
    ],
  },
}
</script>

<template>
  <ElDrawer
    :model-value="modelValue"
    :title="props.title ? '编辑笔记' : '新建笔记'"
    size="640px"
    direction="rtl"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="flex h-full flex-col">
      <!-- 表单内容（可滚动） -->
      <div class="flex-1 space-y-5 overflow-y-auto pr-2">
        <!-- 标题 -->
        <ElFormItem label="标题 *" class="mb-0">
          <ElInput
            v-model="editTitle"
            placeholder="输入笔记标题"
            size="large"
          />
        </ElFormItem>

        <!-- 封面 -->
        <ElFormItem label="封面（可选）" class="mb-0">
          <div class="flex items-start gap-4">
            <!-- 预览区域 -->
            <div
              v-if="coverPreview"
              class="relative h-32 w-48 overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
            >
              <img
                :src="coverPreview"
                alt="封面预览"
                class="h-full w-full object-cover"
              />
              <ElButton
                class="absolute right-1 top-1"
                size="small"
                type="danger"
                circle
                @click="removeCover"
              >
                <el-icon><Close /></el-icon>
              </ElButton>
            </div>

            <!-- 上传按钮 -->
            <ElUpload
              :auto-upload="false"
              :show-file-list="false"
              :on-change="(uploadFile: { raw: File }) => handleCoverUpload(uploadFile.raw!)"
              accept="image/jpeg,image/png,image/gif,image/webp"
            >
              <div
                class="flex h-32 w-48 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition hover:border-blue-400 hover:bg-blue-50"
              >
                <el-icon :size="24" class="text-gray-400">
                  <Picture />
                </el-icon>
                <p class="mt-2 text-xs text-gray-500">点击上传封面</p>
                <p class="text-xs text-gray-400">JPG/PNG/GIF ≤ 2MB</p>
              </div>
            </ElUpload>
          </div>
        </ElFormItem>

        <!-- 富文本编辑器 -->
        <ElFormItem label="内容 *" class="mb-0">
          <div class="min-h-[320px] rounded-lg border border-gray-200">
            <QuillEditor
              ref="quillRef"
              :content="editContent"
              :options="editorConfig"
              content-type="html"
              style="min-height: 320px; height: auto"
            />
          </div>
        </ElFormItem>

        <!-- 标签和关联题目 -->
        <div class="grid grid-cols-2 gap-4">
          <ElFormItem label="标签" class="mb-0">
            <ElInput
              v-model="editTags"
              placeholder="用逗号分隔，如：Vue, 响应式"
            />
          </ElFormItem>

          <ElFormItem label="关联题目（可选）" class="mb-0">
            <ElSelect v-model="editRelatedId" placeholder="不关联" clearable>
              <ElOption label="不关联" value="" />
              <ElOption
                v-for="q in props.questions"
                :key="q.id"
                :label="`[${categoryLabels[q.category] || q.category}] ${q.title}`"
                :value="q.id"
              />
            </ElSelect>
          </ElFormItem>
        </div>
      </div>

      <!-- 底部操作按钮 -->
      <div class="flex items-center justify-between border-t border-gray-200 pt-4">
        <ElButton @click="handleClose">取消</ElButton>
        <div class="flex items-center gap-2">
          <ElButton @click="handleSaveDraft">
            保存草稿
          </ElButton>
          <ElButton
            type="primary"
            :disabled="!editTitle.trim()"
            @click="handlePublish"
          >
            {{ props.title ? '更新并发布' : '发布' }}
          </ElButton>
        </div>
      </div>
    </div>
  </ElDrawer>
</template>

<style scoped>
:deep(.ql-editor) {
  min-height: 280px;
  font-size: 15px;
  line-height: 1.7;
}

:deep(.ql-container) {
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
}

:deep(.ql-toolbar) {
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  border-bottom: 1px solid #e5e7eb;
}
</style>
