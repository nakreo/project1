/**
 * 面试题 + 学习进度 API
 * 题目查询、进度管理、复习记录
 */

import { api } from './http'
import type { Question, QuestionProgress } from '@/types'

export interface QuestionFilterParams {
  category?: string
  difficulty?: string
  searchText?: string
  onlyFavorites?: boolean
  onlyIncorrect?: boolean
}

export interface ProgressUpdate {
  isStarred?: boolean
  isMastered?: boolean
  isIncorrect?: boolean
}

export const questionsApi = {
  /** 获取题目列表（支持筛选） */
  getQuestions: (params?: QuestionFilterParams) => {
    const query = new URLSearchParams()
    if (params) {
      if (params.category && params.category !== 'all') query.set('category', params.category)
      if (params.difficulty && params.difficulty !== 'all') query.set('difficulty', params.difficulty)
      if (params.searchText) query.set('searchText', params.searchText)
      if (params.onlyFavorites) query.set('onlyFavorites', 'true')
      if (params.onlyIncorrect) query.set('onlyIncorrect', 'true')
    }
    const qs = query.toString()
    return api.get<Question[]>(`/questions${qs ? `?${qs}` : ''}`)
  },

  /** 获取单道题目详情 */
  getQuestionById: (id: string) =>
    api.get<Question>(`/questions/${id}`),

  /** 获取用户所有学习进度 */
  getProgress: () =>
    api.get<Record<string, QuestionProgress>>('/progress'),

  /** 获取单题进度 */
  getProgressByQuestionId: (questionId: string) =>
    api.get<QuestionProgress>(`/progress/${questionId}`),

  /** 更新学习进度（收藏/掌握/错题） */
  updateProgress: (questionId: string, data: ProgressUpdate) =>
    api.put<QuestionProgress>(`/progress/${questionId}`, data),

  /** 记录复习 */
  recordReview: (questionId: string) =>
    api.post<null>(`/progress/review/${questionId}`),
}
