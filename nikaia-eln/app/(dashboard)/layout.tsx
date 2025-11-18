'use client'

import { useEffect } from 'react'
import { useAuth } from '@/lib/hooks/use-auth'
import { useUIStore } from '@/lib/stores/ui-store'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import { cn } from '@/lib/utils/cn'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isLoading } = useAuth()
  const { sidebarCollapsed } = useUIStore()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Sidebar />
      <main
        className={cn(
          'pt-14 transition-all duration-300',
          // Adjust for sidebar width
          'md:pl-64',
          sidebarCollapsed && 'md:pl-16'
        )}
      >
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
