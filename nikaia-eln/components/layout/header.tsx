'use client'

import { useAuth } from '@/lib/hooks/use-auth'
import { useUIStore } from '@/lib/stores/ui-store'
import { Button } from '@/components/ui/button'
import {
  FlaskConical,
  Menu,
  Bell,
  Search,
  LogOut,
  User,
  Settings,
} from 'lucide-react'
import Link from 'next/link'

export function Header() {
  const { user, signOut } = useAuth()
  const { setSidebarOpen } = useUIStore()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4 gap-4">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <FlaskConical className="h-6 w-6 text-primary" />
          <span className="font-semibold hidden sm:inline-block">Nikaia ELN</span>
        </Link>

        {/* Search */}
        <div className="flex-1 max-w-md mx-4">
          <Button
            variant="outline"
            className="w-full justify-start text-muted-foreground"
            onClick={() => {
              // TODO: Open command palette
            }}
          >
            <Search className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline-block">Search...</span>
            <kbd className="pointer-events-none ml-auto hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">
              3
            </span>
          </Button>

          {/* User menu */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/settings">
                <Settings className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link href="/settings/profile">
                <User className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" onClick={signOut}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
