<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSocialStore } from '@/stores/social'
import { useNoteStore } from '@/stores/notes'
import type { NoteSortOption } from '@/types'
import { formatRelativeTime } from '@/utils'
import { ElMessage } from 'element-plus'
import {
  ChatDotSquare,
  Search,
  EditPen,
} from '@element-plus/icons-vue'
import DiscussionCard from '@/components/DiscussionCard.vue'
import DiscussionDetailDialog from '@/components/DiscussionDetailDialog.vue'
import EmptyState from '@/components/EmptyState.vue'
import PageHeader from '@/components/PageHeader.vue'

const socialStore = useSocialStore()
const noteStore = useNoteStore()

// ===== 状态 =====
const publishDialogVisible = ref(false)
const selectedNoteId = ref<string | null>(null)
const detailDialogVisible = ref(false)
const detailNoteId = ref<string | null>(null)

// ===== 计算属性 =====
const notesForPublish = computed(() => {
  return noteStore.sortedNotes.filter(
    (n) => !socialStore.isNotePublished(n.id),
  )
})

// ===== 方法 =====

/** 发布笔记到讨论区 */
async function handlePublish() {
  if (!selectedNoteId.value) return

  const result = await socialStore.publishNote(selectedNoteId.value)
  if (result) {
    ElMessage.success('笔记已发布到讨论区')
    selectedNoteId.value = null
    publishDialogVisible.value = false
  } else {
    ElMessage.error('发布失败')
  }
}

/** 打开详情弹窗 */
function handleViewNote(noteId: string) {
  detailNoteId.value = noteId
  detailDialogVisible.value = true
}

/** 卡片被删除后同步刷新 */
function handleNoteDeleted() {
  detailNoteId.value = null
}
</script>

<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <PageHeader
      :icon="ChatDotSquare"
      title="公开讨论区"
      :subtitle="`共 ${socialStore.totalCount} 篇讨论`"
      :show-action="true"
      action-text="发布笔记"
      @action="publishDialogVisible = true"
    />

    <!-- 筛选栏 -->
    <div class="flex flex-wrap items-center gap-4">
      <ElInput
        v-model="socialStore.searchText"
        placeholder="搜索讨论内容..."
        clearable
        class="w-72"
      >
        <template #prefix>
          <el-icon class="text-gray-400">
            <Search />
          </el-icon>
        </template>
      </ElInput>

      <ElSelect
        :model-value="socialStore.sortBy"
        class="w-40"
        @update:model-value="(v: NoteSortOption) => socialStore.setSortBy(v)"
      >
        <ElOption label="最新发布" value="latest" />
        <ElOption label="最多点赞" value="popular" />
        <ElOption label="最多评论" value="mostComments" />
      </ElSelect>

      <div class="flex flex-wrap items-center gap-2">
        <ElTag
          :type="socialStore.selectedTag === null ? 'primary' : 'info'"
          effect="plain"
          class="cursor-pointer"
          @click="socialStore.setSelectedTag(null)"
        >
          全部
        </ElTag>
        <ElTag
          v-for="(count, tag) in socialStore.allTags"
          :key="tag"
          :type="socialStore.selectedTag === tag ? 'primary' : 'info'"
          effect="plain"
          class="cursor-pointer"
          @click="socialStore.setSelectedTag(tag)"
        >
          {{ tag }} ({{ count }})
        </ElTag>
      </div>
    </div>

    <!-- 讨论列表（一行两列网格） -->
    <div v-if="socialStore.filteredNotes.length > 0">
      <ElRow :gutter="20">
        <ElCol
          v-for="note in socialStore.filteredNotes"
          :key="note.id"
          :xs="24"
          :sm="12"
          :lg="12"
          class="mb-5"
        >
          <DiscussionCard
            :note="note"
            @view="handleViewNote"
          />
        </ElCol>
      </ElRow>
    </div>

    <!-- 空状态 -->
    <EmptyState
      v-else
      :icon="ChatDotSquare"
      :title="socialStore.searchText || socialStore.selectedTag ? '没有找到匹配的讨论' : '还没有讨论'"
      :description="socialStore.searchText || socialStore.selectedTag
        ? '试试其他关键词或清空筛选条件'
        : '发布你的第一篇学习笔记，和大家一起交流吧！'"
      :action-text="socialStore.searchText || socialStore.selectedTag ? '' : '发布笔记'"
      :has-filter="!!(socialStore.searchText || socialStore.selectedTag)"
      @clear-filter="socialStore.setSearchText(''); socialStore.setSelectedTag(null)"
      @action="publishDialogVisible = true"
    />

    <!-- 笔记详情弹窗 -->
    <DiscussionDetailDialog
      v-model="detailDialogVisible"
      :note-id="detailNoteId"
      @note-deleted="handleNoteDeleted"
    />

    <!-- 发布笔记弹窗 -->
    <ElDialog
      v-model="publishDialogVisible"
      title="发布笔记到讨论区"
      width="520px"
    >
      <div class="space-y-4">
        <p class="text-sm text-gray-500">
          选择一篇未发布的笔记发布到公开讨论区，让大家一起学习交流。
        </p>

        <div v-if="notesForPublish.length > 0" class="space-y-2">
          <div
            v-for="note in notesForPublish"
            :key="note.id"
            class="cursor-pointer rounded-lg border p-3 transition hover:border-blue-300"
            :class="selectedNoteId === note.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'"
            @click="selectedNoteId = note.id"
          >
            <p class="font-medium text-gray-900">{{ note.title }}</p>
            <p class="mt-1 text-xs text-gray-400">
              {{ note.tags.length > 0 ? note.tags.join(', ') : '无标签' }}
              · {{ formatRelativeTime(note.updatedAt) }}
            </p>
          </div>
        </div>

        <EmptyState
          v-else
          title="没有可发布的笔记"
          description="你所有的笔记都已经发布了，先去写一篇新笔记吧！"
          :icon="EditPen"
        />
      </div>

      <template #footer>
        <ElButton @click="publishDialogVisible = false">取消</ElButton>
        <ElButton
          type="primary"
          :disabled="!selectedNoteId"
          @click="handlePublish"
        >
          发布
        </ElButton>
      </template>
    </ElDialog>
  </div>
</template>