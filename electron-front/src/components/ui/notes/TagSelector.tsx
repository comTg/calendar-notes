
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TranslationKey } from '@/types/translations';

interface TagSelectorProps {
  tags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  availableTags: string[];
}

const TagSelector: React.FC<TagSelectorProps> = ({
  tags,
  onAddTag,
  onRemoveTag,
  availableTags,
}) => {
  const { t } = useLanguage();
  
  return (
    <div className="grid gap-2">
      <label className="text-sm font-medium">{t('tags')}</label>
      <Select onValueChange={onAddTag}>
        <SelectTrigger className="focus-ring mb-2">
          <SelectValue placeholder={t('addTag')} />
        </SelectTrigger>
        <SelectContent>
          {availableTags
            .filter(tag => !tags.includes(tag))
            .map(tag => (
              <SelectItem key={tag} value={tag}>
                {t(tag as TranslationKey)}
              </SelectItem>
            ))
          }
        </SelectContent>
      </Select>
      
      <div className="flex flex-wrap gap-2 min-h-[32px]">
        {tags.map((tag) => (
          <div 
            key={tag}
            className="flex items-center px-3 py-1 text-xs rounded-full bg-secondary text-secondary-foreground gap-1 transition-colors hover:bg-secondary/80"
          >
            <span>{t(tag as TranslationKey)}</span>
            <button 
              type="button" 
              onClick={() => onRemoveTag(tag)}
              className="h-4 w-4 rounded-full hover:bg-secondary-foreground/20 flex items-center justify-center"
              aria-label={`Remove ${t(tag as TranslationKey)} tag`}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(TagSelector);
