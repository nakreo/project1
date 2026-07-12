import { Response } from 'express'

/**
 * 统一响应格式
 */
export function success(res: Response, data: any = null, message = 'ok') {
  res.json({ code: 0, message, data })
}

export function fail(res: Response, message = '操作失败', code = 1, status = 400) {
  res.status(status).json({ code, message, data: null })
}
