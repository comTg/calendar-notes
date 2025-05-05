import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  mode: initialMode,
  preSelectedTime
}) => {
  const { selectedDate, addNote, updateNote, notes } = useCalendar();
  const { t, locale } = useLanguage();
  
  // 将模式状态化，允许从新增转为编辑
  const [mode, setMode] = useState(initialMode);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [time, setTime] = useState('12:00');
  const [tags, setTags] = useState<string[]>([]);
  const [color, setColor] = useState('#3498db');
  const [reminder, setReminder] = useState<Date | null>(null);
  const [timePickerOpen, setTimePickerOpen] = useState(false);
  const isMobile = useIsMobile();
  
  // 自动保存相关状态
  const [lastInputTime, setLastInputTime] = useState<number>(0);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [currentNoteId, setCurrentNoteId] = useState<string | null>(null);
  const AUTO_SAVE_DELAY = 3000; // 3秒无输入后自动保存
  const AUTO_SAVE_MESSAGE_DURATION = 2000; // 显示自动保存消息的时长
  
  const handleTimeChange = useCallback((newTime: string, completed: boolean | undefined) => {
    setTime(newTime);
    setLastInputTime(Date.now());
    
    // Only close the picker if both hour and minute have been selected
    if (completed) {
      setTimePickerOpen(false);
    }
  }, [setTime, setTimePickerOpen]);
  
  const tagOptions = [
    'work', 'personal', 'important', 'meeting', 'reminder', 'idea', 'task'
  ];
  
  useEffect(() => {
    // 使用initialMode而不是mode，确保每次打开对话框时重置到初始状态
    if (initialMode === 'add') {
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
      setCurrentNoteId(null); // 重置当前笔记ID
      setMode('add'); // 重置模式
    } else if (initialMode === 'edit' && note) {
      setTitle(note.title);
      setContent(note.content);
      setDate(new Date(note.date));
      setTime(format(new Date(note.date), 'HH:mm'));
      setTags(note.tags || []);
      setColor(note.color || '#3498db');
      setReminder(note.reminder || null);
      setCurrentNoteId(note.id); // 设置当前编辑的笔记ID
      setMode('edit'); // 设置为编辑模式
    }
    
    setAutoSaveStatus('idle');
    setLastInputTime(0);
  }, [initialMode, note, selectedDate, preSelectedTime, open]);
  
  // 处理内容变化，更新最后输入时间
  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setLastInputTime(Date.now());
  };
  
  // 处理标题变化，更新最后输入时间
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    setLastInputTime(Date.now());
  };
  
  // 自动保存功能
  useEffect(() => {
    // 清除之前的定时器
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    
    // 只有在已打开对话框且有输入时才设置自动保存
    if (open && lastInputTime > 0 && (title.trim() || content.trim())) {
      autoSaveTimerRef.current = setTimeout(() => {
        autoSave();
      }, AUTO_SAVE_DELAY);
    }
    
    // 组件卸载时清除定时器
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [lastInputTime, title, content, open]);
  
  // 在Notes列表更新后，检查是否是我们刚自动保存的笔记
  useEffect(() => {
    if (mode === 'add' && autoSaveStatus === 'saving' && currentNoteId === null) {
      // 通过搜索匹配的标题和内容找到我们刚刚创建的笔记
      const possibleNewNote = notes.find(n => 
        n.title === title && 
        n.content === content && 
        new Date(n.date).toDateString() === date.toDateString()
      );
      
      if (possibleNewNote) {
        setCurrentNoteId(possibleNewNote.id);
        setMode('edit'); // 切换到编辑模式
      }
    }
  }, [notes, mode, autoSaveStatus, currentNoteId, title, content, date]);
  
  // 自动保存逻辑
  const autoSave = () => {
    if (!title.trim() && !content.trim()) return;
    
    setAutoSaveStatus('saving');
    
    const [hours, minutes] = time.split(':').map(Number);
    const noteDate = new Date(date);
    noteDate.setHours(hours, minutes, 0, 0);
    
    const noteData = {
      title,
      content,
      date: noteDate,
      tags,
      color,
      reminder,
      isPinned: false,
      isCompleted: false,
    };
    
    if (currentNoteId && mode === 'edit') {
      // 在编辑模式下更新已有笔记
      const currentNote = notes.find(n => n.id === currentNoteId);
      if (currentNote) {
        updateNote({
          ...currentNote,
          ...noteData
        }, false);
      }
    } else {
      // 在新增模式下创建新笔记
      addNote(noteData, false);
      // 实际的笔记ID将在notes列表更新后通过副作用获取
    }
    
    // 显示自动保存成功状态
    setTimeout(() => {
      setAutoSaveStatus('saved');
      
      // 一段时间后隐藏保存提示
      setTimeout(() => {
        setAutoSaveStatus('idle');
      }, AUTO_SAVE_MESSAGE_DURATION);
    }, 500);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const [hours, minutes] = time.split(':').map(Number);
    const noteDate = new Date(date);
    noteDate.setHours(hours, minutes, 0, 0);
    
    const noteData = {
      title,
      content,
      date: noteDate,
      tags,
      color,
      reminder,
      isPinned: false,
      isCompleted: false,
    };
    
    if (currentNoteId) {
      // 如果有当前编辑的笔记ID（可能是从自动保存获取的）
      const currentNote = notes.find(n => n.id === currentNoteId);
      if (currentNote) {
        updateNote({
          ...currentNote,
          ...noteData
        });
      }
    } else if (mode === 'add') {
      // 新增模式且没有自动保存过
      addNote(noteData);
    } else if (mode === 'edit' && note) {
      // 编辑已有笔记
      updateNote({
        ...note,
        ...noteData
      });
    }
    
    onOpenChange(false);
  };
  
  const handleAddTag = (newTag: string) => {
    if (!tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setLastInputTime(Date.now());
    }
  };
  
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
    setLastInputTime(Date.now());
  };
  
  const handleColorSelect = (newColor: string) => {
    setColor(newColor);
    setLastInputTime(Date.now());
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[850px] max-h-full overflow-y-auto animate-in scale-in">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {mode === 'add' ? t('addNote') : t('editNote')}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm flex items-center gap-3">
              <span>{mode === 'add' ? t('createNote') : t('updateNote')}</span>
              {/* 自动保存状态提示 */}
              {autoSaveStatus !== 'idle' && (
                <div className="text-center">
                  <p className={cn(
                    "text-sm transition-opacity duration-200 rounded-md px-2 inline-block",
                    autoSaveStatus === 'saving' 
                      ? "bg-yellow-50 text-yellow-600" 
                      : "bg-emerald-50 text-emerald-600"
                  )}>
                    {autoSaveStatus === 'saving' 
                      ? (t('autoSaving' as any) || '正在自动保存...') 
                      : (t('autoSaved' as any) || '已自动保存')}
                  </p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <NoteFormFields
              title={title}
              content={content}
              date={date}
              time={time}
              setTitle={handleTitleChange}
              setContent={handleContentChange}
              setTime={(time: string) => handleTimeChange(time, undefined)}
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
                          onSelect={(date) => {
                            if (date) {
                              setDate(date);
                              setLastInputTime(Date.now());
                            }
                          }}
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
                    onColorSelect={handleColorSelect}
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
