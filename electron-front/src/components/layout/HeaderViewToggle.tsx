
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { CalendarMode } from '@/types/calendar';

interface HeaderViewToggleProps {
  calendarMode: CalendarMode;
  setCalendarMode: (mode: CalendarMode) => void;
}

const HeaderViewToggle: React.FC<HeaderViewToggleProps> = ({
  calendarMode,
  setCalendarMode
}) => {
  const { t } = useLanguage();

  const viewOptions: { label: string; value: CalendarMode }[] = [
    { label: t('month'), value: 'month' },
    { label: t('week'), value: 'week' },
    { label: t('day'), value: 'day' },
  ];

  return (
    <div className="flex items-center space-x-2">
      {viewOptions.map((option) => (
        <Button
          key={option.value}
          variant={calendarMode === option.value ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setCalendarMode(option.value)}
          className="text-xs focus-ring px-3"
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
};

export default React.memo(HeaderViewToggle);
