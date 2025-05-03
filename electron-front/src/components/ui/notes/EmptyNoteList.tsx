
import React from 'react';
import { CalendarIcon } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const EmptyNoteList: React.FC = () => {
  const { t } = useLanguage();
  
  return (
    <div className="h-full flex flex-col items-center justify-center p-6 text-center">
      <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium">{t('noNotes')}</h3>
      <p className="text-sm text-muted-foreground mt-2 max-w-xs">
        {t('clickAddNote')}
      </p>
    </div>
  );
};

export default React.memo(EmptyNoteList);
