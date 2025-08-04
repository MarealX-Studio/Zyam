'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'
import Mark from './mark'
import Continue from './continue'
import Translation from './translation'
import { Separator } from '@/components/ui/separator'
import { Bookmark, ArrowRight, Languages } from 'lucide-react'
import Vditor from 'vditor'

interface ToolbarProps {
  editor?: Vditor
}

export default function CustomToolbar({ editor }: ToolbarProps) {
  const t = useTranslations('article.editor.toolbar')
  const [activeTab, setActiveTab] = useState<'mark' | 'continue' | 'translation'>('mark')

  const tabs = [
    { id: 'mark', label: t('mark.title'), icon: Bookmark, component: Mark },
    { id: 'continue', label: t('continue.title'), icon: ArrowRight, component: Continue },
    { id: 'translation', label: t('translation.title'), icon: Languages, component: Translation }
  ]

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || Mark

  return (
    <Card className="w-full max-w-4xl mx-auto mt-2">
      <CardContent className="p-0">
        {/* Tab Headers */}
        <div className="flex border-b bg-muted/30">
          {tabs.map(tab => {
            const Icon = tab.icon
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'ghost'}
                size="sm"
                className="flex-1 rounded-none border-r last:border-r-0 h-10"
                onClick={() => setActiveTab(tab.id as any)}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </Button>
            )
          })}
        </div>

        {/* Tab Content */}
        <div className="p-4 max-h-96 overflow-y-auto">
          <ActiveComponent editor={editor} />
        </div>
      </CardContent>
    </Card>
  )
}