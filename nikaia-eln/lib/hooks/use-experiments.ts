'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

interface ExperimentsOptions {
  status?: string
  studyId?: string
  projectId?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  limit?: number
  search?: string
}

// Fetch all experiments with filters
export function useExperiments(options?: ExperimentsOptions) {
  const {
    status,
    studyId,
    projectId,
    dateFrom,
    dateTo,
    page = 1,
    limit = 20,
    search
  } = options || {}

  return useQuery({
    queryKey: ['experiments', { status, studyId, projectId, dateFrom, dateTo, page, limit, search }],
    queryFn: async () => {
      const supabase = createClient()

      let query = supabase
        .from('experiments')
        .select(`
          *,
          study:studies(
            id,
            name,
            project:projects(id, name)
          )
        `, { count: 'exact' })
        .order('updated_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1)

      if (status) {
        query = query.eq('status', status)
      }

      if (studyId) {
        query = query.eq('study_id', studyId)
      }

      if (projectId) {
        query = query.eq('study.project_id', projectId)
      }

      if (dateFrom) {
        query = query.gte('created_at', dateFrom)
      }

      if (dateTo) {
        query = query.lte('created_at', dateTo)
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

// Fetch single experiment
export function useExperiment(id: string) {
  return useQuery({
    queryKey: ['experiments', id],
    queryFn: async () => {
      const supabase = createClient()

      const { data, error } = await supabase
        .from('experiments')
        .select(`
          *,
          study:studies(
            id,
            name,
            project:projects(id, name)
          ),
          protocol:protocols(id, name)
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!id,
  })
}

// Create experiment
export function useCreateExperiment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      name: string
      description?: string
      study_id: string
      protocol_id?: string
      status?: string
      content?: any
      tags?: string[]
    }) => {
      const supabase = createClient()

      const { data: experiment, error } = await supabase
        .from('experiments')
        .insert(data as any)
        .select()
        .single()

      if (error) throw error
      return experiment
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiments'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Experiment created successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create experiment')
    },
  })
}

// Update experiment
export function useUpdateExperiment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...data }: {
      id: string
      name?: string
      description?: string
      study_id?: string
      protocol_id?: string
      status?: string
      content?: any
      tags?: string[]
    }) => {
      const supabase = createClient()

      const { data: experiment, error } = await supabase
        .from('experiments')
        .update(data as any)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return experiment
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['experiments'] })
      queryClient.invalidateQueries({ queryKey: ['experiments', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Experiment updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update experiment')
    },
  })
}

// Delete experiment
export function useDeleteExperiment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient()

      const { error } = await supabase
        .from('experiments')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiments'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Experiment deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete experiment')
    },
  })
}

// Sign experiment
export function useSignExperiment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient()

      const { data: { user } } = await supabase.auth.getUser()

      const { data: experiment, error } = await supabase
        .from('experiments')
        .update({
          status: 'signed',
          signed_at: new Date().toISOString(),
          signed_by: user?.id
        } as any)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return experiment
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['experiments'] })
      queryClient.invalidateQueries({ queryKey: ['experiments', id] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Experiment signed successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to sign experiment')
    },
  })
}
