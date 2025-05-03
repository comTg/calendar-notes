
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { addMonths, subMonths, addWeeks, subWeeks, addDays, subDays } from 'date-fns';
import { CalendarMode, Note } from '@/types/calendar';
import { generateCalendarMonth } from '@/lib/calendar-utils';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/LanguageContext';

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
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (note: Note) => void;
  deleteNote: (id: string) => void;
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
  
  // Create welcome note function
  const createWelcomeNote = useCallback(() => {
    const welcomeNote: Note = {
      id: '1',
      title: t('welcome'),
      content: t('welcomeNote'),
      date: new Date(),
      tags: ['hoşgeldin', 'welcome'],
      color: '#3498db',
      reminder: null,
      isPinned: true,
      isCompleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setNotes([welcomeNote]);
  }, [t]);
  
  // Load notes from localStorage on initial render
  useEffect(() => {
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
        // If there's an error, create the welcome note
        createWelcomeNote();
      }
    } else {
      // If no notes exist, create the welcome note
      createWelcomeNote();
    }
  }, [createWelcomeNote]);
  
  // Save notes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('calendarNotes', JSON.stringify(notes));
  }, [notes]);
  
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
  
  const addNote = useCallback((note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newNote: Note = {
      ...note,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setNotes(prevNotes => [...prevNotes, newNote]);
    toast({
      title: t('noteAdded'),
      description: t('successfullyCreated'),
    });
  }, [t]);
  
  const updateNote = useCallback((updatedNote: Note) => {
    setNotes(prevNotes => prevNotes.map(note => 
      note.id === updatedNote.id 
        ? { ...updatedNote, updatedAt: new Date() } 
        : note
    ));
    toast({
      title: t('noteUpdated'),
      description: t('successfullyUpdated'),
    });
  }, [t]);
  
  const deleteNote = useCallback((id: string) => {
    setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
    toast({
      title: t('noteDeleted'),
      description: t('successfullyDeleted'),
    });
  }, [t]);
  
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
