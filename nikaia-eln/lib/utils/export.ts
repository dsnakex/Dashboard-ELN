import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

// Export experiments to Excel
export function exportExperimentsToExcel(experiments: any[], filename: string = 'experiments') {
  const data = experiments.map(exp => ({
    'Name': exp.name,
    'Status': exp.status,
    'Project': exp.study?.project?.name || '-',
    'Study': exp.study?.name || '-',
    'Created': new Date(exp.created_at).toLocaleDateString(),
    'Updated': new Date(exp.updated_at).toLocaleDateString(),
    'Signed': exp.signed_at ? new Date(exp.signed_at).toLocaleDateString() : '-',
  }))

  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Experiments')

  // Auto-size columns
  const colWidths = Object.keys(data[0] || {}).map(key => ({
    wch: Math.max(key.length, ...data.map(row => String(row[key as keyof typeof row] || '').length))
  }))
  worksheet['!cols'] = colWidths

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  saveAs(blob, `${filename}.xlsx`)
}

// Export experiments to PDF
export function exportExperimentsToPDF(experiments: any[], filename: string = 'experiments') {
  const doc = new jsPDF()

  // Title
  doc.setFontSize(18)
  doc.text('Experiments Report', 14, 22)
  doc.setFontSize(10)
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 30)

  // Table data
  const tableData = experiments.map(exp => [
    exp.name,
    exp.status,
    exp.study?.project?.name || '-',
    exp.study?.name || '-',
    new Date(exp.created_at).toLocaleDateString(),
    exp.signed_at ? new Date(exp.signed_at).toLocaleDateString() : '-',
  ])

  autoTable(doc, {
    head: [['Name', 'Status', 'Project', 'Study', 'Created', 'Signed']],
    body: tableData,
    startY: 40,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [59, 130, 246] },
  })

  doc.save(`${filename}.pdf`)
}

// Export single experiment details to PDF
export function exportExperimentDetailToPDF(experiment: any) {
  const doc = new jsPDF()

  // Title
  doc.setFontSize(18)
  doc.text(experiment.name, 14, 22)

  // Status badge
  doc.setFontSize(10)
  doc.text(`Status: ${experiment.status}`, 14, 32)
  doc.text(`Created: ${new Date(experiment.created_at).toLocaleDateString()}`, 14, 40)
  if (experiment.signed_at) {
    doc.text(`Signed: ${new Date(experiment.signed_at).toLocaleDateString()}`, 14, 48)
  }

  // Project/Study info
  let yPos = experiment.signed_at ? 56 : 48
  if (experiment.study) {
    doc.text(`Project: ${experiment.study.project?.name || '-'}`, 14, yPos)
    yPos += 8
    doc.text(`Study: ${experiment.study.name}`, 14, yPos)
    yPos += 8
  }

  // Protocol
  if (experiment.protocol) {
    doc.text(`Protocol: ${experiment.protocol.name}`, 14, yPos)
    yPos += 8
  }

  // Objective
  if (experiment.objective) {
    yPos += 4
    doc.setFontSize(12)
    doc.text('Objective', 14, yPos)
    yPos += 6
    doc.setFontSize(10)
    const objectiveLines = doc.splitTextToSize(experiment.objective, 180)
    doc.text(objectiveLines, 14, yPos)
    yPos += objectiveLines.length * 6
  }

  // Content (stripped of HTML)
  if (experiment.content) {
    yPos += 4
    doc.setFontSize(12)
    doc.text('Content', 14, yPos)
    yPos += 6
    doc.setFontSize(10)
    const plainText = experiment.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    const contentLines = doc.splitTextToSize(plainText, 180)
    doc.text(contentLines, 14, yPos)
  }

  // Footer
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.text(
      `Generated on ${new Date().toLocaleString()} - Page ${i} of ${pageCount}`,
      14,
      doc.internal.pageSize.height - 10
    )
  }

  doc.save(`${experiment.name.replace(/[^a-z0-9]/gi, '_')}.pdf`)
}

// Export projects to Excel
export function exportProjectsToExcel(projects: any[], filename: string = 'projects') {
  const data = projects.map(proj => ({
    'Name': proj.name,
    'Status': proj.status,
    'Description': proj.description || '-',
    'Studies': proj.studies?.length || 0,
    'Created': new Date(proj.created_at).toLocaleDateString(),
    'Updated': new Date(proj.updated_at).toLocaleDateString(),
  }))

  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Projects')

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  saveAs(blob, `${filename}.xlsx`)
}

// Export inventory to Excel
export function exportInventoryToExcel(samples: any[], filename: string = 'inventory') {
  const data = samples.map(sample => ({
    'Name': sample.name,
    'Type': sample.sample_type,
    'Status': sample.status,
    'Quantity': `${sample.quantity} ${sample.unit}`,
    'Location': sample.storage_unit?.name || '-',
    'Expiration': sample.expiration_date ? new Date(sample.expiration_date).toLocaleDateString() : '-',
    'Created': new Date(sample.created_at).toLocaleDateString(),
  }))

  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventory')

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  saveAs(blob, `${filename}.xlsx`)
}

// Export activity log to Excel
export function exportActivityToExcel(activities: any[], filename: string = 'activity_log') {
  const data = activities.map(act => ({
    'Action': act.action,
    'Entity Type': act.entity_type,
    'Entity ID': act.entity_id,
    'User': act.user?.full_name || act.user?.email || '-',
    'Date': new Date(act.created_at).toLocaleString(),
  }))

  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Activity Log')

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  saveAs(blob, `${filename}.xlsx`)
}
