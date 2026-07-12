/** 面试题类别 */

export type QuestionCategory = 'html' | 'css' | 'javascript' | 'vue' | 'typescript' | 'algorithm' | 'network' | 'engineering'

/** 难度等级 */
export type Difficulty = 'easy' | 'medium' | 'hard'

/** 单道面试题 */
export interface Question {
  id: string
  category: QuestionCategory
  difficulty: Difficulty
  title: string
  description: string
  answer: string
  tips?: string          // 答题要点提示
  codeExample?: string   // 代码示例
  relatedQuestions?: string[]  // 相关题目 ID
  createdAt: number
}

/** 筛选条件 */
export interface QuestionFilter {
  category: QuestionCategory | 'all'
  difficulty: Difficulty | 'all'
  searchText: string
  onlyFavorites: boolean
  onlyIncorrect: boolean   // 仅错题
}

/** 学习进度 */
export interface QuestionProgress {
  questionId: string
  isStarred: boolean     // 收藏
  isMastered: boolean    // 已掌握
  isIncorrect: boolean   // 答错/需复习
  reviewCount: number    // 复习次数
  lastReviewedAt: number | null
}
