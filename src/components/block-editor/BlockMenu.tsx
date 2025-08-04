'use client'
import React, { useState, useEffect, useRef } from 'react'
import { 
  Type, 
  Heading1, 
  Heading2, 
  Heading3, 
  Quote, 
  Code, 
  List, 
  ListOrdered, 
  CheckSquare, 
  Minus,
  Image
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { BlockMenuProps, BlockType, BlockMenuItemType } from './types'

const blockMenuItems: BlockMenuItemType[] = [
  {
    type: 'paragraph',
    label: '段落',
    description: '普通文本段落',
    icon: <Type className="w-4 h-4" />,
    keywords: ['text', 'paragraph', '段落', '文本']
  },
  {
    type: 'heading1',
    label: '大标题',
    description: '一级标题',
    icon: <Heading1 className="w-4 h-4" />,
    keywords: ['h1', 'heading', 'title', '标题', '大标题']
  },
  {
    type: 'heading2',
    label: '中标题',
    description: '二级标题',
    icon: <Heading2 className="w-4 h-4" />,
    keywords: ['h2', 'heading', 'title', '标题', '中标题']
  },
  {
    type: 'heading3',
    label: '小标题',
    description: '三级标题',
    icon: <Heading3 className="w-4 h-4" />,
    keywords: ['h3', 'heading', 'title', '标题', '小标题']
  },
  {
    type: 'quote',
    label: '引用',
    description: '引用文本块',
    icon: <Quote className="w-4 h-4" />,
    keywords: ['quote', 'blockquote', '引用', '引述']
  },
  {
    type: 'code',
    label: '代码块',
    description: '代码片段',
    icon: <Code className="w-4 h-4" />,
    keywords: ['code', 'pre', '代码', '代码块']
  },
  {
    type: 'bullet-list',
    label: '无序列表',
    description: '项目符号列表',
    icon: <List className="w-4 h-4" />,
    keywords: ['list', 'bullet', 'ul', '列表', '无序列表']
  },
  {
    type: 'number-list',
    label: '有序列表',
    description: '数字编号列表',
    icon: <ListOrdered className="w-4 h-4" />,
    keywords: ['list', 'number', 'ol', '列表', '有序列表', '编号']
  },
  {
    type: 'todo',
    label: '待办事项',
    description: '可勾选的任务项',
    icon: <CheckSquare className="w-4 h-4" />,
    keywords: ['todo', 'task', 'check', '待办', '任务', '清单']
  },
  {
    type: 'divider',
    label: '分割线',
    description: '水平分割线',
    icon: <Minus className="w-4 h-4" />,
    keywords: ['divider', 'hr', 'separator', '分割线', '分隔符']
  }
]

export default function BlockMenu({ position, onSelect, onClose }: BlockMenuProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const menuRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  // 过滤菜单项
  const filteredItems = blockMenuItems.filter(item => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return (
      item.label.toLowerCase().includes(term) ||
      item.description.toLowerCase().includes(term) ||
      item.keywords.some(keyword => keyword.toLowerCase().includes(term))
    )
  })

  // 自动聚焦搜索框
  useEffect(() => {
    if (searchRef.current) {
      searchRef.current.focus()
    }
  }, [])

  // 键盘导航
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          e.preventDefault()
          onClose()
          break
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => 
            prev < filteredItems.length - 1 ? prev + 1 : 0
          )
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : filteredItems.length - 1
          )
          break
        case 'Enter':
          e.preventDefault()
          if (filteredItems[selectedIndex]) {
            onSelect(filteredItems[selectedIndex].type)
          }
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [filteredItems, selectedIndex, onSelect, onClose])

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  // 重置选中项当过滤结果改变
  useEffect(() => {
    setSelectedIndex(0)
  }, [searchTerm])

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-popover border border-border rounded-lg shadow-lg p-2 w-80"
      style={{
        left: position.x,
        top: position.y,
        maxHeight: '400px'
      }}
    >
      {/* 搜索框 */}
      <div className="mb-2">
        <input
          ref={searchRef}
          type="text"
          placeholder="搜索块类型..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* 菜单项列表 */}
      <div className="max-h-64 overflow-y-auto">
        {filteredItems.length === 0 ? (
          <div className="px-3 py-2 text-sm text-muted-foreground">
            未找到匹配的块类型
          </div>
        ) : (
          filteredItems.map((item, index) => (
            <Button
              key={item.type}
              variant="ghost"
              className={cn(
                "w-full justify-start p-2 h-auto mb-1",
                selectedIndex === index && "bg-accent"
              )}
              onClick={() => onSelect(item.type)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">{item.icon}</div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-sm">{item.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {item.description}
                  </div>
                </div>
              </div>
            </Button>
          ))
        )}
      </div>

      {/* 快捷键提示 */}
      <div className="mt-2 pt-2 border-t border-border text-xs text-muted-foreground px-2">
        <div className="flex justify-between">
          <span>↑↓ 导航</span>
          <span>Enter 选择</span>
          <span>Esc 关闭</span>
        </div>
      </div>
    </div>
  )
}