import { Router, Response } from 'express'
import db from '../db.js'
import { success, fail } from '../utils/response.js'
import { authMiddleware, AuthRequest } from '../middleware/auth.js'

const router = Router()

// ===== 获取题目列表（含筛选）=====
router.get('/', authMiddleware, (req: AuthRequest, res: Response) => {
  const { category, difficulty, searchText, onlyFavorites, onlyIncorrect } = req.query
  const userId = req.user!.userId

  let sql = 'SELECT * FROM questions WHERE 1=1'
  const params: any[] = []

  if (category && category !== 'all') {
    sql += ' AND category = ?'
    params.push(category)
  }

  if (difficulty && difficulty !== 'all') {
    sql += ' AND difficulty = ?'
    params.push(difficulty)
  }

  if (searchText) {
    sql += ' AND (title LIKE ? OR description LIKE ?)'
    const text = `%${searchText}%`
    params.push(text, text)
  }

  if (onlyFavorites === 'true') {
    sql += ' AND id IN (SELECT question_id FROM question_progress WHERE user_id = ? AND is_starred = 1)'
    params.push(userId)
  }

  if (onlyIncorrect === 'true') {
    sql += ' AND id IN (SELECT question_id FROM question_progress WHERE user_id = ? AND is_incorrect = 1)'
    params.push(userId)
  }

  const questions = db.prepare(sql).all(...params) as any[]

  // 格式化返回：relatedQuestions 从 JSON 字符串转为数组
  const formatted = questions.map((q) => ({
    id: q.id,
    category: q.category,
    difficulty: q.difficulty,
    title: q.title,
    description: q.description,
    answer: q.answer,
    tips: q.tips,
    codeExample: q.code_example,
    relatedQuestions: q.related_questions ? JSON.parse(q.related_questions) : undefined,
    createdAt: q.created_at,
  }))

  success(res, formatted)
})

// ===== 获取单道题目详情 =====
router.get('/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  const question = db.prepare('SELECT * FROM questions WHERE id = ?').get(req.params.id) as any

  if (!question) {
    return fail(res, '题目不存在', 404, 404)
  }

  success(res, {
    id: question.id,
    category: question.category,
    difficulty: question.difficulty,
    title: question.title,
    description: question.description,
    answer: question.answer,
    tips: question.tips,
    codeExample: question.code_example,
    relatedQuestions: question.related_questions ? JSON.parse(question.related_questions) : undefined,
    createdAt: question.created_at,
  })
})

export default router
