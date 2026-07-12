import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { Note } from '@/types'
import { notesApi } from '@/api'
import { idGen } from '@/utils'

export const useNoteStore = defineStore('notes', () => {
  // ===== 状态 =====
  const notes = ref<Note[]>([])
  const loading = ref(false)
  const searchText = ref('')
  const selectedTag = ref<string | null>(null)
  const selectedStatus = ref<'draft' | 'published' | null>(null)

  // ===== 计算属性 =====
  /** 所有标签及使用次数 */
  const allTags = computed(() => {
    const tagCount: Record<string, number> = {}
    for (const note of notes.value) {
      for (const tag of note.tags) {
        tagCount[tag] = (tagCount[tag] || 0) + 1
      }
    }
    return tagCount
  })

  /** 按更新时间排序的笔记列表（最新在上） */
  const sortedNotes = computed(() => {
    return [...notes.value].sort((a, b) => b.updatedAt - a.updatedAt)
  })
  /** 过滤后的笔记列表 */
  const filteredNotes = computed(() => {
    let list = sortedNotes.value

    // 搜索标题或内容
    if (searchText.value) {
      const text = searchText.value.toLowerCase()
      list = list.filter(
        (n) =>
          n.title.toLowerCase().includes(text) ||
          n.content.toLowerCase().includes(text),
      )
    }

    // 按标签筛选
    if (selectedTag.value) {
      list = list.filter((n) => n.tags.includes(selectedTag.value!))
    }

    // 按状态筛选
    if (selectedStatus.value) {
      list = list.filter((n) => n.status === selectedStatus.value)
    }

    return list
  })

  /** 笔记总数 */
  const totalCount = computed(() => notes.value.length)

  // ===== 数据加载 =====
  /** 从后端加载笔记列表 */
  async function fetchAll() {
    loading.value = true
    const [data, error] = await notesApi.getNotes()
    if (!error && data) {
      notes.value = data
    }
    loading.value = false
  }

  // ===== 方法 =====
  /** 获取单篇笔记 */
  function getNoteById(id: string): Note | undefined {
    return notes.value.find((n) => n.id === id)
  }

  /** 新建笔记 */
  async function createNote(note: {
    title: string
    content: string
    cover?: string
    tags: string[]
    status: 'draft' | 'published'
    relatedQuestionId?: string
  }): Promise<Note | null> {
    const newNote: Note = {
      id: idGen.generate('note'),
      title: note.title,
      content: note.content,
      cover: note.cover,
      tags: note.tags,
      status: note.status,
      relatedQuestionId: note.relatedQuestionId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    const [, error] = await notesApi.createNote({
      id: newNote.id,
      title: newNote.title,
      content: newNote.content,
      cover: newNote.cover,
      tags: newNote.tags,
      status: newNote.status,
      relatedQuestionId: newNote.relatedQuestionId,
    })

    if (error) return null

    notes.value.push(newNote)
    return newNote
  }

  /** 更新笔记 */
  async function updateNote(
    id: string,
    data: {
      title?: string
      content?: string
      cover?: string | null
      tags?: string[]
      status?: 'draft' | 'published'
      relatedQuestionId?: string | null
    },
  ) {
    const index = notes.value.findIndex((n) => n.id === id)
    if (index === -1) return

    const existing = notes.value[index]!
    notes.value[index] = {
      id: existing.id,
      title: data.title ?? existing.title,
      content: data.content ?? existing.content,
      cover: data.cover !== undefined ? (data.cover || undefined) : existing.cover,
      tags: data.tags ?? existing.tags,
      status: data.status ?? existing.status,
      relatedQuestionId: data.relatedQuestionId !== undefined ? (data.relatedQuestionId || undefined) : existing.relatedQuestionId,
      createdAt: existing.createdAt,
      updatedAt: Date.now(),
    }

    // 同步后端
    await notesApi.updateNote(id, data)
  }

  /** 删除笔记 */
  async function deleteNote(id: string) {
    notes.value = notes.value.filter((n) => n.id !== id)
    await notesApi.deleteNote(id)
  }

  /** 设置搜索文本 */
  function setSearchText(text: string) {
    searchText.value = text
  }

  /** 设置标签筛选 */
  function setSelectedTag(tag: string | null) {
    selectedTag.value = tag
  }

  /** 设置状态筛选 */
  function setSelectedStatus(status: 'draft' | 'published' | null) {
    selectedStatus.value = status
  }

  return {
    // 状态
    notes,
    loading,
    searchText,
    selectedTag,
    selectedStatus,
    // 计算
    allTags,
    sortedNotes,
    filteredNotes,
    totalCount,
    // 方法
    fetchAll,
    getNoteById,
    createNote,
    updateNote,
    deleteNote,
    setSearchText,
    setSelectedTag,
    setSelectedStatus,
  }
})

