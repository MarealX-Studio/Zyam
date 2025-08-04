'use client'

import { useState, useCallback } from 'react'
import { v4 as uuid } from 'uuid'
import { uploadImage } from '@/lib/imageHosting'
import { getWorkspacePath } from '@/lib/workspace'
import { writeFile, mkdir, exists } from '@tauri-apps/plugin-fs'
import { appDataDir } from '@tauri-apps/api/path'
import useSettingStore from '@/stores/setting'
import { toast } from '@/hooks/use-toast'

export interface DrawioChart {
  id: string
  title: string
  svgData: string
  xmlData: string
  createdAt: string
  updatedAt: string
}

export function useDrawio() {
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [currentChart, setCurrentChart] = useState<DrawioChart | null>(null)
  const { assetsPath } = useSettingStore()

  const openEditor = useCallback((chart?: DrawioChart) => {
    setCurrentChart(chart || null)
    setIsEditorOpen(true)
  }, [])

  const closeEditor = useCallback(() => {
    setIsEditorOpen(false)
    setCurrentChart(null)
  }, [])

  const saveChart = useCallback(async (
    svgData: string, 
    title?: string, 
    xmlData?: string
  ): Promise<string> => {
    try {
      const chartId = currentChart?.id || uuid()
      const chartTitle = title || currentChart?.title || '未命名图表'
      const timestamp = new Date().toISOString()

      // 创建图表对象
      const chart: DrawioChart = {
        id: chartId,
        title: chartTitle,
        svgData,
        xmlData: xmlData || svgData, // 如果没有 XML 数据，使用 SVG 数据
        createdAt: currentChart?.createdAt || timestamp,
        updatedAt: timestamp
      }

      // 保存图表文件
      const fileName = `chart-${chartId}.svg`
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml' })
      const svgFile = new File([svgBlob], fileName, { type: 'image/svg+xml' })

      // 获取图片 URL
      let imageUrl: string

      // 检查是否使用图片仓库
      const useImageRepo = await (async () => {
        try {
          const { Store } = await import('@tauri-apps/plugin-store')
          const store = await Store.load('store.json')
          return await store.get('useImageRepo') as boolean
        } catch {
          return false
        }
      })()

      if (useImageRepo) {
        // 上传到图片仓库
        imageUrl = await uploadImage(svgFile)
      } else {
        // 保存到本地
        const workspace = await getWorkspacePath()
        const appDataDirPath = await appDataDir()
        
        // 确定保存路径
        let imagesDir = ''
        if (!workspace.isCustom) {
          imagesDir = `${appDataDirPath}/article/${assetsPath}`
        } else {
          imagesDir = `${workspace.path}/${assetsPath}`
        }

        // 确保目录存在
        if (!await exists(imagesDir)) {
          await mkdir(imagesDir)
        }

        // 保存文件
        const filePath = `${imagesDir}/${fileName}`
        const uint8Array = new Uint8Array(await svgFile.arrayBuffer())
        await writeFile(filePath, uint8Array)
        
        imageUrl = `/${assetsPath}/${fileName}`
      }

      // 同时保存图表元数据（用于后续编辑）
      const metadataFileName = `chart-${chartId}.json`
      const metadataBlob = new Blob([JSON.stringify(chart, null, 2)], { type: 'application/json' })
      const metadataFile = new File([metadataBlob], metadataFileName, { type: 'application/json' })

      if (useImageRepo) {
        // 上传元数据到图片仓库（如果支持）
        try {
          await uploadImage(metadataFile)
        } catch (error) {
          console.warn('无法上传图表元数据到图片仓库:', error)
        }
      } else {
        // 保存元数据到本地
        const workspace = await getWorkspacePath()
        const appDataDirPath = await appDataDir()
        
        let metadataDir = ''
        if (!workspace.isCustom) {
          metadataDir = `${appDataDirPath}/article/.drawio`
        } else {
          metadataDir = `${workspace.path}/.drawio`
        }

        if (!await exists(metadataDir)) {
          await mkdir(metadataDir)
        }

        const metadataPath = `${metadataDir}/${metadataFileName}`
        const metadataArray = new Uint8Array(await metadataFile.arrayBuffer())
        await writeFile(metadataPath, metadataArray)
      }

      return imageUrl
    } catch (error) {
      console.error('保存图表失败:', error)
      toast({
        title: '保存失败',
        description: '无法保存图表，请重试',
        variant: 'destructive'
      })
      throw error
    }
  }, [currentChart, assetsPath])

  return {
    isEditorOpen,
    currentChart,
    openEditor,
    closeEditor,
    saveChart
  }
}