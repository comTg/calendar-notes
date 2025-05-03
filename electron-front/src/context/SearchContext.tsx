import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { useCalendar } from './CalendarContext';
import { Note } from '@/types/calendar';

interface SearchContextType {
  searchQuery: string;
  searchResults: Note[];
  isSearching: boolean;
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { notes } = useCalendar();
  
  // 判断是否处于搜索状态
  const isSearching = searchQuery.trim().length > 0;
  
  // 搜索笔记
  const searchResults = useMemo(() => {
    if (!isSearching) return [];
    
    const query = searchQuery.toLowerCase().trim();
    return notes.filter(note => {
      const titleMatch = note.title.toLowerCase().includes(query);
      const contentMatch = note.content.toLowerCase().includes(query);
      const tagsMatch = note.tags?.some(tag => tag.toLowerCase().includes(query)) || false;
      
      return titleMatch || contentMatch || tagsMatch;
    });
  }, [searchQuery, notes, isSearching]);
  
  // 清除搜索
  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);
  
  const value = useMemo(() => ({
    searchQuery,
    searchResults,
    isSearching,
    setSearchQuery,
    clearSearch,
  }), [searchQuery, searchResults, isSearching, clearSearch]);
  
  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = (): SearchContextType => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}; 