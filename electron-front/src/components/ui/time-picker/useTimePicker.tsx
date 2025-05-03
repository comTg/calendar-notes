
import { useState, useEffect, useCallback } from 'react';
import { getHoursArray, getMinutesArray, parseTimeString } from '@/lib/calendar-utils';

export const useTimePicker = (
  initialValue: string, 
  minuteStep: number = 5, 
  onChange?: (value: string, completed?: boolean) => void
) => {
  const { hours: initialHours, minutes: initialMinutes } = parseTimeString(initialValue);
  
  const [selectedHour, setSelectedHour] = useState<string>(initialHours);
  const [selectedMinute, setSelectedMinute] = useState<string>(initialMinutes);
  const [previousHour, setPreviousHour] = useState<string | null>(null);
  
  const hours = getHoursArray();
  const minutes = getMinutesArray(minuteStep);
  
  // Update local state if props value changes
  useEffect(() => {
    const { hours, minutes } = parseTimeString(initialValue);
    setSelectedHour(hours);
    setSelectedMinute(minutes);
  }, [initialValue]);
  
  // Scroll to selected values on mount with a safe timeout
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        const hourElement = document.querySelector(`[data-hour="${selectedHour}"]`);
        const minuteElement = document.querySelector(`[data-minute="${selectedMinute}"]`);
        
        if (hourElement) {
          hourElement.scrollIntoView({ block: 'center', behavior: 'auto' });
        }
        
        if (minuteElement) {
          minuteElement.scrollIntoView({ block: 'center', behavior: 'auto' });
        }
      } catch (err) {
        console.error("Error scrolling time picker into view:", err);
      }
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [selectedHour, selectedMinute]);
  
  const handleHourClick = useCallback((hour: string) => {
    setPreviousHour(selectedHour);
    setSelectedHour(hour);
    
    // Update parent when hour changes, but don't close the picker yet
    if (onChange && hour && selectedMinute) {
      const hourJustChanged = hour !== selectedHour;
      const timeCompleted = hour !== null && selectedMinute !== null && previousHour !== null;
      onChange(`${hour}:${selectedMinute}`, timeCompleted && hourJustChanged);
    }
  }, [selectedHour, selectedMinute, previousHour, onChange]);
  
  const handleMinuteClick = useCallback((minute: string) => {
    setSelectedMinute(minute);
    
    // Update parent when minute changes and consider closing if hour was already selected
    if (onChange && selectedHour && minute) {
      const timeCompleted = selectedHour !== null && minute !== null;
      onChange(`${selectedHour}:${minute}`, timeCompleted);
    }
  }, [selectedHour, onChange]);
  
  return {
    hours,
    minutes,
    selectedHour,
    selectedMinute,
    handleHourClick,
    handleMinuteClick
  };
};
