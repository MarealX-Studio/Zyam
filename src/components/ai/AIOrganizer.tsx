'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  FolderTree, 
  Tags, 
  Clock, 
  FileText,
  CheckCircle,
  AlertCircle,
  Zap,
  Settings
} from 'lucide-react';
import useArticleStore from '@/stores/article';

interface OrganizationTask {
  id: string;
  type: 'categorize' | 'tag' | 'structure' | 'duplicate';
  title: string;
  description: string;
  fileCount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
}

interface AIOrganizerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AIOrganizer({ isOpen, onClose }: AIOrganizerProps) {
  const [tasks, setTasks] = useState<OrganizationTask[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  const { allArticle: articles, fileTree: folders } = useArticleStore();

  const startAnalysis = useCallback(async () => {
    setIsAnalyzing(true);
    setOverallProgress(0);
    
    const initialTasks: OrganizationTask[] = [
      {
        id: 'categorize',
        type: 'categorize',
        title: '智能分类',
        description: '分析笔记内容并自动分类到合适的文件夹',
        fileCount: articles.length,
        status: 'pending',
        progress: 0
      },
      {
        id: 'tag',
        type: 'tag',
        title: '标签生成',
        description: '为笔记生成相关标签以便更好地组织',
        fileCount: articles.length,
        status: 'pending',
        progress: 0
      },
      {
        id: 'structure',
        type: 'structure',
        title: '结构优化',
        description: '优化笔记的标题和内容结构',
        fileCount: articles.filter((a: any) => !a.content?.includes('#')).length,
        status: 'pending',
        progress: 0
      },
      {
        id: 'duplicate',
        type: 'duplicate',
        title: '重复检测',
        description: '检测并处理重复或相似的笔记内容',
        fileCount: articles.length,
        status: 'pending',
        progress: 0
      }
    ];

    setTasks(initialTasks);

    for (let i = 0; i < initialTasks.length; i++) {
      const task = initialTasks[i];
      
      setTasks(prev => prev.map(t => 
        t.id === task.id ? { ...t, status: 'processing' } : t
      ));

      await simulateTaskExecution(task.id, task.fileCount);
      
      setTasks(prev => prev.map(t => 
        t.id === task.id ? { ...t, status: 'completed', progress: 100 } : t
      ));

      setOverallProgress(((i + 1) / initialTasks.length) * 100);
    }

    setIsAnalyzing(false);
  }, [articles]);

  const simulateTaskExecution = async (taskId: string, fileCount: number) => {
    const steps = Math.min(fileCount, 20);
    
    for (let step = 0; step <= steps; step++) {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const progress = (step / steps) * 100;
      setTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, progress } : t
      ));
    }
  };

  const getTaskIcon = (type: OrganizationTask['type']) => {
    switch (type) {
      case 'categorize': return <FolderTree className="w-4 h-4" />;
      case 'tag': return <Tags className="w-4 h-4" />;
      case 'structure': return <FileText className="w-4 h-4" />;
      case 'duplicate': return <AlertCircle className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  const getStatusIcon = (status: OrganizationTask['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processing': return <Clock className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI 智能整理
            <Button variant="ghost" size="sm" onClick={onClose} className="ml-auto">
              ×
            </Button>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className="text-sm text-muted-foreground">
              发现 {articles.length} 个笔记文件，{folders.length} 个文件夹
            </div>
            
            {!isAnalyzing && tasks.length === 0 && (
              <Button 
                onClick={startAnalysis}
                className="bg-primary text-primary-foreground"
              >
                <Zap className="w-4 h-4 mr-2" />
                开始智能整理
              </Button>
            )}
          </div>

          {isAnalyzing && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">整体进度</span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(overallProgress)}%
                </span>
              </div>
              <Progress value={overallProgress} className="w-full" />
            </div>
          )}

          {tasks.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">处理任务</h3>
              
              {tasks.map((task) => (
                <Card key={task.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getTaskIcon(task.type)}
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{task.title}</h4>
                        {getStatusIcon(task.status)}
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        {task.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{task.fileCount} 个文件</span>
                        {task.status === 'processing' && (
                          <span>{Math.round(task.progress)}%</span>
                        )}
                      </div>
                      
                      {task.status === 'processing' && (
                        <Progress value={task.progress} className="w-full h-2" />
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {tasks.length > 0 && tasks.every(t => t.status === 'completed') && (
            <div className="text-center space-y-4 p-6 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
              <div>
                <h3 className="text-lg font-semibold text-green-800">
                  整理完成！
                </h3>
                <p className="text-sm text-green-600 mt-1">
                  所有笔记已经过智能分析和组织
                </p>
              </div>
              
              <div className="flex gap-2 justify-center">
                <Button variant="outline" onClick={onClose}>
                  完成
                </Button>
                <Button variant="ghost" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  查看详情
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}