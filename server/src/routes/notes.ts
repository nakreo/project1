import { Router, Response } from 'express'
import db from '../db.js'
import { success, fail } from '../utils/response.js'
import { authMiddleware, AuthRequest } from '../middleware/auth.js'

const router = Router()

// ===== 获取笔记列表（支持筛选）=====
router.get('/', authMiddleware, (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId
  const { searchText, tag, status } = req.query

  let sql = 'SELECT * FROM notes WHERE user_id = ?'
  const params: any[] = [userId]

  if (status && status !== 'all') {
    sql += ' AND status = ?'
    params.push(status)
  }

  if (searchText) {
    sql += ' AND (title LIKE ? OR content LIKE ?)'
    const text = `%${searchText}%`
    params.push(text, text)
  }

  sql += ' ORDER BY updated_at DESC'

  const notes = db.prepare(sql).all(...params) as any[]

  // 格式化
  let formatted = notes.map((n) => ({
    id: n.id,
    title: n.title,
    content: n.content,
    cover: n.cover,
    tags: JSON.parse(n.tags),
    status: n.status,
    relatedQuestionId: n.related_question_id,
    createdAt: n.created_at,
    updatedAt: n.updated_at,
  }))

  // 标签筛选在内存中进行（tags 是 JSON 字段）
  if (tag) {
    formatted = formatted.filter((n) => n.tags.includes(tag))
  }

  success(res, formatted)
})

// ===== 获取单篇笔记 =====
router.get('/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId
  const note = db.prepare(
    'SELECT * FROM notes WHERE id = ? AND user_id = ?'
  ).get(req.params.id, userId) as any

  if (!note) {
    return fail(res, '笔记不存在', 404, 404)
  }

  success(res, {
    id: note.id,
    title: note.title,
    content: note.content,
    cover: note.cover,
    tags: JSON.parse(note.tags),
    status: note.status,
    relatedQuestionId: note.related_question_id,
    createdAt: note.created_at,
    updatedAt: note.updated_at,
  })
})

// ===== 新建笔记 =====
router.post('/', authMiddleware, (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId
  const { id, title, content, cover, tags, status, relatedQuestionId } = req.body

  if (!title || !content) {
    return fail(res, '标题和内容不能为空')
  }

  const now = Date.now()

  //
  db.prepare(`
    INSERT INTO notes (id, user_id, title, content, cover, tags, status, related_question_id, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    userId,
    title,
    content,
    cover || null,
    JSON.stringify(tags || []),
    status || 'draft',
    relatedQuestionId || null,
    now,
    now,
  )

  success(res, {
    id,
    title,
    content,
    cover: cover || null,
    tags: tags || [],
    status: status || 'draft',
    relatedQuestionId: relatedQuestionId || null,
    createdAt: now,
    updatedAt: now,
  }, '笔记已创建')
})

// ===== 更新笔记（同步更新讨论区已发布的笔记）=====
router.put('/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId
  const { id } = req.params
  const { title, content, cover, tags, status, relatedQuestionId } = req.body

  const existing = db.prepare(
    'SELECT id FROM notes WHERE id = ? AND user_id = ?'
  ).get(id, userId)

  if (!existing) {
    return fail(res, '笔记不存在', 404, 404)
  }

  const now = Date.now()

  // 1. 更新学习笔记
  db.prepare(`
    UPDATE notes SET
      title = COALESCE(?, title),
      content = COALESCE(?, content),
      cover = ?,
      tags = COALESCE(?, tags),
      status = COALESCE(?, status),
      related_question_id = ?,
      updated_at = ?
    WHERE id = ? AND user_id = ?
  `).run(
    title, content,
    cover !== undefined ? (cover || null) : undefined,
    tags ? JSON.stringify(tags) : undefined,
    status,
    relatedQuestionId !== undefined ? (relatedQuestionId || null) : undefined,
    now,
    id, userId,
  )

  // 2. 同步更新讨论区已发布的笔记（如果已发布）
  const publicNote = db.prepare('SELECT id FROM public_notes WHERE note_id = ?').get(id) as any
  if (publicNote) {
    const resolvedRelatedId = relatedQuestionId !== undefined
      ? (relatedQuestionId || null)
      : (db.prepare('SELECT related_question_id FROM notes WHERE id = ?').get(id) as any)?.related_question_id

    let relatedTitle: string | null = null
    if (resolvedRelatedId) {
      const q = db.prepare('SELECT title FROM questions WHERE id = ?').get(resolvedRelatedId) as any
      if (q) relatedTitle = q.title
    }

    db.prepare(`
      UPDATE public_notes SET
        title = COALESCE(?, title),
        content = COALESCE(?, content),
        cover = ?,
        tags = COALESCE(?, tags),
        related_question_id = ?,
        related_question_title = COALESCE(?, related_question_title),
        updated_at = ?
      WHERE note_id = ?
    `).run(
      title, content,
      cover !== undefined ? (cover || null) : undefined,
      tags ? JSON.stringify(tags) : undefined,
      resolvedRelatedId,
      relatedTitle,
      now,
      id,
    )
  }

  success(res, null, '笔记已更新')
})

// ===== 删除笔记 =====
router.delete('/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId
  const { id } = req.params

  const existing = db.prepare(
    'SELECT id FROM notes WHERE id = ? AND user_id = ?'
  ).get(id, userId)

  if (!existing) {
    return fail(res, '笔记不存在', 404, 404)
  }

  // 删除笔记时，也删除关联的公开笔记
  db.prepare('DELETE FROM notes WHERE id = ? AND user_id = ?').run(id, userId)
  db.prepare('DELETE FROM public_notes WHERE note_id = ?').run(id)

  success(res, null, '笔记已删除')
})

export default router

