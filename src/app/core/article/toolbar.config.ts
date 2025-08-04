import { isMobileDevice } from '@/lib/check'
import emitter from '@/lib/emitter'

export const createToolbarConfig = (t: any) => {
  let config = [
    { name: 'undo', tipPosition: 's' },
    { name: 'redo', tipPosition: 's' },
    '|',
    {
      name: 'mark',
      tipPosition: 's',
      tip: t('toolbar.mark.tooltip'),
      className: 'right',
      icon: '<svg><use xlink:href="#vditor-icon-mark"></svg>',
      click: () => emitter.emit('toolbar-mark'),
    },
    {
      name: 'continue',
      tipPosition: 's',
      tip: t('toolbar.continue.tooltip'),
      className: 'right',
      icon: '<svg><use xlink:href="#vditor-icon-list-plus"></svg>',
      click: () => emitter.emit('toolbar-continue'),
    },
    {
      name: 'translation',
      tipPosition: 's',
      tip: t('toolbar.translation.tooltip'),
      className: 'right',
      icon: '<svg><use xlink:href="#vditor-icon-translation"></svg>',
      click: () => emitter.emit('toolbar-translation'),
    },
    '|',
    { name: 'headings', tipPosition: 's', className: 'bottom' },
    { name: 'bold', tipPosition: 's' },
    { name: 'italic', tipPosition: 's' },
    { name: 'strike', tipPosition: 's' },
    '|',
    { name: 'line', tipPosition: 's' },
    { name: 'quote', tipPosition: 's' },
    { name: 'list', tipPosition: 's' },
    { name: 'ordered-list', tipPosition: 's' },
    { name: 'check', tipPosition: 's' },
    { name: 'code', tipPosition: 's' },
    { name: 'inline-code', tipPosition: 's' },
    { name: 'upload', tipPosition: 's' },
    { name: 'link', tipPosition: 's' },
    { name: 'table', tipPosition: 's' },
    {
      name: 'mermaid',
      tipPosition: 's',
      tip: '插入 Mermaid 图表',
      icon: '<svg viewBox="0 0 24 24"><path d="M3 3h18v18H3V3zm2 2v14h14V5H5zm2 2h10v2H7V7zm0 4h10v2H7v-2zm0 4h6v2H7v-2z"/></svg>',
      click: (vditor: any) => {
        const mermaidTemplate = `\`\`\`mermaid
graph TD
    A[开始] --> B{判断条件}
    B -->|是| C[执行操作]
    B -->|否| D[其他操作]
    C --> E[结束]
    D --> E
\`\`\``
        // 添加安全检查和多种 API 方法尝试
        if (vditor) {
          try {
            // 尝试使用 insertValue 方法
            if (typeof vditor.insertValue === 'function') {
              vditor.insertValue(mermaidTemplate)
            }
            // 如果 insertValue 不存在，尝试使用 setValue 和 getValue 组合
            else if (typeof vditor.setValue === 'function' && typeof vditor.getValue === 'function') {
              const currentContent = vditor.getValue()
              const cursorPosition = vditor.getCursorPosition?.() || { start: currentContent.length, end: currentContent.length }
              const newContent = currentContent.slice(0, cursorPosition.start) +
                                mermaidTemplate +
                                currentContent.slice(cursorPosition.end)
              vditor.setValue(newContent)
            }
            // 最后尝试直接插入到当前光标位置
            else if (typeof vditor.insert === 'function') {
              vditor.insert(mermaidTemplate)
            }
            else {
              console.warn('无法找到合适的插入方法，使用事件方式')
              // 使用事件方式作为后备方案
              emitter.emit('toolbar-insert-mermaid', mermaidTemplate)
            }
            
            // 尝试聚焦编辑器
            if (typeof vditor.focus === 'function') {
              vditor.focus()
            }
          } catch (error) {
            console.error('插入 Mermaid 模板时出错:', error)
            // 后备方案：使用事件系统
            emitter.emit('toolbar-insert-mermaid', mermaidTemplate)
          }
        } else {
          console.warn('Vditor 实例未正确传递')
          // 后备方案：使用事件系统
          emitter.emit('toolbar-insert-mermaid', mermaidTemplate)
        }
      }
    },
    {
      name: 'math',
      tipPosition: 's',
      tip: '插入数学公式',
      icon: '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>',
      click: (vditor: any) => {
        const mathTemplate = '$$\n\n$$'
        // 添加安全检查和多种 API 方法尝试
        if (vditor) {
          try {
            // 尝试使用 insertValue 方法
            if (typeof vditor.insertValue === 'function') {
              vditor.insertValue(mathTemplate)
            }
            // 如果 insertValue 不存在，尝试使用 setValue 和 getValue 组合
            else if (typeof vditor.setValue === 'function' && typeof vditor.getValue === 'function') {
              const currentContent = vditor.getValue()
              const cursorPosition = vditor.getCursorPosition?.() || { start: currentContent.length, end: currentContent.length }
              const newContent = currentContent.slice(0, cursorPosition.start) +
                                mathTemplate +
                                currentContent.slice(cursorPosition.end)
              vditor.setValue(newContent)
            }
            // 最后尝试直接插入到当前光标位置
            else if (typeof vditor.insert === 'function') {
              vditor.insert(mathTemplate)
            }
            else {
              console.warn('无法找到合适的插入方法，使用事件方式')
              emitter.emit('toolbar-insert-math', mathTemplate)
            }
            
            // 尝试聚焦编辑器
            if (typeof vditor.focus === 'function') {
              vditor.focus()
            }
          } catch (error) {
            console.error('插入数学公式模板时出错:', error)
            emitter.emit('toolbar-insert-math', mathTemplate)
          }
        } else {
          console.warn('Vditor 实例未正确传递')
          emitter.emit('toolbar-insert-math', mathTemplate)
        }
      }
    },
    {
      name: 'mindmap',
      tipPosition: 's',
      tip: '插入思维导图',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2zm0 3.86L10.2 9.4l-4.1.59 3.06 2.99-.72 4.1L12 15.14l5.14 2.7-.72-4.1 3.06-2.99-4.1-.59L12 5.86z"/></svg>',
      click: () => {
        emitter.emit('toolbar-mindmap')
      }
    },
    {
      name: 'drawio',
      tipPosition: 's',
      tip: '插入 Draw.io 图表',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h18v18H3V3zm2 2v14h14V5H5zm2 2h10v2H7V7zm0 4h6v2H7v-2zm0 4h8v2H7v-2z"/></svg>',
      click: () => {
        emitter.emit('toolbar-drawio')
      }
    },
    '|',
    { name: 'edit-mode', tipPosition: 's', className: 'bottom edit-mode-button' },
    { name: 'preview', tipPosition: 's' },
    { name: 'outline', tipPosition: 's' },
  ]

  if (isMobileDevice()) {
    config = config.slice(0, 12).filter((item) => item !== '|')
  }

  return config
}