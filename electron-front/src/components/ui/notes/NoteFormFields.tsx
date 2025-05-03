
import React, { useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { CalendarIcon, Clock } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { tr, enUS } from 'date-fns/locale';
import { getFormattedDate } from '@/lib/calendar-utils';
import TimePicker from '@/components/ui/time-picker/TimePicker';
import { useIsMobile } from '@/hooks/use-mobile';

interface NoteFormFieldsProps {
  title: string;
  content: string;
  date: Date;
  time: string;
  setTitle: (title: string) => void;
  setContent: (content: string) => void;
  setDate: (date: Date | undefined) => void;
  setTime: (time: string) => void;
  timePickerOpen: boolean;
  setTimePickerOpen: (open: boolean) => void;
}

const NoteFormFields: React.FC<NoteFormFieldsProps> = ({
  title,
  content,
  date,
  time,
  setTitle,
  setContent,
  setDate,
  setTime,
  timePickerOpen,
  setTimePickerOpen
}) => {
  const { t, locale } = useLanguage();
  const isMobile = useIsMobile();
  
  const handleTimeChange = useCallback((newTime: string, completed: boolean) => {
    setTime(newTime);
    
    // Only close the picker if both hour and minute have been selected
    if (completed) {
      setTimePickerOpen(false);
    }
  }, [setTime, setTimePickerOpen]);

  return (
    <div className="grid gap-3 md:gap-4">
      <div className="grid gap-1 md:gap-2">
        <label htmlFor="title" className="text-sm font-medium">
          {t('title')}
        </label>
        <Input
          id="title"
          placeholder={t('title')}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="focus-ring"
        />
      </div>
      
      <div className="grid gap-1 md:gap-2">
        <label htmlFor="content" className="text-sm font-medium">
          {t('content')}
        </label>
        <Textarea
          id="content"
          placeholder={t('content')}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[80px] md:min-h-[100px] focus-ring"
        />
      </div>
      
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
                locale={locale === 'tr' ? tr : enUS}
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
    </div>
  );
};

export default React.memo(NoteFormFields);
