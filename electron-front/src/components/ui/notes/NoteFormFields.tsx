import React, { useCallback, useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import MDEditor from '@uiw/react-md-editor';
import { useTheme } from 'next-themes';

import { useIsMobile } from '@/hooks/use-mobile';

// 导入Markdown编辑器的CSS文件
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';

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
  const [previewMode, setPreviewMode] = useState<'edit' | 'preview' | 'live'>('edit');
  const isMobile = useIsMobile();
  const { resolvedTheme } = useTheme();
  const [colorMode, setColorMode] = useState<'light' | 'dark'>('light');

  // 设置颜色模式跟随系统主题
  useEffect(() => {
    setColorMode(resolvedTheme === 'dark' ? 'dark' : 'light');
  }, [resolvedTheme]);

  // 在移动设备上默认使用编辑模式，桌面设备使用实时预览模式
  useEffect(() => {
    setPreviewMode(isMobile ? 'edit' : 'edit');
  }, [isMobile]);

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
        <div className="wmde-markdown-var" data-color-mode={colorMode}>
          <MDEditor
            value={content}
            onChange={(value) => setContent(value || '')}
            preview={previewMode}
            height={isMobile ? 200 : 300}
            visibleDragbar={true}
            extraCommands={[
              {
                name: 'preview',
                keyCommand: 'preview',
                buttonProps: { 'aria-label': 'Preview' },
                icon: (
                  <svg viewBox="0 0 16 16" width="12px" height="12px">
                    <path d="M1.5 3.5v9c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-9c0-.55-.45-1-1-1h-12c-.55 0-1 .45-1 1z" fill="currentColor" />
                    <path d="M8 4.5c-1.93 0-3.5 1.57-3.5 3.5s1.57 3.5 3.5 3.5 3.5-1.57 3.5-3.5-1.57-3.5-3.5-3.5z" fill="currentColor" />
                  </svg>
                ),
                execute: () => {
                  setPreviewMode(previewMode === 'edit' ? 'preview' : previewMode === 'preview' ? 'live' : 'edit');
                },
              }
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default React.memo(NoteFormFields);
