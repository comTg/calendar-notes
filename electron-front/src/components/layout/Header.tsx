import React, { useCallback, useState } from 'react';
import { useCalendar } from '@/context/CalendarContext';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { zhCN, enUS } from 'date-fns/locale';
import { Calendar, Menu, Plus, X } from 'lucide-react';
import HeaderDatePicker from './HeaderDatePicker';
import HeaderViewToggle from './HeaderViewToggle';
import HeaderControls from './HeaderControls';
import HeaderNavigation from './HeaderNavigation';
import { useIsMobile } from '@/hooks/use-mobile';
import SearchBar from './SearchBar';

interface HeaderProps {
  onAddNote: () => void;
}

const Header: React.FC<HeaderProps> = ({ onAddNote }) => {
  const { 
    currentDate, 
    calendarMode, 
    setCalendarMode, 
    nextPeriod, 
    prevPeriod,
    setCurrentDate 
  } = useCalendar();
  
  const { locale, t } = useLanguage();
  const dateLocale = locale === 'zh' ? zhCN : enUS;
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false);

  const getHeaderTitle = useCallback((): string => {
    return format(currentDate, 'MMM dd, yyyy', { locale: dateLocale });
    // switch (calendarMode) {
    //   case 'month':
    //     return format(currentDate, 'MMM dd, yyyy', { locale: dateLocale });
    //   case 'week':
    //     return format(currentDate, 'MMM dd, yyyy', { locale: dateLocale });
    //   case 'day':
    //     return format(currentDate, 'MMM dd, yyyy', { locale: dateLocale });
    //   default:
    //     return '';
    // }
  // }, [calendarMode, currentDate, dateLocale]);
  }, [currentDate, dateLocale]);

  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
  }, [setCurrentDate]);
  
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  if (isMobile) {
    return (
      <header className="flex flex-col glass-effect sticky top-0 z-10 animate-in fade-in">
        <div className="flex items-center justify-between p-2">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold text-balance truncate">{t('calendarNotes')}</h1>
          </div>
          
          <div className="flex items-center gap-1">
            <SearchBar />
            
            <Button
              variant="default"
              size="icon"
              onClick={onAddNote}
              className="h-8 w-8"
            >
              <Plus className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMenu}
              className="h-8 w-8"
            >
              {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        
        {menuOpen && (
          <div className="p-2 animate-in slide-in">
            <HeaderViewToggle 
              calendarMode={calendarMode}
              setCalendarMode={setCalendarMode}
            />
            
            <div className="flex items-center justify-center mt-2">
              <HeaderNavigation
                prevPeriod={prevPeriod}
                nextPeriod={nextPeriod}
                goToToday={goToToday}
              />
              
              <HeaderDatePicker 
                currentDate={currentDate}
                calendarMode={calendarMode}
                getHeaderTitle={getHeaderTitle}
              />
            </div>
            
            <div className="mt-2">
              <HeaderControls />
            </div>
          </div>
        )}
        
        {!menuOpen && (
          <div className="flex items-center justify-between px-2 py-1 border-t border-border/30">
            <HeaderNavigation
              prevPeriod={prevPeriod}
              nextPeriod={nextPeriod}
              goToToday={goToToday}
            />
            
            <HeaderDatePicker 
              currentDate={currentDate}
              calendarMode={calendarMode}
              getHeaderTitle={getHeaderTitle}
            />
          </div>
        )}
      </header>
    );
  }

  return (
    <header className="flex items-center justify-between p-2 glass-effect sticky top-0 z-10 animate-in fade-in">
      <div className="flex items-center space-x-2">
        <Calendar className="h-5 w-5 text-primary" />
        <h1 className="text-xl font-semibold text-balance">{t('calendarNotes')}</h1>
      </div>
      
      <div className="flex flex-1 justify-center">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <HeaderNavigation 
              prevPeriod={prevPeriod}
              nextPeriod={nextPeriod}
              goToToday={goToToday}
            />
            
            <HeaderDatePicker 
              currentDate={currentDate}
              calendarMode={calendarMode}
              getHeaderTitle={getHeaderTitle}
            />
          </div>
          
          <HeaderViewToggle 
            calendarMode={calendarMode}
            setCalendarMode={setCalendarMode}
          />
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <SearchBar />
        
        <Button
          variant="default"
          size="sm"
          onClick={onAddNote}
          className="focus-ring"
        >
          <Plus className="h-4 w-4 mr-1" />
          <span>{t('addNote')}</span>
        </Button>
        
        <HeaderControls />
      </div>
    </header>
  );
};

export default Header;
