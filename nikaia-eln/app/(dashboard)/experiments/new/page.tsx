'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { ExperimentForm } from '@/components/experiments/experiment-form'
import { useCreateExperiment } from '@/lib/hooks/use-experiments'

export default function NewExperimentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const studyId = searchParams.get('studyId')
  const createExperiment = useCreateExperiment()

  const handleSubmit = async (data: any) => {
    const experiment = await createExperiment.mutateAsync(data) as any
    router.push(`/experiments/${experiment.id}`)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <ExperimentForm
        experiment={studyId ? { study_id: studyId } : undefined}
        onSubmit={handleSubmit}
        isLoading={createExperiment.isPending}
      />
    </div>
  )
}
