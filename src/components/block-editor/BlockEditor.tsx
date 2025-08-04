'use client'
import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Plus, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Block from './Block'
import BlockMenu from './BlockMenu'
import { BlockType, BlockData } from './types'

interface BlockEditorProps {
  initialBlocks?: BlockData[]
  onChange?: (blocks: BlockData[]) => void
  onSave?: (content: string) => void
  className?: string
}

export default function BlockEditor({ 
  initialBlocks = [], 
  onChange, 
  onSave,
  className 
}: BlockEditorProps) {
  const [blocks, setBlocks] = useState<BlockData[]>(initialBlocks.length > 0 ? initialBlocks : [
    {
      id: crypto.randomUUID(),
      type: 'paragraph',
      content: '',
      properties: {}
    }
  ])
  
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null)
  const [showBlockMenu, setShowBlockMenu] = useState(false)
  const [blockMenuPosition, setBlockMenuPosition] = useState({ x: 0, y: 0 })
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null)
  
  const blockRefs = useRef<{ [key: string]: HTMLElement | null }>({})

  // 创建新块
  const createBlock = useCallback((type: BlockType, content: string = '', afterId?: string): BlockData => {
    return {
      id: crypto.randomUUID(),
      type,
      content,
      properties: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  }, [])

  // 添加新块
  const addBlock = useCallback((type: BlockType, afterId?: string, content: string = '') => {
    const newBlock = createBlock(type, content)
    
    setBlocks(prevBlocks => {
      const index = afterId ? prevBlocks.findIndex(b => b.id === afterId) + 1 : prevBlocks.length
      const newBlocks = [...prevBlocks]
      newBlocks.splice(index, 0, newBlock)
      return newBlocks
    })
    
    // 聚焦到新块
    setTimeout(() => {
      setFocusedBlockId(newBlock.id)
    }, 100)
    
    return newBlock.id
  }, [createBlock])

  // 删除块
  const deleteBlock = useCallback((id: string) => {
    setBlocks(prevBlocks => {
      const blockIndex = prevBlocks.findIndex(b => b.id === id)
      if (blockIndex === -1) return prevBlocks
      
      const newBlocks = prevBlocks.filter(b => b.id !== id)
      
      // 如果删除的是最后一个块，确保至少有一个段落块
      if (newBlocks.length === 0) {
        newBlocks.push(createBlock('paragraph'))
      } else if (blockIndex > 0) {
        // 聚焦到前一个块
        setTimeout(() => {
          setFocusedBlockId(newBlocks[blockIndex - 1].id)
        }, 100)
      }
      
      return newBlocks
    })
  }, [createBlock])

  // 更新块内容
  const updateBlock = useCallback((id: string, updates: Partial<BlockData>) => {
    setBlocks(prevBlocks => 
      prevBlocks.map(block => 
        block.id === id 
          ? { ...block, ...updates, updatedAt: new Date().toISOString() }
          : block
      )
    )
  }, [])

  // 处理拖拽开始
  const handleDragStart = useCallback((e: React.DragEvent, blockId: string) => {
    e.dataTransfer.setData('text/plain', blockId)
    e.dataTransfer.effectAllowed = 'move'
  }, [])

  // 处理拖拽结束
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }, [])

  // 处理放置
  const handleDrop = useCallback((e: React.DragEvent, targetBlockId: string) => {
    e.preventDefault()
    const draggedBlockId = e.dataTransfer.getData('text/plain')
    
    if (draggedBlockId === targetBlockId) return

    setBlocks(prevBlocks => {
      const draggedIndex = prevBlocks.findIndex(b => b.id === draggedBlockId)
      const targetIndex = prevBlocks.findIndex(b => b.id === targetBlockId)
      
      if (draggedIndex === -1 || targetIndex === -1) return prevBlocks

      const newBlocks = Array.from(prevBlocks)
      const [draggedBlock] = newBlocks.splice(draggedIndex, 1)
      newBlocks.splice(targetIndex, 0, draggedBlock)
      
      return newBlocks
    })
  }, [])

  // 处理键盘快捷键
  const handleKeyDown = useCallback((e: React.KeyboardEvent, blockId: string) => {
    const block = blocks.find(b => b.id === blockId)
    if (!block) return

    switch (e.key) {
      case 'Enter':
        if (e.shiftKey) return // Shift+Enter 创建新行
        
        e.preventDefault()
        const blockIndex = blocks.findIndex(b => b.id === blockId)
        
        // 如果当前块为空且是标题，转换为段落
        if (block.content === '' && block.type.startsWith('heading')) {
          updateBlock(blockId, { type: 'paragraph' })
        } else {
          // 在当前块后创建新的段落块
          addBlock('paragraph', blockId)
        }
        break
        
      case 'Backspace':
        if (block.content === '' && blocks.length > 1) {
          e.preventDefault()
          deleteBlock(blockId)
        }
        break
        
      case '/':
        if (block.content === '') {
          e.preventDefault()
          setActiveBlockId(blockId)
          setShowBlockMenu(true)
          
          // 获取当前块的位置显示菜单
          const blockElement = blockRefs.current[blockId]
          if (blockElement) {
            const rect = blockElement.getBoundingClientRect()
            setBlockMenuPosition({ x: rect.left, y: rect.bottom + 10 })
          }
        }
        break
    }
  }, [blocks, updateBlock, addBlock, deleteBlock])

  // 处理块菜单选择
  const handleBlockMenuSelect = useCallback((type: BlockType) => {
    if (activeBlockId) {
      updateBlock(activeBlockId, { type, content: '' })
      setShowBlockMenu(false)
      setActiveBlockId(null)
      
      // 重新聚焦到块
      setTimeout(() => {
        setFocusedBlockId(activeBlockId)
      }, 100)
    }
  }, [activeBlockId, updateBlock])

  // 转换为 Markdown
  const convertToMarkdown = useCallback(() => {
    return blocks.map(block => {
      switch (block.type) {
        case 'heading1':
          return `# ${block.content}`
        case 'heading2':
          return `## ${block.content}`
        case 'heading3':
          return `### ${block.content}`
        case 'quote':
          return `> ${block.content}`
        case 'code':
          return `\`\`\`\n${block.content}\n\`\`\``
        case 'bullet-list':
          return `- ${block.content}`
        case 'number-list':
          return `1. ${block.content}`
        case 'todo':
          const checked = block.properties?.checked ? '[x]' : '[ ]'
          return `${checked} ${block.content}`
        default:
          return block.content
      }
    }).join('\n\n')
  }, [blocks])

  // 保存内容
  const handleSave = useCallback(() => {
    const markdown = convertToMarkdown()
    onSave?.(markdown)
  }, [convertToMarkdown, onSave])

  // 监听变化
  useEffect(() => {
    onChange?.(blocks)
  }, [blocks, onChange])

  return (
    <div className={cn("block-editor", className)}>
      <div className="space-y-1 min-h-[200px]">
        {blocks.map((block, index) => (
          <div
            key={block.id}
            className={cn(
              "group relative flex items-start gap-2 p-2 rounded-lg transition-colors",
              focusedBlockId === block.id && "bg-muted/50"
            )}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, block.id)}
          >
            {/* 拖拽手柄 */}
            <div
              draggable
              onDragStart={(e) => handleDragStart(e, block.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing mt-1"
            >
              <GripVertical className="w-4 h-4 text-muted-foreground" />
            </div>

            {/* 块内容 */}
            <div
              className="flex-1 min-w-0"
              ref={(el) => {
                blockRefs.current[block.id] = el
              }}
            >
              <Block
                block={block}
                onUpdate={(updates: Partial<BlockData>) => updateBlock(block.id, updates)}
                onDelete={() => deleteBlock(block.id)}
                onFocus={() => setFocusedBlockId(block.id)}
                onBlur={() => setFocusedBlockId(null)}
                onKeyDown={(e: React.KeyboardEvent) => handleKeyDown(e, block.id)}
                isFocused={focusedBlockId === block.id}
              />
            </div>

            {/* 添加块按钮 */}
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 p-0"
              onClick={() => addBlock('paragraph', block.id)}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      {/* 块类型选择菜单 */}
      {showBlockMenu && (
        <BlockMenu
          position={blockMenuPosition}
          onSelect={handleBlockMenuSelect}
          onClose={() => {
            setShowBlockMenu(false)
            setActiveBlockId(null)
          }}
        />
      )}

      {/* 底部操作栏 */}
      <div className="flex justify-between items-center mt-6 pt-4 border-t">
        <div className="text-sm text-muted-foreground">
          {blocks.length} 个块
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSave}>
            保存为 Markdown
          </Button>
          <Button onClick={() => addBlock('paragraph')}>
            <Plus className="w-4 h-4 mr-2" />
            添加块
          </Button>
        </div>
      </div>
    </div>
  )
}