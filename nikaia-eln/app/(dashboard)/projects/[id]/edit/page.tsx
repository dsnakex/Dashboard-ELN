'use client'

import { useRouter } from 'next/navigation'
import { use } from 'react'
import { ProjectForm } from '@/components/projects/project-form'
import { useProject, useUpdateProject } from '@/lib/hooks/use-projects'
import { Loader2 } from 'lucide-react'

export default function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { data: project, isLoading: isLoadingProject } = useProject(id)
  const updateProject = useUpdateProject()

  const handleSubmit = async (data: { name: string; description?: string; status?: string }) => {
    await updateProject.mutateAsync({ id, ...data })
    router.push(`/projects/${id}`)
  }

  if (isLoadingProject) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Project not found</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <ProjectForm
        initialData={{
          id: project.id,
          name: project.name,
          description: project.description || '',
          status: project.status || 'active',
        }}
        onSubmit={handleSubmit}
        isLoading={updateProject.isPending}
      />
    </div>
  )
}
