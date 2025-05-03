
import React, { useState, useEffect, useCallback } from 'react';
import { useCalendar } from '@/context/CalendarContext';
import { useLanguage } from '@/context/LanguageContext';
import { Note } from '@/types/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import NoteFormFields from './NoteFormFields';
import ColorPicker from './ColorPicker';
import TagSelector from './TagSelector';
import { CalendarIcon, Clock } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { cn } from '@/lib/utils';
import { zhCN, enUS } from 'date-fns/locale';
import { getFormattedDate } from '@/lib/calendar-utils';
import TimePicker from '@/components/ui/time-picker/TimePicker';
import { format } from 'date-fns';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const { t, locale } = useLanguage();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [time, setTime] = useState('12:00');
  const [tags, setTags] = useState<string[]>([]);
  const [color, setColor] = useState('#3498db');
  const [reminder, setReminder] = useState<Date | null>(null);
  const [timePickerOpen, setTimePickerOpen] = useState(false);
  const isMobile = useIsMobile();
  
  const handleTimeChange = useCallback((newTime: string, completed: boolean | undefined) => {
    setTime(newTime);
    
    // Only close the picker if both hour and minute have been selected
    if (completed) {
      setTimePickerOpen(false);
    }
  }, [setTime, setTimePickerOpen]);
  
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
      <DialogContent className="sm:max-w-[850px] max-h-full overflow-y-auto animate-in scale-in">
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
              setTime={setTime}
              timePickerOpen={timePickerOpen}
              setTimePickerOpen={setTimePickerOpen}
            />

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="other">
                <AccordionTrigger>其他配置</AccordionTrigger>
                <AccordionContent className="pl-2 pr-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <div className="grid gap-1 md:gap-2">
                    <label className="text-sm font-medium">{t('date')}</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "justify-start text-left text-sm font-normal focus-ring",
                            !date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? getFormattedDate(date, locale) : <span>{t('date')}</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 pointer-events-auto" align={isMobile ? "center" : "start"}>
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={(date) => date && setDate(date)}
                          initialFocus
                          className="p-3 pointer-events-auto"
                          locale={locale === 'zh' ? zhCN : enUS}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="grid gap-1 md:gap-2">
                    <label htmlFor="time" className="text-sm font-medium">
                      {t('time')}
                    </label>
                    <Popover open={timePickerOpen} onOpenChange={setTimePickerOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left text-sm font-normal focus-ring",
                            !time && "text-muted-foreground"
                          )}
                        >
                          <Clock className="mr-2 h-4 w-4" />
                          {time || "--:--"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-2 md:p-3 pointer-events-auto" align={isMobile ? "center" : "start"}>
                        <TimePicker 
                          value={time} 
                          onChange={handleTimeChange}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                
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
                </AccordionContent>
              </AccordionItem>
            </Accordion>
                  

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
