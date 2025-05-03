import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useCalendar } from '@/context/CalendarContext';
import { startOfWeek, addDays, format, isSameDay } from 'date-fns';
import { zhCN, enUS } from 'date-fns/locale';
import { Note } from '@/types/calendar';
import { useLanguage } from '@/context/LanguageContext';
import { getFormattedTime } from '@/lib/calendar-utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface WeekViewProps {
  onOpenAddNote: (open: boolean) => void;
  onOpenEditNote: (open: boolean) => void;
}

const WeekView: React.FC<WeekViewProps> = ({ onOpenAddNote, onOpenEditNote }) => {
  const { currentDate, selectedDate, setSelectedDate, getNotesForDate, setSelectedNote } = useCalendar();
  const [weekDays, setWeekDays] = useState<Date[]>([]);
  const { t, locale } = useLanguage();
  
  useEffect(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
    setWeekDays(days);
  }, [currentDate]);
  
  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);
  
  const getNotesForHour = useCallback((date: Date, hour: number): Note[] => {
    const dayNotes = getNotesForDate(date);
    return dayNotes.filter(note => {
      const noteDate = new Date(note.date);
      return noteDate.getHours() === hour;
    });
  }, [getNotesForDate]);
  
  const handleCellClick = useCallback((date: Date, hour: number) => {
    const newDate = new Date(date);
    newDate.setHours(hour);
    setSelectedDate(newDate);
  }, [setSelectedDate]);
  
  const handleCellDoubleClick = useCallback((date: Date, hour: number) => {
    const newDate = new Date(date);
    newDate.setHours(hour);
    setSelectedDate(newDate);
    onOpenAddNote(true);
  }, [setSelectedDate, onOpenAddNote]);
  
  const handleNoteClick = useCallback((e: React.MouseEvent, note: Note) => {
    e.stopPropagation();
    setSelectedNote(note);
    onOpenEditNote(true);
  }, [setSelectedNote, onOpenEditNote]);
  
  if (weekDays.length === 0) {
    return <div className="h-full flex items-center justify-center">{t('loading')}</div>;
  }
  
  const dateLocale = locale === 'zh' ? zhCN : enUS;
  
  const formatHour = (hour: number): string => {
    if (locale === 'zh') {
      // 24-hour format for Chinese
      return `${hour}:00`;
    } else {
      // 12-hour format for English
      return hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`;
    }
  };
  
  return (
    <div className="w-full h-full flex flex-col overflow-hidden animate-in slide-in">
      <div className="sticky top-0 z-10 bg-background flex">
        <div className="w-16 shrink-0"></div>
        {weekDays.map((day) => {
          const isToday = isSameDay(day, new Date());
          const isSelected = isSameDay(day, selectedDate);
          
          return (
            <div 
              key={day.toISOString()} 
              className={`
                flex-1 text-center py-2 cursor-pointer
                ${isToday ? 'font-semibold text-primary' : ''}
                ${isSelected ? 'bg-secondary/50' : ''}
              `}
            >
              <div className="text-xs">{format(day, 'EEE', { locale: dateLocale })}</div>
              <div className={`text-sm mt-1 ${isToday ? 'text-primary' : ''}`}>
                {format(day, 'd', { locale: dateLocale })}
              </div>
            </div>
          );
        })}
      </div>
      
      <ScrollArea className="flex-1">
        <div className="min-h-[1500px]">
          {hours.map((hour) => (
            <div key={`hour-${hour}`} className="flex h-16 border-t border-border">
              <div className="w-16 shrink-0 pr-2 text-xs text-right text-muted-foreground flex items-start pt-1 sticky left-0 bg-background z-10">
                {formatHour(hour)}
              </div>
              
              {weekDays.map((day) => {
                const notesForHour = getNotesForHour(day, hour);
                const isCurrentHour = new Date().getHours() === hour && isSameDay(day, new Date());
                
                return (
                  <div 
                    key={`${day.toISOString()}-${hour}`}
                    className={`
                      flex-1 border-l border-border p-1 relative cursor-pointer
                      ${isCurrentHour ? 'bg-blue-50 dark:bg-blue-950/20' : ''}
                      hover:bg-secondary/30
                    `}
                    onClick={() => handleCellClick(day, hour)}
                    onDoubleClick={() => handleCellDoubleClick(day, hour)}
                  >
                    {notesForHour.map((note) => (
                      <div 
                        key={note.id}
                        className="text-xs p-1 mb-1 rounded truncate transition-opacity hover:opacity-90 cursor-pointer"
                        style={{ 
                          backgroundColor: note.color || '#3498db', 
                          color: 'white'
                        }}
                        title={note.title}
                        onClick={(e) => handleNoteClick(e, note)}
                      >
                        {note.title}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default React.memo(WeekView);
