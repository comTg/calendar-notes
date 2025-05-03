
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';

interface NoteFormActionsProps {
  mode: 'add' | 'edit';
  onCancel: () => void;
}

const NoteFormActions: React.FC<NoteFormActionsProps> = ({ mode, onCancel }) => {
  const { t } = useLanguage();
  
  return (
    <>
      <Button 
        type="button" 
        variant="secondary" 
        onClick={onCancel}
      >
        {t('cancel')}
      </Button>
      <Button type="submit">
        {mode === 'add' ? t('save') : t('update')}
      </Button>
    </>
  );
};

export default React.memo(NoteFormActions);
