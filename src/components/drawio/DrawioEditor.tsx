'use client'

import { useEffect, useRef, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'

interface DrawioEditorProps {
  isOpen: boolean
  onClose: () => void
  onSave: (svgData: string, title?: string) => void
  initialData?: string
  title?: string
}

export default function DrawioEditor({
  isOpen,
  onClose,
  onSave,
  initialData,
  title = '新建图表'
}: DrawioEditorProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [chartTitle, setChartTitle] = useState(title)
  // const t = useTranslations('drawio')

  useEffect(() => {
    if (!isOpen) {
      setIsLoading(true)
      return
    }

    const iframe = iframeRef.current
    if (!iframe) return

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://embed.diagrams.net') return

      const { event: eventType, data } = event.data
      
      switch (eventType) {
        case 'init':
          setIsLoading(false)
          // 如果有初始数据，加载它
          if (initialData) {
            iframe.contentWindow?.postMessage({
              action: 'load',
              xml: initialData
            }, 'https://embed.diagrams.net')
          }
          break
          
        case 'save':
          // 处理保存事件
          if (data) {
            onSave(data, chartTitle)
            onClose()
            toast({
              title: '保存成功',
              description: '图表已保存到文档中'
            })
          }
          break
          
        case 'exit':
          onClose()
          break
          
        default:
          break
      }
    }

    window.addEventListener('message', handleMessage)

    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [isOpen, initialData, onSave, onClose, chartTitle])

  const handleSave = () => {
    const iframe = iframeRef.current
    if (iframe?.contentWindow) {
      // 请求 Draw.io 导出 SVG
      iframe.contentWindow.postMessage({
        action: 'export',
        format: 'xmlsvg'
      }, 'https://embed.diagrams.net')
    }
  }

  const handleClose = () => {
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-4">
            <Input
              value={chartTitle}
              onChange={(e) => setChartTitle(e.target.value)}
              className="flex-1"
              placeholder="输入图表标题"
            />
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={isLoading}>
                保存
              </Button>
              <Button variant="outline" onClick={handleClose}>
                取消
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 relative">
          {isLoading && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>正在加载 Draw.io 编辑器...</span>
              </div>
            </div>
          )}
          
          <iframe
            ref={iframeRef}
            src="https://embed.diagrams.net/?embed=1&ui=kennedy&spin=1&proto=json&saveAndExit=1"
            className="w-full h-full border-0 rounded-md"
            title="Draw.io Editor"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}