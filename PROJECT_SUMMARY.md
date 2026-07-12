# 面试刷题助手 - 项目完整摘要

## 技术栈
- **前端框架**: Vue 3 (Composition API, `<script setup lang="ts">`)
- **前端路由**: Vue Router 5.1.0（beta）
- **状态管理**: Pinia 3
- **UI 库**: Element Plus 2.14（按需自动导入）
- **CSS**: Tailwind CSS 4 + Element Plus 样式
- **前端构建**: Vite 8 + TypeScript 6
- **前端包管理**: pnpm
- **后端框架**: Express 5（TypeScript）
- **后端数据库**: SQLite (better-sqlite3)
- **后端认证**: JWT (jsonwebtoken) + bcryptjs 密码加密
- **后端运行时**: tsx（开发模式热重载）

## 项目结构

```
├── server/                          # 后端 API 服务（新增）
│   ├── src/
│   │   ├── index.ts                 # Express 入口（路由挂载、中间件）
│   │   ├── db.ts                    # SQLite 数据库初始化（建表/索引）
│   │   ├── seed.ts                  # 数据种子脚本（预设用户 + 18 道面试题）
│   │   ├── middleware/
│   │   │   └── auth.ts              # JWT 登录验证中间件
│   │   ├── routes/
│   │   │   ├── auth.ts              # 认证路由（登录/注册/个人信息管理）
│   │   │   ├── questions.ts         # 面试题查询路由（列表/详情/筛选）
│   │   │   ├── progress.ts          # 学习进度路由（CRUD/复习记录）
│   │   │   ├── notes.ts             # 学习笔记路由（CRUD/搜索/筛选）
│   │   │   ├── public-notes.ts      # 讨论区笔记路由（发布/更新/删除/检查）
│   │   │   ├── comments.ts          # 评论路由（列表/新增/删除）
│   │   │   └── likes.ts             # 点赞路由（切换/计数/批量查询）
│   │   └── utils/
│   │       └── response.ts          # 统一响应格式（success/fail）
│   ├── data/                        # SQLite 数据库文件（gitignored）
│   ├── package.json                 # 后端依赖
│   ├── tsconfig.json                # 后端 TypeScript 配置
│   └── .env                         # 后端环境变量（PORT, JWT_SECRET 等）
├── src/
│   ├── api/                         # 前端 API 层（重构：从 localStorage 改为 HTTP）
│   │   ├── http.ts                  # HTTP 请求守卫（统一鉴权/错误处理/401 跳转）
│   │   ├── index.ts                 # API 统一出口
│   │   ├── auth.ts                  # 认证 API（登录/注册/个人资料）
│   │   ├── questions.ts             # 面试题 + 进度 API
│   │   ├── notes.ts                 # 学习笔记 API
│   │   ├── social.ts               # 社交互动 API（讨论区/评论/点赞）
│   │   └── deepseek/
│   │       ├── index.ts             # DeepSeek API（面试聊天，保持外部 API 直连）
│   │       └── prompts.ts           # AI 提示词模板
│   ├── components/
│   │   ├── Sidebar.vue              # 侧边栏导航
│   │   ├── UserSettings.vue         # 账号设置弹窗
│   │   ├── NoteCard.vue             # 笔记卡片
│   │   ├── NoteEditor.vue           # 笔记编辑器弹窗（Element Plus Dialog）
│   │   ├── NoteEditorDrawer.vue     # 笔记编辑器抽屉（Quill 富文本 + 封面上传）
│   │   ├── NotePreview.vue          # 笔记预览弹窗
│   │   ├── StatCard.vue             # 通用统计卡片组件
│   │   ├── QuickLinks.vue           # 快捷入口网格组件
│   │   ├── CategoryProgress.vue     # 分类掌握进度组件
│   │   ├── DifficultyProgress.vue   # 难度掌握进度组件
│   │   ├── UserAvatar.vue           # 用户头像组件
│   │   ├── LikeButton.vue           # 点赞按钮组件
│   │   ├── CommentEditor.vue        # 评论输入框组件
│   │   ├── CommentList.vue          # 评论列表组件
│   │   ├── EmptyState.vue           # 通用空状态占位组件
│   │   ├── PageHeader.vue           # 通用页面标题组件
│   │   ├── QuestionAnswerSection.vue # 题目答案统一展示组件
│   │   ├── DiscussionCard.vue       # 讨论区概览卡片
│   │   └── DiscussionDetailDialog.vue # 讨论区笔记详情弹窗
│   ├── composables/
│   │   └── useAI.ts                 # AI 面试对话组合式函数
│   ├── data/
│   │   └── questions.ts             # 分类标签/颜色常量（不再包含题目数据）
│   ├── router/
│   │   └── index.ts                 # 路由配置（10 条路由 + 登录守卫）
│   ├── stores/
│   │   ├── auth.ts                  # 登录认证 Store（重构：调用后端 API）
│   │   ├── questions.ts             # 面试题 Store（重构：从后端加载）
│   │   ├── notes.ts                 # 笔记 Store（重构：从后端 CRUD）
│   │   └── social.ts                # 社交 Store（重构：从后端加载）
│   ├── types/
│   │   ├── index.ts                 # 类型统一导出
│   │   ├── question.ts              # 面试题相关类型
│   │   ├── note.ts                  # 笔记相关类型
│   │   ├── social.ts                # 社交相关类型
│   │   └── ai.ts                    # AI 对话相关类型
│   ├── utils/
│   │   ├── index.ts                 # 工具函数统一导出
│   │   ├── format.ts                # 时间格式化
│   │   ├── id.ts                    # ID 生成器
│   │   ├── storage.ts               # localStorage 安全读写
│   │   ├── difficulty.ts            # 难度相关常量
│   │   ├── sanitize.ts              # HTML 消毒 & 纯文本提取
│   │   ├── statistics.ts            # 统计计算
│   │   └── auth.ts                  # 退出登录工具函数
│   ├── views/
│   │   ├── LoginView.vue            # 登录/注册页
│   │   ├── HomeView.vue             # 首页
│   │   ├── ProfileView.vue          # 个人中心
│   │   ├── QuestionsView.vue        # 面试题库
│   │   ├── QuestionDetailView.vue   # 题目详情
│   │   ├── RandomQuizView.vue       # 随机刷题
│   │   ├── AiInterviewView.vue      # AI 模拟面试
│   │   ├── NotesView.vue            # 学习笔记
│   │   ├── DiscussionView.vue       # 公开讨论区
│   │   └── StatisticsView.vue       # 学习统计
│   ├── App.vue
│   ├── main.ts
│   └── style.css
├── package.json
└── PROJECT_SUMMARY.md
```

## 当前状态

### ✅ 已实现功能

#### 后端 API（新增）
1. **Express 5 + TypeScript 后端服务**：完整 RESTful API，监听 3001 端口
2. **SQLite 数据库（better-sqlite3）**：本地文件数据库，7 张业务表 + 索引
   - `users` — 用户表（密码 bcrypt 加密存储）
   - `questions` — 面试题表（18 道预设题目，支持 JSON 字段）
   - `question_progress` — 学习进度表（收藏/掌握/错题/复习次数）
   - `notes` — 学习笔记表（标签 JSON 字段、关联题目、草稿/发布状态）
   - `public_notes` — 讨论区笔记表（含关联题目标题）
   - `comments` — 评论表（关联用户和公开笔记）
   - `likes` — 点赞表（支持笔记/评论两种类型，联合唯一约束）
   - `ai_sessions` — AI 面试会话表（预留）
3. **JWT 认证中间件**：Bearer Token 鉴权，支持 3 个预设用户种子数据
4. **统一响应格式**：`{ code: 0, message, data }` 标准业务响应
5. **统一错误处理**：401 未授权、404 资源不存在、参数校验等
6. **数据种子脚本**（`cd server ; pnpm seed`）：自动插入 3 个预设用户 + 18 道面试题

#### 前端全量对接后端（重构）
7. **统一 HTTP 请求守卫**（`api/http.ts`）：
   - 自动拼接后端 `baseURL` 和 JWT 鉴权头
   - 统一解析后端 `{ code, message, data }` 响应格式
   - 401 自动跳转登录页并清除失效 token
   - 区分后端 API 和外部 API（DeepSeek）的处理逻辑
   - 返回 `[data, error]` 元组便捷方法
8. **API 模块化**：按业务拆分为 `auth.ts` / `questions.ts` / `notes.ts` / `social.ts` 四个模块
9. **所有 Store 重构为调用后端 API**：
   - `auth Store` — 登录/注册/个人信息全部走 HTTP 请求
   - `questions Store` — 从后端加载题目列表和进度；所有状态变更乐观更新同时同步后端
   - `notes Store` — 笔记的增删改查全部通过后端 API
   - `social Store` — 讨论区笔记、评论、点赞全部走后端接口

#### 前端已有功能（全部保留，数据源从 localStorage 迁移到后端）
10. **登录/认证**: 登录/注册页 + Pinia auth store + 路由前置守卫
11. **用户注册**: 用户名/昵称/密码注册，注册后自动登录
12. **账号设置**: 修改昵称、密码、头像（base64 上传，≤2MB）
13. **面试题库**: 18 道题，8 个分类，3 个难度，支持搜索/筛选/收藏
14. **题目详情**: 查看答案、代码示例、答题要点、标记掌握/复习
15. **AI 模拟面试**: DeepSeek API 集成，选择方向后 AI 扮演面试官
16. **学习统计**: 概览、分类/难度掌握进度、连续学习天数、复习排行
17. **学习笔记**: Quill 富文本编辑器、封面图片上传、草稿/发布状态、标签管理、关联题目
18. **个人中心**: 用户信息、学习数据概览、分类/难度进度、最近活动
19. **公开讨论区**: 笔记发布/评论/点赞、搜索/标签筛选/排序、卡片式展示
20. **随机刷题模式**: 三种模式（全部/排除已掌握/只刷错题）、先作答后看答案、自评闭环
21. **可复用组件库（9 个通用组件）**:
    - `UserAvatar.vue` - 用户头像（支持图片/首字母，可配尺寸）
    - `LikeButton.vue` - 点赞按钮（登录校验、状态切换）
    - `CommentEditor.vue` - 评论输入框（Enter 发送）
    - `CommentList.vue` - 评论列表（折叠/展开/删除）
    - `EmptyState.vue` - 空状态占位（图标/标题/描述/操作按钮/清空筛选）
    - `PageHeader.vue` - 页面标题（图标/标题/副标题/操作按钮）
    - `QuestionAnswerSection.vue` - 题目答案统一展示（参考答案/代码示例/答题要点，3 个 View 共享）
    - `DiscussionCard.vue` - 讨论区概览卡片（封面/头像/标题，点击触发详情）
    - `DiscussionDetailDialog.vue` - 讨论区笔记详情弹窗（完整内容 + 评论区）

### 🎯 代码架构变更记录

| 变更项 | 涉及文件 | 说明 |
|--------|---------|------|
| 新增后端服务 | `server/` 全部文件 | Express 5 + SQLite + JWT 认证 |
| HTTP 请求守卫重构 | `api/http.ts` | 从简单 fetch 封装升级为统一鉴权/错误处理/401 自动跳转 |
| API 模块化 | `api/auth.ts`, `api/questions.ts`, `api/notes.ts`, `api/social.ts` | 按业务拆分，统一通过 `api/index.ts` 导出 |
| Store 全量重构 | `stores/auth.ts`, `stores/questions.ts`, `stores/notes.ts`, `stores/social.ts` | 数据源从 localStorage 迁移到后端 API，保留乐观更新机制 |
| 题目数据迁移 | `data/questions.ts` → `server/src/seed.ts` | 18 道题完整数据移至后端 seed 脚本，前端仅保留分类标签/颜色常量 |
| 数据库设计 | `server/src/db.ts` | 7 张业务表 + 外键约束 + 索引 |

### 📋 下一阶段（待实现功能）

#### 🥇 高优先级
1. **错题本 / 待复习页面** — 专门的「待复习」页面，汇聚需要复习的题目集中攻克
2. **进度持久化（导出/导入）** — 学习进度导出为 JSON 文件，支持导入恢复

#### 🥈 中优先级
3. **AI 面试对话历史** — 保存历史面试记录到后端 `ai_sessions` 表（表已建，接口未实现）
4. **笔记与面试题双向关联** — 题目详情页展示关联的笔记列表
5. **讨论区消息通知** — 他人评论/点赞自己的帖子时收到通知
6. **Markdown 渲染支持** — 笔记/讨论区内容支持 Markdown 渲染与代码高亮
7. **筛选标签栏抽离为 `FilterTagBar` 组件** — 统一封装筛选模式

#### 🥉 低优先级
8. **深色模式切换**
9. **学习提醒 / 番茄钟**
10. **用户自定义题目**
11. **键盘快捷键**

---

### ❌ 当前问题
_（当前无已知问题）_

### 📝 注意事项
- 所有 emoji 已替换为 Element Plus 图标组件 (`@element-plus/icons-vue`)
- `unplugin-auto-import` 的 `auto-imports.d.ts` 为空，部分 Element Plus API（如 `ElMessage`、`ElMessageBox`）需要手动导入
- Vue Router 5 已废弃 `next()` 回调，导航守卫使用 `return true` / `return { name: '...' }` 方式
- **PowerShell 命令分隔符**: Windows PowerShell 不支持 `&&` 连接命令，应使用 `;` 代替（如 `cd path ; pnpm dev`）
- **开发时需同时启动前端和后端**：`pnpm dev`（前端）+ `cd server ; pnpm dev`（后端）
- **首次运行后端需要执行种子脚本**初始化数据：`cd server ; pnpm seed`
- 后端默认端口 3001，可通过 `server/.env` 中的 `PORT` 修改
- 前端通过 `VITE_API_BASE_URL` 环境变量（默认 `http://localhost:3001/api`）连接后端
- 预设账号（由 seed 脚本创建）：admin/admin123, user/user123, test/test123

## 关键依赖版本

### 前端
| 包名 | 版本 |
|------|------|
| vue | 3.5.38 |
| vue-router | 5.1.0 |
| pinia | 3.0.4 |
| element-plus | 2.14.2 |
| vite | 8.0.16 |
| typescript | 6.0.0 |
| tailwindcss | 4.3.2 |
| @vueup/vue-quill | 1.5.5 |
| dompurify | 3.x |

### 后端
| 包名 | 版本 |
|------|------|
| express | 5.2.1 |
| better-sqlite3 | 12.11.1 |
| jsonwebtoken | 9.0.3 |
| bcryptjs | 3.0.3 |
| cors | 2.8.6 |
| dotenv | 17.4.2 |
| tsx | 4.23.0 |
| typescript | 7.0.2 |

## 环境变量
- `VITE_DEEPSEEK_API_KEY`：DeepSeek API Key（在 `.env.local` 中设置）
- `VITE_API_BASE_URL`：后端 API 地址（默认 `http://localhost:3001/api`）
- `PORT`：后端端口（在 `server/.env` 中设置，默认 3001）
- `JWT_SECRET`：JWT 签名密钥（在 `server/.env` 中设置）

## 路由表
| 路径 | 名称 | 页面 | 说明 |
|------|------|------|------|
| `/login` | login | LoginView | 登录页（不受守卫限制） |
| `/` | home | HomeView | 首页 |
| `/profile` | profile | ProfileView | 个人中心 |
| `/questions` | questions | QuestionsView | 面试题库 |
| `/questions/:id` | question-detail | QuestionDetailView | 题目详情 |
| `/random-quiz` | random-quiz | RandomQuizView | 随机刷题 |
| `/ai-interview` | ai-interview | AiInterviewView | AI 模拟面试 |
| `/notes` | notes | NotesView | 学习笔记 |
| `/discussion` | discussion | DiscussionView | 公开讨论区 |
| `/statistics` | statistics | StatisticsView | 学习统计 |

## 测试账号
| 用户名 | 密码 | 昵称 |
|--------|------|------|
| admin | admin123 | 管理员 |
| user | user123 | 面试者 |
| test | test123 | 测试用户 |

> 预设账号由后端 seed 脚本创建，密码 bcrypt 加密存储。前后端分离后，账号数据统一从后端读写。

## 运行命令
- `pnpm dev` — 启动前端开发服务器
- `cd server ; pnpm dev` — 启动后端开发服务器（tsx watch 热重载）
- `cd server ; pnpm seed` — 初始化/重置后端数据库（预设用户 + 面试题）
- `pnpm build` — 构建前端生产版本
- `pnpm type-check` — TypeScript 类型检查（vue-tsc --build）

---

> 最后更新：新增 Express 5 + SQLite 后端服务，前端 API 层重构为 HTTP 请求，所有 Store 对接后端 API，题目数据迁移至后端 seed 脚本。

## ⚠️ 工具调用限制说明

在编辑 PROJECT_SUMMARY.md 等大文件时，存在以下工具调用限制：
1. **edit_existing_file** 和 **single_find_and_replace** 只能处理局部的精确字符串替换，无法进行大范围的全文重写
2. **create_new_file** 需要提供完整内容，但参数可能因特殊字符（反引号、Markdown 语法等）导致调用失败
3. 因此更新时需要逐段进行 find_and_replace 操作，无法一次性完成整文件更新
