/**
 * 计算掌握百分比
 */
export function calcPercent(mastered: number, total: number): number {
  if (total === 0) return 0
  return Math.round((mastered / total) * 100)
}

/**
 * 计算连续学习天数
 * @param dates 所有有学习记录的日期字符串集合 (格式: "YYYY-M-D")
 */
export function calcStreakDays(dates: Set<string>): number {
  let streak = 0
  const today = new Date()
  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
    if (dates.has(key)) {
      streak++
    } else if (i > 0) {
      break
    }
  }
  return streak
}

/**
 * 计算总学习天数
 */
export function calcTotalStudyDays(dates: Set<string>): number {
  return dates.size
}

/**
 * 从复习记录中提取所有学习日期
 * @param progressMap 进度记录，key 为题目 ID，value 包含 lastReviewedAt
 */
export function extractStudyDates(
  progressMap: Record<string, { lastReviewedAt: number | null }>,
): Set<string> {
  const dates = new Set<string>()
  for (const p of Object.values(progressMap)) {
    if (p.lastReviewedAt) {
      const d = new Date(p.lastReviewedAt)
      dates.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`)
    }
  }
  return dates
}
