import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.resolve(__dirname, '../data/database.sqlite')

const db = new Database(dbPath)

// 开启 WAL 模式提升并发性能
db.pragma('journal_mode = WAL')
// 开启外键约束
db.pragma('foreign_keys = ON')

// ===== 建表 =====
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    nickname TEXT NOT NULL,
    avatar_url TEXT,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS questions (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    answer TEXT NOT NULL,
    tips TEXT,
    code_example TEXT,
    related_questions TEXT,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS question_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    question_id TEXT NOT NULL REFERENCES questions(id),
    is_starred INTEGER DEFAULT 0,
    is_mastered INTEGER DEFAULT 0,
    is_incorrect INTEGER DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    last_reviewed_at INTEGER,
    UNIQUE(user_id, question_id)
  );

  CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    cover TEXT,
    tags TEXT DEFAULT '[]',
    status TEXT DEFAULT 'draft',
    related_question_id TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS public_notes (
    id TEXT PRIMARY KEY,
    note_id TEXT NOT NULL REFERENCES notes(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    cover TEXT,
    tags TEXT DEFAULT '[]',
    related_question_id TEXT,
    related_question_title TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    public_note_id TEXT NOT NULL REFERENCES public_notes(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS likes (
    id TEXT PRIMARY KEY,
    target_id TEXT NOT NULL,
    target_type TEXT NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id),
    created_at INTEGER NOT NULL,
    UNIQUE(target_id, target_type, user_id)
  );

  CREATE TABLE IF NOT EXISTS ai_sessions (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    category TEXT NOT NULL,
    messages TEXT NOT NULL,
    started_at INTEGER NOT NULL,
    ended_at INTEGER,
    summary TEXT
  );
`)

// ===== 建索引（IF NOT EXISTS 已保证不会重复创建）=====
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_progress_user ON question_progress(user_id);
  CREATE INDEX IF NOT EXISTS idx_notes_user ON notes(user_id);
  CREATE INDEX IF NOT EXISTS idx_public_notes_user ON public_notes(user_id);
  CREATE INDEX IF NOT EXISTS idx_comments_note ON comments(public_note_id);
  CREATE INDEX IF NOT EXISTS idx_likes_target ON likes(target_id, target_type);
`)

export default db
