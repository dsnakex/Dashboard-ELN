'use client'

import { useRouter } from 'next/navigation'
import { ProtocolForm } from '@/components/protocols/protocol-form'
import { useCreateProtocol } from '@/lib/hooks/use-protocols'

export default function NewProtocolPage() {
  const router = useRouter()
  const createProtocol = useCreateProtocol()

  const handleSubmit = async (data: any) => {
    const protocol = await createProtocol.mutateAsync(data) as any
    router.push(`/protocols/${protocol.id}`)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <ProtocolForm
        onSubmit={handleSubmit}
        isLoading={createProtocol.isPending}
      />
    </div>
  )
}
