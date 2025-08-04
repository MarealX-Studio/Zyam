"use client"

import * as React from "react"
import { Moon, Sun, SunMoon } from "lucide-react"
import { useTheme } from "next-themes"
import { useTranslations } from 'next-intl'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { isMobileDevice } from "@/lib/check";

export function ModeToggle() {
  const t = useTranslations();
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = React.useState(false)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        {
          !isMobileDevice() ?
          <SidebarMenuButton asChild className="md:h-10 md:p-0 transition-all duration-300 hover:scale-110 active:scale-95"
            tooltip={{
              children: t('common.theme'),
              hidden: false,
          }}
        >
          <a href="#">
            <div className="flex size-10 items-center justify-center rounded-xl group relative overflow-hidden">
              <Button
                variant="ghost"
                size="sm"
                className="btn-modern hover:bg-accent/80"
              >
                <ThemeIcon theme={theme} className="transition-all duration-200 group-hover:scale-110 group-hover:rotate-12" />
              </Button>
              {open && (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary-600/20 rounded-xl animate-pulse" />
              )}
            </div>
          </a>
        </SidebarMenuButton>
        : <Button
            variant="ghost"
            size="icon"
            className="btn-modern hover:scale-110 transition-all duration-300"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            <ThemeIcon theme={theme} className="transition-all duration-200" />
          </Button>
        }
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        side="right"
        className="glass border-border/50 shadow-xl animate-scale-in min-w-40"
        sideOffset={8}
      >
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className="hover:bg-accent/80 transition-all duration-200 gap-3 cursor-pointer focus:bg-accent/80 rounded-md"
        >
          <Sun className="h-4 w-4 text-amber-500" />
          <span>{t('common.light')}</span>
          {theme === "light" && (
            <div className="ml-auto w-2 h-2 rounded-full bg-primary animate-pulse" />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className="hover:bg-accent/80 transition-all duration-200 gap-3 cursor-pointer focus:bg-accent/80 rounded-md"
        >
          <Moon className="h-4 w-4 text-blue-400" />
          <span>{t('common.dark')}</span>
          {theme === "dark" && (
            <div className="ml-auto w-2 h-2 rounded-full bg-primary animate-pulse" />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className="hover:bg-accent/80 transition-all duration-200 gap-3 cursor-pointer focus:bg-accent/80 rounded-md"
        >
          <SunMoon className="h-4 w-4 text-slate-500" />
          <span>{t('common.system')}</span>
          {theme === "system" && (
            <div className="ml-auto w-2 h-2 rounded-full bg-primary animate-pulse" />
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function ThemeIcon({ theme, className }: { theme?: string; className?: string }) {
  const iconClass = `size-5 ${className || ''}`
  
  switch (theme) {
    case "light":
      return <Sun className={iconClass} />
    case "dark":
      return <Moon className={iconClass} />
    case "system":
      return <SunMoon className={iconClass} />
    default:
      return <SunMoon className={iconClass} />
  }
}