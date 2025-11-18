'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { ProtocolForm } from '@/components/protocols/protocol-form'
import { useProtocol, useUpdateProtocol } from '@/lib/hooks/use-protocols'
import { Loader2 } from 'lucide-react'

export default function EditProtocolPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const { data: protocol, isLoading } = useProtocol(id) as { data: any; isLoading: boolean }
  const updateProtocol = useUpdateProtocol()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!protocol) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Protocol not found</p>
      </div>
    )
  }

  const handleSubmit = async (data: any) => {
    await updateProtocol.mutateAsync({ id, ...data })
    router.push(`/protocols/${id}`)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <ProtocolForm
        protocol={protocol}
        onSubmit={handleSubmit}
        isLoading={updateProtocol.isPending}
      />
    </div>
  )
}
