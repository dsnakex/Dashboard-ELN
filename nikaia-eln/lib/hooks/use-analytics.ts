'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export function useAnalytics() {
  return useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const supabase = createClient()

      // Get various statistics
      const [
        experimentsResult,
        projectsResult,
        protocolsResult,
        samplesResult,
      ] = await Promise.all([
        supabase.from('experiments').select('id, status, created_at, signed_at'),
        supabase.from('projects').select('id, status, created_at'),
        supabase.from('protocols').select('id, visibility, created_at'),
        supabase.from('samples').select('id, status, created_at, sample_type'),
      ])

      const experiments = experimentsResult.data || []
      const projects = projectsResult.data || []
      const protocols = protocolsResult.data || []
      const samples = samplesResult.data || []

      // Calculate statistics
      const now = new Date()
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

      // Experiments stats
      const experimentsThisMonth = experiments.filter(
        e => new Date(e.created_at) >= thirtyDaysAgo
      ).length
      const experimentsThisWeek = experiments.filter(
        e => new Date(e.created_at) >= sevenDaysAgo
      ).length
      const signedExperiments = experiments.filter(e => e.status === 'signed').length
      const completionRate = experiments.length > 0
        ? Math.round((signedExperiments / experiments.length) * 100)
        : 0

      // Average time to sign (in days)
      const signedWithTime = experiments.filter(e => e.signed_at)
      const avgTimeToSign = signedWithTime.length > 0
        ? Math.round(
            signedWithTime.reduce((acc, e) => {
              const created = new Date(e.created_at).getTime()
              const signed = new Date(e.signed_at).getTime()
              return acc + (signed - created) / (1000 * 60 * 60 * 24)
            }, 0) / signedWithTime.length
          )
        : 0

      // Status distribution
      const statusDistribution = experiments.reduce((acc: Record<string, number>, e) => {
        acc[e.status] = (acc[e.status] || 0) + 1
        return acc
      }, {})

      // Monthly trends (last 6 months)
      const monthlyTrends = []
      for (let i = 5; i >= 0; i--) {
        const date = new Date()
        date.setMonth(date.getMonth() - i)
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)

        const monthExperiments = experiments.filter(e => {
          const created = new Date(e.created_at)
          return created >= monthStart && created <= monthEnd
        }).length

        const monthSigned = experiments.filter(e => {
          if (!e.signed_at) return false
          const signed = new Date(e.signed_at)
          return signed >= monthStart && signed <= monthEnd
        }).length

        monthlyTrends.push({
          month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
          created: monthExperiments,
          signed: monthSigned,
        })
      }

      // Sample types distribution
      const sampleTypes = samples.reduce((acc: Record<string, number>, s) => {
        const type = s.sample_type || 'Unknown'
        acc[type] = (acc[type] || 0) + 1
        return acc
      }, {})

      // Protocol visibility distribution
      const protocolVisibility = protocols.reduce((acc: Record<string, number>, p) => {
        acc[p.visibility] = (acc[p.visibility] || 0) + 1
        return acc
      }, {})

      return {
        summary: {
          totalExperiments: experiments.length,
          experimentsThisMonth,
          experimentsThisWeek,
          totalProjects: projects.length,
          activeProjects: projects.filter(p => p.status === 'active').length,
          totalProtocols: protocols.length,
          totalSamples: samples.length,
          completionRate,
          avgTimeToSign,
        },
        statusDistribution: Object.entries(statusDistribution).map(([status, count]) => ({
          status,
          count,
        })),
        monthlyTrends,
        sampleTypes: Object.entries(sampleTypes).map(([type, count]) => ({
          type,
          count,
        })),
        protocolVisibility: Object.entries(protocolVisibility).map(([visibility, count]) => ({
          visibility,
          count,
        })),
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
