'use client'

const statuses = [
  { value: '', label: 'All Statuses' },
  { value: 'configuring', label: 'Configuring' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'signed', label: 'Signed' },
]

interface StatusFilterProps {
  value: string
  onChange: (value: string) => void
}

export function StatusFilter({ value, onChange }: StatusFilterProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      {statuses.map((status) => (
        <option key={status.value} value={status.value}>
          {status.label}
        </option>
      ))}
    </select>
  )
}
