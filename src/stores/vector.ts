import { create } from 'zustand';
import { initVectorDb, processAllMarkdownFiles, processMarkdownFile, checkEmbeddingModelAvailable } from '@/lib/rag';
import { checkRerankModelAvailable } from '@/lib/ai';
import { Store } from "@tauri-apps/plugin-store";
import { toast } from '@/hooks/use-toast';

interface VectorState {
  isVectorDbEnabled: boolean;
  isRagEnabled: boolean;
  isProcessing: boolean;
  lastProcessTime: number | null;
  hasRerankModel: boolean;
  
  documentCount: number;
  
  initVectorDb: () => Promise<void>;
  
  setVectorDbEnabled: (enabled: boolean) => Promise<void>;
  setRagEnabled: (enabled: boolean) => Promise<void>;
  
  processAllDocuments: () => Promise<void>;
  processDocument: (filename: string, content: string) => Promise<void>;
  checkEmbeddingModel: () => Promise<boolean>;
  checkRerankModel: () => Promise<boolean>;
}

const useVectorStore = create<VectorState>((set, get) => ({
  isVectorDbEnabled: false,
  isRagEnabled: false,
  isProcessing: false,
  lastProcessTime: null,
  hasRerankModel: false,
  documentCount: 0,
  
  initVectorDb: async () => {
    try {
      await initVectorDb();
      
      const store = await Store.load('store.json');
      const isVectorDbEnabled = await store.get<boolean>('isVectorDbEnabled') || false;
      const isRagEnabled = await store.get<boolean>('isRagEnabled') || false;
      const lastProcessTime = await store.get<number>('lastVectorProcessTime') || null;
      
      set({ 
        isVectorDbEnabled, 
        isRagEnabled,
        lastProcessTime
      });
      
      if (isVectorDbEnabled) {
        const modelAvailable = await get().checkEmbeddingModel();
        if (!modelAvailable) {
          await get().setVectorDbEnabled(false);
          await get().setRagEnabled(false);
        }
      }
      
      const hasRerankModel = await get().checkRerankModel();
      set({ hasRerankModel });
    } catch (error) {
      console.error('初始化向量数据库失败:', error);
    }
  },
  
  setVectorDbEnabled: async (enabled: boolean) => {
    try {
      const store = await Store.load('store.json');
      await store.set('isVectorDbEnabled', enabled);
      
      set({ isVectorDbEnabled: enabled });
      
      if (enabled) {
        const modelAvailable = await get().checkEmbeddingModel();
        if (!modelAvailable) {
          toast({
            title: '向量数据库',
            description: '未配置嵌入模型或模型不可用，请在AI设置中配置嵌入模型',
            variant: 'destructive',
          });
          
          await store.set('isVectorDbEnabled', false);
          set({ isVectorDbEnabled: false });
        }
      }
    } catch (error) {
      console.error('设置向量数据库状态失败:', error);
    }
  },
  
  setRagEnabled: async (enabled: boolean) => {
    try {
      const store = await Store.load('store.json');
      await store.set('isRagEnabled', enabled);
      
      set({ isRagEnabled: enabled });
      
      if (enabled && !get().isVectorDbEnabled) {
        await get().setVectorDbEnabled(true);
      }
    } catch (error) {
      console.error('设置RAG状态失败:', error);
    }
  },
  
  processAllDocuments: async () => {
    if (get().isProcessing) return;
    
    try {
      const modelAvailable = await get().checkEmbeddingModel();
      if (!modelAvailable) {
        toast({
          title: '向量处理',
          description: '未配置嵌入模型或模型不可用，请在AI设置中配置嵌入模型',
          variant: 'destructive',
        });
        return;
      }
      
      set({ isProcessing: true });
      
      toast({
        title: '向量处理',
        description: '开始处理文档向量，这可能需要一些时间...',
      });
      
      const result = await processAllMarkdownFiles();
      
      const currentTime = Date.now();
      const store = await Store.load('store.json');
      await store.set('lastVectorProcessTime', currentTime);
      
      set({ 
        isProcessing: false,
        lastProcessTime: currentTime,
        documentCount: result.success
      });
      
      toast({
        title: '向量处理完成',
        description: `成功处理 ${result.success} 个文档，失败 ${result.failed} 个文档。`,
      });
    } catch (error) {
      console.error('处理文档向量失败:', error);
      set({ isProcessing: false });
      
      toast({
        title: '向量处理失败',
        description: '处理文档向量时发生错误，请查看控制台日志',
        variant: 'destructive',
      });
    }
  },
  
  processDocument: async (filename: string, content: string) => {
    if (!get().isVectorDbEnabled) return;
    
    try {
      await processMarkdownFile(filename, content);
    } catch (error) {
      console.error(`处理文档 ${filename} 向量失败:`, error);
    }
  },
  
  checkEmbeddingModel: async () => {
    try {
      const modelAvailable = await checkEmbeddingModelAvailable();
      return modelAvailable;
    } catch (error) {
      console.error('检查嵌入模型失败:', error);
      return false;
    }
  },
  
  checkRerankModel: async () => {
    try {
      const modelAvailable = await checkRerankModelAvailable();
      set({ hasRerankModel: modelAvailable });
      return modelAvailable;
    } catch (error) {
      console.error('检查重排序模型失败:', error);
      set({ hasRerankModel: false });
      return false;
    }
  }
}));

export default useVectorStore;
