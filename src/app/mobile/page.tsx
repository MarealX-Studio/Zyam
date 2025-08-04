'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PenTool, MessageSquare, Settings, FileText, Zap, Brain } from 'lucide-react'
import { useTranslations } from 'next-intl'
import useSettingStore from '@/stores/setting'

export default function MobilePage() {
  const router = useRouter()
  const t = useTranslations('mobile.home')
  const { primaryModel } = useSettingStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const features = [
    {
      icon: <PenTool className="w-8 h-8" />,
      title: 'Quick Writing',
      description: 'Start writing with enhanced mobile editor',
      action: () => router.push('/mobile/writing'),
      disabled: false,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: 'AI Chat',
      description: 'Chat with AI for assistance',
      action: () => router.push('/mobile/chat'),
      disabled: !primaryModel,
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: 'Mind Maps',
      description: 'Create visual mind maps',
      action: () => router.push('/mobile/writing?mode=mindmap'),
      disabled: false,
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: 'Records',
      description: 'View and manage your notes',
      action: () => router.push('/mobile/record'),
      disabled: false,
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Quick Note',
      description: 'Capture ideas instantly',
      action: () => router.push('/mobile/writing?mode=quick'),
      disabled: false,
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: <Settings className="w-8 h-8" />,
      title: 'Settings',
      description: 'Customize your experience',
      action: () => router.push('/mobile/setting'),
      disabled: false,
      color: 'from-gray-500 to-slate-500'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8 pt-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <PenTool className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Zyam Mobile
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Your powerful note-taking companion
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {features.map((feature, index) => (
            <Card
              key={index}
              className={`cursor-pointer transition-all duration-200 hover:scale-105 border-0 shadow-lg ${
                feature.disabled ? 'opacity-50' : 'hover:shadow-xl'
              }`}
              onClick={feature.disabled ? undefined : feature.action}
            >
              <CardContent className="p-6 text-center">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} mx-auto mb-3 flex items-center justify-center text-white`}>
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {feature.title}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {!primaryModel && (
          <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <p className="text-sm text-amber-700 dark:text-amber-300 text-center">
              Configure AI model in settings to enable chat features
            </p>
          </div>
        )}
      </div>
    </div>
  )
}