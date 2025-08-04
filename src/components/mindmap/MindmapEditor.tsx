'use client'
import { useEffect, useRef, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Download, Save, X, RefreshCw, FileText, Eye } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface MindmapEditorProps {
  isOpen: boolean
  onClose: () => void
  onSave: (svgData: string, title?: string) => void
  initialContent?: string
}

export default function MindmapEditor({ isOpen, onClose, onSave, initialContent = '' }: MindmapEditorProps) {
  const [markdownContent, setMarkdownContent] = useState(initialContent || getDefaultTemplate())
  const [title, setTitle] = useState('思维导图')
  const [isPreviewMode, setIsPreviewMode] = useState(true)
  const mindmapRef = useRef<HTMLDivElement>(null)
  const [isRendering, setIsRendering] = useState(false)
  const { toast } = useToast()

  function getDefaultTemplate() {
    return `# 思维导图示例

## 主要想法
- 核心概念 1
  - 子概念 1.1
  - 子概念 1.2
    - 详细内容 1.2.1
    - 详细内容 1.2.2
- 核心概念 2
  - 子概念 2.1
  - 子概念 2.2

## 次要想法
- 辅助概念 1
- 辅助概念 2
  - 补充说明 2.1
  - 补充说明 2.2

## 总结
- 关键要点
- 行动计划`
  }

  const renderMindmap = async () => {
    if (!mindmapRef.current || !markdownContent.trim()) return

    setIsRendering(true)
    try {
      const { default: Vditor } = await import('vditor')
      mindmapRef.current.innerHTML = ''
      if (typeof Vditor.markmapRender === 'function') {
        await Vditor.markmapRender(mindmapRef.current, markdownContent)
      } else {
        await renderWithBuiltinMarkmap()
      }
    } catch (error) {
      console.error('渲染思维导图失败:', error)
      toast({
        title: '渲染失败',
        description: '无法渲染思维导图，请检查 Markdown 格式',
        variant: 'destructive'
      })
    } finally {
      setIsRendering(false)
    }
  }

  const renderWithBuiltinMarkmap = async () => {
    if (!mindmapRef.current) return

    try {
      const lines = markdownContent.split('\n').filter(line => line.trim())
      const mindmapData = parseMindmapData(lines)
      mindmapRef.current.innerHTML = createMindmapHTML(mindmapData)
      const style = document.createElement('style')
      style.textContent = `
        .mindmap-container {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px;
          font-family: system-ui, -apple-system, sans-serif;
        }
        .mindmap-node {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 8px 16px;
          margin: 4px;
          border-radius: 20px;
          font-weight: 500;
          display: inline-block;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          transition: transform 0.2s ease;
        }
        .mindmap-node:hover {
          transform: scale(1.05);
        }
        .mindmap-level-1 { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .mindmap-level-2 { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
        .mindmap-level-3 { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
        .mindmap-level-4 { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }
        .mindmap-children {
          margin-left: 30px;
          margin-top: 10px;
        }
        .mindmap-branch {
          position: relative;
          margin-bottom: 10px;
        }
        .mindmap-branch::before {
          content: '';
          position: absolute;
          left: -20px;
          top: 50%;
          width: 15px;
          height: 2px;
          background: #ddd;
        }
      `
      document.head.appendChild(style)
      
    } catch (error) {
      console.error('内置思维导图渲染失败:', error)
      mindmapRef.current.innerHTML = '<div class="text-center text-gray-500 p-4">思维导图渲染失败，请检查 Markdown 格式</div>'
    }
  }

  // 解析思维导图数据
  const parseMindmapData = (lines: string[]) => {
    const result: any = { title: '', children: [] }
    const stack: any[] = []
    
    for (const line of lines) {
      // 修复解析逻辑
      let level = 0
      let content = ''
      
      // 处理标题 (# ## ###)
      const headerMatch = line.match(/^(#+)\s*(.*)$/)
      if (headerMatch) {
        level = headerMatch[1].length
        content = headerMatch[2].trim()
      } else {
        // 处理列表项 (- * +)
        const listMatch = line.match(/^(\s*)([-*+])\s*(.*)$/)
        if (listMatch) {
          level = Math.floor(listMatch[1].length / 2) + 2 // 列表项从level 2开始
          content = listMatch[3].trim()
        } else {
          // 普通文本行
          content = line.trim()
          level = 1
        }
      }
      
      if (!content) continue
      
      const node = { content, children: [], level }
      
      if (level === 1) {
        if (!result.title) {
          result.title = content
        } else {
          result.children.push(node)
        }
      } else {
        // 找到合适的父节点
        while (stack.length > 0 && stack[stack.length - 1].level >= level) {
          stack.pop()
        }
        
        if (stack.length > 0) {
          stack[stack.length - 1].children.push(node)
        } else {
          result.children.push(node)
        }
      }
      
      stack.push(node)
    }
    
    return result
  }

  // 创建思维导图 HTML
  const createMindmapHTML = (data: any) => {
    const createNodeHTML = (node: any, level: number = 1): string => {
      const levelClass = `mindmap-level-${Math.min(level, 4)}`
      let html = `<div class="mindmap-branch">
        <div class="mindmap-node ${levelClass}">${node.content}</div>`
      
      if (node.children && node.children.length > 0) {
        html += '<div class="mindmap-children">'
        for (const child of node.children) {
          html += createNodeHTML(child, level + 1)
        }
        html += '</div>'
      }
      
      html += '</div>'
      return html
    }

    let html = '<div class="mindmap-container">'
    if (data.title) {
      html += `<div class="mindmap-node mindmap-level-1" style="font-size: 1.2em; margin-bottom: 20px;">${data.title}</div>`
    }
    
    html += '<div class="mindmap-children">'
    for (const child of data.children) {
      html += createNodeHTML(child, 2)
    }
    html += '</div></div>'
    
    return html
  }

  // 导出为 SVG
  const exportAsSVG = async () => {
    if (!mindmapRef.current) return null

    try {
      // 获取思维导图的 HTML 内容
      const mindmapHTML = mindmapRef.current.innerHTML
      
      // 创建 SVG
      const svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
          <foreignObject width="100%" height="100%">
            <div xmlns="http://www.w3.org/1999/xhtml" style="width: 100%; height: 100%; padding: 20px;">
              ${mindmapHTML}
            </div>
          </foreignObject>
        </svg>
      `
      
      return svgContent
    } catch (error) {
      console.error('导出 SVG 失败:', error)
      return null
    }
  }

  // 保存思维导图
  const handleSave = async () => {
    const svgData = await exportAsSVG()
    if (svgData) {
      onSave(svgData, title)
      onClose()
      toast({
        title: '保存成功',
        description: '思维导图已插入到文档中'
      })
    } else {
      toast({
        title: '保存失败',
        description: '无法生成思维导图图像',
        variant: 'destructive'
      })
    }
  }

  // 下载为 SVG 文件
  const handleDownload = async () => {
    const svgData = await exportAsSVG()
    if (svgData) {
      const blob = new Blob([svgData], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${title}.svg`
      a.click()
      URL.revokeObjectURL(url)
      
      toast({
        title: '下载成功',
        description: '思维导图已保存为 SVG 文件'
      })
    }
  }

  // 渲染思维导图
  useEffect(() => {
    if (isOpen && isPreviewMode) {
      const timer = setTimeout(() => {
        renderMindmap()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [isOpen, markdownContent, isPreviewMode])

  // 重置内容
  const handleReset = () => {
    setMarkdownContent(getDefaultTemplate())
    setTitle('思维导图')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>思维导图编辑器</span>
              <div className="flex items-center gap-1">
                <Button
                  variant={isPreviewMode ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsPreviewMode(true)}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  预览
                </Button>
                <Button
                  variant={!isPreviewMode ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsPreviewMode(false)}
                >
                  <FileText className="w-4 h-4 mr-1" />
                  编辑
                </Button>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 p-6 pt-0">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">标题</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="请输入思维导图标题"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-96">
            {/* 编辑区域 */}
            {!isPreviewMode && (
              <div className="lg:col-span-2">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium">Markdown 内容</label>
                  <Button variant="outline" size="sm" onClick={handleReset}>
                    <RefreshCw className="w-4 h-4 mr-1" />
                    重置模板
                  </Button>
                </div>
                <Textarea
                  value={markdownContent}
                  onChange={(e) => setMarkdownContent(e.target.value)}
                  className="h-80 font-mono text-sm"
                  placeholder="请输入 Markdown 格式的思维导图内容..."
                />
              </div>
            )}

            {/* 预览区域 */}
            {isPreviewMode && (
              <div className="lg:col-span-2">
                <div className="mb-2">
                  <label className="block text-sm font-medium">预览</label>
                </div>
                <ScrollArea className="h-80 border rounded-md bg-white">
                  <div 
                    ref={mindmapRef} 
                    className="min-h-full w-full relative"
                    style={{ minHeight: '300px' }}
                  >
                    {isRendering && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
                        <div className="flex items-center gap-2 text-gray-600">
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          正在渲染思维导图...
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-between mt-6">
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                下载 SVG
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                取消
              </Button>
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                保存到文档
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}