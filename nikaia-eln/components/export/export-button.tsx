'use client'

import { useState } from 'react'
import { Download, FileSpreadsheet, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface ExportButtonProps {
  onExportExcel?: () => void
  onExportPDF?: () => void
  disabled?: boolean
}

export function ExportButton({ onExportExcel, onExportPDF, disabled }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async (exportFn?: () => void) => {
    if (!exportFn) return
    setIsExporting(true)
    try {
      await exportFn()
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={disabled || isExporting}>
          <Download className="mr-2 h-4 w-4" />
          {isExporting ? 'Exporting...' : 'Export'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {onExportExcel && (
          <DropdownMenuItem onClick={() => handleExport(onExportExcel)}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export to Excel
          </DropdownMenuItem>
        )}
        {onExportPDF && (
          <DropdownMenuItem onClick={() => handleExport(onExportPDF)}>
            <FileText className="mr-2 h-4 w-4" />
            Export to PDF
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
