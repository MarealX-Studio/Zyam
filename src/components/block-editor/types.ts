export type BlockType = 
  | 'paragraph'
  | 'heading1'
  | 'heading2' 
  | 'heading3'
  | 'quote'
  | 'code'
  | 'bullet-list'
  | 'number-list'
  | 'todo'
  | 'divider'
  | 'image'
  | 'table'

export interface BlockData {
  id: string
  type: BlockType
  content: string
  properties: {
    checked?: boolean // for todo items
    language?: string // for code blocks
    level?: number // for lists
    src?: string // for images
    alt?: string // for images
    href?: string // for links
    [key: string]: any
  }
  createdAt?: string
  updatedAt?: string
}

export interface BlockMenuItemType {
  type: BlockType
  label: string
  description: string
  icon: React.ReactNode
  keywords: string[]
}

export interface BlockProps {
  block: BlockData
  onUpdate: (updates: Partial<BlockData>) => void
  onDelete: () => void
  onFocus: () => void
  onBlur: () => void
  onKeyDown: (e: React.KeyboardEvent) => void
  isFocused: boolean
}

export interface BlockMenuProps {
  position: { x: number; y: number }
  onSelect: (type: BlockType) => void
  onClose: () => void
}