import { create } from 'zustand';
import { Store } from "@tauri-apps/plugin-store";
import { toast } from '@/hooks/use-toast';

export interface RagSettings {
  chunkSize: number;
  chunkOverlap: number;
  resultCount: number;
  similarityThreshold: number;
}

export const DEFAULT_RAG_SETTINGS: RagSettings = {
  chunkSize: 1000,
  chunkOverlap: 200,
  resultCount: 5,
  similarityThreshold: 0.7
};

interface RagSettingsState extends RagSettings {
  initSettings: () => Promise<void>;
  updateSetting: <K extends keyof RagSettings>(key: K, value: RagSettings[K]) => Promise<void>;
  resetToDefaults: () => Promise<void>;
}

const useRagSettingsStore = create<RagSettingsState>((set) => ({
  ...DEFAULT_RAG_SETTINGS,

  initSettings: async () => {
    try {
      const store = await Store.load('store.json');
      
      const chunkSize = await store.get<number>('ragChunkSize') || DEFAULT_RAG_SETTINGS.chunkSize;
      const chunkOverlap = await store.get<number>('ragChunkOverlap') || DEFAULT_RAG_SETTINGS.chunkOverlap;
      const resultCount = await store.get<number>('ragResultCount') || DEFAULT_RAG_SETTINGS.resultCount;
      const similarityThreshold = await store.get<number>('ragSimilarityThreshold') || DEFAULT_RAG_SETTINGS.similarityThreshold;
      
      set({
        chunkSize,
        chunkOverlap,
        resultCount,
        similarityThreshold
      });
    } catch (error) {
      console.error('初始化 RAG 设置失败:', error);
    }
  },

  updateSetting: async <K extends keyof RagSettings>(key: K, value: RagSettings[K]) => {
    try {
      set({ [key]: value } as Pick<RagSettings, K>);
      
      const store = await Store.load('store.json');
      await store.set(`rag${key.charAt(0).toUpperCase() + key.slice(1)}`, value);
    } catch (error) {
      console.error(`更新 RAG 设置 ${key} 失败:`, error);
    }
  },

  resetToDefaults: async () => {
    try {
      set(DEFAULT_RAG_SETTINGS);
      
      const store = await Store.load('store.json');
      await store.set('ragChunkSize', DEFAULT_RAG_SETTINGS.chunkSize);
      await store.set('ragChunkOverlap', DEFAULT_RAG_SETTINGS.chunkOverlap);
      await store.set('ragResultCount', DEFAULT_RAG_SETTINGS.resultCount);
      await store.set('ragSimilarityThreshold', DEFAULT_RAG_SETTINGS.similarityThreshold);
    } catch (error) {
      toast({
        title: '重置 RAG 设置失败',
        description: error as string,
        variant: 'destructive',
      });
    }
  }
}));

export default useRagSettingsStore;
