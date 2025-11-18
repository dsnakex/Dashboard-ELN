'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUIStore } from '@/lib/stores/ui-store'
import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  Folder,
  FlaskConical,
  ClipboardList,
  Box,
  FileText,
  Settings,
  ChevronLeft,
  X,
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Projects', href: '/projects', icon: Folder },
  { name: 'Experiments', href: '/experiments', icon: FlaskConical },
  { name: 'Protocols', href: '/protocols', icon: ClipboardList },
  { name: 'Inventory', href: '/inventory', icon: Box },
  { name: 'Files', href: '/files', icon: FileText },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { sidebarCollapsed, sidebarOpen, toggleSidebar, setSidebarOpen } = useUIStore()

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-14 z-40 h-[calc(100vh-3.5rem)] bg-background border-r transition-all duration-300',
          // Desktop
          'hidden md:block',
          sidebarCollapsed ? 'md:w-16' : 'md:w-64',
          // Mobile
          sidebarOpen && 'block w-64 md:hidden'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Mobile close button */}
          <div className="md:hidden flex justify-end p-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== '/' && pathname.startsWith(item.href))

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!sidebarCollapsed && (
                    <span className="truncate">{item.name}</span>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Collapse button (desktop only) */}
          <div className="hidden md:block p-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-center"
              onClick={toggleSidebar}
            >
              <ChevronLeft
                className={cn(
                  'h-4 w-4 transition-transform',
                  sidebarCollapsed && 'rotate-180'
                )}
              />
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}
