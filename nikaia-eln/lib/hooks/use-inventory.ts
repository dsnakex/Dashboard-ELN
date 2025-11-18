'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

// === SAMPLES ===

export function useSamples(options?: {
  type?: string
  status?: string
  search?: string
  page?: number
  limit?: number
}) {
  const { type, status, search, page = 1, limit = 20 } = options || {}

  return useQuery({
    queryKey: ['samples', { type, status, search, page, limit }],
    queryFn: async () => {
      const supabase = createClient()

      let query = supabase
        .from('samples')
        .select('*, storage_unit:storage_units(id, name)', { count: 'exact' })
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1)

      if (type) query = query.eq('sample_type', type)
      if (status) query = query.eq('status', status)
      if (search) query = query.ilike('name', `%${search}%`)

      const { data, error, count } = await query
      if (error) throw error
      return { data, count }
    },
  })
}

export function useSample(id: string) {
  return useQuery({
    queryKey: ['samples', id],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('samples')
        .select('*, storage_unit:storage_units(id, name)')
        .eq('id', id)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!id,
  })
}

export function useCreateSample() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: any) => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      const { data: sample, error } = await supabase
        .from('samples')
        .insert({ ...data, created_by: user?.id } as any)
        .select()
        .single()
      if (error) throw error
      return sample
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['samples'] })
      toast.success('Sample created successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create sample')
    },
  })
}

export function useUpdateSample() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const supabase = createClient()
      const { data: sample, error } = await supabase
        .from('samples')
        .update(data as any)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return sample
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['samples'] })
      queryClient.invalidateQueries({ queryKey: ['samples', variables.id] })
      toast.success('Sample updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update sample')
    },
  })
}

export function useDeleteSample() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient()
      const { error } = await supabase
        .from('samples')
        .update({ is_active: false } as any)
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['samples'] })
      toast.success('Sample deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete sample')
    },
  })
}

// === STORAGE UNITS ===

export function useStorageUnits() {
  return useQuery({
    queryKey: ['storage-units'],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('storage_units')
        .select('*')
        .eq('is_active', true)
        .order('name')
      if (error) throw error
      return data
    },
  })
}

export function useCreateStorageUnit() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: any) => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      const { data: unit, error } = await supabase
        .from('storage_units')
        .insert({ ...data, created_by: user?.id } as any)
        .select()
        .single()
      if (error) throw error
      return unit
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storage-units'] })
      toast.success('Storage unit created successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create storage unit')
    },
  })
}

// === EQUIPMENT ===

export function useEquipment(options?: { status?: string; search?: string }) {
  const { status, search } = options || {}

  return useQuery({
    queryKey: ['equipment', { status, search }],
    queryFn: async () => {
      const supabase = createClient()

      let query = supabase
        .from('equipment')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (status) query = query.eq('status', status)
      if (search) query = query.ilike('name', `%${search}%`)

      const { data, error } = await query
      if (error) throw error
      return data
    },
  })
}

export function useCreateEquipment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: any) => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      const { data: equipment, error } = await supabase
        .from('equipment')
        .insert({ ...data, created_by: user?.id } as any)
        .select()
        .single()
      if (error) throw error
      return equipment
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] })
      toast.success('Equipment created successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create equipment')
    },
  })
}
