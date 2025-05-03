
import React, { useState, useMemo } from 'react';
import { useCalendar } from '@/context/CalendarContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import NoteItem from './NoteItem';
import DeleteNoteDialog from './DeleteNoteDialog';
import EmptyNoteList from './EmptyNoteList';
import NoteDialog from './NoteDialog';
import { Note } from '@/types/calendar';

const NoteList: React.FC = () => {
  const { notes, updateNote, deleteNote } = useCalendar();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState<Note | undefined>(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
  
  // Sort notes: pinned first, then by date
  const sortedNotes = useMemo(() => {
    return [...notes].sort((a, b) => {
      // First sort by pinned status
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      
      // Then sort by date (newest first)
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [notes]);
  
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
  
  if (notes.length === 0) {
    return <EmptyNoteList />;
  }
  
  return (
    <>
      <ScrollArea className="h-full w-full">
        <div className="space-y-1 p-2">
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
