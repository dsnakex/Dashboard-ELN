'use client'

import { use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RichTextEditor } from '@/components/experiments/rich-text-editor'
import { UsedInExperiments } from '@/components/protocols/used-in-experiments'
import { useProtocol, useDeleteProtocol, useDuplicateProtocol } from '@/lib/hooks/use-protocols'
import { formatRelativeDate } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Copy,
  Clock,
  User,
  Users,
  Globe,
  Loader2
} from 'lucide-react'

const difficultyColors: Record<string, string> = {
  easy: 'bg-green-500/10 text-green-500',
  medium: 'bg-amber-500/10 text-amber-500',
  hard: 'bg-red-500/10 text-red-500',
}

const visibilityConfig: Record<string, { icon: React.ElementType; label: string }> = {
  personal: { icon: User, label: 'Personal' },
  group: { icon: Users, label: 'Group' },
  public: { icon: Globe, label: 'Public' },
}

export default function ProtocolDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const { data: protocol, isLoading, error } = useProtocol(id) as { data: any; isLoading: boolean; error: any }
  const deleteProtocol = useDeleteProtocol()
  const duplicateProtocol = useDuplicateProtocol()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !protocol) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Protocol not found</p>
        <Button asChild className="mt-4">
          <Link href="/protocols">Back to protocols</Link>
        </Button>
      </div>
    )
  }

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this protocol?')) {
      await deleteProtocol.mutateAsync(protocol.id)
      router.push('/protocols')
    }
  }

  const handleDuplicate = async () => {
    const newProtocol = await duplicateProtocol.mutateAsync(protocol.id) as any
    router.push(`/protocols/${newProtocol.id}`)
  }

  const visConfig = visibilityConfig[protocol.visibility] || visibilityConfig.personal
  const VisibilityIcon = visConfig.icon

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/protocols" className="hover:text-foreground">Protocols</Link>
        <span>/</span>
        <span className="text-foreground">{protocol.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{protocol.name}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
            <span className="flex items-center gap-1">
              <VisibilityIcon className="h-4 w-4" />
              {visConfig.label}
            </span>
            {protocol.category && (
              <span className="px-2 py-0.5 rounded-full bg-muted text-xs">
                {protocol.category}
              </span>
            )}
            {protocol.difficulty && (
              <span className={cn(
                'px-2 py-0.5 rounded-full text-xs capitalize',
                difficultyColors[protocol.difficulty]
              )}>
                {protocol.difficulty}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleDuplicate}
            disabled={duplicateProtocol.isPending}
          >
            {duplicateProtocol.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Copy className="mr-2 h-4 w-4" />
            )}
            Duplicate
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/protocols/${protocol.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Description */}
      {protocol.description && (
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{protocol.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Meta info */}
      {(protocol.estimated_duration_minutes || protocol.version) && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-6 text-sm">
              {protocol.estimated_duration_minutes && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{protocol.estimated_duration_minutes} minutes</span>
                </div>
              )}
              <div>
                <span className="text-muted-foreground">Version:</span>{' '}
                <span className="font-medium">{protocol.version || 1}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Updated:</span>{' '}
                <span>{formatRelativeDate(protocol.updated_at)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle>Content</CardTitle>
        </CardHeader>
        <CardContent>
          {protocol.content && Object.keys(protocol.content).length > 0 ? (
            <RichTextEditor
              content={protocol.content}
              readOnly
              className="border-0"
            />
          ) : (
            <p className="text-muted-foreground text-center py-6">
              No content yet
            </p>
          )}
        </CardContent>
      </Card>

      {/* Used in Experiments */}
      <UsedInExperiments protocolId={protocol.id} />
    </div>
  )
}
