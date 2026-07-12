import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { fail } from '../utils/response.js'

// 扩展 Request 类型，添加用户信息
export interface AuthRequest extends Request {
  user?: { userId: number; username: string }
}

/**
 * JWT 登录验证中间件
 * 验证通过后，在 req.user 中注入 userId 和 username
 */
export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return fail(res, '未登录', 401, 401)
  }

  const token = authHeader.slice(7)

  try {
    const secret = process.env.JWT_SECRET || 'default-secret'
    const decoded = jwt.verify(token, secret) as { userId: number; username: string }
    req.user = decoded
    next()
  } catch {
    return fail(res, '登录已过期，请重新登录', 401, 401)
  }
}
