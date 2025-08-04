'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { 
  PenTool, 
  Zap, 
  Save, 
  Wand2, 
  Brain, 
  FileText,
  Tags,
  Clock,
  X
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import './quick-note.scss';

interface QuickNoteProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (content: string, aiSuggestions?: AISuggestion[]) => void;
}

interface AISuggestion {
  type: 'title' | 'tags' | 'category' | 'structure';
  content: string;
  confidence: number;
}

export default function QuickNote({ isOpen, onClose, onSave }: QuickNoteProps) {
  const [content, setContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const { saveFile } = useStore();

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  const generateAISuggestions = async (text: string): Promise<AISuggestion[]> => {
    const suggestions: AISuggestion[] = [];
    
    if (text.length > 10) {
      const lines = text.split('\n').filter(line => line.trim());
      const firstLine = lines[0];
      
      if (firstLine && firstLine.length < 100) {
        suggestions.push({
          type: 'title',
          content: firstLine.replace(/^[#\-\*\+]\s*/, '').trim(),
          confidence: 0.8
        });
      }
      
      const words = text.toLowerCase().split(/\s+/);
      const keywordFreq: Record<string, number> = {};
      
      words.forEach(word => {
        if (word.length > 3 && !/^(the|and|for|are|but|not|you|all|can|had|her|was|one|our|out|day|get|has|him|his|how|its|may|new|now|old|see|two|way|who|boy|did|you|have|that|with|this|will|your|from|they|know|want|been|good|much|some|time|very|when|come|here|just|like|long|make|many|over|such|take|than|them|well|were)$/.test(word)) {
          keywordFreq[word] = (keywordFreq[word] || 0) + 1;
        }
      });
      
      const topKeywords = Object.entries(keywordFreq)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([word]) => word);
        
      if (topKeywords.length > 0) {
        suggestions.push({
          type: 'tags',
          content: topKeywords.join(', '),
          confidence: 0.7
        });
      }
      
      if (text.includes('TODO') || text.includes('待办') || text.includes('任务')) {
        suggestions.push({
          type: 'category',
          content: '任务管理',
          confidence: 0.9
        });
      } else if (text.includes('想法') || text.includes('idea') || text.includes('思考')) {
        suggestions.push({
          type: 'category',
          content: '想法记录',
          confidence: 0.8
        });
      } else if (text.includes('会议') || text.includes('meeting') || text.includes('讨论')) {
        suggestions.push({
          type: 'category',
          content: '会议记录',
          confidence: 0.9
        });
      }
      
      if (lines.length > 3) {
        suggestions.push({
          type: 'structure',
          content: '建议使用标题和列表结构化内容',
          confidence: 0.6
        });
      }
    }
    
    return suggestions;
  };

  const handleContentChange = async (value: string) => {
    setContent(value);
    
    if (value.length > 20) {
      setIsProcessing(true);
      try {
        const suggestions = await generateAISuggestions(value);
        setAiSuggestions(suggestions);
        setShowSuggestions(suggestions.length > 0);
      } catch (error) {
        console.error('AI suggestions failed:', error);
      } finally {
        setIsProcessing(false);
      }
    } else {
      setShowSuggestions(false);
      setAiSuggestions([]);
    }
  };

  const handleSave = async () => {
    if (!content.trim()) return;
    
    const titleSuggestion = aiSuggestions.find(s => s.type === 'title');
    const fileName = titleSuggestion ? `${titleSuggestion.content}.md` : `快速笔记-${new Date().toLocaleDateString()}.md`;
    
    try {
      await saveFile({
        name: fileName,
        path: '/快速笔记/',
        content: content.trim(),
        lastModified: new Date()
      });
      
      onSave(content, aiSuggestions);
      setContent('');
      setAiSuggestions([]);
      setShowSuggestions(false);
      onClose();
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  const applySuggestion = (suggestion: AISuggestion) => {
    switch (suggestion.type) {
      case 'title':
        setContent(`# ${suggestion.content}\n\n${content.replace(/^.*\n/, '')}`);
        break;
      case 'structure':
        const lines = content.split('\n');
        const structuredContent = lines.map((line, index) => {
          if (index === 0 && !line.startsWith('#')) {
            return `# ${line}`;
          }
          if (line.trim() && !line.startsWith('#') && !line.startsWith('-') && !line.startsWith('*')) {
            return `- ${line}`;
          }
          return line;
        }).join('\n');
        setContent(structuredContent);
        break;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="quick-note-overlay">
      <Card className="quick-note-card">
        <CardContent className="p-6">
          <div className="quick-note-header">
            <div className="quick-note-title">
              <PenTool className="w-5 h-5 mr-2" />
              <span>快速笔记</span>
              {isProcessing && <Brain className="w-4 h-4 ml-2 animate-pulse text-primary" />}
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder="输入你的想法，AI 会帮助你整理..."
            className="quick-note-textarea"
            rows={6}
          />

          {showSuggestions && aiSuggestions.length > 0 && (
            <div className="ai-suggestions">
              <div className="suggestions-header">
                <Wand2 className="w-4 h-4 mr-2" />
                <span>AI 建议</span>
              </div>
              <div className="suggestions-list">
                {aiSuggestions.map((suggestion, index) => (
                  <div key={index} className="suggestion-item">
                    <div className="suggestion-content">
                      <div className="suggestion-type">
                        {suggestion.type === 'title' && <FileText className="w-3 h-3" />}
                        {suggestion.type === 'tags' && <Tags className="w-3 h-3" />}
                        {suggestion.type === 'category' && <Clock className="w-3 h-3" />}
                        {suggestion.type === 'structure' && <Zap className="w-3 h-3" />}
                        <span>{getSuggestionLabel(suggestion.type)}</span>
                      </div>
                      <span className="suggestion-text">{suggestion.content}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => applySuggestion(suggestion)}
                      className="apply-btn"
                    >
                      应用
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="quick-note-actions">
            <Button variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button 
              onClick={handleSave}
              disabled={!content.trim()}
              className="save-btn"
            >
              <Save className="w-4 h-4 mr-2" />
              保存笔记
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function getSuggestionLabel(type: string): string {
  const labels = {
    'title': '标题',
    'tags': '标签',
    'category': '分类',
    'structure': '结构'
  };
  return labels[type as keyof typeof labels] || type;
}