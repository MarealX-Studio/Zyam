'use client'

import { MessageSquare, Highlighter, SquarePen, Settings, User } from "lucide-react"
import { usePathname, useRouter } from 'next/navigation'
import { cn } from "@/lib/utils"
import { Store } from "@tauri-apps/plugin-store"
import { useTranslations } from 'next-intl'
import { useSidebarStore } from "@/stores/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import useSettingStore from "@/stores/setting"
import useSyncStore from "@/stores/sync"
import { SyncStateEnum, UserInfo } from "@/lib/github.types"
import { getUserInfo } from "@/lib/github"
import { useEffect } from "react"


export function AppFootbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { toggleFileSidebar } = useSidebarStore()
  const { 
    githubUsername,
    accessToken,
    primaryBackupMethod,
    giteeAccessToken,
    gitlabAccessToken,
    setGithubUsername,
    setGitlabUsername,
  } = useSettingStore()
  const {
    setUserInfo,
    setSyncRepoInfo,
    setSyncRepoState,
    setGiteeSyncRepoInfo,
    setGiteeSyncRepoState,
    setGitlabSyncProjectInfo,
    setGitlabSyncProjectState,
    setGiteeUserInfo,
    setGitlabUserInfo,
    giteeUserInfo,
    gitlabUserInfo,
  } = useSyncStore()
  const t = useTranslations()
  
  // 检查是否有 GitHub 或 Gitee 账号，用于显示头像
  const hasGithubAccount = Boolean(githubUsername && accessToken)
  const hasGiteeAccount = Boolean(giteeAccessToken)
  const hasGitlabAccount = Boolean(gitlabAccessToken)
  const showAvatar = hasGithubAccount || hasGiteeAccount

  // 获取当前主要备份方式的用户信息
  async function handleGetUserInfo() {
    try {
      if (primaryBackupMethod === 'github') {
        if (accessToken) {
          setSyncRepoInfo(undefined)
          setSyncRepoState(SyncStateEnum.checking)
          const res = await getUserInfo()
          if (res) {
            setUserInfo(res.data as UserInfo)
            setGithubUsername(res.data.login)
          }
        }
      } else if (primaryBackupMethod === 'gitee') {
        if (giteeAccessToken) {
          // 获取 Gitee 用户信息
          setGiteeSyncRepoInfo(undefined)
          setGiteeSyncRepoState(SyncStateEnum.checking)
          const res = await import('@/lib/gitee').then(module => module.getUserInfo())
          if (res) {
            setGiteeUserInfo(res)
          }
        }
      } else if (primaryBackupMethod === 'gitlab') {
        if (gitlabAccessToken) {
          // 获取 Gitlab 用户信息
          setGitlabSyncProjectInfo(undefined)
          setGitlabSyncProjectState(SyncStateEnum.checking)
          const { getUserInfo } = await import('@/lib/gitlab')
          const res = await getUserInfo()
          if (res) {
            setGitlabUserInfo(res)
            setGitlabUsername(res.username)
          }
        }
      } else {
        setUserInfo(undefined)
        setGiteeUserInfo(undefined)
        setGitlabUserInfo(undefined)
      }
    } catch (err) {
      console.error('Failed to get user info:', err)
    }
  }
  
  // 确定使用哪个账号用于头像显示
  const username = primaryBackupMethod === 'github' && hasGithubAccount 
    ? githubUsername 
    : primaryBackupMethod === 'gitee' && hasGiteeAccount
    ? giteeUserInfo?.login
    : primaryBackupMethod === 'gitlab' && hasGitlabAccount
    ? gitlabUserInfo?.username
    : ''
    
  // 底部导航菜单项
  const items = [
    {
      title: t('navigation.chat'),
      url: "/mobile/chat",
      icon: MessageSquare,
    },
    {
      title: t('navigation.record'),
      url: "/mobile/record",
      icon: Highlighter,
    },
    {
      title: t('navigation.write'),
      url: "/mobile/writing",
      icon: SquarePen,
    },
    {
      title: t('navigation.setting'),
      url: "/mobile/setting",
      icon: Settings,
    },
  ]

  // 处理导航点击事件
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
    if (accessToken || giteeAccessToken || gitlabAccessToken) {
      handleGetUserInfo()
    }
  }, [accessToken, giteeAccessToken, gitlabAccessToken, primaryBackupMethod])

  return (
    <div className="w-full border-t bg-background/95 backdrop-blur-lg h-20 safe-area-padding-bottom">
      <div className="flex h-full items-center justify-center gap-4 px-4">
        {items.map((item, index) => (
          <button
            key={index}
            onClick={() => menuHandler(item)}
            className={cn(
              "flex flex-col items-center justify-center w-12 h-12 mx-2 my-1 transition-all duration-300 relative rounded-xl",
              "hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-primary/20",
              pathname === item.url
                ? "text-primary bg-gradient-to-br from-primary/20 to-primary/10 shadow-lg scale-105 ring-2 ring-primary/30"
                : "text-muted-foreground hover:text-primary hover:bg-accent/50"
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* 最后一项可能显示头像 */}
            {index === items.length - 1 && showAvatar && username ? (
              <div className="flex flex-col items-center animate-fade-in">
                <Avatar className="h-8 w-8 ring-2 ring-primary/20 transition-all duration-200 hover:ring-primary/40">
                  <AvatarImage
                    src={`https://github.com/${username}.png`}
                    alt="Profile"
                  />
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary-600/20">
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
              </div>
            ) : (
              <div className="flex items-center justify-center animate-fade-in">
                <item.icon className={cn(
                  "h-7 w-7 transition-all duration-200",
                  pathname === item.url
                    ? "drop-shadow-sm text-primary-foreground"
                    : "text-muted-foreground"
                )} />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
