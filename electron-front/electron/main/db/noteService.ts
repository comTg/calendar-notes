import db from './database';
import { Note } from '../../../src/types/calendar';

/**
 * 获取所有笔记
 */
export function getAllNotes(): Note[] {
  const notes = db.prepare(`
    SELECT * FROM notes
  `).all();
  
  return notes.map((note: any) => {
    const tags = getTagsForNote(note.id);
    return {
      ...note,
      date: new Date(note.date),
      createdAt: new Date(note.createdAt),
      updatedAt: new Date(note.updatedAt),
      reminder: note.reminder ? new Date(note.reminder) : null,
      isPinned: Boolean(note.isPinned),
      isCompleted: Boolean(note.isCompleted),
      tags
    };
  });
}

/**
 * 获取指定日期的笔记
 */
export function getNotesForDate(date: Date): Note[] {
  const dateStr = date.toISOString().split('T')[0];
  const notes = db.prepare(`
    SELECT * FROM notes WHERE date LIKE ?
  `).all(`${dateStr}%`);
  
  return notes.map((note: any) => {
    const tags = getTagsForNote(note.id);
    return {
      ...note,
      date: new Date(note.date),
      createdAt: new Date(note.createdAt),
      updatedAt: new Date(note.updatedAt),
      reminder: note.reminder ? new Date(note.reminder) : null,
      isPinned: Boolean(note.isPinned),
      isCompleted: Boolean(note.isCompleted),
      tags
    };
  });
}

/**
 * 获取笔记的所有标签
 */
function getTagsForNote(noteId: string): string[] {
  return db.prepare(`
    SELECT t.name 
    FROM tags t
    JOIN note_tags nt ON t.id = nt.tag_id
    WHERE nt.note_id = ?
  `).all(noteId).map((tag: any) => tag.name);
}

/**
 * 添加新笔记
 */
export function addNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Note {
  const now = new Date();
  const id = Date.now().toString();
  
  const newNote: Note = {
    ...note,
    id,
    createdAt: now,
    updatedAt: now
  };
  
  const stmt = db.prepare(`
    INSERT INTO notes (
      id, title, content, date, color, isPinned, isCompleted, createdAt, updatedAt, reminder
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    newNote.id,
    newNote.title,
    newNote.content,
    newNote.date.toISOString(),
    newNote.color,
    newNote.isPinned ? 1 : 0,
    newNote.isCompleted ? 1 : 0,
    newNote.createdAt.toISOString(),
    newNote.updatedAt.toISOString(),
    newNote.reminder ? newNote.reminder.toISOString() : null
  );
  
  // 处理标签
  saveTags(newNote.id, newNote.tags || []);
  
  return newNote;
}

/**
 * 更新笔记
 */
export function updateNote(note: Note): Note {
  const updatedNote = {
    ...note,
    updatedAt: new Date()
  };
  
  const stmt = db.prepare(`
    UPDATE notes 
    SET title = ?, content = ?, date = ?, color = ?, isPinned = ?, 
        isCompleted = ?, updatedAt = ?, reminder = ?
    WHERE id = ?
  `);
  
  stmt.run(
    updatedNote.title,
    updatedNote.content,
    updatedNote.date.toISOString(),
    updatedNote.color,
    updatedNote.isPinned ? 1 : 0,
    updatedNote.isCompleted ? 1 : 0,
    updatedNote.updatedAt.toISOString(),
    updatedNote.reminder ? updatedNote.reminder.toISOString() : null,
    updatedNote.id
  );
  
  // 更新标签
  // 先删除现有标签关联
  db.prepare('DELETE FROM note_tags WHERE note_id = ?').run(updatedNote.id);
  // 保存新标签
  saveTags(updatedNote.id, updatedNote.tags || []);
  
  return updatedNote;
}

/**
 * 删除笔记
 */
export function deleteNote(id: string): boolean {
  // 删除笔记（note_tags表会因外键约束自动删除关联）
  const result = db.prepare('DELETE FROM notes WHERE id = ?').run(id);
  return result.changes > 0;
}

/**
 * 保存笔记的标签
 */
function saveTags(noteId: string, tags: string[]): void {
  const db_run = db.transaction(() => {
    // 为每个标签创建或获取标签ID
    for (const tagName of tags) {
      // 尝试插入标签，如果已存在则忽略
      db.prepare(`
        INSERT OR IGNORE INTO tags (name) VALUES (?)
      `).run(tagName);
      
      // 获取标签ID
      const tagRow = db.prepare('SELECT id FROM tags WHERE name = ?').get(tagName) as { id: number };
      
      // 创建笔记-标签关联
      db.prepare(`
        INSERT OR IGNORE INTO note_tags (note_id, tag_id) VALUES (?, ?)
      `).run(noteId, tagRow.id);
    }
  });
  
  db_run();
} 