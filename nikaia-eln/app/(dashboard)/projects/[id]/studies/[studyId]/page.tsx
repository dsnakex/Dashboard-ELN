'use client'

import { use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useStudy, useDeleteStudy } from '@/lib/hooks/use-studies'
import { formatRelativeDate } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Plus,
  FlaskConical,
  Loader2
} from 'lucide-react'

const statusColors: Record<string, string> = {
  configuring: 'bg-slate-500/10 text-slate-500',
  pending: 'bg-amber-500/10 text-amber-500',
  in_progress: 'bg-blue-500/10 text-blue-500',
  completed: 'bg-green-500/10 text-green-500',
  signed: 'bg-purple-500/10 text-purple-500',
}

export default function StudyDetailPage({
  params
}: {
  params: Promise<{ id: string; studyId: string }>
}) {
  const { id: projectId, studyId } = use(params)
  const router = useRouter()
  const { data: study, isLoading, error } = useStudy(studyId) as { data: any; isLoading: boolean; error: any }
  const deleteStudy = useDeleteStudy()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !study) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Study not found</p>
        <Button asChild className="mt-4">
          <Link href={`/projects/${projectId}`}>Back to project</Link>
        </Button>
      </div>
    )
  }

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this study? All experiments will be deleted.')) {
      await deleteStudy.mutateAsync(study.id)
      router.push(`/projects/${projectId}`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/projects" className="hover:text-foreground">Projects</Link>
        <span>/</span>
        <Link href={`/projects/${projectId}`} className="hover:text-foreground">
          {(study.project as any)?.name || 'Project'}
        </Link>
        <span>/</span>
        <span className="text-foreground">{study.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{study.name}</h1>
          <p className="text-muted-foreground">
            Created {formatRelativeDate(study.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Description */}
      {study.description && (
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{study.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Experiments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Experiments</CardTitle>
            <CardDescription>
              {study.experiments?.length || 0} experiments in this study
            </CardDescription>
          </div>
          <Button asChild>
            <Link href={`/experiments/new?studyId=${study.id}`}>
              <Plus className="mr-2 h-4 w-4" />
              New Experiment
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {study.experiments && study.experiments.length > 0 ? (
            <div className="space-y-3">
              {study.experiments.map((exp: any) => (
                <Link
                  key={exp.id}
                  href={`/experiments/${exp.id}`}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FlaskConical className="h-5 w-5 text-primary" />
                    <div>
                      <h3 className="font-medium">{exp.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Updated {formatRelativeDate(exp.updated_at)}
                      </p>
                    </div>
                  </div>
                  <span className={cn('text-xs px-2 py-1 rounded-full', statusColors[exp.status] || '')}>
                    {exp.status}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-6">
              No experiments yet. Create your first experiment to get started.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
