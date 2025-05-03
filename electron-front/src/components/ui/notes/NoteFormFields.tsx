
import React, { useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import { useIsMobile } from '@/hooks/use-mobile';

interface NoteFormFieldsProps {
  title: string;
  content: string;
  date: Date;
  time: string;
  setTitle: (title: string) => void;
  setContent: (content: string) => void;
  setTime: (time: string) => void;
  timePickerOpen: boolean;
  setTimePickerOpen: (open: boolean) => void;
}

const NoteFormFields: React.FC<NoteFormFieldsProps> = ({
  title,
  content,
  setTitle,
  setContent,
}) => {
  const { t } = useLanguage();

  return (
    <div className="grid gap-3 md:gap-4">
      <div className="grid gap-1 md:gap-2">
        <label htmlFor="title" className="text-sm font-medium">
          {t('title')}
        </label>
        <Input
          id="title"
          placeholder={t('title')}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="focus-ring"
        />
      </div>
      
      <div className="grid gap-1 md:gap-2">
        <label htmlFor="content" className="text-sm font-medium">
          {t('content')}
        </label>
        <Textarea
          id="content"
          placeholder={t('content')}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[80px] md:min-h-[100px] focus-ring"
        />
      </div>

    </div>
  );
};

export default React.memo(NoteFormFields);
