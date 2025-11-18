import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  FlaskConical,
  Folder,
  ClipboardList,
  Box,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react'

// Placeholder KPI data
const kpis = [
  {
    title: 'Total Experiments',
    value: '156',
    description: 'All time',
    icon: FlaskConical,
    color: 'text-blue-500',
  },
  {
    title: 'Active Experiments',
    value: '12',
    description: 'In progress',
    icon: FlaskConical,
    color: 'text-primary',
  },
  {
    title: 'Signed This Month',
    value: '8',
    description: 'Last 30 days',
    icon: CheckCircle2,
    color: 'text-green-500',
  },
  {
    title: 'Active Projects',
    value: '5',
    description: 'Currently running',
    icon: Folder,
    color: 'text-purple-500',
  },
  {
    title: 'Protocols',
    value: '34',
    description: 'Total available',
    icon: ClipboardList,
    color: 'text-orange-500',
  },
  {
    title: 'Samples Expiring',
    value: '3',
    description: 'Within 30 days',
    icon: AlertTriangle,
    color: 'text-red-500',
  },
]

export default function DashboardPage() {
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
        {kpis.map((kpi) => (
          <Card key={kpi.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.title}
              </CardTitle>
              <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className="text-xs text-muted-foreground">{kpi.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity Placeholder */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Experiments</CardTitle>
            <CardDescription>Your latest experiment activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Experiment {i}</p>
                    <p className="text-xs text-muted-foreground">
                      Updated 2 hours ago
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                    In Progress
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activity Feed</CardTitle>
            <CardDescription>Recent actions in your lab</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                'Created new experiment',
                'Signed experiment #45',
                'Added sample to inventory',
                'Updated protocol',
                'Created new project',
              ].map((activity, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-xs font-medium">JD</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{activity}</p>
                    <p className="text-xs text-muted-foreground">
                      {i + 1} hour{i > 0 ? 's' : ''} ago
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info card */}
      <Card className="border-primary/50 bg-primary/5">
        <CardContent className="pt-6">
          <div className="text-center">
            <h3 className="font-semibold text-primary">Setup in Progress</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              This is a placeholder dashboard. Connect your Supabase database and run
              the migration scripts to see real data.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
