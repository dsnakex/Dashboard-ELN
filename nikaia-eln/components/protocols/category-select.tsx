'use client'

import { Label } from '@/components/ui/label'

const categories = [
  { value: '', label: 'All Categories' },
  { value: 'antibiotics', label: 'Antibiotics' },
  { value: 'buffers', label: 'Buffers' },
  { value: 'enzymes', label: 'Enzymes' },
  { value: 'media', label: 'Media' },
  { value: 'staining', label: 'Staining' },
  { value: 'other', label: 'Other' },
]

interface CategorySelectProps {
  value: string
  onChange: (value: string) => void
  showLabel?: boolean
  includeAll?: boolean
}

export function CategorySelect({
  value,
  onChange,
  showLabel = false,
  includeAll = true
}: CategorySelectProps) {
  const options = includeAll ? categories : categories.filter(c => c.value !== '')

  return (
    <div className="space-y-2">
      {showLabel && <Label htmlFor="category">Category</Label>}
      <select
        id="category"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {options.map((category) => (
          <option key={category.value} value={category.value}>
            {category.label}
          </option>
        ))}
      </select>
    </div>
  )
}
