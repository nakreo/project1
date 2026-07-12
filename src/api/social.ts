/**
 * 社交互动 API
 * 讨论区发布、评论、点赞
 */

import { api } from './http'
import type { PublicNote, Comment, NoteSortOption } from '@/types'

export interface PublicNoteItem extends PublicNote {
  commentCount?: number
  likeCount?: number
}

export interface PublicNoteFilterParams {
  searchText?: string
  tag?: string
  sortBy?: NoteSortOption
}

export const socialApi = {
  // ===== 公开笔记 =====

  /** 获取公开笔记列表（含筛选排序） */
  getPublicNotes: (params?: PublicNoteFilterParams) => {
    const query = new URLSearchParams()
    if (params) {
      if (params.searchText) query.set('searchText', params.searchText)
      if (params.tag) query.set('tag', params.tag)
      if (params.sortBy) query.set('sortBy', params.sortBy)
    }
    const qs = query.toString()
    return api.get<PublicNoteItem[]>(`/public-notes${qs ? `?${qs}` : ''}`)
  },

  /** 发布笔记到讨论区 */
  publishNote: (noteId: string) =>
    api.post<PublicNote>('/public-notes/publish', { noteId }),

  /** 重新发布（更新公开笔记） */
  rePublishNote: (publicNoteId: string) =>
    api.put<null>(`/public-notes/re-publish/${publicNoteId}`),

  /** 删除公开笔记 */
  unpublishNote: (publicNoteId: string) =>
    api.del<null>(`/public-notes/${publicNoteId}`),

  /** 获取我的公开笔记列表 */
  getMyPublishedNotes: () =>
    api.get<PublicNote[]>('/public-notes/mine/list'),

  /** 检查笔记是否已发布 */
  checkPublished: (noteId: string) =>
    api.get<{ published: boolean }>(`/public-notes/check/${noteId}`),

  // ===== 评论 =====

  /** 获取笔记的评论列表 */
  getComments: (publicNoteId: string) =>
    api.get<Comment[]>(`/comments/${publicNoteId}`),

  /** 添加评论 */
  addComment: (publicNoteId: string, content: string) =>
    api.post<Comment>('/comments', { publicNoteId, content }),

  /** 删除评论 */
  deleteComment: (commentId: string) =>
    api.del<null>(`/comments/${commentId}`),

  // ===== 点赞 =====

  /** 切换点赞状态 */
  toggleLike: (targetId: string, targetType: 'note' | 'comment') =>
    api.post<{ liked: boolean; likeCount: number }>('/likes/toggle', { targetId, targetType }),

  /** 获取点赞数 */
  getLikeCount: (targetId: string, targetType: 'note' | 'comment') =>
    api.get<{ count: number }>(`/likes/count/${targetId}/${targetType}`),

  /** 批量查询点赞状态 */
  getLikeStatus: (targets: Array<{ targetId: string; targetType: string }>) =>
    api.post<{ likedSet: string[] }>('/likes/status', { targets }),
}
