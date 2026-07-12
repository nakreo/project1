import { Router, Response } from 'express'
import db from '../db.js'
import { success, fail } from '../utils/response.js'
import { authMiddleware, AuthRequest } from '../middleware/auth.js'

const router = Router()

// ===== 获取笔记的评论列表 =====
router.get('/:publicNoteId', authMiddleware, (req: AuthRequest, res: Response) => {
  const { publicNoteId } = req.params

  const rows = db.prepare(`
    SELECT c.*, u.nickname, u.avatar_url
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.public_note_id = ?
    ORDER BY c.created_at ASC
  `).all(publicNoteId) as any[]

  const comments = rows.map((c) => ({
    id: c.id,
    publicNoteId: c.public_note_id,
    userId: c.user_id,
    nickname: c.nickname,
    avatarUrl: c.avatar_url,
    content: c.content,
    createdAt: c.created_at,
  }))

  success(res, comments)
})

// ===== 添加评论 =====
router.post('/', authMiddleware, (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId
  const { publicNoteId, content } = req.body

  if (!publicNoteId || !content || !content.trim()) {
    return fail(res, '评论内容不能为空')
  }

  // 验证公开笔记存在
  const note = db.prepare('SELECT id FROM public_notes WHERE id = ?').get(publicNoteId)
  if (!note) {
    return fail(res, '笔记不存在', 404, 404)
  }

  const commentId = `cmt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const now = Date.now()

  db.prepare(`
    INSERT INTO comments (id, public_note_id, user_id, content, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(commentId, publicNoteId, userId, content.trim(), now)

  // 获取用户信息
  const user = db.prepare('SELECT nickname, avatar_url FROM users WHERE id = ?').get(userId) as any

  success(res, {
    id: commentId,
    publicNoteId,
    userId,
    nickname: user?.nickname || '',
    avatarUrl: user?.avatar_url || null,
    content: content.trim(),
    createdAt: now,
  }, '评论成功')
})

// ===== 删除评论 =====
router.delete('/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId
  const { id } = req.params

  const comment = db.prepare('SELECT * FROM comments WHERE id = ?').get(id) as any
  if (!comment) {
    return fail(res, '评论不存在', 404, 404)
  }

  // 检查权限：评论作者 或 笔记作者 可删除
  const isCommentAuthor = comment.user_id === userId
  const note = db.prepare('SELECT user_id FROM public_notes WHERE id = ?').get(comment.public_note_id) as any
  const isNoteAuthor = note && note.user_id === userId

  if (!isCommentAuthor && !isNoteAuthor) {
    return fail(res, '无权删除此评论', 403, 403)
  }

  db.prepare('DELETE FROM comments WHERE id = ?').run(id)
  // 删除关联的点赞
  db.prepare('DELETE FROM likes WHERE target_id = ? AND target_type = ?').run(id, 'comment')

  success(res, null, '评论已删除')
})

export default router
