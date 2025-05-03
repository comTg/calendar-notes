import React, { useState } from 'react';
import { useCalendar } from '@/context/CalendarContext';
import { useLanguage } from '@/context/LanguageContext';
import { format, setMonth, setYear } from 'date-fns';
import { zhCN, enUS } from 'date-fns/locale';
import { ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface HeaderDatePickerProps {
  currentDate: Date;
  calendarMode: string;
  getHeaderTitle: () => string;
}

const HeaderDatePicker: React.FC<HeaderDatePickerProps> = ({
  currentDate,
  calendarMode,
  getHeaderTitle
}) => {
  const { setCurrentDate } = useCalendar();
  const { locale, t } = useLanguage();
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);
  const dateLocale = locale === 'zh' ? zhCN : enUS;

  // Month array with names
  const months = Array.from({ length: 12 }, (_, index) => {
    const monthDate = new Date(currentDate.getFullYear(), index, 1);
    return {
      name: format(monthDate, 'MMMM', { locale: dateLocale }),
      value: index
    };
  });

  // Get an array of years (current year -10 to +10)
  const currentYear = currentDate.getFullYear();
  const years = Array.from({ length: 21 }, (_, index) => currentYear - 10 + index);

  const handleMonthSelect = (month: number) => {
    const newDate = setMonth(currentDate, month);
    setCurrentDate(newDate);
    setMonthPickerOpen(false);
  };

  const handleYearSelect = (year: string) => {
    const newDate = setYear(currentDate, parseInt(year));
    setCurrentDate(newDate);
  };

  return (
    <Popover open={monthPickerOpen} onOpenChange={setMonthPickerOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost"
          className="text-sm font-medium min-w-28 text-center flex items-center space-x-1"
        >
          <span>{getHeaderTitle()}</span>
          <ChevronsUpDown className="h-3.5 w-3.5 opacity-70" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-auto p-0 bg-card shadow-lg border rounded-md" 
        align="center" 
        sideOffset={4}
      >
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">{t('year')}</h3>
            <Select
              value={currentDate.getFullYear().toString()}
              onValueChange={handleYearSelect}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('selectYear')} />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium">{t('month')}</h3>
            <div className="grid grid-cols-3 gap-2">
              {months.map((month) => (
                <Button
                  key={month.value}
                  variant={currentDate.getMonth() === month.value ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => handleMonthSelect(month.value)}
                  className="h-9 text-xs capitalize"
                >
                  {month.name}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default React.memo(HeaderDatePicker);
