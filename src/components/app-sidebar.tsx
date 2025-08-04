'use client'
import { ImageUp, Search, Settings, Highlighter, SquarePen, CheckSquare } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { usePathname, useRouter } from 'next/navigation'
import { ModeToggle } from "./mode-toggle"
import Link from "next/link"
import AppStatus from "./app-status"
import { Store } from "@tauri-apps/plugin-store"
import { PinToggle } from "./pin-toggle"
import { useTranslations } from 'next-intl'
import { LanguageSwitch } from "./language-switch"
import { useSidebarStore } from "@/stores/sidebar"
import { useEffect, useState } from "react"
import useImageStore from "@/stores/imageHosting"
 
export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { toggleFileSidebar } = useSidebarStore()
  const t = useTranslations()
  const { imageRepoUserInfo } = useImageStore()
  const [items, setItems] = useState([
    {
      title: t('navigation.record'),
      url: "/core/record",
      icon: Highlighter,
      isActive: true,
    },
    {
      title: t('navigation.write'),
      url: "/core/article",
      icon: SquarePen,
    },
    {
      title: t('navigation.todolist'),
      url: "/core/todolist",
      icon: CheckSquare,
    },
    {
      title: t('navigation.search'),
      url: "/core/search",
      icon: Search,
    },
  ])

  async function initGithubImageHosting() {
    const store = await Store.load('store.json')
    const githubImageUsername = await store.get<string>('githubImageUsername')
    const githubImageAccessToken = await store.get<string>('githubImageAccessToken')
    if (githubImageUsername && githubImageAccessToken && !items.find(item => item.url === '/core/image')) {
      setItems([...items, {
        title: t('navigation.githubImageHosting'),
        url: "/core/image",
        icon: ImageUp,
      }])
    }
  }

  async function menuHandler(item: typeof items[0]) {
    if (pathname === '/core/article' && item.url === '/core/article') {
      toggleFileSidebar()
    } else {
      router.push(item.url)
    }
    const store = await Store.load('store.json')
    store.set('currentPage', item.url)
  }

  useEffect(() => {
    initGithubImageHosting()
  }, [imageRepoUserInfo])

  return (
    <Sidebar
      collapsible="none"
      className="!w-[calc(var(--sidebar-width-icon)_+_1px)] border-r h-screen glass backdrop-blur-lg"
    >
      <SidebarHeader className="p-3 border-b border-border/50">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="animate-fade-in">
              <AppStatus />
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      
      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {items.map((item, index) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    disabled={item.url === '#'}
                    isActive={pathname === item.url}
                    className="transition-all duration-300 hover:scale-105 active:scale-95 hover:bg-accent/50 hover:shadow-md"
                    tooltip={{
                      children: item.title,
                      hidden: false,
                    }}
                  >
                    <div
                      className="cursor-pointer flex size-10 items-center justify-center rounded-lg relative overflow-hidden group"
                      onClick={() => menuHandler(item)}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <item.icon className={`
                        transition-all duration-300 ease-out
                        ${pathname === item.url
                          ? 'size-7 text-primary drop-shadow-lg scale-125 filter brightness-110'
                          : 'size-5 group-hover:scale-110 group-hover:text-primary/80'
                        }
                      `} />
                      {pathname === item.url && (
                        <div className="absolute inset-0 rounded-lg bg-primary/5 animate-pulse" />
                      )}
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="p-2 border-t border-border/50 space-y-2">
        <div className="animate-slide-up">
          <LanguageSwitch />
        </div>
        <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
          <PinToggle />
        </div>
        <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
          <ModeToggle />
        </div>
        <SidebarMenuButton
          isActive={pathname.includes('/core/setting')}
          asChild
          className={`
            md:h-10 md:p-0 transition-all duration-300 hover:scale-110 active:scale-95
            ${pathname.includes('/core/setting')
              ? 'bg-black dark:bg-white text-white dark:text-black shadow-lg shadow-primary/20'
              : 'hover:bg-accent hover:shadow-md'
            }
            animate-slide-up
          `}
          style={{ animationDelay: '300ms' }}
          tooltip={{
            children: t('common.settings'),
            hidden: false,
          }}
        >
          <Link href="/core/setting">
            <div className="flex size-10 items-center justify-center rounded-lg group relative overflow-hidden">
              <Settings className="size-5 transition-all duration-200 group-hover:scale-110 group-hover:rotate-90" />
            </div>
          </Link>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  )
}