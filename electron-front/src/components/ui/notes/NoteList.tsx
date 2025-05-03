import React, { useState, useMemo } from 'react';
import { useCalendar } from '@/context/CalendarContext';
import { useSearch } from '@/context/SearchContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import NoteItem from './NoteItem';
import DeleteNoteDialog from './DeleteNoteDialog';
import EmptyNoteList from './EmptyNoteList';
import NoteDialog from './NoteDialog';
import { Note } from '@/types/calendar';
import { useLanguage } from '@/context/LanguageContext';

const NoteList: React.FC = () => {
  const { notes, updateNote, deleteNote } = useCalendar();
  const { isSearching, searchResults } = useSearch();
  const { t } = useLanguage();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState<Note | undefined>(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
  
  // 根据是否在搜索来确定显示的笔记列表
  const displayNotes = isSearching ? searchResults : notes;
  
  // Sort notes: pinned first, then by date
  const sortedNotes = useMemo(() => {
    return [...displayNotes].sort((a, b) => {
      // First sort by pinned status
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      
      // Then sort by date (newest first)
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [displayNotes]);
  
  const handleEditClick = (note: Note) => {
    setCurrentNote(note);
    setEditDialogOpen(true);
  };
  
  const handleDeleteClick = (noteId: string) => {
    setNoteToDelete(noteId);
    setDeleteDialogOpen(true);
  };
  
  const confirmDelete = () => {
    if (noteToDelete) {
      deleteNote(noteToDelete);
      setNoteToDelete(null);
    }
    setDeleteDialogOpen(false);
  };
  
  const togglePin = (note: Note) => {
    updateNote({
      ...note,
      isPinned: !note.isPinned
    });
  };
  
  const toggleComplete = (note: Note) => {
    updateNote({
      ...note,
      isCompleted: !note.isCompleted
    });
  };
  
  const handleEditDialogOpenChange = (open: boolean) => {
    setEditDialogOpen(open);
  };
  
  // 处理空列表状态
  if (displayNotes.length === 0) {
    // 如果是搜索状态且没有结果
    if (isSearching) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-4 text-center text-muted-foreground">
          <p>{t('noNotesFound')}</p>
        </div>
      );
    }
    // 不是搜索状态但没有笔记
    return <EmptyNoteList />;
  }
  
  return (
    <>
      <ScrollArea className="h-full w-full">
        <div className="space-y-1 p-2">
          {isSearching && (
            <div className="mb-3 px-2 py-1.5 text-sm text-muted-foreground">
              {t('searchResults')}: {sortedNotes.length}
            </div>
          )}
          
          {sortedNotes.map((note) => (
            <NoteItem
              key={note.id}
              note={note}
              onTogglePin={togglePin}
              onToggleComplete={toggleComplete}
              onEditClick={handleEditClick}
              onDeleteClick={handleDeleteClick}
            />
          ))}
        </div>
      </ScrollArea>
      
      <NoteDialog
        open={editDialogOpen}
        onOpenChange={handleEditDialogOpenChange}
        note={currentNote}
        mode="edit"
      />
      
      <DeleteNoteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirmDelete={confirmDelete}
      />
    </>
  );
};

export default React.memo(NoteList);
