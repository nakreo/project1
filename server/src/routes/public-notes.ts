import { Router, Response } from 'express'
import db from '../db.js'
import { success, fail } from '../utils/response.js'
import { authMiddleware, AuthRequest } from '../middleware/auth.js'

const router = Router()

// ===== 获取公开笔记列表（含筛选排序）=====
router.get('/', authMiddleware, (req: AuthRequest, res: Response) => {
  const { searchText, tag, sortBy } = req.query

  let sql = `
    SELECT pn.*, 
      (SELECT COUNT(*) FROM comments c WHERE c.public_note_id = pn.id) AS comment_count,
      (SELECT COUNT(*) FROM likes l WHERE l.target_id = pn.id AND l.target_type = 'note') AS like_count
    FROM public_notes pn
    WHERE 1=1
  `
  const params: any[] = []

  if (searchText) {
    sql += ' AND (pn.title LIKE ? OR pn.content LIKE ?)'
    const text = `%${searchText}%`
    params.push(text, text)
  }

  // 排序
  switch (sortBy) {
    case 'popular':
      sql += ' ORDER BY like_count DESC, pn.created_at DESC'
      break
    case 'mostComments':
      sql += ' ORDER BY comment_count DESC, pn.created_at DESC'
      break
    default:
      sql += ' ORDER BY pn.created_at DESC'
  }

  const notes = db.prepare(sql).all(...params) as any[]

  // 格式化
  let formatted = notes.map((n) => ({
    id: n.id,
    noteId: n.note_id,
    userId: n.user_id,
    // 关联用户信息
    nickname: '',
    avatarUrl: null,
    title: n.title,
    content: n.content,
    cover: n.cover,
    tags: JSON.parse(n.tags),
    relatedQuestionId: n.related_question_id,
    relatedQuestionTitle: n.related_question_title,
    createdAt: n.created_at,
    updatedAt: n.updated_at,
    commentCount: n.comment_count,
    likeCount: n.like_count,
  }))

  // 查询用户信息（批量）
  const userIds = [...new Set(formatted.map((n) => n.userId))]
  const userMap: Record<number, { nickname: string; avatar_url: string | null }> = {}
  for (const uid of userIds) {
    const user = db.prepare('SELECT nickname, avatar_url FROM users WHERE id = ?').get(uid) as any
    if (user) {
      userMap[uid] = user
    }
  }

  for (const n of formatted) {
    const u = userMap[n.userId]
    if (u) {
      n.nickname = u.nickname
      n.avatarUrl = u.avatar_url
    }
  }

  // 标签筛选（内存中）
  if (tag) {
    formatted = formatted.filter((n) => n.tags.includes(tag))
  }

  success(res, formatted)
})

// ===== 发布笔记到讨论区 =====
router.post('/publish', authMiddleware, (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId
  const { noteId } = req.body

  if (!noteId) {
    return fail(res, '请指定要发布的笔记')
  }

  // 获取学习笔记
  const note = db.prepare('SELECT * FROM notes WHERE id = ? AND user_id = ?')
    .get(noteId, userId) as any

  if (!note) {
    return fail(res, '笔记不存在')
  }

  // 检查是否已发布
  const existing = db.prepare('SELECT id FROM public_notes WHERE note_id = ?').get(noteId) as any
  if (existing) {
    return success(res, { id: existing.id }, '笔记已发布')
  }

  // 查询关联的题目标题
  let relatedTitle: string | null = null
  if (note.related_question_id) {
    const q = db.prepare('SELECT title FROM questions WHERE id = ?').get(note.related_question_id) as any
    if (q) relatedTitle = q.title
  }

  // 生成公开笔记 ID
  const pubNoteId = `pub-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const now = Date.now()

  db.prepare(`
    INSERT INTO public_notes (id, note_id, user_id, title, content, cover, tags, related_question_id, related_question_title, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    pubNoteId, noteId, userId, note.title, note.content, note.cover,
    note.tags, note.related_question_id, relatedTitle, now, now,
  )

  // 获取用户信息
  const user = db.prepare('SELECT nickname, avatar_url FROM users WHERE id = ?').get(userId) as any

  success(res, {
    id: pubNoteId,
    noteId: note.id,
    userId,
    nickname: user?.nickname || '',
    avatarUrl: user?.avatar_url || null,
    title: note.title,
    content: note.content,
    cover: note.cover,
    tags: JSON.parse(note.tags),
    relatedQuestionId: note.related_question_id,
    relatedQuestionTitle: relatedTitle,
    createdAt: now,
    updatedAt: now,
  }, '发布成功')
})

// ===== 重新发布（更新公开笔记）=====
router.put('/re-publish/:publicNoteId', authMiddleware, (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId
  const { publicNoteId } = req.params

  const publicNote = db.prepare(
    'SELECT * FROM public_notes WHERE id = ? AND user_id = ?'
  ).get(publicNoteId, userId) as any

  if (!publicNote) {
    return fail(res, '公开笔记不存在', 404, 404)
  }

  const note = db.prepare('SELECT * FROM notes WHERE id = ?').get(publicNote.note_id) as any
  if (!note) {
    return fail(res, '关联的学习笔记不存在', 404, 404)
  }

  db.prepare(`
    UPDATE public_notes SET
      title = ?, content = ?, cover = ?, tags = ?,
      related_question_id = ?, updated_at = ?
    WHERE id = ? AND user_id = ?
  `).run(
    note.title, note.content, note.cover, note.tags,
    note.related_question_id, Date.now(),
    publicNoteId, userId,
  )

  success(res, null, '已重新发布')
})

// ===== 删除公开笔记 =====
router.delete('/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId
  const { id } = req.params

  const existing = db.prepare(
    'SELECT id FROM public_notes WHERE id = ? AND user_id = ?'
  ).get(id, userId) as any

  if (!existing) {
    return fail(res, '公开笔记不存在或无权删除', 404, 404)
  }

  // 删除公开笔记及关联的评论和点赞
  db.prepare('DELETE FROM public_notes WHERE id = ?').run(id)
  db.prepare('DELETE FROM comments WHERE public_note_id = ?').run(id)
  db.prepare('DELETE FROM likes WHERE target_id = ? AND target_type = ?').run(id, 'note')

  success(res, null, '已删除')
})

// ===== 获取我的公开笔记列表 =====
router.get('/mine/list', authMiddleware, (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId

  const notes = db.prepare(
    'SELECT * FROM public_notes WHERE user_id = ? ORDER BY created_at DESC'
  ).all(userId) as any[]

  const formatted = notes.map((n) => ({
    id: n.id,
    noteId: n.note_id,
    title: n.title,
    tags: JSON.parse(n.tags),
    createdAt: n.created_at,
  }))

  success(res, formatted)
})

// ===== 检查笔记是否已发布 =====
router.get('/check/:noteId', authMiddleware, (req: AuthRequest, res: Response) => {
  const { noteId } = req.params
  const existing = db.prepare('SELECT id FROM public_notes WHERE note_id = ?').get(noteId)
  success(res, { published: !!existing })
})

export default router
