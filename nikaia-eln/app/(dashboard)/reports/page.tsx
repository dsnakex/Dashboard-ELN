'use client'

import { useState } from 'react'
import { FileSpreadsheet, FileText, Download, Calendar } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import {
  exportExperimentsToExcel,
  exportExperimentsToPDF,
  exportProjectsToExcel,
  exportInventoryToExcel,
  exportActivityToExcel,
} from '@/lib/utils/export'

export default function ReportsPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const handleExport = async (type: string, format: 'excel' | 'pdf') => {
    setLoading(`${type}-${format}`)
    const supabase = createClient()

    try {
      let query
      const dateFilter = (q: any) => {
        if (dateFrom) q = q.gte('created_at', dateFrom)
        if (dateTo) q = q.lte('created_at', dateTo)
        return q
      }

      switch (type) {
        case 'experiments':
          query = supabase
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
            .order('created_at', { ascending: false })

          query = dateFilter(query)
          const { data: experiments } = await query

          if (format === 'excel') {
            exportExperimentsToExcel(experiments || [], `experiments_${new Date().toISOString().split('T')[0]}`)
          } else {
            exportExperimentsToPDF(experiments || [], `experiments_${new Date().toISOString().split('T')[0]}`)
          }
          break

        case 'projects':
          query = supabase
            .from('projects')
            .select(`
              *,
              studies(id)
            `)
            .order('created_at', { ascending: false })

          query = dateFilter(query)
          const { data: projects } = await query

          exportProjectsToExcel(projects || [], `projects_${new Date().toISOString().split('T')[0]}`)
          break

        case 'inventory':
          query = supabase
            .from('samples')
            .select(`
              *,
              storage_unit:storage_units(id, name)
            `)
            .order('created_at', { ascending: false })

          query = dateFilter(query)
          const { data: samples } = await query

          exportInventoryToExcel(samples || [], `inventory_${new Date().toISOString().split('T')[0]}`)
          break

        case 'activity':
          query = supabase
            .from('activity_log')
            .select(`
              *,
              user:users(id, full_name, email)
            `)
            .order('created_at', { ascending: false })

          query = dateFilter(query)
          const { data: activities } = await query

          exportActivityToExcel(activities || [], `activity_log_${new Date().toISOString().split('T')[0]}`)
          break
      }
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setLoading(null)
    }
  }

  const reports = [
    {
      id: 'experiments',
      title: 'Experiments Report',
      description: 'Export all experiments with project, study, and status information',
      formats: ['excel', 'pdf'] as ('excel' | 'pdf')[],
    },
    {
      id: 'projects',
      title: 'Projects Report',
      description: 'Export all projects with study counts and status',
      formats: ['excel'] as ('excel' | 'pdf')[],
    },
    {
      id: 'inventory',
      title: 'Inventory Report',
      description: 'Export all samples with storage locations and quantities',
      formats: ['excel'] as ('excel' | 'pdf')[],
    },
    {
      id: 'activity',
      title: 'Activity Log',
      description: 'Export complete activity history with user information',
      formats: ['excel'] as ('excel' | 'pdf')[],
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-muted-foreground">
          Generate and export reports in various formats
        </p>
      </div>

      {/* Date filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Date Range Filter</CardTitle>
          <CardDescription>
            Optional: Filter reports by date range
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="date-from">From</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="date-from"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date-to">To</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="date-to"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            {(dateFrom || dateTo) && (
              <Button
                variant="ghost"
                onClick={() => {
                  setDateFrom('')
                  setDateTo('')
                }}
              >
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Report cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {reports.map((report) => (
          <Card key={report.id}>
            <CardHeader>
              <CardTitle className="text-lg">{report.title}</CardTitle>
              <CardDescription>{report.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                {report.formats.includes('excel') && (
                  <Button
                    variant="outline"
                    onClick={() => handleExport(report.id, 'excel')}
                    disabled={loading === `${report.id}-excel`}
                  >
                    {loading === `${report.id}-excel` ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
                    ) : (
                      <FileSpreadsheet className="mr-2 h-4 w-4" />
                    )}
                    Excel
                  </Button>
                )}
                {report.formats.includes('pdf') && (
                  <Button
                    variant="outline"
                    onClick={() => handleExport(report.id, 'pdf')}
                    disabled={loading === `${report.id}-pdf`}
                  >
                    {loading === `${report.id}-pdf` ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
                    ) : (
                      <FileText className="mr-2 h-4 w-4" />
                    )}
                    PDF
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
