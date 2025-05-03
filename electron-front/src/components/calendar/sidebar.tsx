import { useState } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Note, useNoteStore } from '@/lib/store';
import { NoteDialog } from './note-dialog';

interface SidebarProps {
  selectedDate: Date | null;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ selectedDate, isOpen, onClose }: SidebarProps) {
  const { notes, deleteNote, getNotesByDate } = useNoteStore();
  const [editingNote, setEditingNote] = useState<{ id: string; date: Date } | null>(null);

  const formatDateToString = (date: Date) => {
    return format(date, 'yyyy-MM-dd');
  };

  // 获取特定日期的笔记
  const getNotesForDate = (date: Date): Note[] => {
    if (!date) return [];
    return getNotesByDate(formatDateToString(date));
  };

  // 获取所有日期的笔记
  const getAllNotes = (): Note[] => {
    return notes;
  };

  // 处理删除笔记
  const handleDeleteNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('确定要删除这个笔记吗？')) {
      deleteNote(id);
    }
  };

  // 处理编辑笔记
  const handleEditNote = (note: Note) => {
    setEditingNote({
      id: note.id,
      date: new Date(note.date),
    });
  };

  return (
    <div
      className={cn(
        'fixed right-0 top-0 h-full w-80 bg-white border-l shadow-lg transition-transform duration-300 z-10',
        isOpen ? 'translate-x-0' : 'translate-x-full'
      )}
    >
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-xl font-bold">笔记列表</h2>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="p-4 overflow-y-auto h-[calc(100%-60px)]">
        {selectedDate ? (
          <div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold">
                {format(selectedDate, 'yyyy年MM月dd日')}
              </h3>
              <p className="text-gray-500">
                {format(selectedDate, 'EEEE')}
              </p>
            </div>
            
            {getNotesForDate(selectedDate).length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <p>当天没有笔记</p>
                <Button 
                  className="mt-2" 
                  onClick={() => setEditingNote({ id: '', date: selectedDate })}
                >
                  创建笔记
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {getNotesForDate(selectedDate).map((note) => (
                  <Card 
                    key={note.id} 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleEditNote(note)}
                  >
                    <CardHeader className="py-3 px-4">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-sm text-gray-500">
                          {format(new Date(note.createdAt), 'HH:mm')}
                        </CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleDeleteNote(note.id, e)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="py-0 px-4 pb-3">
                      <p className="text-sm line-clamp-3">{note.content}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold mb-2">所有笔记</h3>
            {getAllNotes().length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <p>暂无笔记</p>
              </div>
            ) : (
              getAllNotes()
                .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                .map((note) => (
                  <Card 
                    key={note.id} 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleEditNote(note)}
                  >
                    <CardHeader className="py-3 px-4">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-sm text-gray-500">
                          {format(new Date(note.date), 'yyyy-MM-dd')}
                        </CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleDeleteNote(note.id, e)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="py-0 px-4 pb-3">
                      <p className="text-sm line-clamp-3">{note.content}</p>
                    </CardContent>
                  </Card>
                ))
            )}
          </div>
        )}
      </div>

      {editingNote && (
        <NoteDialog
          date={editingNote.date}
          open={!!editingNote}
          onOpenChange={(open) => !open && setEditingNote(null)}
          noteId={editingNote.id || undefined}
        />
      )}
    </div>
  );
} 