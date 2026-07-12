import type { Difficulty } from '@/types'

/** 难度显示名称 */
export const difficultyLabels: Record<Difficulty, string> = {
  easy: '简单',
  medium: '中等',
  hard: '困难',
}

/** 难度对应的文字颜色类名（Tailwind） */
export const difficultyTextColors: Record<Difficulty, string> = {
  easy: 'text-green-600',
  medium: 'text-yellow-600',
  hard: 'text-red-600',
}

/** 难度对应的背景颜色类名（Tailwind） */
export const difficultyBgColors: Record<Difficulty, string> = {
  easy: 'bg-green-500',
  medium: 'bg-yellow-500',
  hard: 'bg-red-500',
}

/** 难度对应的 badge 样式类名（浅色背景文字） */
export const difficultyBadgeColors: Record<Difficulty, string> = {
  easy: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  hard: 'bg-red-100 text-red-700',
}

/** 难度排序权重 */
export const difficultyOrder: Record<Difficulty, number> = {
  easy: 1,
  medium: 2,
  hard: 3,
}
