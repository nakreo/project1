import { Router, Response } from 'express'
import db from '../db.js'
import { success, fail } from '../utils/response.js'
import { authMiddleware, AuthRequest } from '../middleware/auth.js'

const router = Router()

// ===== 获取用户的所有学习进度 =====
router.get('/', authMiddleware, (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId
  const rows = db.prepare(
    'SELECT * FROM question_progress WHERE user_id = ?'
  ).all(userId) as any[]

  const progress: Record<string, any> = {}
  for (const p of rows) {
    progress[p.question_id] = {
      questionId: p.question_id,
      isStarred: !!p.is_starred,
      isMastered: !!p.is_mastered,
      isIncorrect: !!p.is_incorrect,
      reviewCount: p.review_count,
      lastReviewedAt: p.last_reviewed_at,
    }
  }

  success(res, progress)
})

// ===== 获取单题进度 =====
router.get('/:questionId', authMiddleware, (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId
  const { questionId } = req.params

  const row = db.prepare(
    'SELECT * FROM question_progress WHERE user_id = ? AND question_id = ?'
  ).get(userId, questionId) as any

  success(res, {
    questionId,
    isStarred: row ? !!row.is_starred : false,
    isMastered: row ? !!row.is_mastered : false,
    isIncorrect: row ? !!row.is_incorrect : false,
    reviewCount: row ? row.review_count : 0,
    lastReviewedAt: row ? row.last_reviewed_at : null,
  })
})

// ===== 更新学习进度（收藏/掌握/错题标记）=====
router.put('/:questionId', authMiddleware, (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId
  const { questionId } = req.params
  const { isStarred, isMastered, isIncorrect } = req.body

  // 确保题目存在
  const question = db.prepare('SELECT id FROM questions WHERE id = ?').get(questionId)
  if (!question) {
    return fail(res, '题目不存在', 404, 404)
  }

  // 使用 UPSERT 语法（INSERT OR REPLACE 的变体）
  db.prepare(`
    INSERT INTO question_progress (user_id, question_id, is_starred, is_mastered, is_incorrect, review_count, last_reviewed_at)
    VALUES (?, ?, ?, ?, ?, COALESCE((SELECT review_count FROM question_progress WHERE user_id = ? AND question_id = ?), 0), COALESCE((SELECT last_reviewed_at FROM question_progress WHERE user_id = ? AND question_id = ?), ?))
    ON CONFLICT(user_id, question_id) DO UPDATE SET
      is_starred = COALESCE(?, is_starred),
      is_mastered = COALESCE(?, is_mastered),
      is_incorrect = CASE WHEN ? = 1 THEN 0 ELSE COALESCE(?, is_incorrect) END
  `).run(
    userId, questionId,
    isStarred ?? 0, isMastered ?? 0, isIncorrect ?? 0,
    userId, questionId,
    userId, questionId, Date.now(),
    isStarred, isMastered,
    isMastered, isIncorrect  // 标记掌握时清除错题
  )

  // 获取更新后的进度
  const updated = db.prepare(
    'SELECT * FROM question_progress WHERE user_id = ? AND question_id = ?'
  ).get(userId, questionId) as any

  success(res, {
    questionId,
    isStarred: !!updated.is_starred,
    isMastered: !!updated.is_mastered,
    isIncorrect: !!updated.is_incorrect,
    reviewCount: updated.review_count,
    lastReviewedAt: updated.last_reviewed_at,
  })
})

// ===== 记录复习 =====
router.post('/review/:questionId', authMiddleware, (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId
  const { questionId } = req.params

  const existing = db.prepare(
    'SELECT id FROM question_progress WHERE user_id = ? AND question_id = ?'
  ).get(userId, questionId) as any

  if (existing) {
    db.prepare(`
      UPDATE question_progress SET review_count = review_count + 1, last_reviewed_at = ? WHERE user_id = ? AND question_id = ?
    `).run(Date.now(), userId, questionId)
  } else {
    db.prepare(`
      INSERT INTO question_progress (user_id, question_id, review_count, last_reviewed_at)
      VALUES (?, ?, 1, ?)
    `).run(userId, questionId, Date.now())
  }

  success(res, null, '已记录复习')
})

export default router
