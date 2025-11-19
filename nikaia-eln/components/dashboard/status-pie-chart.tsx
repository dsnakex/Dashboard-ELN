'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useExperimentsByStatus } from '@/lib/hooks/use-dashboard'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts'

const STATUS_COLORS: Record<string, string> = {
  configuring: '#94a3b8', // slate
  pending: '#fbbf24', // amber
  in_progress: '#3b82f6', // blue
  completed: '#22c55e', // green
  signed: '#8b5cf6', // violet
}

const STATUS_LABELS: Record<string, string> = {
  configuring: 'Configuring',
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
  signed: 'Signed',
}

export function StatusPieChart() {
  const { data: statusData, isLoading, error } = useExperimentsByStatus()

  const chartData = statusData?.filter(item => item.count > 0) ?? []

  return (
    <Card>
      <CardHeader>
        <CardTitle>Experiments by Status</CardTitle>
        <CardDescription>Distribution of experiment statuses</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : error ? (
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Unable to load chart data</p>
          </div>
        ) : chartData.length > 0 ? (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ payload }: any) => `${STATUS_LABELS[payload.status]}: ${payload.count}`}
                  labelLine={false}
                >
                  {chartData.map((entry) => (
                    <Cell
                      key={entry.status}
                      fill={STATUS_COLORS[entry.status] || '#6b7280'}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.5rem',
                  }}
                  formatter={(value, name) => [value, STATUS_LABELS[name as string] || name]}
                />
                <Legend
                  formatter={(value) => STATUS_LABELS[value] || value}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-sm text-muted-foreground">No experiments yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
