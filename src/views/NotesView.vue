<script setup lang="ts">
import { ref, computed } from 'vue'
import { useNoteStore } from '@/stores/notes'
import { useQuestionStore } from '@/stores/questions'
import { useSocialStore } from '@/stores/social'
import NoteCard from '@/components/NoteCard.vue'
import NoteEditorDrawer from '@/components/NoteEditorDrawer.vue'
import NotePreview from '@/components/NotePreview.vue'
import type { Note } from '@/types'
import EmptyState from '@/components/EmptyState.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { EditPen, Search } from '@element-plus/icons-vue'

const noteStore = useNoteStore()
const questionStore = useQuestionStore()
const socialStore = useSocialStore()

// ===== 状态 =====
const editorVisible = ref(false)
const previewVisible = ref(false)
const editingNoteId = ref<string | null>(null)
const previewNote = ref<Note | null>(null)

// ===== 计算属性 =====
const notesWithRelatedTitle = computed(() => {
  return noteStore.filteredNotes.map((note) => ({
    ...note,
    relatedTitle: note.relatedQuestionId
      ? questionStore.getQuestionById(note.relatedQuestionId)?.title
      : undefined,
  }))
})

const editingNote = computed(() => {
  if (!editingNoteId.value) return null
  return noteStore.getNoteById(editingNoteId.value) ?? null
})

// ===== 方法 =====
/** 打开新建笔记抽屉 */
function openCreate() {
  editingNoteId.value = null
  editorVisible.value = true
}

/** 打开编辑笔记抽屉 */
function openEdit(id: string) {
  editingNoteId.value = id
  editorVisible.value = true
}

/** 打开笔记预览弹窗 */
function openPreview(note: Note) {
  previewNote.value = note
  previewVisible.value = true
}

/** 从预览切换到编辑模式 */
function previewToEdit() {
  if (previewNote.value) {
    previewVisible.value = false
    openEdit(previewNote.value.id)
  }
}

/** 处理抽屉中「保存草稿」的 emit，创建或更新笔记 */
async function handleSave(data: {
  title: string
  content: string
  cover?: string
  tags: string[]
  status: 'draft' | 'published'
  relatedQuestionId?: string
}) {
  if (editingNoteId.value) {
    await noteStore.updateNote(editingNoteId.value, {
      title: data.title,
      content: data.content,
      cover: data.cover,
      tags: data.tags,
      status: data.status,
      relatedQuestionId: data.relatedQuestionId,
    })
  } else {
    await noteStore.createNote(data)
  }
  editorVisible.value = false
  editingNoteId.value = null
  ElMessage.success(data.status === 'draft' ? '草稿已保存' : '笔记已创建')
}

/** 处理抽屉中「发布」的 emit，创建笔记并同步发布到讨论区 */
async function handlePublishFromDrawer(data: {
  title: string
  content: string
  cover?: string
  tags: string[]
  status: 'published'
  relatedQuestionId?: string
}) {
  let noteId: string
  if (editingNoteId.value) {
    await noteStore.updateNote(editingNoteId.value, {
      title: data.title,
      content: data.content,
      cover: data.cover,
      tags: data.tags,
      status: 'published',
      relatedQuestionId: data.relatedQuestionId,
    })
    noteId = editingNoteId.value
  } else {
    const note = await noteStore.createNote(data)
    if (!note) {
      ElMessage.error('创建笔记失败')
      return
    }
    noteId = note.id
  }

  const result = await socialStore.publishNote(noteId)
  if (result) {
    ElMessage.success('笔记已发布到讨论区！')
  } else {
    ElMessage.warning('发布到讨论区失败')
  }

  editorVisible.value = false
  editingNoteId.value = null
}

/** 删除笔记（包含确认弹窗，同步移除已发布的讨论区文章） */
async function handleDelete(id: string) {
  try {
    await ElMessageBox.confirm('确定要删除这篇笔记吗？', '确认删除', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      buttonSize: 'small',
    })

    await noteStore.deleteNote(id)
    const publicNote = socialStore.getMyPublishedNotes().find((pn) => pn.noteId === id)
    if (publicNote) {
      await socialStore.unpublishNote(publicNote.id)
    }
    ElMessage.success('笔记已删除')
  } catch { /* 用户取消 */ }
}

/** 从笔记卡片上直接发布已有笔记到讨论区 */
async function handlePublish(noteId: string) {
  const result = await socialStore.publishNote(noteId)
  if (result) {
    await noteStore.updateNote(noteId, { status: 'published' })
    ElMessage.success('笔记已发布到讨论区！')
  } else {
    ElMessage.warning('该笔记已发布或发布失败')
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- 页面标题 + 新建按钮 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="flex items-center gap-2 text-2xl font-bold text-gray-900">
          <el-icon :size="24">
            <EditPen />
          </el-icon>
          学习笔记
        </h1>
        <p class="mt-1 text-sm text-gray-500">
          共 {{ noteStore.totalCount }} 篇笔记
        </p>
      </div>
      <ElButton type="primary" @click="openCreate">
        + 新建笔记
      </ElButton>
    </div>

    <!-- 搜索和标签筛选栏 -->
    <div class="flex flex-wrap items-center gap-4">
      <ElInput
        v-model="noteStore.searchText"
        placeholder="搜索笔记标题或内容..."
        clearable
        class="w-72"
      >
        <template #prefix>
          <el-icon class="text-gray-400">
            <Search />
          </el-icon>
        </template>
      </ElInput>

      <div class="flex flex-wrap items-center gap-2">
        <ElTag
          :type="noteStore.selectedTag === null ? 'primary' : 'info'"
          effect="plain"
          class="cursor-pointer"
          @click="noteStore.setSelectedTag(null)"
        >
          全部
        </ElTag>
        <ElTag
          v-for="(count, tag) in noteStore.allTags"
          :key="tag"
          :type="noteStore.selectedTag === tag ? 'primary' : 'info'"
          effect="plain"
          class="cursor-pointer"
          @click="noteStore.setSelectedTag(tag)"
        >
          {{ tag }} ({{ count }})
        </ElTag>
      </div>

      <!-- 状态筛选 -->
      <div class="flex items-center gap-2">
        <ElTag
          :type="noteStore.selectedStatus === null ? 'primary' : 'info'"
          effect="plain"
          class="cursor-pointer"
          @click="noteStore.setSelectedStatus(null)"
        >
          全部
        </ElTag>
        <ElTag
          :type="noteStore.selectedStatus === 'draft' ? 'primary' : 'info'"
          effect="plain"
          class="cursor-pointer"
          @click="noteStore.setSelectedStatus('draft')"
        >
          草稿
        </ElTag>
        <ElTag
          :type="noteStore.selectedStatus === 'published' ? 'primary' : 'info'"
          effect="plain"
          class="cursor-pointer"
          @click="noteStore.setSelectedStatus('published')"
        >
          已发布
        </ElTag>
      </div>
    </div>

    <!-- 笔记列表 -->
    <div v-if="notesWithRelatedTitle.length > 0" class="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
      <NoteCard
        v-for="note in notesWithRelatedTitle"
        :key="note.id"
        :note="note"
        :is-published="socialStore.isNotePublished(note.id)"
        @preview="openPreview(note)"
        @edit="openEdit(note.id)"
        @delete="handleDelete(note.id)"
        @publish="handlePublish(note.id)"
      />
    </div>

    <!-- 空状态 -->
    <EmptyState
      v-else
      :icon="noteStore.searchText || noteStore.selectedTag || noteStore.selectedStatus ? Search : EditPen"
      :title="noteStore.searchText || noteStore.selectedTag || noteStore.selectedStatus ? '没有找到匹配的笔记' : '还没有笔记'"
      :description="noteStore.searchText || noteStore.selectedTag || noteStore.selectedStatus
        ? '试试其他关键词或清空筛选条件'
        : '点击上方「新建笔记」开始记录你的学习心得'"
      :action-text="noteStore.searchText || noteStore.selectedTag || noteStore.selectedStatus ? '' : '新建笔记'"
      :has-filter="!!(noteStore.searchText || noteStore.selectedTag || noteStore.selectedStatus)"
      @clear-filter="noteStore.setSearchText(''); noteStore.setSelectedTag(null); noteStore.setSelectedStatus(null)"
      @action="openCreate"
    />

    <!-- 新建/编辑抽屉 -->
    <NoteEditorDrawer
      v-model="editorVisible"
      :title="editingNote?.title ?? ''"
      :content="editingNote?.content ?? ''"
      :cover="editingNote?.cover ?? ''"
      :tags="editingNote?.tags ?? []"
      :status="editingNote?.status ?? 'draft'"
      :related-question-id="editingNote?.relatedQuestionId ?? ''"
      :questions="questionStore.questions"
      @save="handleSave"
      @publish="handlePublishFromDrawer"
    />

    <!-- 预览弹窗 -->
    <NotePreview
      v-model="previewVisible"
      :note="previewNote ? {
        ...previewNote,
        relatedTitle: previewNote.relatedQuestionId
          ? questionStore.getQuestionById(previewNote.relatedQuestionId)?.title
          : undefined,
      } : null"
      @edit="previewToEdit"
    />
  </div>
</template>
