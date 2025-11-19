'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

interface ActivityOptions {
  entityType?: string
  entityId?: string
  userId?: string
  limit?: number
}

export function useActivityLog(options?: ActivityOptions) {
  const { entityType, entityId, userId, limit = 50 } = options || {}

  return useQuery({
    queryKey: ['activity-log', { entityType, entityId, userId, limit }],
    queryFn: async () => {
      const supabase = createClient()

      let query = supabase
        .from('activity_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (entityType) query = query.eq('entity_type', entityType)
      if (entityId) query = query.eq('entity_id', entityId)
      if (userId) query = query.eq('user_id', userId)

      const { data, error } = await query
      if (error) throw error
      return data || []
    },
  })
}

export function useRecentActivity() {
  return useQuery({
    queryKey: ['activity-log', 'recent'],
    queryFn: async () => {
      const supabase = createClient()

      const { data, error } = await supabase
        .from('activity_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error
      return data || []
    },
  })
}
