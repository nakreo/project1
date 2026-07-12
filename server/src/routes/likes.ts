import { Router, Response } from 'express'
import db from '../db.js'
import { success, fail } from '../utils/response.js'
import { authMiddleware, AuthRequest } from '../middleware/auth.js'

const router = Router()

// ===== 切换点赞状态 =====
router.post('/toggle', authMiddleware, (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId
  const { targetId, targetType } = req.body

  if (!targetId || !targetType) {
    return fail(res, '参数不完整')
  }

  if (!['note', 'comment'].includes(targetType)) {
    return fail(res, '不支持的点赞类型')
  }

  // 检查是否已点赞
  const existing = db.prepare(
    'SELECT id FROM likes WHERE target_id = ? AND target_type = ? AND user_id = ?'
  ).get(targetId, targetType, userId) as any

  if (existing) {
    // 取消点赞
    db.prepare('DELETE FROM likes WHERE id = ?').run(existing.id)
    const count = db.prepare(
      'SELECT COUNT(*) AS cnt FROM likes WHERE target_id = ? AND target_type = ?'
    ).get(targetId, targetType) as any

    success(res, { liked: false, likeCount: count.cnt }, '已取消点赞')
  } else {
    // 点赞
    const likeId = `like-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    db.prepare(`
      INSERT INTO likes (id, target_id, target_type, user_id, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(likeId, targetId, targetType, userId, Date.now())

    const count = db.prepare(
      'SELECT COUNT(*) AS cnt FROM likes WHERE target_id = ? AND target_type = ?'
    ).get(targetId, targetType) as any

    success(res, { liked: true, likeCount: count.cnt }, '点赞成功')
  }
})

// ===== 获取某目标的点赞数 =====
router.get('/count/:targetId/:targetType', authMiddleware, (req: AuthRequest, res: Response) => {
  const { targetId, targetType } = req.params

  const count = db.prepare(
    'SELECT COUNT(*) AS cnt FROM likes WHERE target_id = ? AND target_type = ?'
  ).get(targetId, targetType) as any

  success(res, { count: count.cnt })
})

// ===== 批量获取点赞状态（用于页面初始化）=====
router.post('/status', authMiddleware, (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId
  const { targets } = req.body  // [{ targetId, targetType }, ...]

  if (!Array.isArray(targets)) {
    return fail(res, '参数格式错误')
  }

  const likedSet = new Set<string>()
  for (const { targetId, targetType } of targets) {
    const existing = db.prepare(
      'SELECT id FROM likes WHERE target_id = ? AND target_type = ? AND user_id = ?'
    ).get(targetId, targetType, userId)

    if (existing) {
      likedSet.add(`${targetType}:${targetId}`)
    }
  }

  success(res, { likedSet: [...likedSet] })
})

export default router
