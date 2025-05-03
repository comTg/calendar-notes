import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, addDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Note, useNoteStore } from '@/lib/store';
import { NoteDialog } from './note-dialog';

interface CalendarViewProps {
  onSelectDate?: (date: Date | null) => void;
}

export function CalendarView({ onSelectDate }: CalendarViewProps = {}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentView, setCurrentView] = useState<'month' | 'week' | 'day'>('month');
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  
  const { notes, getNotesByDate } = useNoteStore();

  // 当选中的日期变化时，通知父组件
  useEffect(() => {
    if (onSelectDate) {
      onSelectDate(selectedDate);
    }
  }, [selectedDate, onSelectDate]);

  const nextMonth = () => {
    if (currentView === 'month') {
      setCurrentDate(addMonths(currentDate, 1));
    } else if (currentView === 'week') {
      setCurrentDate(addDays(currentDate, 7));
    } else {
      setCurrentDate(addDays(currentDate, 1));
    }
  };

  const prevMonth = () => {
    if (currentView === 'month') {
      setCurrentDate(subMonths(currentDate, 1));
    } else if (currentView === 'week') {
      setCurrentDate(addDays(currentDate, -7));
    } else {
      setCurrentDate(addDays(currentDate, -1));
    }
  };

  const today = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  // 生成当前月的日期数组
  const getDaysInMonth = () => {
    const start = startOfWeek(startOfMonth(currentDate));
    const end = endOfWeek(endOfMonth(currentDate));
    return eachDayOfInterval({ start, end });
  };

  // 生成当前周的日期数组
  const getDaysInWeek = () => {
    const start = startOfWeek(currentDate);
    const end = endOfWeek(currentDate);
    return eachDayOfInterval({ start, end });
  };

  // 格式化日期为 'yyyy-MM-dd'
  const formatDateToString = (date: Date) => {
    return format(date, 'yyyy-MM-dd');
  };

  // 获取某日期的笔记
  const getNotesForDate = (date: Date) => {
    return getNotesByDate(formatDateToString(date));
  };

  // 处理日期点击
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  // 处理日期双击 - 打开笔记创建对话框
  const handleDateDoubleClick = (date: Date) => {
    setSelectedDate(date);
    setIsNoteDialogOpen(true);
  };

  // 渲染月视图
  const renderMonthView = () => {
    const days = getDaysInMonth();
    const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

    return (
      <div className="month-view">
        <div className="grid grid-cols-7 mb-2">
          {weekDays.map((day) => (
            <div key={day} className="text-center p-2 font-medium">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, i) => {
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isToday = isSameDay(day, new Date());
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const dayNotes = getNotesForDate(day);
            
            return (
              <div 
                key={i}
                className={cn(
                  "min-h-24 p-2 border rounded-md overflow-hidden",
                  !isCurrentMonth && "text-gray-400 bg-gray-50",
                  isToday && "border-blue-300",
                  isSelected && "border-blue-500 bg-blue-50",
                  "transition-colors duration-200 cursor-pointer"
                )}
                onClick={() => handleDateClick(day)}
                onDoubleClick={() => handleDateDoubleClick(day)}
              >
                <div className="font-medium text-sm">{format(day, 'd')}</div>
                <div className="mt-1 space-y-1">
                  {dayNotes.slice(0, 2).map((note) => (
                    <div key={note.id} className="text-xs p-1 bg-blue-100 rounded truncate">
                      {note.content}
                    </div>
                  ))}
                  {dayNotes.length > 2 && (
                    <div className="text-xs text-gray-500 flex items-center justify-center">
                      +{dayNotes.length - 2} 更多
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // 渲染周视图
  const renderWeekView = () => {
    const days = getDaysInWeek();
    
    return (
      <div className="week-view space-y-2">
        <div className="grid grid-cols-7 mb-2">
          {days.map((day) => (
            <div key={format(day, 'yyyy-MM-dd')} className="text-center p-2">
              <div className="font-medium">{format(day, 'E')}</div>
              <div 
                className={cn(
                  "text-sm rounded-full w-8 h-8 flex items-center justify-center mx-auto",
                  isSameDay(day, new Date()) && "bg-blue-500 text-white"
                )}
              >
                {format(day, 'd')}
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-2">
          {Array.from({ length: 12 }).map((_, hour) => (
            <div 
              key={hour} 
              className="grid grid-cols-7 border-t py-2"
            >
              {days.map((day) => {
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                return (
                  <div 
                    key={format(day, 'yyyy-MM-dd')+hour} 
                    className={cn(
                      "p-2 min-h-16 border-r",
                      isSelected && "bg-blue-50"
                    )}
                    onClick={() => handleDateClick(day)}
                    onDoubleClick={() => handleDateDoubleClick(day)}
                  >
                    <div className="text-xs text-gray-500">{`${hour + 8}:00`}</div>
                    <div className="space-y-1 mt-1">
                      {getNotesForDate(day).slice(0, 1).map((note) => (
                        <div key={note.id} className="text-xs p-1 bg-blue-100 rounded truncate">
                          {note.content}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 渲染日视图
  const renderDayView = () => {
    const dayDate = selectedDate || currentDate;
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const dayNotes = getNotesForDate(dayDate);
    
    return (
      <div className="day-view space-y-2">
        <div className="text-center p-4">
          <div className="font-bold">{format(dayDate, 'yyyy年MM月dd日')}</div>
          <div className="text-gray-500">{format(dayDate, 'EEEE')}</div>
        </div>
        <div className="space-y-1">
          {hours.map((hour) => (
            <div 
              key={hour} 
              className="grid grid-cols-12 border-t py-2"
              onDoubleClick={() => handleDateDoubleClick(dayDate)}
            >
              <div className="col-span-1 text-right pr-2 text-gray-500">
                {`${hour}:00`}
              </div>
              <div className="col-span-11 p-2 min-h-16 border-l">
                {dayNotes.map((note) => (
                  <div key={note.id} className="text-sm p-2 mb-1 bg-blue-100 rounded">
                    {note.content}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="calendar-container">
      <div className="flex justify-between items-center p-4 border-b">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={today}>
            今天
          </Button>
          <h2 className="text-xl font-bold">
            {currentView === 'month' && format(currentDate, 'yyyy年MM月')}
            {currentView === 'week' && `${format(startOfWeek(currentDate), 'MM/dd')} - ${format(endOfWeek(currentDate), 'MM/dd')}`}
            {currentView === 'day' && format(selectedDate || currentDate, 'yyyy年MM月dd日')}
          </h2>
        </div>
        <Tabs 
          defaultValue="month"
          value={currentView} 
          onValueChange={(v) => setCurrentView(v as 'month' | 'week' | 'day')}
        >
          <TabsList>
            <TabsTrigger value="month">月</TabsTrigger>
            <TabsTrigger value="week">周</TabsTrigger>
            <TabsTrigger value="day">日</TabsTrigger>
          </TabsList>
        </Tabs>
        {selectedDate && (
          <Button onClick={() => setIsNoteDialogOpen(true)}>
            新建笔记
          </Button>
        )}
      </div>

      <div className="p-4">
        {currentView === 'month' && renderMonthView()}
        {currentView === 'week' && renderWeekView()}
        {currentView === 'day' && renderDayView()}
      </div>

      {selectedDate && (
        <NoteDialog
          date={selectedDate}
          open={isNoteDialogOpen}
          onOpenChange={setIsNoteDialogOpen}
        />
      )}
    </div>
  );
} 