'use client'

import { useRouter } from 'next/navigation'
import { ProjectForm } from '@/components/projects/project-form'
import { useCreateProject } from '@/lib/hooks/use-projects'

export default function NewProjectPage() {
  const router = useRouter()
  const createProject = useCreateProject()

  const handleSubmit = async (data: { name: string; description?: string; status?: string }) => {
    const project = await createProject.mutateAsync(data) as any
    router.push(`/projects/${project.id}`)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <ProjectForm
        onSubmit={handleSubmit}
        isLoading={createProject.isPending}
      />
    </div>
  )
}
