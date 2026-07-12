/**
 * 安全的 localStorage 工具函数
 * 自动处理 JSON 序列化/反序列化和错误
 */

export function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key)
    return saved ? (JSON.parse(saved) as T) : fallback
  } catch {
    return fallback
  }
}

export function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (err) {
    console.error(`保存到 localStorage 失败 (key: ${key}):`, err)
  }
}

export function removeFromStorage(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch (err) {
    console.error(`从 localStorage 移除失败 (key: ${key}):`, err)
  }
}
