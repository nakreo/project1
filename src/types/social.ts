/** 公开的笔记（发布到讨论区） */
export interface PublicNote {
  id: string
  noteId: string           // 关联的学习笔记 ID
  userId: string           // 发布者用户名
  nickname: string         // 发布者昵称
  avatarUrl?: string       // 发布者头像
  title: string
  content: string          // HTML 内容
  cover?: string           // 封面图片（base64）
  tags: string[]
  relatedQuestionId?: string
  relatedQuestionTitle?: string
  createdAt: number
  updatedAt: number
}

/** 评论 */
export interface Comment {
  id: string
  publicNoteId: string     // 所属公开笔记 ID
  userId: string           // 评论者用户名
  nickname: string         // 评论者昵称
  avatarUrl?: string       // 评论者头像
  content: string
  createdAt: number
}

/** 点赞记录 */
export interface Like {
  id: string
  targetId: string         // 被点赞的对象 ID（笔记或评论）
  targetType: 'note' | 'comment'
  userId: string           // 点赞者用户名
  createdAt: number
}

/** 公开笔记排序选项 */
export type NoteSortOption = 'latest' | 'popular' | 'mostComments'

