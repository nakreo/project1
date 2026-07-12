import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import db from './db.js'

// 路由导入
import authRoutes from './routes/auth.js'
import questionsRoutes from './routes/questions.js'
import progressRoutes from './routes/progress.js'
import notesRoutes from './routes/notes.js'
import publicNotesRoutes from './routes/public-notes.js'
import commentsRoutes from './routes/comments.js'
import likesRoutes from './routes/likes.js'

const app = express()
const PORT = process.env.PORT || 3001

// ===== 中间件 =====
app.use(cors())
app.use(express.json({ limit: '5mb' }))  // 支持 base64 图片传输
app.use(express.urlencoded({ extended: true }))

// ===== 路由挂载 =====
app.use('/api/auth', authRoutes)
app.use('/api/questions', questionsRoutes)
app.use('/api/progress', progressRoutes)
app.use('/api/notes', notesRoutes)
app.use('/api/public-notes', publicNotesRoutes)
app.use('/api/comments', commentsRoutes)
app.use('/api/likes', likesRoutes)

// ===== 健康检查 =====
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() })
})

// ===== 启动服务器 =====
app.listen(PORT, () => {
  console.log(`🚀 后端服务已启动: http://localhost:${PORT}`)
  console.log(`📊 数据库: SQLite (${db.name})`)
  console.log(`📋 API 前缀: /api`)
})
