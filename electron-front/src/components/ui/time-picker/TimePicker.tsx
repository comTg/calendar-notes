
import React from 'react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import TimePickerColumn from './TimePickerColumn';
import { useTimePicker } from './useTimePicker';
import { useIsMobile } from '@/hooks/use-mobile';

interface TimePickerProps {
  value: string; // "HH:mm" format
  onChange: (value: string, completed?: boolean) => void;
  minuteStep?: number;
  className?: string;
}

const TimePicker: React.FC<TimePickerProps> = ({
  value,
  onChange,
  minuteStep = 5,
  className
}) => {
  const { locale } = useLanguage();
  const isMobile = useIsMobile();
  const { 
    hours, 
    minutes, 
    selectedHour, 
    selectedMinute, 
    handleHourClick, 
    handleMinuteClick 
  } = useTimePicker(value, minuteStep, onChange);
  
  const hourTitle = locale === 'tr' ? 'Saat' : 'Hour';
  const minuteTitle = locale === 'tr' ? 'Dakika' : 'Minute';

  return (
    <div className={cn("flex gap-2 md:gap-4 p-1 md:p-2", className)}>
      <TimePickerColumn
        title={hourTitle}
        items={hours}
        selectedItem={selectedHour}
        onItemClick={handleHourClick}
        dataAttrKey="hour"
      />
      
      <TimePickerColumn
        title={minuteTitle}
        items={minutes}
        selectedItem={selectedMinute}
        onItemClick={handleMinuteClick}
        dataAttrKey="minute"
      />
    </div>
  );
};

export default React.memo(TimePicker);
