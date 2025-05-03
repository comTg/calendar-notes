
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';

interface HeaderNavigationProps {
  prevPeriod: () => void;
  nextPeriod: () => void;
  goToToday: () => void;
}

const HeaderNavigation: React.FC<HeaderNavigationProps> = ({
  prevPeriod,
  nextPeriod,
  goToToday
}) => {
  const { t } = useLanguage();

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={prevPeriod}
        aria-label="Previous"
        className="focus-ring h-8 w-8"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={goToToday}
        className="text-xs focus-ring px-3"
      >
        {t('today')}
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={nextPeriod}
        aria-label="Next"
        className="focus-ring h-8 w-8"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default React.memo(HeaderNavigation);
