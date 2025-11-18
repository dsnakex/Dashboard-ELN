'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SampleCard } from '@/components/inventory/sample-card'
import { useSamples, useStorageUnits, useEquipment } from '@/lib/hooks/use-inventory'
import { cn } from '@/lib/utils/cn'
import {
  Plus,
  Search,
  Loader2,
  TestTube,
  Archive,
  Wrench
} from 'lucide-react'

type Tab = 'samples' | 'storage' | 'equipment'

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState<Tab>('samples')
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  const { data: samplesData, isLoading: samplesLoading } = useSamples({
    search: search || undefined,
    type: typeFilter || undefined,
  })

  const { data: storageUnits, isLoading: storageLoading } = useStorageUnits()
  const { data: equipment, isLoading: equipmentLoading } = useEquipment({
    search: search || undefined,
  })

  const samples = samplesData?.data || []

  const tabs = [
    { value: 'samples' as const, label: 'Samples', icon: TestTube, count: samplesData?.count || 0 },
    { value: 'storage' as const, label: 'Storage', icon: Archive, count: storageUnits?.length || 0 },
    { value: 'equipment' as const, label: 'Equipment', icon: Wrench, count: equipment?.length || 0 },
  ]

  const sampleTypes = [
    { value: '', label: 'All Types' },
    { value: 'antibody', label: 'Antibody' },
    { value: 'cell_line', label: 'Cell Line' },
    { value: 'oligo', label: 'Oligo' },
    { value: 'protein', label: 'Protein' },
    { value: 'chemical', label: 'Chemical' },
    { value: 'reagent', label: 'Reagent' },
    { value: 'other', label: 'Other' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inventory</h1>
          <p className="text-muted-foreground">
            Manage samples, storage, and equipment
          </p>
        </div>
        {activeTab === 'samples' && (
          <Button asChild>
            <Link href="/inventory/samples/new">
              <Plus className="mr-2 h-4 w-4" />
              New Sample
            </Link>
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px',
              activeTab === tab.value
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
            <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={`Search ${activeTab}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        {activeTab === 'samples' && (
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
          >
            {sampleTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Content */}
      {activeTab === 'samples' && (
        samplesLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : samples.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No samples found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {samples.map((sample: any) => (
              <SampleCard key={sample.id} sample={sample} />
            ))}
          </div>
        )
      )}

      {activeTab === 'storage' && (
        storageLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : !storageUnits || storageUnits.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No storage units found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {storageUnits.map((unit: any) => (
              <Card key={unit.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Archive className="h-4 w-4 text-primary" />
                    {unit.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm space-y-1">
                    <p className="capitalize text-muted-foreground">
                      {unit.unit_type?.replace('_', ' ')}
                    </p>
                    {unit.temperature && (
                      <p>{unit.temperature}°C</p>
                    )}
                    {unit.room && (
                      <p className="text-muted-foreground">
                        {unit.building && `${unit.building}, `}{unit.room}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      )}

      {activeTab === 'equipment' && (
        equipmentLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : !equipment || equipment.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No equipment found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {equipment.map((item: any) => (
              <Card key={item.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-4 w-4 text-primary" />
                    {item.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm space-y-1">
                    {item.manufacturer && (
                      <p>{item.manufacturer} {item.model}</p>
                    )}
                    <p className={cn(
                      'capitalize',
                      item.status === 'operational' ? 'text-green-600' :
                      item.status === 'maintenance' ? 'text-amber-600' :
                      'text-red-600'
                    )}>
                      {item.status}
                    </p>
                    {item.room && (
                      <p className="text-muted-foreground">{item.room}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      )}
    </div>
  )
}
