'use client'

import {
  FlaskConical,
  Folder,
  ClipboardList,
  AlertTriangle,
  CheckCircle2,
  Wrench,
} from 'lucide-react'
import { KpiCard } from '@/components/dashboard/kpi-card'
import { RecentExperiments } from '@/components/dashboard/recent-experiments'
import { ActivityFeed } from '@/components/dashboard/activity-feed'
import { StatsChart } from '@/components/dashboard/stats-chart'
import { useKpis } from '@/lib/hooks/use-dashboard'

export default function DashboardPage() {
  const { data: kpis, isLoading } = useKpis()

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s an overview of your lab activity.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <KpiCard
          title="Total Experiments"
          value={kpis?.experimentsTotal ?? 0}
          description="All time"
          icon={FlaskConical}
          color="text-blue-500"
          isLoading={isLoading}
        />
        <KpiCard
          title="Active Experiments"
          value={kpis?.experimentsActive ?? 0}
          description="In progress"
          icon={FlaskConical}
          color="text-primary"
          isLoading={isLoading}
        />
        <KpiCard
          title="Signed This Month"
          value={kpis?.experimentsSigned ?? 0}
          description="Last 30 days"
          icon={CheckCircle2}
          color="text-green-500"
          isLoading={isLoading}
        />
        <KpiCard
          title="Active Projects"
          value={kpis?.projectsActive ?? 0}
          description="Currently running"
          icon={Folder}
          color="text-purple-500"
          isLoading={isLoading}
        />
        <KpiCard
          title="Protocols"
          value={kpis?.protocolsTotal ?? 0}
          description="Total available"
          icon={ClipboardList}
          color="text-orange-500"
          isLoading={isLoading}
        />
        <KpiCard
          title="Samples Expiring"
          value={kpis?.samplesExpiring ?? 0}
          description="Within 30 days"
          icon={AlertTriangle}
          color="text-red-500"
          isLoading={isLoading}
        />
      </div>

      {/* Chart */}
      <StatsChart />

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <RecentExperiments />
        <ActivityFeed />
      </div>
    </div>
  )
}
