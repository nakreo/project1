import { Router, Response } from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import db from '../db.js'
import { success, fail } from '../utils/response.js'
import { authMiddleware, AuthRequest } from '../middleware/auth.js'

const router = Router()

// ===== 登录 =====
router.post('/login', (req: AuthRequest, res: Response) => {
  const { username, password } = req.body

  if (!username || !password) {
    return fail(res, '请输入用户名和密码')
  }

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as any

  if (!user) {
    return fail(res, '用户名或密码错误')
  }

  // 验证密码
  const valid = bcrypt.compareSync(password, user.password)
  if (!valid) {
    return fail(res, '用户名或密码错误')
  }

  // 生成 JWT token
  const secret = process.env.JWT_SECRET || 'default-secret'
  const token = jwt.sign(
    { userId: user.id, username: user.username },
    secret,
    { expiresIn: '7d' }
  )

  success(res, {
    token,
    user: {
      username: user.username,
      nickname: user.nickname,
      avatarUrl: user.avatar_url,
      createdAt: user.created_at,
    },
  }, '登录成功')
})

// ===== 注册 =====
router.post('/register', (req: AuthRequest, res: Response) => {
  const { username, password, nickname } = req.body

  if (!username || !password || !nickname) {
    return fail(res, '用户名、密码和昵称不能为空')
  }

  if (username.length < 2) {
    return fail(res, '用户名至少 2 个字符')
  }

  if (password.length < 6) {
    return fail(res, '密码至少 6 个字符')
  }

  // 检查用户名是否已存在
  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username)
  if (existing) {
    return fail(res, '用户名已存在')
  }

  // 加密密码
  const hashedPassword = bcrypt.hashSync(password, 10)

  const result = db.prepare(
    'INSERT INTO users (username, password, nickname, created_at) VALUES (?, ?, ?, ?)'
  ).run(username, hashedPassword, nickname.trim(), Date.now())

  const secret = process.env.JWT_SECRET || 'default-secret'
  const token = jwt.sign(
    { userId: result.lastInsertRowid, username },
    secret,
    { expiresIn: '7d' }
  )

  success(res, {
    token,
    user: {
      username,
      nickname: nickname.trim(),
      avatarUrl: null,
      createdAt: Date.now(),
    },
  }, '注册成功')
})

// ===== 获取用户信息 =====
router.get('/profile', authMiddleware, (req: AuthRequest, res: Response) => {
  const user = db.prepare(
    'SELECT id, username, nickname, avatar_url, created_at FROM users WHERE id = ?'
  ).get(req.user!.userId) as any

  if (!user) {
    return fail(res, '用户不存在', 404, 404)
  }

  success(res, {
    username: user.username,
    nickname: user.nickname,
    avatarUrl: user.avatar_url,
    createdAt: user.created_at,
  })
})

// ===== 更新昵称 =====
router.put('/profile/nickname', authMiddleware, (req: AuthRequest, res: Response) => {
  const { nickname } = req.body

  if (!nickname || !nickname.trim()) {
    return fail(res, '昵称不能为空')
  }

  db.prepare('UPDATE users SET nickname = ? WHERE id = ?')
    .run(nickname.trim(), req.user!.userId)

  success(res, null, '昵称已更新')
})

// ===== 更新密码 =====
router.put('/profile/password', authMiddleware, (req: AuthRequest, res: Response) => {
  const { oldPassword, newPassword } = req.body

  if (newPassword.length < 6) {
    return fail(res, '新密码至少 6 个字符')
  }

  const user = db.prepare('SELECT password FROM users WHERE id = ?')
    .get(req.user!.userId) as any

  if (!bcrypt.compareSync(oldPassword, user.password)) {
    return fail(res, '旧密码不正确')
  }

  const hashedPassword = bcrypt.hashSync(newPassword, 10)
  db.prepare('UPDATE users SET password = ? WHERE id = ?')
    .run(hashedPassword, req.user!.userId)

  success(res, null, '密码已更新')
})

// ===== 更新头像 =====
router.put('/profile/avatar', authMiddleware, (req: AuthRequest, res: Response) => {
  const { avatarUrl } = req.body

  if (!avatarUrl) {
    return fail(res, '请上传头像')
  }

  // 限制 base64 大小
  if (avatarUrl.startsWith('data:image') && avatarUrl.length > 250000) {
    return fail(res, '图片过大，请压缩后再试')
  }

  db.prepare('UPDATE users SET avatar_url = ? WHERE id = ?')
    .run(avatarUrl, req.user!.userId)

  success(res, null, '头像已更新')
})

export default router
