
export type CalendarMode = 'month' | 'week' | 'day';

export interface Note {
  id: string;
  title: string;
  content: string;
  date: Date;
  tags?: string[];
  color?: string;
  reminder?: Date | null;
  isPinned?: boolean;
  isCompleted?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  notes: Note[];
}

export interface CalendarWeek {
  days: CalendarDay[];
}

export interface CalendarMonth {
  month: number;
  year: number;
  weeks: CalendarWeek[];
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}
