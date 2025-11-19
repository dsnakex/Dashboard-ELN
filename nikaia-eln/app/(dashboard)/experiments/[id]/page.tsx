'use client'

import { use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/experiments/status-badge'
import { RichTextEditor } from '@/components/experiments/rich-text-editor'
import { useExperiment, useDeleteExperiment, useSignExperiment } from '@/lib/hooks/use-experiments'
import { formatDate, formatRelativeDate } from '@/lib/utils/format'
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Loader2,
  CheckCircle
} from 'lucide-react'
import { CommentsSection } from '@/components/comments/comments-section'

export default function ExperimentDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const { data: experiment, isLoading, error } = useExperiment(id) as { data: any; isLoading: boolean; error: any }
  const deleteExperiment = useDeleteExperiment()
  const signExperiment = useSignExperiment()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !experiment) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Experiment not found</p>
        <Button asChild className="mt-4">
          <Link href="/experiments">Back to experiments</Link>
        </Button>
      </div>
    )
  }

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this experiment?')) {
      await deleteExperiment.mutateAsync(experiment.id)
      router.push('/experiments')
    }
  }

  const handleSign = async () => {
    if (confirm('Are you sure you want to sign this experiment? This action cannot be undone.')) {
      await signExperiment.mutateAsync(experiment.id)
    }
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/experiments" className="hover:text-foreground">Experiments</Link>
        {experiment.study && (
          <>
            <span>/</span>
            <Link
              href={`/projects/${experiment.study.project?.id}`}
              className="hover:text-foreground"
            >
              {experiment.study.project?.name || 'Project'}
            </Link>
            <span>/</span>
            <Link
              href={`/projects/${experiment.study.project?.id}/studies/${experiment.study.id}`}
              className="hover:text-foreground"
            >
              {experiment.study.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-foreground">{experiment.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{experiment.name}</h1>
            <StatusBadge status={experiment.status} />
          </div>
          <p className="text-muted-foreground">
            Created {formatRelativeDate(experiment.created_at)}
            {experiment.updated_at !== experiment.created_at && (
              <> • Updated {formatRelativeDate(experiment.updated_at)}</>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {experiment.status !== 'signed' && (
            <>
              <Button variant="outline" asChild>
                <Link href={`/experiments/${experiment.id}/edit`}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </Button>
              {experiment.status === 'completed' && (
                <Button
                  onClick={handleSign}
                  disabled={signExperiment.isPending}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {signExperiment.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="mr-2 h-4 w-4" />
                  )}
                  Sign
                </Button>
              )}
            </>
          )}
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Description */}
      {experiment.description && (
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{experiment.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle>Content</CardTitle>
        </CardHeader>
        <CardContent>
          {experiment.content && Object.keys(experiment.content).length > 0 ? (
            <RichTextEditor
              content={experiment.content}
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

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-muted-foreground">Project</dt>
              <dd className="font-medium">{experiment.study?.project?.name || 'N/A'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Study</dt>
              <dd className="font-medium">{experiment.study?.name || 'N/A'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Protocol</dt>
              <dd className="font-medium">{experiment.protocol?.name || 'None'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Status</dt>
              <dd><StatusBadge status={experiment.status} /></dd>
            </div>
            {experiment.signed_at && (
              <>
                <div>
                  <dt className="text-muted-foreground">Signed at</dt>
                  <dd className="font-medium">{formatDate(experiment.signed_at)}</dd>
                </div>
              </>
            )}
          </dl>
        </CardContent>
      </Card>

      {/* Comments */}
      <CommentsSection entityType="experiment" entityId={experiment.id} />
    </div>
  )
}
