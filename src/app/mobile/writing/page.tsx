'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Save, Share, MoreHorizontal, Edit3, Eye, Settings2 } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { usePathname } from 'next/navigation';
import CustomHeader from './custom-header';
import '../mobile-styles.scss';

interface WritingPageProps {
  searchParams?: {
    file?: string;
    folder?: string;
  };
}

export default function WritingPage({ searchParams }: WritingPageProps) {
  const [content, setContent] = useState('');
  const [isEditing, setIsEditing] = useState(true);
  const [fileName, setFileName] = useState('新文档.md');
  const [filePath, setFilePath] = useState('/');
  const [isSaving, setIsSaving] = useState(false);
  const [showToolbar, setShowToolbar] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  
  const { currentFile, saveFile } = useStore();

  useEffect(() => {
    if (searchParams?.file) {
      setFileName(decodeURIComponent(searchParams.file));
    }
    if (searchParams?.folder) {
      setFilePath(decodeURIComponent(searchParams.folder));
    }
    if (currentFile) {
      setContent(currentFile.content || '');
      setFileName(currentFile.name);
      setFilePath(currentFile.path);
    }
  }, [searchParams, currentFile]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveFile({
        name: fileName,
        path: filePath,
        content,
        lastModified: new Date()
      });
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const insertMarkdown = (syntax: string, placeholder: string = '') => {
    const textarea = editorRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const replacement = selectedText || placeholder;
    
    let newContent: string;
    let newCursorPos: number;

    switch (syntax) {
      case 'bold':
        newContent = content.substring(0, start) + `**${replacement}**` + content.substring(end);
        newCursorPos = start + 2 + replacement.length;
        break;
      case 'italic':
        newContent = content.substring(0, start) + `*${replacement}*` + content.substring(end);
        newCursorPos = start + 1 + replacement.length;
        break;
      case 'heading':
        newContent = content.substring(0, start) + `# ${replacement}` + content.substring(end);
        newCursorPos = start + 2 + replacement.length;
        break;
      case 'list':
        newContent = content.substring(0, start) + `- ${replacement}` + content.substring(end);
        newCursorPos = start + 2 + replacement.length;
        break;
      case 'link':
        newContent = content.substring(0, start) + `[${replacement}](url)` + content.substring(end);
        newCursorPos = start + replacement.length + 3;
        break;
      case 'code':
        newContent = content.substring(0, start) + `\`${replacement}\`` + content.substring(end);
        newCursorPos = start + 1 + replacement.length;
        break;
      default:
        return;
    }

    setContent(newContent);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  return (
    <div className="mobile-writing">
      <CustomHeader 
        fileName={fileName}
        filePath={filePath}
        onSave={handleSave}
        isSaving={isSaving}
      />

      <div className="editor-container">
        {showToolbar && (
          <div className="mobile-toolbar">
            <button onClick={() => insertMarkdown('bold', '粗体文本')}>
              <strong>B</strong>
            </button>
            <button onClick={() => insertMarkdown('italic', '斜体文本')}>
              <em>I</em>
            </button>
            <button onClick={() => insertMarkdown('heading', '标题')}>
              H
            </button>
            <button onClick={() => insertMarkdown('list', '列表项')}>
              •
            </button>
            <button onClick={() => insertMarkdown('link', '链接文本')}>
              🔗
            </button>
            <button onClick={() => insertMarkdown('code', '代码')}>
              &lt;/&gt;
            </button>
          </div>
        )}

        <div className="editor-content">
          {isEditing ? (
            <textarea
              ref={editorRef}
              value={content}
              onChange={handleContentChange}
              className="mobile-editor"
              placeholder="开始写作..."
              style={{
                width: '100%',
                minHeight: '400px',
                border: 'none',
                outline: 'none',
                resize: 'none',
                padding: '16px',
                fontFamily: 'inherit',
                fontSize: '16px',
                lineHeight: '1.6',
                background: 'transparent',
                color: 'var(--foreground)'
              }}
            />
          ) : (
            <div className="markdown-preview">
              <div dangerouslySetInnerHTML={{ __html: content }} />
            </div>
          )}
        </div>
      </div>

      <div className="mobile-actions">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowToolbar(!showToolbar)}
        >
          <Settings2 className="w-4 h-4 mr-2" />
          {showToolbar ? '隐藏工具栏' : '显示工具栏'}
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? <Eye className="w-4 h-4 mr-2" /> : <Edit3 className="w-4 h-4 mr-2" />}
          {isEditing ? '预览' : '编辑'}
        </Button>
        
        <Button variant="outline" size="sm">
          <Share className="w-4 h-4 mr-2" />
          分享
        </Button>
      </div>
    </div>
  );
}