
import React from 'react';
import { Note } from '@/types/calendar';
import { useLanguage } from '@/context/LanguageContext';
import { Pencil, Trash2, PinIcon, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getFormattedDateTime } from '@/lib/calendar-utils';
import { TranslationKey } from '@/types/translations';
import { useIsMobile } from '@/hooks/use-mobile';

interface NoteItemProps {
  note: Note;
  onTogglePin: (note: Note) => void;
  onToggleComplete: (note: Note) => void;
  onEditClick: (note: Note) => void;
  onDeleteClick: (noteId: string) => void;
}

const NoteItem: React.FC<NoteItemProps> = ({ 
  note, 
  onTogglePin, 
  onToggleComplete,
  onEditClick,
  onDeleteClick 
}) => {
  const { locale, t } = useLanguage();
  const isMobile = useIsMobile();

  return (
    <div className="group p-2 md:p-3 rounded-lg transition-all hover:bg-secondary/20">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 flex-1">
          <button
            onClick={() => onToggleComplete(note)}
            className="mt-1"
            aria-label={note.isCompleted ? t('markIncomplete') : t('markComplete')}
          >
            <CheckCircle className={`h-4 w-4 ${note.isCompleted ? 'text-primary' : 'text-muted-foreground/40'}`} />
          </button>
          
          <div className={`flex-1 ${note.isCompleted ? 'line-through text-muted-foreground' : ''}`}>
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm">{note.title}</h3>
              <div className="flex items-center">
                {/* Always show buttons on mobile, hover on desktop */}
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-7 w-7 ${isMobile ? '' : 'opacity-0 group-hover:opacity-100 transition-opacity'}`}
                  onClick={() => onTogglePin(note)}
                  aria-label={note.isPinned ? t('unpin') : t('pin')}
                >
                  <PinIcon 
                    className={`h-4 w-4 ${note.isPinned ? 'text-primary' : 'text-muted-foreground'}`} 
                    fill={note.isPinned ? "currentColor" : "none"}
                  />
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-7 w-7 ${isMobile ? '' : 'opacity-0 group-hover:opacity-100 transition-opacity'}`}
                  onClick={() => onEditClick(note)}
                  aria-label={t('edit')}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-7 w-7 ${isMobile ? '' : 'opacity-0 group-hover:opacity-100 transition-opacity'} text-destructive`}
                  onClick={() => onDeleteClick(note.id)}
                  aria-label={t('delete')}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {note.content}
            </p>
            
            <div className="flex items-center justify-between flex-wrap gap-1 mt-2">
              <div className="text-xs text-muted-foreground">
                {getFormattedDateTime(new Date(note.date), locale)}
              </div>
              
              {note.tags && note.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {note.tags.map(tag => (
                    <span 
                      key={tag}
                      className="px-2 py-0.5 text-xs rounded-full bg-secondary text-secondary-foreground"
                    >
                      {t(tag as TranslationKey)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div 
        className="w-full h-0.5 mt-2 rounded-full"
        style={{ backgroundColor: note.color ? `${note.color}30` : undefined }}
      />
    </div>
  );
};

export default React.memo(NoteItem);
