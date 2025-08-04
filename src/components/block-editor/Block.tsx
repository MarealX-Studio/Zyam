'use client'
import React, { useState, useRef, useEffect } from 'react'
import { Trash2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { BlockProps, BlockData } from './types'

export default function Block({
  block,
  onUpdate,
  onDelete,
  onFocus,
  onBlur,
  onKeyDown,
  isFocused
}: BlockProps) {
  const [localContent, setLocalContent] = useState(block.content)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // 同步外部内容变化
  useEffect(() => {
    setLocalContent(block.content)
  }, [block.content])

  // 自动聚焦
  useEffect(() => {
    if (isFocused && textareaRef.current) {
      textareaRef.current.focus()
      // 将光标移到末尾
      const length = textareaRef.current.value.length
      textareaRef.current.setSelectionRange(length, length)
    } else if (isFocused && inputRef.current) {
      inputRef.current.focus()
      const length = inputRef.current.value.length
      inputRef.current.setSelectionRange(length, length)
    }
  }, [isFocused])

  // 处理内容变化
  const handleContentChange = (content: string) => {
    setLocalContent(content)
    onUpdate({ content })
  }

  // 处理待办事项切换
  const handleTodoToggle = () => {
    onUpdate({ 
      properties: { 
        ...block.properties, 
        checked: !block.properties.checked 
      }
    })
  }

  // 自动调整文本域高度
  const adjustHeight = (element: HTMLTextAreaElement) => {
    element.style.height = 'auto'
    element.style.height = element.scrollHeight + 'px'
  }

  // 获取占位符文本
  const getPlaceholder = (type: string) => {
    switch (type) {
      case 'heading1': return '大标题'
      case 'heading2': return '中标题'
      case 'heading3': return '小标题'
      case 'quote': return '引用文本...'
      case 'code': return '输入代码...'
      case 'bullet-list': return '无序列表项'
      case 'number-list': return '有序列表项'
      case 'todo': return '待办事项'
      default: return '输入内容或输入 / 选择块类型...'
    }
  }

  // 渲染不同类型的块
  const renderBlock = () => {
    const commonProps = {
      value: localContent,
      onChange: (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => 
        handleContentChange(e.target.value),
      onFocus,
      onBlur,
      onKeyDown,
      className: cn(
        "w-full resize-none border-none outline-none bg-transparent",
        "placeholder:text-muted-foreground focus:ring-0"
      ),
      placeholder: getPlaceholder(block.type)
    }

    switch (block.type) {
      case 'heading1':
        return (
          <input
            {...commonProps}
            ref={inputRef}
            className={cn(
              commonProps.className,
              "text-3xl font-bold py-2"
            )}
          />
        )

      case 'heading2':
        return (
          <input
            {...commonProps}
            ref={inputRef}
            className={cn(
              commonProps.className,
              "text-2xl font-bold py-2"
            )}
          />
        )

      case 'heading3':
        return (
          <input
            {...commonProps}
            ref={inputRef}
            className={cn(
              commonProps.className,
              "text-xl font-bold py-1"
            )}
          />
        )

      case 'quote':
        return (
          <div className="border-l-4 border-primary pl-4">
            <textarea
              {...commonProps}
              ref={textareaRef}
              className={cn(
                commonProps.className,
                "italic text-muted-foreground py-2"
              )}
              onInput={(e) => adjustHeight(e.currentTarget)}
            />
          </div>
        )

      case 'code':
        return (
          <div className="bg-muted rounded-md p-3">
            <textarea
              {...commonProps}
              ref={textareaRef}
              className={cn(
                commonProps.className,
                "font-mono text-sm bg-transparent"
              )}
              onInput={(e) => adjustHeight(e.currentTarget)}
            />
          </div>
        )

      case 'bullet-list':
        return (
          <div className="flex items-start gap-2">
            <span className="text-lg leading-6 select-none">•</span>
            <textarea
              {...commonProps}
              ref={textareaRef}
              className={cn(commonProps.className, "flex-1")}
              onInput={(e) => adjustHeight(e.currentTarget)}
            />
          </div>
        )

      case 'number-list':
        return (
          <div className="flex items-start gap-2">
            <span className="text-sm leading-6 select-none min-w-[20px]">1.</span>
            <textarea
              {...commonProps}
              ref={textareaRef}
              className={cn(commonProps.className, "flex-1")}
              onInput={(e) => adjustHeight(e.currentTarget)}
            />
          </div>
        )

      case 'todo':
        return (
          <div className="flex items-start gap-2">
            <button
              onClick={handleTodoToggle}
              className={cn(
                "mt-1 w-4 h-4 border border-gray-300 rounded flex items-center justify-center",
                "hover:bg-muted transition-colors",
                block.properties.checked && "bg-primary border-primary text-primary-foreground"
              )}
            >
              {block.properties.checked && <Check className="w-3 h-3" />}
            </button>
            <textarea
              {...commonProps}
              ref={textareaRef}
              className={cn(
                commonProps.className,
                "flex-1",
                block.properties.checked && "line-through text-muted-foreground"
              )}
              onInput={(e) => adjustHeight(e.currentTarget)}
            />
          </div>
        )

      case 'divider':
        return (
          <div className="py-4">
            <hr className="border-muted-foreground/20" />
          </div>
        )

      default: // paragraph
        return (
          <textarea
            {...commonProps}
            ref={textareaRef}
            className={cn(commonProps.className, "min-h-[24px] py-1")}
            onInput={(e) => adjustHeight(e.currentTarget)}
          />
        )
    }
  }

  return (
    <div className="group relative">
      {renderBlock()}
      
      {/* 删除按钮 */}
      {isFocused && block.content === '' && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 p-0"
          onClick={onDelete}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      )}
    </div>
  )
}