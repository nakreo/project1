/**
 * 学习笔记 API
 * 笔记的增删改查、筛选
 */

import { api } from './http'
import type { Note } from '@/types'

export interface CreateNoteParams {
  id: string
  title: string
  content: string
  cover?: string
  tags: string[]
  status: 'draft' | 'published'
  relatedQuestionId?: string
}

export interface UpdateNoteParams {
  title?: string
  content?: string
  cover?: string | null
  tags?: string[]
  status?: 'draft' | 'published'
  relatedQuestionId?: string | null
}

export interface NoteFilterParams {
  searchText?: string
  tag?: string
  status?: string
}

export const notesApi = {
  /** 获取笔记列表（支持筛选） */
  getNotes: (params?: NoteFilterParams) => {
    const query = new URLSearchParams()
    if (params) {
      if (params.searchText) query.set('searchText', params.searchText)
      if (params.tag) query.set('tag', params.tag)
      if (params.status) query.set('status', params.status)
    }
    const qs = query.toString()
    return api.get<Note[]>(`/notes${qs ? `?${qs}` : ''}`)
  },

  /** 获取单篇笔记 */
  getNoteById: (id: string) =>
    api.get<Note>(`/notes/${id}`),

  /** 新建笔记 */
  createNote: (params: CreateNoteParams) =>
    api.post<Note>('/notes', params),

  /** 更新笔记 */
  updateNote: (id: string, params: UpdateNoteParams) =>
    api.put<null>(`/notes/${id}`, params),

  /** 删除笔记 */
  deleteNote: (id: string) =>
    api.del<null>(`/notes/${id}`),
}
