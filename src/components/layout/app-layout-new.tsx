'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface AppLayoutProps {
  sidebar?: React.ReactNode
  header?: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

export function AppLayout({ 
  sidebar, 
  header, 
  children, 
  footer, 
  className 
}: AppLayoutProps) {
  return (
    <div className={cn("layout-grid", className)}>
      {sidebar && (
        <aside className="layout-sidebar">
          {sidebar}
        </aside>
      )}
      
      {header && (
        <header className="layout-header">
          {header}
        </header>
      )}
      
      <main className="layout-main">
        {children}
      </main>
    </div>
  )
}

interface MobileLayoutProps {
  children: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

export function MobileLayout({ 
  children, 
  footer, 
  className 
}: MobileLayoutProps) {
  return (
    <div className={cn("layout-mobile", className)}>
      <main className="layout-mobile-main">
        {children}
      </main>
      
      {footer && (
        <footer className="layout-mobile-footer">
          {footer}
        </footer>
      )}
    </div>
  )
}

interface ContainerProps {
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  className?: string
}

export function Container({ 
  children, 
  size = 'xl', 
  className 
}: ContainerProps) {
  const sizeClasses = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl', 
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-full'
  }
  
  return (
    <div className={cn(
      "layout-container",
      sizeClasses[size],
      className
    )}>
      {children}
    </div>
  )
}

interface StackProps {
  children: React.ReactNode
  direction?: 'row' | 'column'
  gap?: 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16
  align?: 'start' | 'center' | 'end' | 'stretch'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
  className?: string
}

export function Stack({ 
  children, 
  direction = 'column',
  gap = 4,
  align = 'stretch',
  justify = 'start',
  className 
}: StackProps) {
  const directionClass = direction === 'row' ? 'flex-row' : 'flex-col'
  const gapClass = `gap-${gap}`
  const alignClass = {
    start: 'items-start',
    center: 'items-center', 
    end: 'items-end',
    stretch: 'items-stretch'
  }[align]
  
  const justifyClass = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end', 
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly'
  }[justify]
  
  return (
    <div className={cn(
      "flex",
      directionClass,
      gapClass,
      alignClass,
      justifyClass,
      className
    )}>
      {children}
    </div>
  )
}