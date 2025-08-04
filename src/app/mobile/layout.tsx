'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Menu, Settings } from 'lucide-react';
import Link from 'next/link';
import './mobile-styles.scss';

interface MobileLayoutProps {
  children: ReactNode;
}

export default function MobileLayout({ children }: MobileLayoutProps) {
  const pathname = usePathname();
  const isHomePage = pathname === '/mobile';

  return (
    <div className="mobile-layout">
      <header className="mobile-header">
        <div className="mobile-header-content">
          {!isHomePage && (
            <Link href="/mobile">
              <Button variant="ghost" size="sm" className="mobile-back-btn">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
          )}
          
          <h1 className="mobile-title">
            {isHomePage ? 'Zyam Notes' : getPageTitle(pathname)}
          </h1>
          
          <div className="mobile-actions">
            {isHomePage && (
              <Link href="/mobile/settings">
                <Button variant="ghost" size="sm">
                  <Settings className="w-4 h-4" />
                </Button>
              </Link>
            )}
            <Button variant="ghost" size="sm" className="mobile-menu-btn">
              <Menu className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mobile-main">
        {children}
      </main>

      <div className="mobile-safe-area" />
    </div>
  );
}

function getPageTitle(pathname: string): string {
  const routes: Record<string, string> = {
    '/mobile/writing': 'Writing',
    '/mobile/search': 'Search',
    '/mobile/recent': 'Recent Notes',
    '/mobile/favorites': 'Favorites',
    '/mobile/tags': 'Tags',
    '/mobile/settings': 'Settings',
  };
  
  return routes[pathname] || 'Zyam Notes';
}
