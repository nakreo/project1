# 面试刷题助手 · Interview Practice Assistant

一个面向求职者的**面试刷题 + AI 模拟面试**平台。前端 Vue 3 全栈 TypeScript，后端 Express 5 + SQLite，AI 部分直连 DeepSeek API。

> 做这个项目的出发点是：市面上的刷题站大多只做「看题」，缺少「练 → 记 → 讨论 → 复盘」的闭环。这个项目把四个环节串成一条链路：刷题记录进度、错题沉淀成笔记、笔记可以发布到讨论区互动、最后用 AI 模拟面试检验效果。

---

## 目录

- [功能概览](#功能概览)
- [技术栈](#技术栈)
- [系统架构](#系统架构)
- [数据库设计](#数据库设计)
- [API 接口](#api-接口)
- [本地运行](#本地运行)
- [关键设计决策](#关键设计决策)
- [已知限制](#已知限制)

---

## 功能概览

| 模块 | 说明 |
|---|---|
| 题库浏览 | 按分类（HTML / CSS / JavaScript / Vue / TypeScript / 算法 / 网络 / 工程化）和难度（简单 / 中等 / 困难）筛选 |
| 学习进度 | 收藏、已掌握、易错三种状态标记，记录复习次数与最近复习时间 |
| 随机刷题 | 从题库中随机抽题，用于碎片时间练习 |
| 学习笔记 | Quill 富文本编辑器 + 封面上传，支持草稿 / 发布两种状态 |
| 讨论区 | 笔记发布后进入公开区，其他用户可评论、点赞 |
| AI 模拟面试 | 按岗位类别生成面试官提示词，逐题问答并给出评价 |
| 学习统计 | 按分类统计掌握率、错题分布，可视化展示 |

前端共 **10 个页面**、**18 个业务组件**、**4 个 Pinia store**。

---

## 技术栈

### 前端

| 项 | 选型 | 版本 |
|---|---|---|
| 框架 | Vue 3（Composition API + `<script setup>`） | 3.5 |
| 语言 | TypeScript | 6.0 |
| 构建 | Vite | 8.0 |
| 路由 | Vue Router | 5.1 |
| 状态管理 | Pinia | 3.0 |
| UI 组件 | Element Plus（unplugin 按需自动导入） | 2.14 |
| 样式 | Tailwind CSS | 4.3 |
| 富文本 | VueQuill | 1.5 |
| 安全过滤 | DOMPurify | 3.4 |

### 后端

| 项 | 选型 | 版本 |
|---|---|---|
| 框架 | Express | 5.2 |
| 数据库 | SQLite（better-sqlite3） | 12.11 |
| 鉴权 | jsonwebtoken | 9.0 |
| 密码加密 | bcryptjs | 3.0 |
| 开发热重载 | tsx watch | 4.23 |

**为什么用 better-sqlite3 而不是 mysql2 / Prisma**：这个项目是单机部署的个人应用，SQLite 零运维、单文件、备份就是复制一个文件。better-sqlite3 是同步 API，在 Express 里写起来不需要 async/await 层层包裹，代码更直白。代价是无法水平扩展——如果要做多实例，需要换 PostgreSQL。

---

## 系统架构

```
┌─────────────────────────────────────────────┐
│              Browser (Vue 3 SPA)             │
│  views (10) → components (18) → stores (4)   │
└───────────────────┬─────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │  src/api/http.ts      │  ← 统一请求守卫
        │  · 注入 JWT           │
        │  · 拦截 401 → 跳登录  │
        │  · 统一 ApiResult     │
        └───────┬───────┬───────┘
                │       │
      target:   │       │  target: 'deepseek'
     'backend'  │       │
                ▼       ▼
    ┌───────────────┐  ┌──────────────────────┐
    │ Express 5 API │  │ api.deepseek.com     │
    │ 7 路由模块    │  │ /v1/chat/completions │
    │ 29 个接口     │  └──────────────────────┘
    └───────┬───────┘
            │ better-sqlite3 (同步调用)
            ▼
    ┌───────────────┐
    │ SQLite        │  WAL 模式 + 外键约束
    │ 8 张表 / 5 索引│
    └───────────────┘
```

**关键点**：前端所有请求都走 `src/api/http.ts` 这一个函数，用 `target` 字段区分「请求自己的后端」还是「请求 DeepSeek」。前者自动注入 JWT，后者注入 API Key。这样做的好处是鉴权逻辑只有一处，不会出现某个页面漏加 token 的情况。

---

## 数据库设计

### E-R 关系

```
                        ┌──────────┐
                        │  users   │
                        └────┬─────┘
                             │ 1
          ┌──────────────────┼──────────────────┬──────────────┐
          │ N                │ N                │ N            │ N
          ▼                  ▼                  ▼              ▼
┌──────────────────┐  ┌───────────┐  ┌──────────────┐  ┌─────────────┐
│question_progress │  │   notes   │  │    likes     │  │ ai_sessions │
└────────┬─────────┘  └─────┬─────┘  │  (多态关联)  │  └─────────────┘
         │ N                │ 1        └──────────────┘
         ▼                  ▼ N
   ┌───────────┐   ┌────────────────┐
   │ questions │   │  public_notes  │
   └───────────┘   └────────┬───────┘
                            │ 1
                            ▼ N
                     ┌────────────┐
                     │  comments  │
                     └────────────┘
```

### 8 张表

| 表名 | 作用 | 主键 | 关键约束 |
|---|---|---|---|
| `users` | 用户账号 | `id` INTEGER 自增 | `username` UNIQUE |
| `questions` | 题库 | `id` TEXT（如 `html-001`） | — |
| `question_progress` | 用户 × 题目的学习状态 | `id` INTEGER 自增 | **`UNIQUE(user_id, question_id)`** + 双外键 |
| `notes` | 私有笔记 | `id` TEXT | 外键 → users |
| `public_notes` | 已发布笔记（快照） | `id` TEXT | 外键 → notes、users |
| `comments` | 评论 | `id` TEXT | 外键 → public_notes、users |
| `likes` | 点赞（多态） | `id` TEXT | `UNIQUE(target_id, target_type, user_id)` |
| `ai_sessions` | AI 面试会话 | `id` TEXT | 外键 → users |

> 8 张表中 **7 张声明了外键**（`likes` 因多态设计无法在数据库层声明）。

### 索引

```sql
CREATE INDEX idx_progress_user      ON question_progress(user_id);
CREATE INDEX idx_notes_user         ON notes(user_id);
CREATE INDEX idx_public_notes_user  ON public_notes(user_id);
CREATE INDEX idx_comments_note      ON comments(public_note_id);
CREATE INDEX idx_likes_target       ON likes(target_id, target_type);
```

**这 5 个索引全部建在外键字段上**，不是随手加的。SQLite **不会**自动为外键建索引，不建的话每次按 `user_id` 查进度、按 `public_note_id` 查评论都是全表扫描。数据量小的时候感知不到，但这是必须补上的一环。

---

## API 接口

Base URL: `http://localhost:3001/api`，共 **7 个路由模块、29 个接口**。
除 `/auth/login` 和 `/auth/register` 外，全部需要 `Authorization: Bearer <token>`。

### `/api/auth` — 6 个

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/login` | 登录，返回 JWT（有效期 7 天） |
| POST | `/register` | 注册，密码 bcrypt 加密（10 轮） |
| GET | `/profile` | 查当前用户资料 |
| PUT | `/profile/nickname` | 改昵称 |
| PUT | `/profile/password` | 改密码（需校验旧密码） |
| PUT | `/profile/avatar` | 换头像（base64） |

### `/api/questions` — 2 个

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/` | 题目列表，支持 `category` / `difficulty` 筛选 |
| GET | `/:id` | 题目详情 |

### `/api/progress` — 4 个

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/` | 当前用户全部进度 |
| GET | `/:questionId` | 单题进度 |
| PUT | `/:questionId` | 更新收藏 / 掌握 / 易错状态 |
| POST | `/review/:questionId` | 记录一次复习，`review_count + 1` |

### `/api/notes` — 5 个

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/` | 笔记列表 |
| GET | `/:id` | 笔记详情 |
| POST | `/` | 新建笔记 |
| PUT | `/:id` | 编辑笔记 |
| DELETE | `/:id` | 删除笔记 |

### `/api/public-notes` — 6 个（最复杂的模块）

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/` | 公开笔记列表 |
| POST | `/publish` | 发布笔记（从 notes 生成快照） |
| PUT | `/re-publish/:publicNoteId` | 重新发布（原笔记更新后同步） |
| DELETE | `/:id` | 下架 |
| GET | `/mine/list` | 我发布过的 |
| GET | `/check/:noteId` | **查重**：这篇笔记是否已发布过 |

### `/api/comments` — 3 个

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/:publicNoteId` | 某篇公开笔记的评论列表 |
| POST | `/` | 发评论 |
| DELETE | `/:id` | 删评论 |

### `/api/likes` — 3 个

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/toggle` | 点赞 / 取消点赞（同一接口） |
| GET | `/count/:targetId/:targetType` | 某目标的点赞数 |
| POST | `/status` | 批量查询当前用户是否点过赞 |

### 其他

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/health` | 健康检查 |

---

## 本地运行

### 环境要求

- Node.js `^22.18.0` 或 `>=24.12.0`
- pnpm（前端）

### 1. 安装依赖

```bash
# 前端
pnpm install

# 后端
cd server && npm install && cd ..
```

### 2. 配置环境变量

**前端** — 项目根目录新建 `.env.local`：

```ini
VITE_API_BASE_URL=http://localhost:3001/api
VITE_DEEPSEEK_API_KEY=sk-xxxxxxxx
```

**后端** — `server/` 目录新建 `.env`：

```ini
PORT=3001
JWT_SECRET=换成你自己的随机字符串
```

### 3. 初始化数据库

```bash
cd server
mkdir -p data          # 数据文件目录，首次运行需手动创建
npm run seed           # 建表 + 插入种子用户和 16 道题
```

> `seed.ts` 用 `INSERT OR IGNORE`，可以重复执行，不会产生重复数据。
> 数据库文件生成在 `server/data/database.sqlite`。

### 4. 启动

```bash
# 终端 1：后端
cd server && npm run dev

# 终端 2：前端（回到项目根目录）
pnpm dev
```

前端默认 `http://localhost:5173`，后端 `http://localhost:3001`。

### 5. 验证

```bash
curl http://localhost:3001/api/health
# {"status":"ok","timestamp":...}
```

### 其他脚本

| 命令 | 位置 | 作用 |
|---|---|---|
| `pnpm build` | 根目录 | 类型检查 + 生产构建 |
| `pnpm type-check` | 根目录 | 仅 `vue-tsc` 类型检查 |
| `pnpm lint` | 根目录 | oxlint + eslint 检查并修复 |
| `npm run seed` | server | 重跑种子数据 |

---

## 关键设计决策

### 1. 为什么 `public_notes` 是独立表，而不是 `notes` 加一个 `is_public` 字段

因为**发布是一个动作，不是一个状态**。用户把笔记发布出去之后，还会继续修改自己的私有笔记——如果只有 `is_public` 字段，改完私有笔记，公开区的内容会跟着变成未完成的样子。

所以发布时把 title / content 复制一份到 `public_notes`，形成**快照**。想同步更新，走 `PUT /re-publish/:publicNoteId` 显式触发。这是内容型系统的常见做法，代价是有一份冗余数据。

### 2. 为什么 `question_progress` 要有 `UNIQUE(user_id, question_id)`

进度表本质是「用户 × 题目」的关联表。业务上一个人对一道题只能有一个状态，如果允许重复行，查进度时就要 `ORDER BY last_reviewed_at DESC LIMIT 1`，越写越绕。

加了联合唯一约束后，重复写入直接报错。同时这个约束顺带生成了 `(user_id, question_id)` 的复合索引，查「我的所有进度」走 `user_id` 前缀就能命中索引。

### 3. 为什么 `likes` 用多态设计

点赞可以点笔记，也可以点评论。如果建两张表（`note_likes` / `comment_likes`），点赞逻辑要写两遍，查「我点过哪些」还要 union。

多态设计用 `target_type`（`'note'` / `'comment'`）+ `target_id` 一张表搞定。**代价是数据库层面无法约束 `target_id` 一定存在于对应的表里**，只能靠代码校验 `target_type` 的合法值和目标是否存在。这是一个真实的取舍，不是偷懒。

### 4. 为什么开启 WAL

```ts
db.pragma('journal_mode = WAL')
```

SQLite 默认的 rollback journal 模式在写入时会锁住整个数据库，读操作要等写完成。WAL（Write-Ahead Logging）把新数据先追加到独立的 `-wal` 文件，读操作继续读旧快照，互不阻塞。

代价是会多出 `database.sqlite-wal` 和 `-shm` 两个文件；而且 WAL 依赖共享内存，**不能放在 NFS 等网络文件系统上**，也不适合多台机器共享同一个库文件。

验证方式：`PRAGMA journal_mode;` 返回 `wal` 即生效。

### 5. 关于外键的一个重要细节

```ts
db.pragma('foreign_keys = ON')
```

**SQLite 出于向后兼容，默认不检查外键**。哪怕表定义里写了 `REFERENCES`，不开这个 pragma 也形同虚设。这是 SQLite 和 MySQL / PostgreSQL 差异最大的地方之一，必须显式打开。

本项目**没有设置级联删除**（`ON DELETE CASCADE`），所以删除仍被子记录引用的父记录会被阻止。当前做法是在业务层先处理子记录，这是一个待改进项。

### 6. 密码与令牌

- 密码用 bcryptjs 哈希存储，**10 轮**，数据库里不存明文
- JWT 载荷只有 `{ userId, username }`，**不放密码和敏感信息**——JWT 只签名不加密，base64 解码就能看到内容
- 有效期 7 天
- 前端在 `src/api/http.ts` 统一注入 `Authorization: Bearer <token>`，收到 401 时清除本地 token 并跳转登录页

### 7. 前端为什么把鉴权放在请求层而不是路由守卫

路由守卫只能在「切换页面」时拦截，但真正的权限校验点在接口——用户即使停在某个页面，token 也可能已经过期。

`src/api/http.ts` 是**所有请求的唯一出口**，在这里做三件事：没 token 且目标不是 `/auth/*` 就直接跳登录、有 token 就自动带上、响应 401 就清 token 并跳登录。这样权限判断只有一处，不会漏。

### 8. 富文本的 XSS 防护

笔记正文是富文本（Quill 产出 HTML），直接 `v-html` 渲染等同于把 XSS 漏洞敞开。

`src/utils/sanitize.ts` 用 DOMPurify 在渲染前过滤，移除 `<script>`、`on*` 事件属性、`javascript:` 协议链接等危险内容。

---

## 已知限制

写在这里是为了诚实记录，不是为了掩饰：

| 限制 | 说明 | 改进方向 |
|---|---|---|
| 题库只有 16 道 | 覆盖 8 个分类，每类 1–3 道 | 题库是数据驱动的（`seed.ts` 里是数组），扩充不改代码 |
| 无级联删除 | 删除被引用的父记录会失败 | 加 `ON DELETE CASCADE` 或在业务层补齐 |
| `JWT_SECRET` 有默认值 | 代码里写了 `'default-secret'` 兜底，忘配 `.env` 不会报错 | 生产环境应改为启动时强制校验 |
| 未部署线上 | 只有本地运行 | 前端可上 Vercel / Netlify，后端需支持持久化磁盘 |
| DeepSeek Key 在前端 | API Key 通过 `VITE_` 前缀打包进前端代码，浏览器可见 | 应改为后端代理转发 |
| 单机数据库 | SQLite 无法多实例共享 | 扩展时换 PostgreSQL |

---

## 项目结构

```
.
├── server/                     # 后端
│   ├── src/
│   │   ├── index.ts            # Express 入口：CORS、JSON 解析、路由挂载
│   │   ├── db.ts               # 建表 + 索引 + WAL + 外键开关
│   │   ├── seed.ts             # 种子数据（用户 + 16 道题）
│   │   ├── middleware/auth.ts  # JWT 校验中间件
│   │   ├── routes/             # 7 个路由模块
│   │   └── utils/response.ts   # 统一响应格式 success / fail
│   └── data/                   # SQLite 文件（应 gitignore）
│
└── src/                        # 前端
    ├── api/
    │   ├── http.ts             # 请求守卫：鉴权注入 + 错误处理 + 401 跳转
    │   ├── auth.ts / questions.ts / notes.ts / social.ts
    │   └── deepseek/           # index.ts（调用）+ prompts.ts（提示词）
    ├── components/             # 18 个业务组件
    ├── views/                  # 10 个页面
    ├── stores/                 # 4 个 Pinia store
    ├── router/index.ts         # 10 条路由
    ├── composables/useAI.ts    # AI 对话状态管理
    ├── utils/
    │   ├── sanitize.ts         # DOMPurify XSS 过滤
    │   ├── statistics.ts       # 学习统计计算
    │   └── difficulty.ts / format.ts / id.ts / storage.ts
    └── types/                  # TS 类型定义（ai / note / question / social）
```

---

## License

个人项目，仅供学习参考。
