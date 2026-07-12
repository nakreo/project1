/** 学习笔记 */
export interface Note {
  id: string
  title: string
  content: string       // HTML 格式（来自富文本编辑器）
  cover?: string         // 封面图片（base64）
  tags: string[]
  status: 'draft' | 'published'  // 笔记状态
  relatedQuestionId?: string  // 关联的面试题
  createdAt: number
  updatedAt: number
}
