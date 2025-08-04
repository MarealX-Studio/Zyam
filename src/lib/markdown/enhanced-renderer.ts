// Vditor增强功能 - 优化Markdown预览体验
// 由于Vditor已经内置了Mermaid支持，我们主要提供配置和增强功能

// Vditor Mermaid配置
export function getVditorMermaidConfig(theme: 'light' | 'dark' = 'light') {
  return {
    cdn: '',
    theme: theme === 'dark' ? 'dark' : 'default',
    securityLevel: 'loose',
    startOnLoad: false,
    flowchart: {
      useMaxWidth: true,
      htmlLabels: true,
      curve: 'cardinal'
    },
    sequence: {
      useMaxWidth: true,
      boxMargin: 10,
      diagramMarginX: 50,
      diagramMarginY: 10,
      actorMargin: 50,
      width: 150,
      height: 65,
      mirrorActors: true,
      showSequenceNumbers: false
    },
    gantt: {
      useMaxWidth: true,
      leftPadding: 75,
      rightPadding: 20,
      gridLineStartPadding: 35,
      fontSize: 11,
      fontFamily: 'ui-sans-serif, system-ui, sans-serif',
      numberSectionStyles: 4
    }
  }
}

// Vditor已经内置Mermaid支持，这里提供额外的增强功能

// 增强代码高亮
export function enhanceCodeHighlight(container: HTMLElement) {
  const codeBlocks = container.querySelectorAll('pre code')
  
  codeBlocks.forEach((block) => {
    const codeElement = block as HTMLElement
    
    // 添加语言标签
    const language = codeElement.className.match(/language-(\w+)/)?.[1]
    if (language && language !== 'mermaid') {
      const languageLabel = document.createElement('div')
      languageLabel.className = 'code-language-label'
      languageLabel.textContent = language.toUpperCase()
      languageLabel.style.cssText = `
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
        background: var(--vditor-background-color, #374151);
        color: var(--vditor-color, #ffffff);
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.75rem;
        font-weight: 500;
        z-index: 1;
      `
      
      const pre = codeElement.closest('pre')
      if (pre) {
        pre.style.position = 'relative'
        pre.appendChild(languageLabel)
      }
    }
    
    // 添加复制按钮
    const copyButton = document.createElement('button')
    copyButton.className = 'code-copy-button'
    copyButton.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="m5 15-4-4m0 0 4-4m-4 4h12"></path>
      </svg>
    `
    copyButton.style.cssText = `
      position: absolute;
      top: 0.5rem;
      right: ${language ? '4rem' : '0.5rem'};
      background: var(--vditor-background-color, #374151);
      color: var(--vditor-color, #ffffff);
      border: none;
      padding: 0.5rem;
      border-radius: 4px;
      cursor: pointer;
      opacity: 0.7;
      transition: opacity 0.2s;
      z-index: 1;
    `
    
    copyButton.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(codeElement.textContent || '')
        copyButton.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20,6 9,17 4,12"></polyline>
          </svg>
        `
        setTimeout(() => {
          copyButton.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="m5 15-4-4m0 0 4-4m-4 4h12"></path>
            </svg>
          `
        }, 2000)
      } catch (err) {
        console.error('复制失败:', err)
      }
    })
    
    copyButton.addEventListener('mouseenter', () => {
      copyButton.style.opacity = '1'
    })
    
    copyButton.addEventListener('mouseleave', () => {
      copyButton.style.opacity = '0.7'
    })
    
    const pre = codeElement.closest('pre')
    if (pre) {
      pre.style.position = 'relative'
      pre.appendChild(copyButton)
    }
  })
}

// 增强表格样式
export function enhanceTableStyles(container: HTMLElement) {
  const tables = container.querySelectorAll('table')
  
  tables.forEach((table) => {
    // 添加表格包装器
    const wrapper = document.createElement('div')
    wrapper.className = 'table-wrapper'
    wrapper.style.cssText = `
      overflow-x: auto;
      margin: 1rem 0;
      border: 1px solid var(--vditor-border-color, #e5e7eb);
      border-radius: 8px;
    `
    
    table.style.cssText = `
      width: 100%;
      border-collapse: collapse;
      margin: 0;
    `
    
    // 增强表头样式
    const thead = table.querySelector('thead')
    if (thead) {
      thead.style.cssText = `
        background: var(--vditor-background-color, #f9fafb);
        border-bottom: 2px solid var(--vditor-border-color, #e5e7eb);
      `
    }
    
    // 增强单元格样式
    const cells = table.querySelectorAll('th, td')
    cells.forEach((cell) => {
      (cell as HTMLElement).style.cssText = `
        padding: 0.75rem 1rem;
        text-align: left;
        border-bottom: 1px solid var(--vditor-border-color, #e5e7eb);
      `
    })
    
    table.parentNode?.insertBefore(wrapper, table)
    wrapper.appendChild(table)
  })
}

// 增强数学公式渲染
export function enhanceMathRendering(container: HTMLElement) {
  // 检查是否有KaTeX或MathJax可用
  if (typeof window !== 'undefined' && (window as any).katex) {
    const mathElements = container.querySelectorAll('.language-math, .math')
    
    mathElements.forEach((element) => {
      const mathContent = element.textContent || ''
      try {
        const rendered = (window as any).katex.renderToString(mathContent, {
          displayMode: true,
          throwOnError: false
        })
        element.innerHTML = rendered
        element.classList.add('katex-rendered')
      } catch (error) {
        console.error('Math rendering error:', error)
      }
    })
  }
}