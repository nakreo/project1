import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { PublicNote, Comment, NoteSortOption } from '@/types'
import { socialApi } from '@/api'
import { useAuthStore } from './auth'
import { useNoteStore } from './notes'

export const useSocialStore = defineStore('social', () => {
  // ===== 状态 =====
  const publicNotes = ref<PublicNote[]>([])
  const commentsMap = ref<Record<string, Comment[]>>({})  // key: publicNoteId
  const likeStatus = ref<Set<string>>(new Set())           // "type:id"
  const likeCounts = ref<Record<string, number>>({})       // "note:id" | "comment:id"
  const loading = ref(false)
  const searchText = ref('')
  const sortBy = ref<NoteSortOption>('latest')
  const selectedTag = ref<string | null>(null)

  // ===== 计算属性 =====
  /** 所有标签及使用次数（从公开笔记中） */
  const allTags = computed(() => {
    const tagCount: Record<string, number> = {}
    for (const note of publicNotes.value) {
      for (const tag of note.tags) {
        tagCount[tag] = (tagCount[tag] || 0) + 1
      }
    }
    return tagCount
  })

  /** 笔记的评论数统计 */
  const commentCountMap = computed(() => {
    const map: Record<string, number> = {}
    for (const [noteId, comments] of Object.entries(commentsMap.value)) {
      map[noteId] = comments.length
    }
    return map
  })

  /** 笔记的点赞数（兼容旧版引用） */
  const likeCountMap = computed(() => {
    const map: Record<string, number> = {}
    for (const [key, count] of Object.entries(likeCounts.value)) {
      if (key.startsWith('note:')) {
        map[key.slice(5)] = count
      }
    }
    return map
  })

  /** 当前用户是否点赞了某个目标 */
  const userLikes = computed(() => likeStatus.value)

  /** 过滤 + 排序后的公开笔记列表 */
  const filteredNotes = computed(() => {
    let list = [...publicNotes.value]

    // 搜索
    if (searchText.value) {
      const text = searchText.value.toLowerCase()
      list = list.filter(
        (n) =>
          n.title.toLowerCase().includes(text) ||
          n.content.toLowerCase().includes(text),
      )
    }

    // 标签筛选
    if (selectedTag.value) {
      list = list.filter((n) => n.tags.includes(selectedTag.value!))
    }

    // 排序
    switch (sortBy.value) {
      case 'latest':
        list.sort((a, b) => b.createdAt - a.createdAt)
        break
      case 'popular':
        list.sort((a, b) => {
          const aLikes = (a as any).likeCount || 0
          const bLikes = (b as any).likeCount || 0
          return bLikes - aLikes
        })
        break
      case 'mostComments':
        list.sort((a, b) => {
          const aCmt = commentCountMap.value[a.id] || 0
          const bCmt = commentCountMap.value[b.id] || 0
          return bCmt - aCmt
        })
        break
    }

    return list
  })

  /** 公开笔记总数 */
  const totalCount = computed(() => publicNotes.value.length)

  // ===== 数据加载 =====
  /** 加载讨论区列表 */
  async function fetchPublicNotes() {
    loading.value = true
    const params: any = { sortBy: sortBy.value }
    if (searchText.value) params.searchText = searchText.value
    if (selectedTag.value) params.tag = selectedTag.value

    const [data, error] = await socialApi.getPublicNotes(params)
    if (!error && data) {
      publicNotes.value = data

      // 批量构建点赞状态
      const targets: Array<{ targetId: string; targetType: string }> = []
      for (const note of data) {
        targets.push({ targetId: note.id, targetType: 'note' })
      }
      if (targets.length > 0) {
        await fetchLikeStatus(targets)
      }
    }
    loading.value = false
  }

  /** 加载单篇笔记的评论 */
  async function fetchComments(publicNoteId: string) {
    const [data, error] = await socialApi.getComments(publicNoteId)
    if (!error && data) {
      commentsMap.value[publicNoteId] = data
    }
  }

  /** 批量查询点赞状态 */
  async function fetchLikeStatus(targets: Array<{ targetId: string; targetType: string }>) {
    const [data, error] = await socialApi.getLikeStatus(targets)
    if (!error && data) {
      likeStatus.value = new Set(data.likedSet)
    }
  }

  // ===== 方法 =====

  /** 将学习笔记发布到公开讨论区 */
  async function publishNote(noteId: string): Promise<PublicNote | null> {
    const noteStore = useNoteStore()
    const note = noteStore.getNoteById(noteId)
    if (!note) return null

    // 检查是否已发布
    const [checkData] = await socialApi.checkPublished(noteId)
    if (checkData?.published) {
      // 已发布，找到已有的返回
      const existing = publicNotes.value.find((pn) => pn.noteId === noteId)
      return existing || null
    }

    const [data, error] = await socialApi.publishNote(noteId)
    if (error || !data) return null

    publicNotes.value.unshift(data)
    return data
  }

  /** 删除公开笔记 */
  async function unpublishNote(publicNoteId: string): Promise<boolean> {
    const [, error] = await socialApi.unpublishNote(publicNoteId)
    if (error) return false

    publicNotes.value = publicNotes.value.filter((pn) => pn.id !== publicNoteId)
    delete commentsMap.value[publicNoteId]
    return true
  }

  /** 重新发布（更新公开笔记内容） */
  async function updatePublicNote(publicNoteId: string): Promise<boolean> {
    const [, error] = await socialApi.rePublishNote(publicNoteId)
    if (error) return false

    // 重新加载列表以获取更新后的数据
    await fetchPublicNotes()
    return true
  }

  /** 获取单篇公开笔记 */
  function getPublicNoteById(id: string): PublicNote | undefined {
    return publicNotes.value.find((pn) => pn.id === id)
  }

  /** 检查笔记是否已发布 */
  function isNotePublished(noteId: string): boolean {
    return publicNotes.value.some((pn) => pn.noteId === noteId)
  }

  /** 获取我的公开笔记 */
  function getMyPublishedNotes(): PublicNote[] {
    const auth = useAuthStore()
    return publicNotes.value.filter((pn) => pn.userId === auth.username)
  }

  // ===== 评论 =====

  /** 获取笔记的评论列表 */
  function getComments(publicNoteId: string): Comment[] {
    return commentsMap.value[publicNoteId] || []
  }

  /** 添加评论 */
  async function addComment(publicNoteId: string, content: string): Promise<Comment | null> {
    if (!content.trim()) return null

    const [data, error] = await socialApi.addComment(publicNoteId, content)
    if (error || !data) return null

    if (!commentsMap.value[publicNoteId]) {
      commentsMap.value[publicNoteId] = []
    }
    commentsMap.value[publicNoteId].push(data)
    return data
  }

  /** 删除评论 */
  async function deleteComment(commentId: string): Promise<boolean> {
    const [, error] = await socialApi.deleteComment(commentId)
    if (error) return false

    // 从所有笔记的评论列表中移除
    for (const noteId of Object.keys(commentsMap.value)) {
      const list = commentsMap.value[noteId]
      if (list) {
        commentsMap.value[noteId] = list.filter((c) => c.id !== commentId)
      }
    }
    return true
  }

  // ===== 点赞 =====

  /** 切换点赞状态 */
  async function toggleLike(targetId: string, targetType: 'note' | 'comment'): Promise<boolean> {
    const key = `${targetType}:${targetId}`

    // 乐观更新
    const wasLiked = likeStatus.value.has(key)
    if (wasLiked) {
      likeStatus.value.delete(key)
    } else {
      likeStatus.value = new Set(likeStatus.value).add(key)
    }

    // 同步后端
    const [data, error] = await socialApi.toggleLike(targetId, targetType)
    if (error) {
      // 回滚
      if (wasLiked) {
        likeStatus.value = new Set([...likeStatus.value].filter((k) => k !== key))
      } else {
        const newSet = new Set(likeStatus.value)
        newSet.delete(key)
        likeStatus.value = newSet
      }
      return false
    }

    // 更新点赞计数
    if (data) {
      likeCounts.value[key] = data.likeCount
    }
    return data?.liked ?? !wasLiked
  }

  /** 获取点赞数 */
  function getLikeCount(targetId: string, targetType: 'note' | 'comment'): number {
    return likeCounts.value[`${targetType}:${targetId}`] || 0
  }

  /** 是否已点赞 */
  function isLiked(targetId: string, targetType: 'note' | 'comment'): boolean {
    return likeStatus.value.has(`${targetType}:${targetId}`)
  }

  // ===== 筛选方法 =====
  function setSearchText(text: string) {
    searchText.value = text
  }

  function setSortBy(sort: NoteSortOption) {
    sortBy.value = sort
  }

  function setSelectedTag(tag: string | null) {
    selectedTag.value = tag
  }

  return {
    // 状态
    publicNotes,
    commentsMap,
    loading,
    searchText,
    sortBy,
    selectedTag,
    // 计算
    allTags,
    commentCountMap,
    likeCountMap,
    userLikes,
    likeCounts,
    filteredNotes,
    totalCount,
    // 数据加载
    fetchPublicNotes,
    fetchComments,
    fetchLikeStatus,
    // 笔记发布
    publishNote,
    unpublishNote,
    updatePublicNote,
    getPublicNoteById,
    isNotePublished,
    getMyPublishedNotes,
    // 评论
    getComments,
    addComment,
    deleteComment,
    // 点赞
    toggleLike,
    getLikeCount,
    isLiked,
    // 筛选
    setSearchText,
    setSortBy,
    setSelectedTag,
  }
})
