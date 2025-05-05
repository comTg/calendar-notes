import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { addMonths, subMonths, addWeeks, subWeeks, addDays, subDays } from 'date-fns';
import { CalendarMode, Note } from '@/types/calendar';
import { generateCalendarMonth } from '@/lib/calendar-utils';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/LanguageContext';

interface ElectronAPI {
  notes: {
    getAll: () => Promise<Note[]>;
    getForDate: (date: Date) => Promise<Note[]>;
    add: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Note>;
    update: (note: Note) => Promise<Note>;
    delete: (id: string) => Promise<boolean>;
  }
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

interface CalendarContextType {
  currentDate: Date;
  selectedDate: Date;
  calendarMode: CalendarMode;
  notes: Note[];
  selectedNote: Note | null;
  setCurrentDate: (date: Date) => void;
  setSelectedDate: (date: Date) => void;
  setCalendarMode: (mode: CalendarMode) => void;
  setSelectedNote: (note: Note | null) => void;
  nextPeriod: () => void;
  prevPeriod: () => void;
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>, showToast?: boolean) => void;
  updateNote: (note: Note, showToast?: boolean) => void;
  deleteNote: (id: string, showToast?: boolean) => void;
  getNotesForDate: (date: Date) => Note[];
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

export const CalendarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [calendarMode, setCalendarMode] = useState<CalendarMode>('month');
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const { t } = useLanguage();
  
  // 是否支持电子存储（在Electron环境中运行）
  const hasElectronStorage = typeof window !== 'undefined' && window.electronAPI !== undefined;
  
  // Create welcome note function
  const createWelcomeNote = useCallback(() => {
    const welcomeNote: Omit<Note, 'id' | 'createdAt' | 'updatedAt'> = {
      title: t('welcome'),
      content: t('welcomeNote'),
      date: new Date(),
      tags: ['hoşgeldin', 'welcome'],
      color: '#3498db',
      reminder: null,
      isPinned: true,
      isCompleted: false,
    };
    
    if (hasElectronStorage) {
      window.electronAPI?.notes.add(welcomeNote)
        .then(newNote => {
          setNotes([newNote]);
        })
        .catch(error => {
          console.error('Failed to add welcome note:', error);
        });
    } else {
      // Fallback to localStorage for non-Electron environments or development
      const fallbackNote: Note = {
        ...welcomeNote,
        id: '1',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setNotes([fallbackNote]);
      localStorage.setItem('calendarNotes', JSON.stringify([fallbackNote]));
    }
  }, [t, hasElectronStorage]);
  
  // Load notes on initial render
  useEffect(() => {
    if (hasElectronStorage) {
      // 从SQLite数据库加载笔记
      window.electronAPI?.notes.getAll()
        .then(loadedNotes => {
          if (loadedNotes && loadedNotes.length > 0) {
            setNotes(loadedNotes);
          } else {
            // 如果没有笔记，创建欢迎笔记
            createWelcomeNote();
          }
        })
        .catch(error => {
          console.error('Failed to load notes from database:', error);
          createWelcomeNote();
        });
    } else {
      // Fallback to localStorage for non-Electron environments or development
      const savedNotes = localStorage.getItem('calendarNotes');
      if (savedNotes) {
        try {
          const parsedNotes = JSON.parse(savedNotes).map((note: any) => ({
            ...note,
            date: new Date(note.date),
            createdAt: new Date(note.createdAt),
            updatedAt: new Date(note.updatedAt),
            reminder: note.reminder ? new Date(note.reminder) : null,
          }));
          setNotes(parsedNotes);
        } catch (error) {
          console.error('Failed to parse saved notes:', error);
          createWelcomeNote();
        }
      } else {
        createWelcomeNote();
      }
    }
  }, [createWelcomeNote, hasElectronStorage]);
  
  // Save notes to localStorage for non-Electron environments
  useEffect(() => {
    if (!hasElectronStorage && notes.length > 0) {
      localStorage.setItem('calendarNotes', JSON.stringify(notes));
    }
  }, [notes, hasElectronStorage]);
  
  const nextPeriod = useCallback(() => {
    switch (calendarMode) {
      case 'month':
        setCurrentDate(prevDate => addMonths(prevDate, 1));
        break;
      case 'week':
        setCurrentDate(prevDate => addWeeks(prevDate, 1));
        break;
      case 'day':
        setCurrentDate(prevDate => addDays(prevDate, 1));
        setSelectedDate(prevDate => addDays(prevDate, 1));
        break;
    }
  }, [calendarMode]);
  
  const prevPeriod = useCallback(() => {
    switch (calendarMode) {
      case 'month':
        setCurrentDate(prevDate => subMonths(prevDate, 1));
        break;
      case 'week':
        setCurrentDate(prevDate => subWeeks(prevDate, 1));
        break;
      case 'day':
        setCurrentDate(prevDate => subDays(prevDate, 1));
        setSelectedDate(prevDate => subDays(prevDate, 1));
        break;
    }
  }, [calendarMode]);
  
  const addNote = useCallback((note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>, showToast: boolean = true) => {
    if (hasElectronStorage) {
      window.electronAPI?.notes.add(note)
        .then(newNote => {
          setNotes(prevNotes => [...prevNotes, newNote]);
          if (showToast) {
            toast({
              title: t('noteAdded'),
              description: t('successfullyCreated'),
            });
          }
        })
        .catch(error => {
          console.error('Failed to add note:', error);
          toast({
            title: t('error'),
            description: t('failedToCreateNote'),
            variant: 'destructive',
          });
        });
    } else {
      // Fallback for non-Electron environments
      const newNote: Note = {
        ...note,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      setNotes(prevNotes => [...prevNotes, newNote]);
      if (showToast) {
        toast({
          title: t('noteAdded'),
          description: t('successfullyCreated'),
        });
      }
    }
  }, [hasElectronStorage, t]);
  
  const updateNote = useCallback((updatedNote: Note, showToast: boolean = true) => {
    if (hasElectronStorage) {
      window.electronAPI?.notes.update(updatedNote)
        .then(result => {
          setNotes(prevNotes => prevNotes.map(note => 
            note.id === updatedNote.id ? result : note
          ));
          if (showToast) {
            toast({
              title: t('noteUpdated'),
              description: t('successfullyUpdated'),
            });
          }
        })
        .catch(error => {
          console.error('Failed to update note:', error);
          toast({
            title: t('error'),
            description: t('failedToUpdateNote'),
            variant: 'destructive',
          });
        });
    } else {
      // Fallback for non-Electron environments
      setNotes(prevNotes => prevNotes.map(note => 
        note.id === updatedNote.id 
          ? { ...updatedNote, updatedAt: new Date() } 
          : note
      ));
      if (showToast) {
        toast({
          title: t('noteUpdated'),
          description: t('successfullyUpdated'),
        });
      }
    }
  }, [hasElectronStorage, t]);
  
  const deleteNote = useCallback((id: string) => {
    if (hasElectronStorage) {
      window.electronAPI?.notes.delete(id)
        .then(success => {
          if (success) {
            setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
            toast({
              title: t('noteDeleted'),
              description: t('successfullyDeleted'),
            });
          } else {
            toast({
              title: t('error'),
              description: t('failedToDeleteNote'),
              variant: 'destructive',
            });
          }
        })
        .catch(error => {
          console.error('Failed to delete note:', error);
          toast({
            title: t('error'),
            description: t('failedToDeleteNote'),
            variant: 'destructive',
          });
        });
    } else {
      // Fallback for non-Electron environments
      setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
      toast({
        title: t('noteDeleted'),
        description: t('successfullyDeleted'),
      });
    }
  }, [hasElectronStorage, t]);
  
  const getNotesForDate = useCallback((date: Date): Note[] => {
    return notes.filter(note => {
      const noteDate = new Date(note.date);
      return noteDate.getDate() === date.getDate() &&
             noteDate.getMonth() === date.getMonth() &&
             noteDate.getFullYear() === date.getFullYear();
    });
  }, [notes]);
  
  const value = useMemo(() => ({
    currentDate,
    selectedDate,
    calendarMode,
    notes,
    selectedNote,
    setCurrentDate,
    setSelectedDate,
    setCalendarMode,
    setSelectedNote,
    nextPeriod,
    prevPeriod,
    addNote,
    updateNote,
    deleteNote,
    getNotesForDate,
  }), [
    currentDate, 
    selectedDate, 
    calendarMode, 
    notes, 
    selectedNote,
    nextPeriod,
    prevPeriod,
    addNote,
    updateNote,
    deleteNote,
    getNotesForDate
  ]);
  
  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
};

export const useCalendar = (): CalendarContextType => {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  return context;
};
