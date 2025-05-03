
import React, { useState, useEffect } from 'react';
import { useCalendar } from '@/context/CalendarContext';
import { useLanguage } from '@/context/LanguageContext';
import { Note } from '@/types/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import NoteFormFields from './NoteFormFields';
import ColorPicker from './ColorPicker';
import TagSelector from './TagSelector';
import { format } from 'date-fns';

interface NoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note?: Note | null;
  mode: 'add' | 'edit';
  preSelectedTime?: Date;
}

const NoteDialog: React.FC<NoteDialogProps> = ({ 
  open, 
  onOpenChange, 
  note, 
  mode,
  preSelectedTime
}) => {
  const { selectedDate, addNote, updateNote } = useCalendar();
  const { t } = useLanguage();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [time, setTime] = useState('12:00');
  const [tags, setTags] = useState<string[]>([]);
  const [color, setColor] = useState('#3498db');
  const [reminder, setReminder] = useState<Date | null>(null);
  const [timePickerOpen, setTimePickerOpen] = useState(false);
  
  const tagOptions = [
    'work', 'personal', 'important', 'meeting', 'reminder', 'idea', 'task'
  ];
  
  useEffect(() => {
    if (mode === 'add') {
      const initialDate = preSelectedTime || selectedDate || new Date();
      setDate(initialDate);
      
      const hours = initialDate.getHours().toString().padStart(2, '0');
      const minutes = initialDate.getMinutes() >= 30 ? '30' : '00';
      setTime(`${hours}:${minutes}`);
      
      setTitle('');
      setContent('');
      setTags([]);
      setColor('#3498db');
      setReminder(null);
    } else if (mode === 'edit' && note) {
      setTitle(note.title);
      setContent(note.content);
      setDate(new Date(note.date));
      setTime(format(new Date(note.date), 'HH:mm'));
      setTags(note.tags || []);
      setColor(note.color || '#3498db');
      setReminder(note.reminder || null);
    }
  }, [mode, note, selectedDate, preSelectedTime, open]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const [hours, minutes] = time.split(':').map(Number);
    const noteDate = new Date(date);
    noteDate.setHours(hours, minutes, 0, 0);
    
    if (mode === 'add') {
      addNote({
        title,
        content,
        date: noteDate,
        tags,
        color,
        reminder,
        isPinned: false,
        isCompleted: false,
      });
    } else if (mode === 'edit' && note) {
      updateNote({
        ...note,
        title,
        content,
        date: noteDate,
        tags,
        color,
        reminder,
      });
    }
    
    onOpenChange(false);
  };
  
  const handleAddTag = (newTag: string) => {
    if (!tags.includes(newTag)) {
      setTags([...tags, newTag]);
    }
  };
  
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] animate-in scale-in">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {mode === 'add' ? t('addNote') : t('editNote')}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              {mode === 'add' ? t('createNote') : t('updateNote')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <NoteFormFields
              title={title}
              content={content}
              date={date}
              time={time}
              setTitle={setTitle}
              setContent={setContent}
              setDate={setDate}
              setTime={setTime}
              timePickerOpen={timePickerOpen}
              setTimePickerOpen={setTimePickerOpen}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <ColorPicker
                selectedColor={color}
                onColorSelect={setColor}
              />
              
              <TagSelector
                tags={tags}
                onAddTag={handleAddTag}
                onRemoveTag={handleRemoveTag}
                availableTags={tagOptions}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => onOpenChange(false)}
            >
              {t('cancel')}
            </Button>
            <Button type="submit">
              {mode === 'add' ? t('save') : t('update')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default React.memo(NoteDialog);
