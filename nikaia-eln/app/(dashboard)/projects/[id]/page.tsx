'use client'

import { use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useProject, useDeleteProject } from '@/lib/hooks/use-projects'
import { useDeleteStudy } from '@/lib/hooks/use-studies'
import { formatDate, formatRelativeDate } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Plus,
  Folder,
  FlaskConical,
  Loader2
} from 'lucide-react'

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { data: project, isLoading, error } = useProject(id) as { data: any; isLoading: boolean; error: any }
  const deleteProject = useDeleteProject()
  const deleteStudy = useDeleteStudy()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Project not found</p>
        <Button asChild className="mt-4">
          <Link href="/projects">Back to projects</Link>
        </Button>
      </div>
    )
  }

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this project? All studies and experiments will be deleted.')) {
      await deleteProject.mutateAsync(project.id)
      router.push('/projects')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <Folder className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">{project.name}</h1>
          </div>
          <p className="text-muted-foreground">
            Created {formatRelativeDate(project.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/projects/${project.id}/edit`}>
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
      {project.description && (
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{project.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Studies */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Studies</CardTitle>
            <CardDescription>
              {project.studies?.length || 0} studies in this project
            </CardDescription>
          </div>
          <Button asChild>
            <Link href={`/projects/${project.id}/studies/new`}>
              <Plus className="mr-2 h-4 w-4" />
              New Study
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {project.studies && project.studies.length > 0 ? (
            <div className="space-y-3">
              {project.studies.map((study: any) => (
                <div
                  key={study.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <Link
                    href={`/projects/${project.id}/studies/${study.id}`}
                    className="flex-1"
                  >
                    <h3 className="font-medium">{study.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {study.experiments?.[0]?.count || 0} experiments
                    </p>
                  </Link>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm('Delete this study?')) {
                          deleteStudy.mutate(study.id)
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-6">
              No studies yet. Create your first study to get started.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
