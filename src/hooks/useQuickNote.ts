'use client';

import { useState, useCallback } from 'react';
import useArticleStore from '@/stores/article';

interface QuickNoteState {
  isOpen: boolean;
  content: string;
  isProcessing: boolean;
}

interface AISuggestion {
  type: 'title' | 'tags' | 'category' | 'structure';
  content: string;
  confidence: number;
}

export function useQuickNote() {
  const [state, setState] = useState<QuickNoteState>({
    isOpen: false,
    content: '',
    isProcessing: false
  });

  const { saveCurrentArticle: saveFile } = useArticleStore();

  const open = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: true }));
  }, []);

  const close = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: false, content: '' }));
  }, []);

  const updateContent = useCallback((content: string) => {
    setState(prev => ({ ...prev, content }));
  }, []);

  const setProcessing = useCallback((isProcessing: boolean) => {
    setState(prev => ({ ...prev, isProcessing }));
  }, []);

  const saveNote = useCallback(async (content: string, suggestions: AISuggestion[] = []) => {
    if (!content.trim()) return false;

    setProcessing(true);

    try {
      const titleSuggestion = suggestions.find(s => s.type === 'title');
      const fileName = titleSuggestion 
        ? `${titleSuggestion.content}.md` 
        : `快速笔记-${new Date().toLocaleDateString()}.md`;

      await saveFile(content.trim());

      close();
      return true;
    } catch (error) {
      console.error('Save quick note failed:', error);
      return false;
    } finally {
      setProcessing(false);
    }
  }, [saveFile, close, setProcessing]);

  const generateSuggestions = useCallback(async (text: string): Promise<AISuggestion[]> => {
    if (text.length < 10) return [];

    const suggestions: AISuggestion[] = [];
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

    return suggestions;
  }, []);

  return {
    ...state,
    open,
    close,
    updateContent,
    setProcessing,
    saveNote,
    generateSuggestions
  };
}