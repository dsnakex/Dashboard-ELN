'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

// KPIs
export function useKpis() {
  return useQuery({
    queryKey: ['dashboard', 'kpis'],
    queryFn: async () => {
      const supabase = createClient()

      // Fetch all counts in parallel
      const [
        experimentsTotal,
        experimentsActive,
        experimentsSigned,
        projectsActive,
        protocolsTotal,
        samplesExpiring,
        equipmentMaintenance,
      ] = await Promise.all([
        // Total experiments
        supabase.from('experiments').select('*', { count: 'exact', head: true }),
        // Active experiments (in_progress)
        supabase
          .from('experiments')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'in_progress'),
        // Signed experiments (last 30 days)
        supabase
          .from('experiments')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'signed')
          .gte('signed_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
        // Active projects
        supabase
          .from('projects')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active'),
        // Total protocols
        supabase
          .from('protocols')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true),
        // Samples expiring within 30 days
        supabase
          .from('samples')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'available')
          .lte('expiration_date', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString())
          .gte('expiration_date', new Date().toISOString()),
        // Equipment needing maintenance within 7 days
        supabase
          .from('equipment')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'operational')
          .lte('next_maintenance_date', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()),
      ])

      return {
        experimentsTotal: experimentsTotal.count ?? 0,
        experimentsActive: experimentsActive.count ?? 0,
        experimentsSigned: experimentsSigned.count ?? 0,
        projectsActive: projectsActive.count ?? 0,
        protocolsTotal: protocolsTotal.count ?? 0,
        samplesExpiring: samplesExpiring.count ?? 0,
        equipmentMaintenance: equipmentMaintenance.count ?? 0,
      }
    },
    staleTime: 60 * 1000, // 1 minute
  })
}

// Recent experiments
export function useRecentExperiments(limit: number = 10) {
  return useQuery({
    queryKey: ['dashboard', 'recent-experiments', limit],
    queryFn: async () => {
      const supabase = createClient()

      const { data, error } = await supabase
        .from('experiments')
        .select(`
          id,
          name,
          status,
          updated_at,
          study:studies(
            id,
            name,
            project:projects(id, name)
          )
        `)
        .order('updated_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data
    },
    staleTime: 30 * 1000, // 30 seconds
  })
}

// Activity log
export function useActivityLog(limit: number = 20) {
  return useQuery({
    queryKey: ['dashboard', 'activity-log', limit],
    queryFn: async () => {
      const supabase = createClient()

      const { data, error } = await supabase
        .from('activity_log')
        .select(`
          id,
          action,
          entity_type,
          entity_id,
          created_at,
          user:users(id, full_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data
    },
    staleTime: 30 * 1000, // 30 seconds
  })
}

// Experiments per month (for chart)
export function useExperimentsPerMonth() {
  return useQuery({
    queryKey: ['dashboard', 'experiments-per-month'],
    queryFn: async () => {
      const supabase = createClient()

      // Get experiments from last 6 months
      const sixMonthsAgo = new Date()
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

      const { data, error } = await supabase
        .from('experiments')
        .select('created_at')
        .gte('created_at', sixMonthsAgo.toISOString())
        .order('created_at', { ascending: true })

      if (error) throw error

      // Group by month
      const monthCounts: Record<string, number> = {}
      data?.forEach((exp: any) => {
        const date = new Date(exp.created_at)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1
      })

      // Convert to array for Recharts
      return Object.entries(monthCounts).map(([month, count]) => ({
        month,
        count,
      }))
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Experiments by status (for pie chart)
export function useExperimentsByStatus() {
  return useQuery({
    queryKey: ['dashboard', 'experiments-by-status'],
    queryFn: async () => {
      const supabase = createClient()

      const statuses = ['configuring', 'pending', 'in_progress', 'completed', 'signed']
      const results = await Promise.all(
        statuses.map((status) =>
          supabase
            .from('experiments')
            .select('*', { count: 'exact', head: true })
            .eq('status', status)
        )
      )

      return statuses.map((status, i) => ({
        status,
        count: results[i].count ?? 0,
      }))
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Projects with experiment counts
export function useProjectsOverview() {
  return useQuery({
    queryKey: ['dashboard', 'projects-overview'],
    queryFn: async () => {
      const supabase = createClient()

      const { data, error } = await supabase
        .from('projects')
        .select(`
          id,
          name,
          status,
          studies(
            id,
            experiments(id)
          )
        `)
        .eq('status', 'active')
        .limit(10)

      if (error) throw error

      return data?.map((project: any) => ({
        name: project.name.length > 15 ? project.name.substring(0, 15) + '...' : project.name,
        experiments: project.studies?.reduce((acc: number, study: any) =>
          acc + (study.experiments?.length || 0), 0) || 0,
        studies: project.studies?.length || 0,
      })) || []
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Weekly activity trend
export function useWeeklyActivity() {
  return useQuery({
    queryKey: ['dashboard', 'weekly-activity'],
    queryFn: async () => {
      const supabase = createClient()

      // Get last 7 days
      const days = []
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        days.push(date.toISOString().split('T')[0])
      }

      const { data, error } = await supabase
        .from('activity_log')
        .select('created_at, action')
        .gte('created_at', days[0])

      if (error) throw error

      // Group by day
      const activityByDay: Record<string, number> = {}
      days.forEach(day => { activityByDay[day] = 0 })

      data?.forEach((activity: any) => {
        const day = activity.created_at.split('T')[0]
        if (activityByDay[day] !== undefined) {
          activityByDay[day]++
        }
      })

      return days.map(day => ({
        day: new Date(day).toLocaleDateString('en-US', { weekday: 'short' }),
        activities: activityByDay[day] || 0,
      }))
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
