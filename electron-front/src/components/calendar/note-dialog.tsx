import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useNoteStore } from '@/lib/store';

interface NoteDialogProps {
  date: Date;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  noteId?: string;
}

export function NoteDialog({ date, open, onOpenChange, noteId }: NoteDialogProps) {
  const { addNote, updateNote, notes } = useNoteStore();
  const [content, setContent] = useState('');
  const dateString = format(date, 'yyyy-MM-dd');
  const formattedDate = format(date, 'yyyy年MM月dd日');

  // 如果有笔记ID，表示编辑模式，获取笔记内容
  useEffect(() => {
    if (noteId) {
      const note = notes.find(n => n.id === noteId);
      if (note) {
        setContent(note.content);
      }
    } else {
      setContent('');
    }
  }, [noteId, notes]);

  const handleSubmit = () => {
    if (content.trim() === '') return;

    if (noteId) {
      updateNote(noteId, content);
    } else {
      addNote(content, dateString);
    }

    setContent('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{noteId ? '编辑笔记' : '新建笔记'}</DialogTitle>
          <DialogDescription>
            {formattedDate}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <textarea
            className="w-full min-h-[200px] p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="在这里输入笔记内容..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSubmit}>
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 