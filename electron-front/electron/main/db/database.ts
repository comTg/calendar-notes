import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

// 获取应用数据目录
const APP_DATA_PATH = process.env.APP_DATA_PATH || path.join(process.env.HOME || process.env.USERPROFILE || '.', 'CalendarNotes');

// 确保数据目录存在
if (!fs.existsSync(APP_DATA_PATH)) {
  fs.mkdirSync(APP_DATA_PATH, { recursive: true });
}

// 数据库文件路径
const DB_PATH = path.join(APP_DATA_PATH, 'notes.db');

// 创建数据库连接
const db = new Database(DB_PATH);

// 启用外键约束
db.pragma('foreign_keys = ON');

// 初始化数据库表
function initDatabase() {
  // 创建笔记表
  db.exec(`
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT,
      date TEXT NOT NULL,
      color TEXT,
      isPinned INTEGER DEFAULT 0,
      isCompleted INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      reminder TEXT
    )
  `);

  // 创建标签表
  db.exec(`
    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    )
  `);

  // 创建笔记-标签关联表
  db.exec(`
    CREATE TABLE IF NOT EXISTS note_tags (
      note_id TEXT NOT NULL,
      tag_id INTEGER NOT NULL,
      PRIMARY KEY (note_id, tag_id),
      FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
    )
  `);

  console.log('数据库初始化完成');
}

// 初始化数据库
initDatabase();

export default db; 