import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { Question, QuestionCategory, Difficulty, QuestionProgress, QuestionFilter } from '@/types'
import { questionsApi } from '@/api'
import { calcStreakDays, extractStudyDates } from '@/utils'

export const useQuestionStore = defineStore('questions', () => {
  // ===== 状态 =====
  const questions = ref<Question[]>([])
  const progress = ref<Record<string, QuestionProgress>>({})
  const loading = ref(false)
  const filter = ref<QuestionFilter>({
    category: 'all',
    difficulty: 'all',
    searchText: '',
    onlyFavorites: false,
    onlyIncorrect: false,
  })

  // ===== 计算属性 =====
  /** 过滤后的题目列表 */
  const filteredQuestions = computed(() => {
    return questions.value.filter((q) => {
      // 分类筛选
      if (filter.value.category !== 'all' && q.category !== filter.value.category) {
        return false
      }
      // 难度筛选
      if (filter.value.difficulty !== 'all' && q.difficulty !== filter.value.difficulty) {
        return false
      }
      // 搜索
      if (filter.value.searchText) {
        const text = filter.value.searchText.toLowerCase()
        if (
          !q.title.toLowerCase().includes(text) &&
          !q.description.toLowerCase().includes(text)
        ) {
          return false
        }
      }
      // 仅收藏
      if (filter.value.onlyFavorites) {
        const p = progress.value[q.id]
        if (!p || !p.isStarred) return false
      }
      // 仅错题
      if (filter.value.onlyIncorrect) {
        const p = progress.value[q.id]
        if (!p || !p.isIncorrect) return false
      }
      return true
    })
  })

  /** 各分类的题目数量 */
  const categoryCount = computed(() => {
    const counts: Record<string, number> = {}
    for (const q of questions.value) {
      counts[q.category] = (counts[q.category] || 0) + 1
    }
    return counts
  })

  /** 今日学习统计 */
  const todayStats = computed(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayMs = today.getTime()

    let reviewed = 0
    let mastered = 0

    for (const p of Object.values(progress.value)) {
      if (p.lastReviewedAt && p.lastReviewedAt >= todayMs) {
        reviewed++
      }
      if (p.isMastered) {
        mastered++
      }
    }

    return {
      reviewed,
      mastered,
      total: questions.value.length,
      totalMastered: mastered,
    }
  })

  /** 各分类掌握统计 */
  const categoryStats = computed(() => {
    const stats: Record<string, { total: number; mastered: number }> = {}
    for (const q of questions.value) {
      const cat = q.category
      if (!stats[cat]) {
        stats[cat] = { total: 0, mastered: 0 }
      }
      stats[cat]!.total++
      const p = progress.value[q.id]
      if (p?.isMastered) {
        stats[cat]!.mastered++
      }
    }
    return stats
  })

  /** 各难度掌握统计 */
  const difficultyStats = computed(() => {
    const stats: Record<string, { total: number; mastered: number }> = {
      easy: { total: 0, mastered: 0 },
      medium: { total: 0, mastered: 0 },
      hard: { total: 0, mastered: 0 },
    }
    for (const q of questions.value) {
      const diff = q.difficulty
      stats[diff]!.total++
      const p = progress.value[q.id]
      if (p?.isMastered) {
        stats[diff]!.mastered++
      }
    }
    return stats
  })

  /** 复习次数最多的题目（前 5） */
  const topReviewed = computed(() => {
    return [...questions.value]
      .map((q) => ({
        ...q,
        progress: getProgress(q.id),
      }))
      .filter((q) => q.progress.reviewCount > 0)
      .sort((a, b) => b.progress.reviewCount - a.progress.reviewCount)
      .slice(0, 5)
  })

  /** 连续学习天数 */
  const streakDays = computed(() => {
    return calcStreakDays(extractStudyDates(progress.value))
  })

  // ===== 数据加载 =====
  /** 从后端加载题目和进度 */
  async function fetchAll() {
    loading.value = true
    const [questionsData, qError] = await questionsApi.getQuestions()
    if (!qError && questionsData) {
      questions.value = questionsData
    }
    const [progressData, pError] = await questionsApi.getProgress()
    if (!pError && progressData) {
      progress.value = progressData
    }
    loading.value = false
  }

  // ===== 方法 =====
  /** 获取某题的进度 */
  function getProgress(questionId: string): QuestionProgress {
    return progress.value[questionId] || {
      questionId,
      isStarred: false,
      isMastered: false,
      isIncorrect: false,
      reviewCount: 0,
      lastReviewedAt: null,
    }
  }

  /** 切换收藏 */
  async function toggleStar(questionId: string) {
    const p = getProgress(questionId)
    const newStarred = !p.isStarred
    // 乐观更新
    progress.value[questionId] = { ...p, isStarred: newStarred }
    // 同步后端
    await questionsApi.updateProgress(questionId, { isStarred: newStarred })
  }

  /** 标记已掌握 */
  async function toggleMastered(questionId: string) {
    const p = getProgress(questionId)
    const newMastered = !p.isMastered
    // 乐观更新
    progress.value[questionId] = {
      ...p,
      isMastered: newMastered,
      isIncorrect: newMastered ? false : p.isIncorrect, // 标记掌握时清除错题标记
      lastReviewedAt: Date.now(),
    }
    // 同步后端
    await questionsApi.updateProgress(questionId, {
      isMastered: newMastered,
      isIncorrect: newMastered ? false : undefined,
    })
  }

  /** 记录复习 */
  async function recordReview(questionId: string) {
    const p = getProgress(questionId)
    // 乐观更新
    progress.value[questionId] = {
      ...p,
      reviewCount: p.reviewCount + 1,
      lastReviewedAt: Date.now(),
    }
    // 同步后端
    await questionsApi.recordReview(questionId)
  }

  /** 更新筛选条件 */
  function setFilter(partial: Partial<QuestionFilter>) {
    filter.value = { ...filter.value, ...partial }
  }

  /** 标记为错题 */
  async function markIncorrect(questionId: string) {
    const p = getProgress(questionId)
    // 乐观更新
    progress.value[questionId] = {
      ...p,
      isIncorrect: true,
      isMastered: false,
      lastReviewedAt: Date.now(),
    }
    // 同步后端
    await questionsApi.updateProgress(questionId, { isIncorrect: true, isMastered: false })
  }

  /** 标记为已纠正（移出错题本） */
  async function markCorrected(questionId: string) {
    const p = getProgress(questionId)
    // 乐观更新
    progress.value[questionId] = { ...p, isIncorrect: false }
    // 同步后端
    await questionsApi.updateProgress(questionId, { isIncorrect: false })
  }

  /** 根据 ID 获取题目 */
  function getQuestionById(id: string): Question | undefined {
    return questions.value.find((q) => q.id === id)
  }

  /** 随机抽取一道题目（可选排除已掌握的题目） */
  function getRandomQuestion(excludeMastered = false): Question {
    let pool = questions.value
    if (excludeMastered) {
      pool = pool.filter((q) => !getProgress(q.id).isMastered)
      if (pool.length === 0) pool = questions.value
    }
    const index = Math.floor(Math.random() * pool.length)
    return pool[index]!
  }

  /** 从错题中随机抽取一道 */
  function getRandomIncorrect(): Question | undefined {
    const pool = questions.value.filter((q) => getProgress(q.id).isIncorrect)
    if (pool.length === 0) return undefined
    return pool[Math.floor(Math.random() * pool.length)]
  }

  /** 错题数量 */
  const incorrectCount = computed(() => {
    return questions.value.filter((q) => getProgress(q.id).isIncorrect).length
  })

  return {
    // 状态
    questions,
    progress,
    loading,
    filter,
    // 计算
    filteredQuestions,
    categoryCount,
    todayStats,
    categoryStats,
    difficultyStats,
    topReviewed,
    streakDays,
    incorrectCount,
    // 方法
    fetchAll,
    getProgress,
    toggleStar,
    toggleMastered,
    recordReview,
    setFilter,
    getQuestionById,
    getRandomQuestion,
    getRandomIncorrect,
    markIncorrect,
    markCorrected,
  }
})
