'use client'

import { use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSample, useDeleteSample } from '@/lib/hooks/use-inventory'
import { formatDate, formatRelativeDate } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'
import {
  ArrowLeft,
  Trash2,
  Loader2,
  TestTube,
  MapPin
} from 'lucide-react'

const statusColors: Record<string, string> = {
  available: 'bg-green-500/10 text-green-500',
  in_use: 'bg-blue-500/10 text-blue-500',
  depleted: 'bg-gray-500/10 text-gray-500',
  expired: 'bg-red-500/10 text-red-500',
}

export default function SampleDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const { data: sample, isLoading, error } = useSample(id) as { data: any; isLoading: boolean; error: any }
  const deleteSample = useDeleteSample()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !sample) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Sample not found</p>
        <Button asChild className="mt-4">
          <Link href="/inventory">Back to inventory</Link>
        </Button>
      </div>
    )
  }

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this sample?')) {
      await deleteSample.mutateAsync(sample.id)
      router.push('/inventory')
    }
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/inventory" className="hover:text-foreground">Inventory</Link>
        <span>/</span>
        <span className="text-foreground">{sample.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <TestTube className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">{sample.name}</h1>
            <span className={cn(
              'text-xs px-2.5 py-1 rounded-full capitalize',
              statusColors[sample.status]
            )}>
              {sample.status}
            </span>
          </div>
          <p className="text-muted-foreground capitalize">
            {sample.sample_type?.replace('_', ' ')}
          </p>
        </div>
        <Button variant="destructive" onClick={handleDelete}>
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </Button>
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quantity & Concentration</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3 text-sm">
              {sample.quantity && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Quantity</dt>
                  <dd className="font-medium">{sample.quantity} {sample.unit}</dd>
                </div>
              )}
              {sample.concentration && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Concentration</dt>
                  <dd className="font-medium">{sample.concentration} {sample.concentration_unit}</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Storage Location</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3 text-sm">
              {sample.storage_unit && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Storage Unit</dt>
                  <dd className="font-medium">{sample.storage_unit.name}</dd>
                </div>
              )}
              {sample.position && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Position</dt>
                  <dd className="font-medium">{sample.position}</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Provenance</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3 text-sm">
              {sample.supplier && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Supplier</dt>
                  <dd className="font-medium">{sample.supplier}</dd>
                </div>
              )}
              {sample.catalog_number && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Catalog #</dt>
                  <dd className="font-medium">{sample.catalog_number}</dd>
                </div>
              )}
              {sample.lot_number && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Lot #</dt>
                  <dd className="font-medium">{sample.lot_number}</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dates</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3 text-sm">
              {sample.received_date && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Received</dt>
                  <dd className="font-medium">{formatDate(sample.received_date)}</dd>
                </div>
              )}
              {sample.expiration_date && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Expires</dt>
                  <dd className="font-medium">{formatDate(sample.expiration_date)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Added</dt>
                <dd>{formatRelativeDate(sample.created_at)}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
