import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSearch } from '@/context/SearchContext';
import { useLanguage } from '@/context/LanguageContext';

const SearchBar: React.FC = () => {
  const { searchQuery, setSearchQuery, clearSearch, isSearching } = useSearch();
  const [focused, setFocused] = useState(false);
  const { t } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);
  
  // 键盘快捷键: Ctrl+K 或 Cmd+K 聚焦搜索框
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      
      // ESC 键清除搜索或取消焦点
      if (e.key === 'Escape' && isSearching) {
        clearSearch();
        inputRef.current?.blur();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [clearSearch, isSearching]);
  
  return (
    <div className={`relative ${focused || isSearching ? 'w-full md:w-64' : 'w-9 md:w-9'} transition-all duration-200`}>
      <div className="relative flex items-center">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute left-0 h-9 w-9 text-muted-foreground hover:bg-transparent"
          onClick={() => inputRef.current?.focus()}
        >
          <Search className="h-4 w-4" />
        </Button>
        
        <Input
          ref={inputRef}
          type="text"
          placeholder={t('searchNotes')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`h-9 pl-9 pr-9 bg-muted/50 focus-visible:ring-0 focus-visible:ring-offset-0 ${
            focused || isSearching ? 'w-full opacity-100' : 'w-9 opacity-0 md:opacity-0'
          } transition-all duration-200`}
        />
        
        {isSearching && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 h-9 w-9 text-muted-foreground hover:bg-transparent"
            onClick={clearSearch}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {focused && !isSearching && (
        <div className="absolute right-3 top-2 text-xs text-muted-foreground hidden md:block">
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium">
            <span className="text-xs">⌘</span>K
          </kbd>
        </div>
      )}
    </div>
  );
};

export default SearchBar; 