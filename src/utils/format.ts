/**
 * 
 * 格式化时间戳为相对时间（如：刚刚、5 分钟前、3 小时前、2024-01-01）
 */
export function formatRelativeTime(ts: number): string {
  const d = new Date(ts)
  const now = Date.now()
  const diff = now - ts

  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)} 天前`
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/**
 * 格式化时间戳为完整日期字符串（如：2024-01-01）
 */
export function formatDate(ts: number): string {
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
