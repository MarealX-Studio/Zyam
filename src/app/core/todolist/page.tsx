'use client'

import { useState, useEffect } from 'react'
import { Plus, Check, X, Edit3, Trash2, Filter, Search, CheckSquare, Square, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card-new'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'

interface TodoItem {
  id: string
  title: string
  description?: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  createdAt: Date
  completedAt?: Date
  category?: string
}

type FilterType = 'all' | 'active' | 'completed'
type SortType = 'created' | 'priority' | 'alphabetical'

export default function TodoListPage() {
  const t = useTranslations('todolist')
  const [todos, setTodos] = useState<TodoItem[]>([])
  const [newTodo, setNewTodo] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [editingDescription, setEditingDescription] = useState('')
  const [filter, setFilter] = useState<FilterType>('all')
  const [sort, setSort] = useState<SortType>('created')
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddingTodo, setIsAddingTodo] = useState(false)

  // 从localStorage加载数据
  useEffect(() => {
    const saved = localStorage.getItem('zyam-todos')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setTodos(parsed.map((todo: any) => ({
          ...todo,
          createdAt: new Date(todo.createdAt),
          completedAt: todo.completedAt ? new Date(todo.completedAt) : undefined
        })))
      } catch (error) {
        console.error('Failed to load todos:', error)
      }
    }
  }, [])

  // 保存到localStorage
  useEffect(() => {
    localStorage.setItem('zyam-todos', JSON.stringify(todos))
  }, [todos])

  const addTodo = () => {
    if (!newTodo.trim()) return

    const todo: TodoItem = {
      id: crypto.randomUUID(),
      title: newTodo.trim(),
      description: newDescription.trim() || undefined,
      completed: false,
      priority: 'medium',
      createdAt: new Date(),
      category: undefined
    }

    setTodos(prev => [todo, ...prev])
    setNewTodo('')
    setNewDescription('')
    setIsAddingTodo(false)
  }

  const toggleTodo = (id: string) => {
    setTodos(prev => prev.map(todo => 
      todo.id === id 
        ? { 
            ...todo, 
            completed: !todo.completed,
            completedAt: !todo.completed ? new Date() : undefined
          }
        : todo
    ))
  }

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id))
  }

  const startEdit = (todo: TodoItem) => {
    setEditingId(todo.id)
    setEditingTitle(todo.title)
    setEditingDescription(todo.description || '')
  }

  const saveEdit = () => {
    if (!editingTitle.trim()) return

    setTodos(prev => prev.map(todo => 
      todo.id === editingId 
        ? { 
            ...todo, 
            title: editingTitle.trim(),
            description: editingDescription.trim() || undefined
          }
        : todo
    ))
    
    setEditingId(null)
    setEditingTitle('')
    setEditingDescription('')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditingTitle('')
    setEditingDescription('')
  }

  const setPriority = (id: string, priority: 'low' | 'medium' | 'high') => {
    setTodos(prev => prev.map(todo => 
      todo.id === id ? { ...todo, priority } : todo
    ))
  }

  // 过滤和排序逻辑
  const filteredTodos = todos.filter(todo => {
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'active' && !todo.completed) ||
      (filter === 'completed' && todo.completed)
    
    const matchesSearch = 
      !searchQuery ||
      todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      todo.description?.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesFilter && matchesSearch
  }).sort((a, b) => {
    switch (sort) {
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      case 'alphabetical':
        return a.title.localeCompare(b.title)
      case 'created':
      default:
        return b.createdAt.getTime() - a.createdAt.getTime()
    }
  })

  // 统计数据
  const stats = {
    total: todos.length,
    completed: todos.filter(t => t.completed).length,
    remaining: todos.filter(t => !t.completed).length
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500 dark:text-red-400'
      case 'medium': return 'text-yellow-500 dark:text-yellow-400'  
      case 'low': return 'text-green-500 dark:text-green-400'
      default: return 'text-gray-500'
    }
  }

  const getPriorityBg = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
      case 'medium': return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
      case 'low': return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
      default: return 'bg-gray-50 dark:bg-gray-900/20'
    }
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-background to-accent/5">
      {/* 头部统计和操作区 */}
      <div className="flex-shrink-0 p-6 border-b border-border/50 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {t('title')}
            </h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span>{t('stats.total')}: {stats.total}</span>
              <span>{t('stats.completed')}: {stats.completed}</span>
              <span>{t('stats.remaining')}: {stats.remaining}</span>
            </div>
          </div>
          
          <Button
            onClick={() => setIsAddingTodo(true)}
            variant="modern"
            className="animate-fade-in"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('addNew')}
          </Button>
        </div>

        {/* 搜索和筛选 */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t('search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background/50 backdrop-blur-sm border-border/50"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as FilterType)}
              className="px-3 py-2 rounded-lg bg-background/50 backdrop-blur-sm border border-border/50 text-sm"
            >
              <option value="all">{t('all')}</option>
              <option value="active">{t('active')}</option>
              <option value="completed">{t('completed')}</option>
            </select>
            
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortType)}
              className="px-3 py-2 rounded-lg bg-background/50 backdrop-blur-sm border border-border/50 text-sm"
            >
              <option value="created">{t('sortBy.created')}</option>
              <option value="priority">{t('sortBy.priority')}</option>
              <option value="alphabetical">{t('sortBy.alphabetical')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* 添加新待办 */}
      {isAddingTodo && (
        <div className="flex-shrink-0 p-6 border-b border-border/50 bg-accent/5">
          <Card className="p-4 animate-slide-down">
            <div className="space-y-3">
              <Input
                placeholder={t('placeholder.title')}
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTodo()}
                autoFocus
              />
              <Input
                placeholder={t('placeholder.description')}
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTodo()}
              />
              <div className="flex gap-2">
                <Button onClick={addTodo} size="sm" variant="modern">
                  <Check className="w-4 h-4 mr-2" />
                  {t('add')}
                </Button>
                <Button variant="outline" onClick={() => setIsAddingTodo(false)} size="sm">
                  <X className="w-4 h-4 mr-2" />
                  取消
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* 待办列表 */}
      <div className="flex-1 overflow-auto p-6">
        {filteredTodos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <CheckSquare className="w-16 h-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              {todos.length === 0 ? t('empty') : '暂无符合条件的待办事项'}
            </h3>
            <p className="text-sm text-muted-foreground/70 mb-6 max-w-md">
              {todos.length === 0 ? t('emptyDesc') : '尝试调整筛选条件或搜索关键词'}
            </p>
            {todos.length === 0 && (
              <Button onClick={() => setIsAddingTodo(true)} variant="ghost">
                <Plus className="w-4 h-4 mr-2" />
                {t('addNew')}
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTodos.map((todo, index) => (
              <Card 
                key={todo.id} 
                className={cn(
                  "p-4 transition-all duration-200 hover:shadow-md animate-fade-in",
                  todo.completed && "opacity-60",
                  getPriorityBg(todo.priority)
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {editingId === todo.id ? (
                  // 编辑模式
                  <div className="space-y-3">
                    <Input
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                    />
                    <Input
                      value={editingDescription}
                      onChange={(e) => setEditingDescription(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                      placeholder={t('placeholder.description')}
                    />
                    <div className="flex gap-2">
                      <Button onClick={saveEdit} size="sm" variant="modern">
                        <Check className="w-4 h-4 mr-2" />
                        保存
                      </Button>
                      <Button variant="outline" onClick={cancelEdit} size="sm">
                        <X className="w-4 h-4 mr-2" />
                        取消
                      </Button>
                    </div>
                  </div>
                ) : (
                  // 显示模式
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleTodo(todo.id)}
                      className={cn(
                        "flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors mt-0.5",
                        todo.completed 
                          ? "bg-primary border-primary text-primary-foreground" 
                          : "border-border hover:border-primary"
                      )}
                    >
                      {todo.completed && <Check className="w-3 h-3" />}
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h3 className={cn(
                            "font-medium text-sm mb-1",
                            todo.completed && "line-through text-muted-foreground"
                          )}>
                            {todo.title}
                          </h3>
                          {todo.description && (
                            <p className={cn(
                              "text-xs text-muted-foreground",
                              todo.completed && "line-through"
                            )}>
                              {todo.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <span className={cn("text-xs font-medium px-2 py-1 rounded", getPriorityColor(todo.priority))}>
                              {t(`priority.${todo.priority}`)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {todo.createdAt.toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => startEdit(todo)}
                            className="h-8 w-8"
                          >
                            <Edit3 className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteTodo(todo.id)}
                            className="h-8 w-8 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}