'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ProtocolCard } from './protocol-card'
import { CategorySelect } from './category-select'
import { useProtocols } from '@/lib/hooks/use-protocols'
import { cn } from '@/lib/utils/cn'
import {
  Plus,
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

type VisibilityTab = 'personal' | 'group' | 'public'

export function ProtocolBrowser() {
  const [activeTab, setActiveTab] = useState<VisibilityTab>('personal')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [page, setPage] = useState(1)
  const limit = 20

  const { data, isLoading, error } = useProtocols({
    visibility: activeTab,
    category: category || undefined,
    search: search || undefined,
    page,
    limit,
  })

  const protocols = data?.data || []
  const totalCount = data?.count || 0
  const totalPages = Math.ceil(totalCount / limit)

  const tabs = [
    { value: 'personal' as const, label: 'My Protocols' },
    { value: 'group' as const, label: 'Group Protocols' },
    { value: 'public' as const, label: 'Public Protocols' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Protocols</h1>
          <p className="text-muted-foreground">
            {totalCount} protocols
          </p>
        </div>
        <Button asChild>
          <Link href="/protocols/new">
            <Plus className="mr-2 h-4 w-4" />
            New Protocol
          </Link>
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setActiveTab(tab.value)
              setPage(1)
            }}
            className={cn(
              'px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px',
              activeTab === tab.value
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search protocols..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="pl-9"
          />
        </div>
        <CategorySelect
          value={category}
          onChange={(value) => {
            setCategory(value)
            setPage(1)
          }}
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Failed to load protocols</p>
        </div>
      ) : protocols.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {search || category
              ? 'No protocols match your filters'
              : `No ${activeTab} protocols yet. Create your first protocol to get started.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {protocols.map((protocol: any) => (
            <ProtocolCard key={protocol.id} protocol={protocol} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
