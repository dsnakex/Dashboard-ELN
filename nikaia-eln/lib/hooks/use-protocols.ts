'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

interface ProtocolsOptions {
  category?: string
  visibility?: string
  tags?: string[]
  search?: string
  page?: number
  limit?: number
}

// Fetch all protocols
export function useProtocols(options?: ProtocolsOptions) {
  const {
    category,
    visibility,
    tags,
    search,
    page = 1,
    limit = 20
  } = options || {}

  return useQuery({
    queryKey: ['protocols', { category, visibility, tags, search, page, limit }],
    queryFn: async () => {
      const supabase = createClient()

      let query = supabase
        .from('protocols')
        .select('*', { count: 'exact' })
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1)

      if (category) {
        query = query.eq('category', category)
      }

      if (visibility) {
        query = query.eq('visibility', visibility)
      }

      if (tags && tags.length > 0) {
        query = query.contains('tags', tags)
      }

      if (search) {
        query = query.ilike('name', `%${search}%`)
      }

      const { data, error, count } = await query

      if (error) throw error
      return { data, count }
    },
  })
}

// Fetch single protocol
export function useProtocol(id: string) {
  return useQuery({
    queryKey: ['protocols', id],
    queryFn: async () => {
      const supabase = createClient()

      const { data, error } = await supabase
        .from('protocols')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!id,
  })
}

// Get experiments using a protocol
export function useProtocolExperiments(protocolId: string) {
  return useQuery({
    queryKey: ['protocols', protocolId, 'experiments'],
    queryFn: async () => {
      const supabase = createClient()

      const { data, error } = await supabase
        .from('experiments')
        .select(`
          id,
          name,
          status,
          updated_at,
          study:studies(id, name, project:projects(id, name))
        `)
        .eq('protocol_id', protocolId)
        .order('updated_at', { ascending: false })

      if (error) throw error
      return data
    },
    enabled: !!protocolId,
  })
}

// Create protocol
export function useCreateProtocol() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      name: string
      description?: string
      content?: any
      category?: string
      visibility?: string
      estimated_duration_minutes?: number
      difficulty?: string
      tags?: string[]
    }) => {
      const supabase = createClient()

      const { data: { user } } = await supabase.auth.getUser()

      const { data: protocol, error } = await supabase
        .from('protocols')
        .insert({
          ...data,
          created_by: user?.id,
        } as any)
        .select()
        .single()

      if (error) throw error
      return protocol
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['protocols'] })
      toast.success('Protocol created successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create protocol')
    },
  })
}

// Update protocol
export function useUpdateProtocol() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...data }: {
      id: string
      name?: string
      description?: string
      content?: any
      category?: string
      visibility?: string
      estimated_duration_minutes?: number
      difficulty?: string
      tags?: string[]
    }) => {
      const supabase = createClient()

      const { data: protocol, error } = await supabase
        .from('protocols')
        .update(data as any)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return protocol
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['protocols'] })
      queryClient.invalidateQueries({ queryKey: ['protocols', variables.id] })
      toast.success('Protocol updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update protocol')
    },
  })
}

// Delete protocol
export function useDeleteProtocol() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient()

      const { error } = await supabase
        .from('protocols')
        .update({ is_active: false } as any)
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['protocols'] })
      toast.success('Protocol deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete protocol')
    },
  })
}

// Duplicate protocol
export function useDuplicateProtocol() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient()

      // Get original protocol
      const { data: original, error: fetchError } = await supabase
        .from('protocols')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      const { data: { user } } = await supabase.auth.getUser()

      // Create duplicate
      const { data: protocol, error: createError } = await supabase
        .from('protocols')
        .insert({
          name: `${original.name} (Copy)`,
          description: original.description,
          content: original.content,
          category: original.category,
          visibility: 'personal',
          estimated_duration_minutes: original.estimated_duration_minutes,
          difficulty: original.difficulty,
          tags: original.tags,
          created_by: user?.id,
        } as any)
        .select()
        .single()

      if (createError) throw createError
      return protocol
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['protocols'] })
      toast.success('Protocol duplicated successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to duplicate protocol')
    },
  })
}
