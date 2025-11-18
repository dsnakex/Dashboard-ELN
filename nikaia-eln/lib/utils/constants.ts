// Experiment statuses
export const EXPERIMENT_STATUSES = [
  { value: 'configuring', label: 'Configuring', color: 'slate' },
  { value: 'pending', label: 'Pending', color: 'amber' },
  { value: 'in_progress', label: 'In Progress', color: 'blue' },
  { value: 'completed', label: 'Completed', color: 'green' },
  { value: 'signed', label: 'Signed', color: 'purple' },
] as const

// Sample types
export const SAMPLE_TYPES = [
  { value: 'antibody', label: 'Antibody' },
  { value: 'cell_line', label: 'Cell Line' },
  { value: 'oligo', label: 'Oligo' },
  { value: 'protein', label: 'Protein' },
  { value: 'rna', label: 'RNA' },
  { value: 'vector', label: 'Vector' },
  { value: 'chemical', label: 'Chemical' },
  { value: 'reagent', label: 'Reagent' },
  { value: 'other', label: 'Other' },
] as const

// Sample statuses
export const SAMPLE_STATUSES = [
  { value: 'available', label: 'Available', color: 'green' },
  { value: 'in_use', label: 'In Use', color: 'blue' },
  { value: 'depleted', label: 'Depleted', color: 'red' },
  { value: 'expired', label: 'Expired', color: 'red' },
  { value: 'disposed', label: 'Disposed', color: 'gray' },
] as const

// Protocol categories
export const PROTOCOL_CATEGORIES = [
  { value: 'Antibiotics', label: 'Antibiotics' },
  { value: 'Buffers', label: 'Buffers' },
  { value: 'Enzymes', label: 'Enzymes' },
  { value: 'Media', label: 'Media' },
  { value: 'Staining', label: 'Staining' },
  { value: 'Other', label: 'Other' },
] as const

// Protocol visibility
export const PROTOCOL_VISIBILITY = [
  { value: 'personal', label: 'Personal' },
  { value: 'group', label: 'Group' },
  { value: 'public', label: 'Public' },
] as const

// Storage unit types
export const STORAGE_UNIT_TYPES = [
  { value: 'freezer_minus80', label: 'Freezer -80°C' },
  { value: 'freezer_minus20', label: 'Freezer -20°C' },
  { value: 'fridge', label: 'Fridge 4°C' },
  { value: 'room_temp', label: 'Room Temperature' },
  { value: 'liquid_nitrogen', label: 'Liquid Nitrogen' },
  { value: 'incubator', label: 'Incubator' },
  { value: 'other', label: 'Other' },
] as const

// Equipment statuses
export const EQUIPMENT_STATUSES = [
  { value: 'operational', label: 'Operational', color: 'green' },
  { value: 'maintenance', label: 'Maintenance', color: 'amber' },
  { value: 'out_of_service', label: 'Out of Service', color: 'red' },
  { value: 'reserved', label: 'Reserved', color: 'blue' },
] as const

// User roles
export const USER_ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'researcher', label: 'Researcher' },
  { value: 'viewer', label: 'Viewer' },
] as const
