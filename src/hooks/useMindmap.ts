'use client'
import { useState } from 'react'
import { exists, mkdir, writeFile } from '@tauri-apps/plugin-fs'
import { appDataDir } from '@tauri-apps/api/path'
import { v4 as uuid } from 'uuid'
import { toast } from '@/hooks/use-toast'
import { getWorkspacePath } from '@/lib/workspace'
import useArticleStore from '@/stores/article'
import useSettingStore from '@/stores/setting'
import { uploadImage } from '@/lib/imageHosting'
import { Store } from '@tauri-apps/plugin-store'

export interface MindmapState {
  isEditorOpen: boolean
  isLoading: boolean
  currentContent: string
}

export function useMindmap() {
  const [state, setState] = useState<MindmapState>({
    isEditorOpen: false,
    isLoading: false,
    currentContent: ''
  })

  const { activeFilePath } = useArticleStore()
  const { assetsPath } = useSettingStore()

  // 打开思维导图编辑器
  const openEditor = (initialContent?: string) => {
    setState(prev => ({
      ...prev,
      isEditorOpen: true,
      currentContent: initialContent || ''
    }))
  }

  // 关闭思维导图编辑器
  const closeEditor = () => {
    setState(prev => ({
      ...prev,
      isEditorOpen: false,
      currentContent: ''
    }))
  }

  // 保存思维导图
  const saveMindmap = async (svgData: string, title?: string): Promise<string> => {
    if (!svgData) {
      throw new Error('SVG 数据为空')
    }

    setState(prev => ({ ...prev, isLoading: true }))

    try {
      const store = await Store.load('store.json')
      const useImageRepo = await store.get('useImageRepo')

      if (useImageRepo) {
        // 使用图片托管服务
        return await uploadToImageHost(svgData, title)
      } else {
        // 保存到本地
        return await saveToLocal(svgData, title)
      }
    } catch (error) {
      console.error('保存思维导图失败:', error)
      toast({
        title: '保存失败',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'destructive'
      })
      throw error
    } finally {
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }

  // 上传到图片托管服务
  const uploadToImageHost = async (svgData: string, title?: string): Promise<string> => {
    try {
      // 将 SVG 转换为 Blob
      const blob = new Blob([svgData], { type: 'image/svg+xml' })
      const file = new File([blob], `${title || 'mindmap'}-${uuid()}.svg`, { type: 'image/svg+xml' })

      // 上传到图片托管服务
      const imageUrl = await uploadImage(file)
      
      toast({
        title: '上传成功',
        description: '思维导图已上传到图片托管服务'
      })

      return imageUrl
    } catch (error) {
      console.error('上传思维导图失败:', error)
      throw new Error('上传思维导图失败')
    }
  }

  // 保存到本地
  const saveToLocal = async (svgData: string, title?: string): Promise<string> => {
    try {
      const workspace = await getWorkspacePath()
      const articlePath = activeFilePath.split('/').slice(0, -1).join('/')
      const fileName = `${title || 'mindmap'}-${uuid()}.svg`

      let imagesDir = ''
      if (!workspace.isCustom) {
        const appDataDirPath = await appDataDir()
        imagesDir = `${appDataDirPath}/article/${articlePath}/${assetsPath}`
      } else {
        imagesDir = `${workspace.path}/${articlePath}/${assetsPath}`
      }

      // 确保目录存在
      if (!await exists(imagesDir)) {
        await mkdir(imagesDir, { recursive: true })
      }

      // 保存 SVG 文件
      const filePath = `${imagesDir}/${fileName}`
      await writeFile(filePath, new TextEncoder().encode(svgData))

      toast({
        title: '保存成功',
        description: '思维导图已保存到本地'
      })

      // 返回相对路径
      return `/${assetsPath}/${fileName}`
    } catch (error) {
      console.error('保存思维导图到本地失败:', error)
      throw new Error('保存思维导图到本地失败')
    }
  }

  // 从 Markdown 内容生成思维导图
  const generateFromMarkdown = (markdownContent: string) => {
    setState(prev => ({
      ...prev,
      currentContent: markdownContent
    }))
    openEditor(markdownContent)
  }

  return {
    ...state,
    openEditor,
    closeEditor,
    saveMindmap,
    generateFromMarkdown
  }
}