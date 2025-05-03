import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Note {
  id: string;
  content: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

interface NoteState {
  notes: Note[];
  addNote: (content: string, date: string) => void;
  updateNote: (id: string, content: string) => void;
  deleteNote: (id: string) => void;
  getNotesByDate: (date: string) => Note[];
}

// 生成UUID
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export const useNoteStore = create<NoteState>()(
  persist(
    (set, get) => ({
      notes: [],
      addNote: (content, date) => {
        const now = new Date().toISOString();
        const newNote: Note = {
          id: generateUUID(),
          content,
          date,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          notes: [...state.notes, newNote],
        }));
      },
      updateNote: (id, content) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id
              ? { ...note, content, updatedAt: new Date().toISOString() }
              : note
          ),
        }));
      },
      deleteNote: (id) => {
        set((state) => ({
          notes: state.notes.filter((note) => note.id !== id),
        }));
      },
      getNotesByDate: (date) => {
        return get().notes.filter((note) => note.date === date);
      },
    }),
    {
      name: 'calendar-notes-storage',
    }
  )
); 