'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export function useComments(entityType: string, entityId: string) {
  return useQuery({
    queryKey: ['comments', entityType, entityId],
    queryFn: async () => {
      const supabase = createClient()

      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          user:users(id, full_name, email, avatar_url)
        `)
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .order('created_at', { ascending: true })

      if (error) throw error
      return data
    },
    enabled: !!entityId,
  })
}

export function useCreateComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      entityType,
      entityId,
      content,
      parentId,
    }: {
      entityType: string
      entityId: string
      content: string
      parentId?: string
    }) => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('comments')
        .insert({
          entity_type: entityType,
          entity_id: entityId,
          content,
          parent_id: parentId,
          user_id: user.id,
        } as any)
        .select(`
          *,
          user:users(id, full_name, email, avatar_url)
        `)
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['comments', variables.entityType, variables.entityId],
      })
    },
  })
}

export function useUpdateComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      content,
      entityType,
      entityId,
    }: {
      id: string
      content: string
      entityType: string
      entityId: string
    }) => {
      const supabase = createClient()

      const { data, error } = await supabase
        .from('comments')
        .update({ content, updated_at: new Date().toISOString() } as any)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['comments', variables.entityType, variables.entityId],
      })
    },
  })
}

export function useDeleteComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      entityType,
      entityId,
    }: {
      id: string
      entityType: string
      entityId: string
    }) => {
      const supabase = createClient()

      const { error } = await supabase.from('comments').delete().eq('id', id)

      if (error) throw error
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['comments', variables.entityType, variables.entityId],
      })
    },
  })
}
