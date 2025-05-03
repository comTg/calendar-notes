import React, { useState, useCallback, useMemo } from 'react';
import { useCalendar, CalendarProvider } from '@/context/CalendarContext';
import Header from '@/components/layout/Header';
import MonthView from '@/components/ui/calendar-view/MonthView';
import WeekView from '@/components/ui/calendar-view/WeekView';
import DayView from '@/components/ui/calendar-view/DayView';
import NoteDialog from '@/components/ui/notes/NoteDialog';
import NoteList from '@/components/ui/notes/NoteList';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLanguage } from '@/context/LanguageContext';

const CalendarApp: React.FC = () => {
  const { calendarMode, selectedNote, selectedDate } = useCalendar();
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
  const [isEditNoteOpen, setIsEditNoteOpen] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const isMobile = useIsMobile();
  const { t } = useLanguage();
  
  const handleAddNote = useCallback(() => {
    setIsAddNoteOpen(true);
  }, []);
  
  const handleEditNoteClose = useCallback((open: boolean) => {
    setIsEditNoteOpen(open);
    if (!open) {
      const { setSelectedNote } = useCalendar();
      setSelectedNote(null);
    }
  }, []);
  
  const calendarView = useMemo(() => {
    switch (calendarMode) {
      case 'month':
        return <MonthView onOpenAddNote={setIsAddNoteOpen} onOpenEditNote={setIsEditNoteOpen} />;
      case 'week':
        return <WeekView onOpenAddNote={setIsAddNoteOpen} onOpenEditNote={setIsEditNoteOpen} />;
      case 'day':
        return <DayView onOpenAddNote={setIsAddNoteOpen} onOpenEditNote={setIsEditNoteOpen} />;
      default:
        return null;
    }
  }, [calendarMode, setIsAddNoteOpen, setIsEditNoteOpen]);
  
  if (isMobile) {
    return (
      <div className="h-full flex flex-col overflow-hidden">
        <Header onAddNote={handleAddNote} />
        
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
          <div className="flex justify-center py-2">
            <button
              onClick={() => setShowNotes(!showNotes)}
              className="text-sm font-medium bg-primary text-primary-foreground px-3 py-1 rounded-full"
            >
              {showNotes ? t('showCalendar') : t('showNotes')}
            </button>
          </div>
          
          <div className={`flex-1 ${showNotes ? 'hidden' : 'block'}`}>
            {calendarView}
          </div>
          
          <div className={`flex-1 ${showNotes ? 'block' : 'hidden'}`}>
            <NoteList />
          </div>
        </div>
        
        <NoteDialog 
          open={isAddNoteOpen}
          onOpenChange={setIsAddNoteOpen}
          mode="add"
          preSelectedTime={selectedDate}
        />
        
        <NoteDialog 
          open={isEditNoteOpen && selectedNote !== null}
          onOpenChange={handleEditNoteClose}
          note={selectedNote}
          mode="edit"
        />
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col overflow-hidden">
      <Header onAddNote={handleAddNote} />
      
      <div className="flex-1 min-h-0 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          <ResizablePanel defaultSize={70} minSize={40} className="h-full">
            <div className="h-full overflow-hidden">
              {calendarView}
            </div>
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          <ResizablePanel defaultSize={30} minSize={25} className="h-full">
            <div className="h-full overflow-hidden">
              <NoteList />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
      
      <NoteDialog 
        open={isAddNoteOpen}
        onOpenChange={setIsAddNoteOpen}
        mode="add"
        preSelectedTime={selectedDate}
      />
      
      <NoteDialog 
        open={isEditNoteOpen && selectedNote !== null}
        onOpenChange={handleEditNoteClose}
        note={selectedNote}
        mode="edit"
      />
    </div>
  );
};

const Index: React.FC = () => {
  return (
    <CalendarProvider>
      <CalendarApp />
    </CalendarProvider>
  );
};

export default Index;
