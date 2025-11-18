'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { ExperimentForm } from '@/components/experiments/experiment-form'
import { useExperiment, useUpdateExperiment } from '@/lib/hooks/use-experiments'
import { Loader2 } from 'lucide-react'

export default function EditExperimentPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const { data: experiment, isLoading } = useExperiment(id) as { data: any; isLoading: boolean }
  const updateExperiment = useUpdateExperiment()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!experiment) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Experiment not found</p>
      </div>
    )
  }

  const handleSubmit = async (data: any) => {
    await updateExperiment.mutateAsync({ id, ...data })
    router.push(`/experiments/${id}`)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <ExperimentForm
        experiment={experiment}
        onSubmit={handleSubmit}
        isLoading={updateExperiment.isPending}
      />
    </div>
  )
}
